/**
 * Shared Types
 * Common types used across all modules
 */

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SearchParams {
  query: string
  filters?: Record<string, any>
  pagination?: PaginationParams
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  loading: boolean
  touched: Record<keyof T, boolean>
  dirty: boolean
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: string
}

export interface HealthcareEntity extends BaseEntity {
  hipaaCompliant: boolean
  phiLevel?: 'none' | 'limited' | 'full'
  auditTrail: string[]
}

export type Permission = 
  | 'admin' 
  | 'crm' 
  | 'hipaa' 
  | 'audit' 
  | 'system'
  | 'patient_care'
  | 'scheduling'
  | 'basic_crm'
  | 'shift_notes'
  | 'self_service'
  | 'appointments'
  | 'family_portal'
  | 'limited_access'

export interface ModuleConfig {
  name: string
  version: string
  enabled: boolean
  permissions: Permission[]
  dependencies: string[]
}