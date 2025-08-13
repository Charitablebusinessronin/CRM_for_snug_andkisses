export interface UnifiedAPIError {
  code: string
  message: string
  details?: any
}

export interface UnifiedAPIResponse<T> {
  success: boolean
  data?: T
  error?: UnifiedAPIError
  timestamp: string
  requestId: string
}

export function respondOk<T>(data: T, requestId?: string): UnifiedAPIResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: requestId || crypto.randomUUID(),
  }
}

export function respondError(
  code: string,
  message: string,
  details?: any,
  status?: number,
  requestId?: string
): { body: UnifiedAPIResponse<null>; status: number } {
  return {
    body: {
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
      requestId: requestId || crypto.randomUUID(),
    },
    status: status || 500,
  }
}
