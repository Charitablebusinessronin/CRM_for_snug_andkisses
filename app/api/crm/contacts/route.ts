import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';
import zohoCRM from '@/lib/zoho-crm-enhanced';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_CONTACTS_READ',
      resource: '/api/crm/contacts',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm-api',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    // Call real Zoho CRM API
    const zohoResponse = await zohoCRM.getContacts(page, limit);
    
    return NextResponse.json({
      success: true,
      data: zohoResponse.data || [],
      total: zohoResponse.data?.length || 0,
      page: page,
      limit: limit,
      timestamp: new Date().toISOString(),
      source: 'zoho-crm-direct'
    });

  } catch (error) {
    console.error('[CATALYST_CRM_ERROR]', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_CONTACTS_ERROR',
      resource: '/api/crm/contacts',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm-api',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch contacts from Zoho CRM',
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
      action: 'CRM_CONTACT_CREATE',
      resource: '/api/crm/contacts',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm-api',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    // Transform the body to match Zoho CRM contact format
    const contactData = {
      firstName: body.first_name,
      lastName: body.last_name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      source: body.lead_source || 'Website',
      message: body.description || body.notes
    };

    // Call real Zoho CRM API for contact creation
    const zohoResponse = await zohoCRM.createContact(contactData, userId);
    
    return NextResponse.json({
      success: true,
      data: zohoResponse.data?.[0] || {},
      zoho_id: zohoResponse.data?.[0]?.details?.id,
      timestamp: new Date().toISOString(),
      source: 'zoho-crm-direct'
    });

  } catch (error) {
    console.error('[CATALYST_CRM_ERROR]', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CRM_CONTACT_CREATE_ERROR',
      resource: '/api/crm/contacts',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-crm-api',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create contact in Zoho CRM',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
