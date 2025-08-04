/**
 * HIPAA Compatibility Layer
 * Simple wrapper for backward compatibility
 */
import { logAuditEvent } from './hipaa-audit-edge'

export async function auditLogAccess(
  resource: string,
  action: string,
  userId?: string,
  additionalData?: any
) {
  await logAuditEvent({
    action: `${resource.toUpperCase()}_${action.toUpperCase()}`,
    resource: resource,
    user_id: userId || 'anonymous',
    ip_address: 'unknown',
    user_agent: 'compatibility-layer',
    timestamp: new Date().toISOString(),
    origin: 'internal',
    request_id: crypto.randomUUID(),
    result: 'success',
    data: additionalData
  })
}