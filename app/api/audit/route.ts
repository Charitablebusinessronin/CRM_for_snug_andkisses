import { NextResponse } from 'next/server';

// This interface defines the structure of an audit log entry.
interface AuditLogPayload {
  action: string; // e.g., 'USER_LOGIN', 'VIEW_PATIENT_RECORD', 'CREATE_SERVICE_REQUEST'
  userId: string;   // The ID of the user performing the action.
  details: Record<string, any>; // A flexible object for additional context.
  timestamp: string; // ISO 8601 timestamp.
}

// POST handler for creating a new audit log entry.
export async function POST(request: Request) {
  try {
    const logEntry = (await request.json()) as AuditLogPayload;

    // --- Backend Logic Placeholder ---
    // In a real, HIPAA-compliant application, you would:
    // 1. Write this logEntry to a secure, immutable, and persistent log store.
    //    - Zoho Catalyst Log Management or a dedicated logging service is ideal.
    // 2. Ensure the log store is encrypted at rest.
    // 3. Have retention policies in place as required by HIPAA.

    // For now, we will log to the console to demonstrate the functionality.
    console.log('AUDIT LOG:', JSON.stringify(logEntry, null, 2));
    // --- End Placeholder ---

    return NextResponse.json({ message: 'Audit event logged successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Audit Log API Error:', error);
    // In a production environment, you should avoid sending detailed error messages back.
    return NextResponse.json(
      { message: 'An error occurred while logging the audit event.' },
      { status: 500 }
    );
  }
}
