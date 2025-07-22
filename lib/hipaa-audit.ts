
import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

// Define the structure of an audit log entry
interface AuditLogEntry {
  timestamp: string;
  ipAddress: string | undefined;
  method: string;
  path: string;
  userAgent: string | undefined;
  requestBodyHash?: string;
  status: number;
  statusText: string;
}

/**
 * Logs an API request for HIPAA audit purposes.
 * This is a simplified version. In a real-world scenario, this would
 * log to a secure, immutable, and encrypted data store.
 *
 * @param request The incoming NextRequest object.
 * @param response The outgoing NextResponse object.
 */
export async function logApiRequest(request: NextRequest, response: { status: number; statusText: string; }) {
  const entry: Partial<AuditLogEntry> = {
    timestamp: new Date().toISOString(),
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    status: response.status,
    statusText: response.statusText,
  };

  // For POST/PUT requests, you might want to hash the body to ensure integrity
  // without logging sensitive PHI.
  if (request.method === 'POST' || request.method === 'PUT') {
    const bodyText = await request.clone().text();
    if (bodyText) {
      entry.requestBodyHash = createHash('sha256').update(bodyText).digest('hex');
    }
  }

  // In a real system, this would write to a secure log store (e.g., AWS CloudWatch, a dedicated logging service, or a database table with restricted access).
  // For this example, we'll just log to the console.
  console.log('HIPAA Audit Log:', JSON.stringify(entry, null, 2));
}

/**
 * A placeholder for a function that would verify the integrity of the audit logs.
 * In a real system, this might involve checking a chain of hashes or digital signatures.
 */
export function verifyLogIntegrity() {
  console.log('Placeholder for verifying log integrity. In a real system, this would be a complex process.');
}
