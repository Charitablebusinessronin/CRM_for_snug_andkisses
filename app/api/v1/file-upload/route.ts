/**
 * File Upload API - Profile Photos and Documents
 * Handles secure file uploads with validation and storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string || 'general';
    const userId = formData.get('user_id') as string || 'anonymous';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', fileType);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    const publicUrl = `/uploads/${fileType}/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Log upload for HIPAA compliance
    await logAuditEvent({
      action: 'FILE_UPLOAD',
      resource: '/api/v1/file-upload',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'file-upload',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: {
        file_name: fileName,
        file_type: file.type,
        file_size: file.size,
        upload_type: fileType
      }
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file_url: publicUrl,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
      upload_type: fileType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type') || 'general';
    const userId = searchParams.get('user_id') || '';

    // This could return a list of uploaded files for the user
    return NextResponse.json({
      success: true,
      message: 'File upload endpoint is active',
      supported_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
      max_size: '10MB',
      upload_types: ['profile_photo', 'document', 'general']
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}