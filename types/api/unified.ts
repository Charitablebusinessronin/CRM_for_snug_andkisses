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

export enum ErrorTypes {
  AUTHENTICATION_FAILED = 'AUTH_001',
  API_TIMEOUT = 'API_001',
  PERMISSION_DENIED = 'PERM_001',
  VALIDATION_ERROR = 'VAL_001',
  SYSTEM_ERROR = 'SYS_001',
}
