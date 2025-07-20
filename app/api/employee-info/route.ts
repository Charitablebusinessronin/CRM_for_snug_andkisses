import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit';
import { ZohoCRM } from '@/lib/zoho-crm';

// POST handler for employee information form
export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // --- Backend Logic Placeholder ---
    // In a real application, you would:
    // 1. Validate the data against a schema (e.g., using Zod).
    // 2. Sanitize the inputs to prevent security vulnerabilities.
    // 3. Save the data to your database (e.g., Zoho CRM, Catalyst Data Store).
    // 4. Implement robust error handling.
    // 5. Trigger any subsequent workflows (e.g., sending confirmation emails).
    
    console.log('Received Employee Info Form Data:', formData);

    // --- Zoho CRM Integration ---
    const zohoCRM = new ZohoCRM();
    const employeeId = await zohoCRM.createEmployeeRecord(formData);
    
    if (!employeeId) {
      throw new Error('Failed to save employee data to Zoho CRM');
    }
    // --- End Zoho CRM Integration ---

    // --- Audit Log Integration ---
    await logAuditEvent({
      action: 'SUBMIT_CLIENT_INFO_FORM',
      userId: 'placeholder-user-id',
      details: {
        clientName: formData.fullName,
        zohoRecordId: employeeId,
      },
    });
    // --- End Audit Log Integration ---

    return NextResponse.json(
      { 
        message: 'Employee information submitted successfully.',
        zohoRecordId: employeeId,
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
