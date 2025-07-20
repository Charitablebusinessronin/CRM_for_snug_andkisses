import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit';
import { ZohoCRM } from '@/lib/zoho-crm';

interface ServiceRequestPayload {
  serviceType: 'postpartum' | 'birth' | 'sitter' | 'both';
  // In a real app, you'd also include the user's ID from their session
  // userId: string;
}

// POST handler for creating a new service request
export async function POST(request: Request) {
  try {
    const { serviceType } = (await request.json()) as ServiceRequestPayload;

    if (!serviceType) {
      return NextResponse.json(
        { message: 'Service type is required.' },
        { status: 400 }
      );
    }

    // --- Backend Logic Placeholder ---
    // In a real application, you would:
    // 1. Authenticate the user and get their ID.
    // 2. Validate the request against their available benefits.
    // 3. Create a new service request record in your database (e.g., Zoho CRM).
    // 4. Trigger notifications to the admin/scheduling team.

    console.log(`New Service Request Received: ${serviceType}`);

    // --- Zoho CRM Integration ---
    const zohoCRM = new ZohoCRM();
    const serviceRequestId = await zohoCRM.createServiceRequest({ serviceType });
    
    if (!serviceRequestId) {
      throw new Error('Failed to save service request to Zoho CRM');
    }
    // --- End Zoho CRM Integration ---

    // --- Audit Log Integration ---
    await logAuditEvent({
      action: 'CREATE_SERVICE_REQUEST',
      userId: 'placeholder-user-id',
      details: {
        serviceType: serviceType,
        zohoRecordId: serviceRequestId,
      },
    });
    // --- End Audit Log Integration ---

    return NextResponse.json(
      { 
        message: `Service request for '${serviceType}' submitted successfully.`,
        zohoRecordId: serviceRequestId,
        success: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the service request.' },
      { status: 500 }
    );
  }
}
