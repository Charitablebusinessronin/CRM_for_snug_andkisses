/**
 * Zoho CRM API Integration Endpoint
 * Connects directly to Zoho CRM APIs
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
      action: `ZOHO_CRM_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/zoho/crm',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    switch (action) {
      case 'contacts':
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '50');
        const contacts = await zohoClient.getCRMContacts(page, perPage);
        
        return NextResponse.json({
          success: true,
          data: contacts,
          page,
          per_page: perPage,
          timestamp: new Date().toISOString()
        });

      case 'deals':
        const dealPage = parseInt(searchParams.get('page') || '1');
        const dealPerPage = parseInt(searchParams.get('per_page') || '50');
        const deals = await zohoClient.getCRMDeals(dealPage, dealPerPage);
        
        return NextResponse.json({
          success: true,
          data: deals,
          page: dealPage,
          per_page: dealPerPage,
          timestamp: new Date().toISOString()
        });

      case 'dashboard':
        const dashboard = await zohoClient.getCRMDashboard();
        
        return NextResponse.json({
          success: true,
          data: dashboard,
          timestamp: new Date().toISOString()
        });

      case 'test-connection':
        const testResult = await zohoClient.testConnections();
        
        return NextResponse.json({
          success: true,
          connection_status: testResult.crm,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: contacts, deals, dashboard, test-connection' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho CRM API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'ZOHO_CRM_ERROR',
      resource: '/api/zoho/crm',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to connect to Zoho CRM',
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
      action: `ZOHO_CRM_CREATE_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/zoho/crm',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action }
    });

    switch (action) {
      case 'create-contact':
        const newContact = await zohoClient.createCRMContact(data);
        
        return NextResponse.json({
          success: true,
          data: newContact,
          message: 'Contact created successfully in Zoho CRM',
          timestamp: new Date().toISOString()
        });

      case 'create-deal':
        const newDeal = await zohoClient.createCRMDeal(data);
        
        return NextResponse.json({
          success: true,
          data: newDeal,
          message: 'Deal created successfully in Zoho CRM',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: create-contact, create-deal' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho CRM POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create record in Zoho CRM',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}