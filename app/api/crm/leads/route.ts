import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';

// Catalyst CRM Backend URL - Native Zoho Integration (No Token Refresh Issues)
const CATALYST_CRM_URL = 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '50';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_LEADS_GET',
      resource: '/api/crm/leads',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'crm-leads-catalyst',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    const catalystResponse = await fetch(`${CATALYST_CRM_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0'
      },
      body: JSON.stringify({
        action: 'getLeads',
        params: { page, limit }
      })
    });

    if (!catalystResponse.ok) {
      throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
    }

    const catalystData = await catalystResponse.json();
    
    return NextResponse.json({
      success: true,
      data: catalystData.data || catalystData,
      total: catalystData.total || 0,
      timestamp: new Date().toISOString(),
      source: 'catalyst-crm-backend'
    });
  } catch (error) {
    console.error('[ZOHO_API_ERROR]', error);

    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_LEADS_GET_ERROR',
      resource: '/api/crm/leads',
      user_id: request.headers.get('x-user-id') || 'anonymous',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'crm-leads-catalyst',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leads',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const leadData = await request.json();

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_LEADS_CREATE',
      resource: '/api/crm/leads',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'crm-leads-catalyst',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    // Use Catalyst CRM Backend with native Zoho integration
    const response = await fetch(`${CATALYST_CRM_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0'
      },
      body: JSON.stringify({
        action: 'createLead',
        params: leadData
      })
    });

    if (!response.ok) {
      throw new Error(`Catalyst CRM API error: ${response.status} ${response.statusText}`);
    }

    const catalystData = await response.json();
    
    return NextResponse.json({
      success: true,
      data: catalystData.data || catalystData,
      message: 'Lead created successfully',
      timestamp: new Date().toISOString(),
      source: 'catalyst-crm-backend'
    }, { status: 201 });
  } catch (error) {
    console.error('[ZOHO_API_ERROR]', error);

    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_LEADS_CREATE_ERROR',
      resource: '/api/crm/leads',
      user_id: request.headers.get('x-user-id') || 'anonymous',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'crm-leads-catalyst',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
