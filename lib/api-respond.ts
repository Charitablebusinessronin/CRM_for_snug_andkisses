import { NextResponse } from 'next/server'

// Standardized API response helpers
// Ensures consistent envelopes and status codes across all routes

export type ApiSuccess<T = any> = {
  success: true
  data: T
  meta?: Record<string, any>
}

export type ApiError = {
  success: false
  error: string
  code?: string
  details?: any
}

function json(body: any, init?: ResponseInit) {
  return NextResponse.json(body, init)
}

export const respond = {
  ok<T = any>(data: T, meta?: Record<string, any>) {
    return json({ success: true, data, ...(meta ? { meta } : {}) } as ApiSuccess<T>, { status: 200 })
  },
  created<T = any>(data: T, meta?: Record<string, any>) {
    return json({ success: true, data, ...(meta ? { meta } : {}) } as ApiSuccess<T>, { status: 201 })
  },
  badRequest(message = 'Bad request', code?: string, details?: any) {
    return json({ success: false, error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) } as ApiError, { status: 400 })
  },
  unauthorized(message = 'Unauthorized', code?: string, details?: any) {
    return json({ success: false, error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) } as ApiError, { status: 401 })
  },
  forbidden(message = 'Forbidden', code?: string, details?: any) {
    return json({ success: false, error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) } as ApiError, { status: 403 })
  },
  notFound(message = 'Not found', code?: string, details?: any) {
    return json({ success: false, error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) } as ApiError, { status: 404 })
  },
  upstreamError(message = 'Upstream service error', code = 'upstream_error', details?: any) {
    return json({ success: false, error: message, code, ...(details ? { details } : {}) } as ApiError, { status: 502 })
  },
  serverError(message = 'Internal server error', code = 'server_error', details?: any) {
    return json({ success: false, error: message, code, ...(details ? { details } : {}) } as ApiError, { status: 500 })
  }
}

export default respond
