/**
 * Security Configuration for HIPAA Compliance
 * This file contains security-related constants and utilities
 */

// Session timeout in milliseconds (30 minutes)
export const SESSION_TIMEOUT = 30 * 60 * 1000;

// Password policy requirements
export const PASSWORD_POLICY = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+\-={}[]|:;"\'<>,.?/`~',
};

// Audit log actions
export const AUDIT_ACTIONS = {
  LOGIN: 'USER_LOGIN',
  LOGOUT: 'USER_LOGOUT',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
} as const;

/**
 * Logs security-related events
 */
export class SecurityLogger {
  static log(action: string, userId?: string, details: Record<string, unknown> = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${action}] User: ${userId || 'system'}`, details);
    
    // In production, this would send logs to a secure logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement secure logging service integration
    }
  }
}

/**
 * Validates a password against the password policy
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < PASSWORD_POLICY.minLength) {
    return { 
      valid: false, 
      message: `Password must be at least ${PASSWORD_POLICY.minLength} characters long` 
    };
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter' 
    };
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one lowercase letter' 
    };
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one number' 
    };
  }

  if (PASSWORD_POLICY.requireSpecialChars && !new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    return { 
      valid: false, 
      message: `Password must contain at least one special character (${PASSWORD_POLICY.specialChars})` 
    };
  }

  return { valid: true };
}
