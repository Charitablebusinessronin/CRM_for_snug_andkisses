/**
 * Zoho Books API Integration Endpoint
 * Connects directly to Zoho Books APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { zohoClient } from '@/lib/zoho-api-client';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `ZOHO_BOOKS_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/zoho/books',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-books',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    switch (action) {
      case 'customers':
        const customers = await zohoClient.getBooksCustomers();
        
        return NextResponse.json({
          success: true,
          data: customers,
          count: customers.length,
          timestamp: new Date().toISOString()
        });

      case 'invoices':
        const invoices = await zohoClient.getBooksInvoices();
        
        return NextResponse.json({
          success: true,
          data: invoices,
          count: invoices.length,
          timestamp: new Date().toISOString()
        });

      case 'dashboard':
        const dashboard = await zohoClient.getBooksDashboard();
        
        return NextResponse.json({
          success: true,
          data: dashboard,
          timestamp: new Date().toISOString()
        });

      case 'test-connection':
        const testResult = await zohoClient.testConnections();
        
        return NextResponse.json({
          success: true,
          connection_status: testResult.books,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: customers, invoices, dashboard, test-connection' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho Books API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'ZOHO_BOOKS_ERROR',
      resource: '/api/zoho/books',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-books',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to connect to Zoho Books',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `ZOHO_BOOKS_CREATE_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/zoho/books',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-books',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action }
    });

    switch (action) {
      case 'create-invoice':
        const newInvoice = await zohoClient.createBooksInvoice(data);
        
        return NextResponse.json({
          success: true,
          data: newInvoice,
          message: 'Invoice created successfully in Zoho Books',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: create-invoice' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho Books POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create record in Zoho Books',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}