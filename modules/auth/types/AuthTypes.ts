/**
 * Authentication Module Types
 * Healthcare CRM Authentication Types with HIPAA compliance
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  orgId: string
  createdAt: string
  lastLoginAt?: string
  mfaEnabled: boolean
  hipaaCompliant: boolean
}

export enum UserRole {
  ADMIN = 'App Administrator',
  HEALTHCARE_ADMIN = 'Healthcare Admin',
  SYSTEM_ADMIN = 'System Administrator',
  HEALTHCARE_PROVIDER = 'Healthcare Provider',
  CARE_COORDINATOR = 'Care Coordinator',
  CAREGIVER = 'Caregiver',
  CLIENT = 'Client',
  FAMILY_MEMBER = 'Family Member'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  PENDING_BACKGROUND_CHECK = 'pending_background_check',
  PENDING_APPROVAL = 'pending_approval',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface LoginCredentials {
  email: string
  password: string
  mfaCode?: string
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  message?: string
  requiresMfa?: boolean
}

export interface ValidationResult {
  isValid: boolean
  reason?: string
  user?: Partial<User>
}

export interface AuditEvent {
  eventType: string
  userEmail?: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  complianceLogged: boolean
}

export interface SessionData {
  userId: string
  email: string
  role: UserRole
  permissions: string[]
  expiresAt: number
  hipaaAccess: boolean
}

export interface AuthConfig {
  sessionTimeout: number
  mfaRequired: boolean
  passwordMinLength: number
  allowedDomains: string[]
  hipaaComplianceEnabled: boolean
}