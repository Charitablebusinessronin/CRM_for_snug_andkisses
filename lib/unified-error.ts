import { NextResponse } from 'next/server'
import { respondError } from '@/lib/unified-response'

export enum ErrorTypes {
  AUTHENTICATION_FAILED = 'AUTH_001',
  API_TIMEOUT = 'API_001',
  PERMISSION_DENIED = 'PERM_001',
  VALIDATION_ERROR = 'VAL_001',
  SYSTEM_ERROR = 'SYS_001',
}

export interface ErrorContext {
  resource?: string
  requestId?: string
  userId?: string
  meta?: Record<string, any>
}

export class UnifiedErrorHandler {
  static handle(err: unknown, ctx: ErrorContext = {}) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const code = ErrorTypes.SYSTEM_ERROR

    // TODO: Hook HIPAA-compliant logging here (reuse logAuditEvent)
    // await logAuditEvent({ action: 'API_ERROR', resource: ctx.resource ?? 'unknown', result: 'error', error_message: message, ... })

    const { body, status } = respondError(code, message, { context: ctx })
    return NextResponse.json(body, { status })
  }
}
