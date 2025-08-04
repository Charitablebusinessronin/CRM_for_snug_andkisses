/**
 * Authentication type definitions for Snugs and Kisses CRM
 * HIPAA-compliant user management with role-based access control
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  CONTRACTOR = 'CONTRACTOR', 
  CLIENT = 'CLIENT',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  image?: string | null
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  zohoContactId?: string
  phoneNumber?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
  }
  preferences?: {
    theme?: 'light' | 'dark'
    notifications?: boolean
    timezone?: string
  }
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string | null
  }
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  message?: string
}

export interface RefreshTokenData {
  userId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  isRevoked: boolean
}

export interface AuthAuditEvent {
  userId?: string
  action: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_REFRESH' | 'PASSWORD_CHANGE'
  ipAddress: string
  userAgent: string
  timestamp: Date
  result: 'success' | 'failure' | 'error'
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface RolePermissions {
  [UserRole.ADMIN]: {
    canViewAllData: true
    canManageUsers: true
    canConfigureIntegrations: true
    canViewAuditLogs: true
    canManageBilling: true
  }
  [UserRole.CONTRACTOR]: {
    canViewOwnData: true
    canUpdateProfile: true
    canViewSchedule: true
    canSubmitNotes: true
    canViewPayments: true
  }
  [UserRole.CLIENT]: {
    canViewOwnData: true
    canUpdateProfile: true
    canViewServices: true
    canRequestServices: true
    canViewInvoices: true
  }
  [UserRole.EMPLOYEE]: {
    canViewAssignedData: true
    canUpdateProfile: true
    canViewSchedule: true
    canManageClients: true
    canViewReports: true
  }
}

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: {
    canViewAllData: true,
    canManageUsers: true,
    canConfigureIntegrations: true,
    canViewAuditLogs: true,
    canManageBilling: true
  },
  [UserRole.CONTRACTOR]: {
    canViewOwnData: true,
    canUpdateProfile: true,
    canViewSchedule: true,
    canSubmitNotes: true,
    canViewPayments: true
  },
  [UserRole.CLIENT]: {
    canViewOwnData: true,
    canUpdateProfile: true,
    canViewServices: true,
    canRequestServices: true,
    canViewInvoices: true
  },
  [UserRole.EMPLOYEE]: {
    canViewAssignedData: true,
    canUpdateProfile: true,
    canViewSchedule: true,
    canManageClients: true,
    canViewReports: true
  }
}

export const ROLE_DASHBOARDS = {
  [UserRole.ADMIN]: '/admin/dashboard',
  [UserRole.CONTRACTOR]: '/contractor/dashboard',
  [UserRole.CLIENT]: '/client/dashboard',
  [UserRole.EMPLOYEE]: '/employee/dashboard'
} as const

export const DEMO_ACCOUNTS = {
  [UserRole.ADMIN]: {
    email: 'admin@snugandkisses.demo',
    password: 'SecureDemo2025!',
    name: 'System Administrator'
  },
  [UserRole.CONTRACTOR]: {
    email: 'contractor@snugandkisses.demo', 
    password: 'SecureDemo2025!',
    name: 'Demo Contractor'
  },
  [UserRole.CLIENT]: {
    email: 'client@snugandkisses.demo',
    password: 'SecureDemo2025!',
    name: 'Demo Client'
  },
  [UserRole.EMPLOYEE]: {
    email: 'employee@snugandkisses.demo',
    password: 'SecureDemo2025!',
    name: 'Demo Employee'
  }
} as const

export const SESSION_CONFIG = {
  maxAge: 15 * 60, // 15 minutes - HIPAA compliance
  updateAge: 5 * 60, // Update session every 5 minutes
  strategy: 'jwt' as const,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  preventReuse: 5 // Remember last 5 passwords
}