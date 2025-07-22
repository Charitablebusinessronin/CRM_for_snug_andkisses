import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit';
import { syncContactAndCreateDeal } from '@/lib/zoho-crm';

// POST handler for employee information form
export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    console.log('Received Employee Info Form Data:', formData);

    const result = await syncContactAndCreateDeal(formData);
    
    if (!result.contactId) {
      throw new Error('Failed to save employee data to Zoho CRM');
    }

    await logAuditEvent({
      action: 'SUBMIT_CLIENT_INFO_FORM',
      userId: 'placeholder-user-id',
      details: {
        clientName: formData.fullName,
        zohoRecordId: result.contactId,
      },
    });

    return NextResponse.json(
      { 
        message: 'Employee information submitted successfully.',
        zohoRecordId: result.contactId,
        success: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
