import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';
import { getApiBase } from '@/lib/apiBase';

// Resolve API base dynamically (Docker/Local compatible)
const API_BASE = getApiBase();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: 'FINANCE_INVOICES_READ',
      resource: '/api/finance/invoices',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'finance-api',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    // Call Express Backend Finance API
    const backendResponse = await fetch(`${API_BASE}/api/finance/invoices?page=${page}&limit=${limit}&status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0',
        'x-user-id': userId
      }
    });

    if (!backendResponse.ok) {
      throw new Error(`Express backend call failed: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      data: backendData.data || [],
      total: backendData.total || 0,
      page: page,
      limit: limit,
      timestamp: new Date().toISOString(),
      source: 'express-finance-backend'
    });

  } catch (error) {
    console.error('[FINANCE_INVOICES_ERROR]', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'FINANCE_INVOICES_ERROR',
      resource: '/api/finance/invoices',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'finance-api',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch invoices',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: 'FINANCE_INVOICE_CREATE',
      resource: '/api/finance/invoices',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'finance-api',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    // Call Express Backend Finance API for invoice creation
    const backendResponse = await fetch(`${API_BASE}/api/finance/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0',
        'x-user-id': userId
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      throw new Error(`Express backend call failed: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      data: backendData.data || {},
      message: 'Invoice created successfully',
      timestamp: new Date().toISOString(),
      source: 'express-finance-backend'
    });

  } catch (error) {
    console.error('[FINANCE_INVOICE_CREATE_ERROR]', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'FINANCE_INVOICE_CREATE_ERROR',
      resource: '/api/finance/invoices',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'finance-api',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}