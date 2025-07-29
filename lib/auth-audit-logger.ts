/**
 * Authentication-specific HIPAA audit logging
 * Enhanced audit trail for authentication events with tamper-evident logging
 */
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { UserRole } from "@/types/auth"

export interface AuthAuditEvent {
  // Core event information
  action: AuthAuditAction
  userId?: string
  email?: string
  role?: UserRole
  
  // Request context
  ipAddress: string
  userAgent: string
  origin: string
  sessionId?: string
  
  // Security context
  result: "success" | "failure" | "error" | "warning"
  errorMessage?: string
  
  // Additional metadata
  metadata?: {
    loginAttempts?: number
    lockoutDuration?: number
    tokenRotated?: boolean
    deviceFingerprint?: string
    geoLocation?: string
    riskScore?: number
    mfaUsed?: boolean
    previousLogin?: string
  }
}

export enum AuthAuditAction {
  // Authentication events
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  LOGIN_SUCCESS = "LOGIN_SUCCESS", 
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  
  // Session management
  SESSION_CREATED = "SESSION_CREATED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SESSION_TERMINATED = "SESSION_TERMINATED",
  
  // Token management
  TOKEN_ISSUED = "TOKEN_ISSUED",
  TOKEN_REFRESHED = "TOKEN_REFRESHED",
  TOKEN_REVOKED = "TOKEN_REVOKED",
  TOKEN_VALIDATION_FAILED = "TOKEN_VALIDATION_FAILED",
  
  // Security events
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  ACCOUNT_UNLOCKED = "ACCOUNT_UNLOCKED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  
  // Access control
  ACCESS_DENIED = "ACCESS_DENIED",
  PRIVILEGE_ESCALATION_ATTEMPT = "PRIVILEGE_ESCALATION_ATTEMPT",
  UNAUTHORIZED_API_ACCESS = "UNAUTHORIZED_API_ACCESS",
  
  // Admin actions
  USER_CREATED = "USER_CREATED",
  USER_MODIFIED = "USER_MODIFIED",
  USER_DELETED = "USER_DELETED",
  ROLE_CHANGED = "ROLE_CHANGED"
}

class AuthAuditLogger {
  private static instance: AuthAuditLogger
  private loginAttempts: Map<string, { count: number; lastAttempt: Date; locked: boolean }> = new Map()
  
  public static getInstance(): AuthAuditLogger {
    if (!AuthAuditLogger.instance) {
      AuthAuditLogger.instance = new AuthAuditLogger()
    }
    return AuthAuditLogger.instance
  }

  /**
   * Log authentication-specific audit events
   */
  async logAuthEvent(event: AuthAuditEvent): Promise<void> {
    try {
      // Calculate risk score based on various factors
      const riskScore = this.calculateRiskScore(event)
      
      // Enhanced metadata
      const enhancedMetadata = {
        ...event.metadata,
        riskScore,
        timestamp: new Date().toISOString(),
        source: "auth_system",
        compliance: "HIPAA",
      }

      // Log to main audit system
      await logAuditEvent({
        action: event.action,
        resource: this.getResourceFromAction(event.action),
        method: "POST",
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        timestamp: new Date().toISOString(),
        origin: event.origin,
        request_id: crypto.randomUUID(),
        result: event.result,
        error_message: event.errorMessage,
        data: {
          email: event.email,
          role: event.role,
          sessionId: event.sessionId,
          metadata: enhancedMetadata
        }
      })

      // Additional processing for specific events
      await this.processSpecialEvents(event)
      
      // Real-time alerting for critical events
      if (this.isCriticalEvent(event)) {
        await this.sendSecurityAlert(event, riskScore)
      }
      
    } catch (error) {
      console.error("Auth audit logging failed:", error)
      // Critical: Auth audit failures should be escalated immediately
      await this.escalateAuditFailure(event, error)
    }
  }

  /**
   * Calculate risk score for the authentication event
   */
  private calculateRiskScore(event: AuthAuditEvent): number {
    let score = 0
    
    // Base score by action type
    const actionScores: Record<string, number> = {
      [AuthAuditAction.LOGIN_FAILED]: 3,
      [AuthAuditAction.ACCOUNT_LOCKED]: 8,
      [AuthAuditAction.SUSPICIOUS_ACTIVITY]: 9,
      [AuthAuditAction.PRIVILEGE_ESCALATION_ATTEMPT]: 10,
      [AuthAuditAction.UNAUTHORIZED_API_ACCESS]: 7,
      [AuthAuditAction.TOKEN_VALIDATION_FAILED]: 5,
    }
    
    score += actionScores[event.action] || 1
    
    // Increase score for repeated failures
    if (event.metadata?.loginAttempts && event.metadata.loginAttempts > 1) {
      score += Math.min(event.metadata.loginAttempts * 2, 10)
    }
    
    // Decrease score for successful events
    if (event.result === "success") {
      score = Math.max(score - 2, 0)
    }
    
    // Device fingerprint mismatch
    if (event.metadata?.deviceFingerprint === "mismatch") {
      score += 5
    }
    
    return Math.min(score, 10) // Cap at 10
  }

  /**
   * Get resource path based on auth action
   */
  private getResourceFromAction(action: AuthAuditAction): string {
    const resourceMap: Record<string, string> = {
      [AuthAuditAction.LOGIN_ATTEMPT]: "/api/auth/signin",
      [AuthAuditAction.LOGIN_SUCCESS]: "/api/auth/signin", 
      [AuthAuditAction.LOGIN_FAILED]: "/api/auth/signin",
      [AuthAuditAction.LOGOUT]: "/api/auth/signout",
      [AuthAuditAction.TOKEN_REFRESHED]: "/api/auth/refresh",
      [AuthAuditAction.TOKEN_REVOKED]: "/api/auth/revoke",
      [AuthAuditAction.PASSWORD_CHANGED]: "/api/auth/password",
    }
    
    return resourceMap[action] || "/api/auth/unknown"
  }

  /**
   * Process special authentication events
   */
  private async processSpecialEvents(event: AuthAuditEvent): Promise<void> {
    switch (event.action) {
      case AuthAuditAction.LOGIN_FAILED:
        await this.trackFailedLogin(event)
        break
        
      case AuthAuditAction.LOGIN_SUCCESS:
        await this.clearFailedAttempts(event)
        break
        
      case AuthAuditAction.ACCOUNT_LOCKED:
        await this.handleAccountLockout(event)
        break
        
      case AuthAuditAction.SUSPICIOUS_ACTIVITY:
        await this.handleSuspiciousActivity(event)
        break
    }
  }

  /**
   * Track failed login attempts for rate limiting
   */
  private async trackFailedLogin(event: AuthAuditEvent): Promise<void> {
    const key = event.email || event.ipAddress
    const current = this.loginAttempts.get(key) || { count: 0, lastAttempt: new Date(), locked: false }
    
    current.count++
    current.lastAttempt = new Date()
    
    // Lock account after 5 attempts
    if (current.count >= 5) {
      current.locked = true
      
      // Log account lockout
      await this.logAuthEvent({
        ...event,
        action: AuthAuditAction.ACCOUNT_LOCKED,
        result: "warning",
        metadata: {
          ...event.metadata,
          lockoutDuration: 15, // 15 minutes
          loginAttempts: current.count
        }
      })
    }
    
    this.loginAttempts.set(key, current)
  }

  /**
   * Clear failed attempts on successful login
   */
  private async clearFailedAttempts(event: AuthAuditEvent): Promise<void> {
    const key = event.email || event.ipAddress
    this.loginAttempts.delete(key)
  }

  /**
   * Handle account lockout events
   */
  private async handleAccountLockout(event: AuthAuditEvent): Promise<void> {
    // Schedule unlock after 15 minutes
    setTimeout(() => {
      const key = event.email || event.ipAddress
      const current = this.loginAttempts.get(key)
      if (current) {
        current.locked = false
        current.count = 0
        this.loginAttempts.set(key, current)
        
        // Log unlock event
        this.logAuthEvent({
          ...event,
          action: AuthAuditAction.ACCOUNT_UNLOCKED,
          result: "success",
          metadata: {
            ...event.metadata,
            autoUnlocked: true
          }
        })
      }
    }, 15 * 60 * 1000) // 15 minutes
  }

  /**
   * Handle suspicious activity
   */
  private async handleSuspiciousActivity(event: AuthAuditEvent): Promise<void> {
    // Automatically lock account for high-risk suspicious activity
    if (event.metadata?.riskScore && event.metadata.riskScore >= 8) {
      await this.logAuthEvent({
        ...event,
        action: AuthAuditAction.ACCOUNT_LOCKED,
        result: "warning",
        errorMessage: "Account locked due to suspicious activity",
        metadata: {
          ...event.metadata,
          lockoutDuration: 60, // 1 hour for suspicious activity
          reason: "suspicious_activity"
        }
      })
    }
  }

  /**
   * Check if event is critical and requires immediate attention
   */
  private isCriticalEvent(event: AuthAuditEvent): boolean {
    const criticalActions = [
      AuthAuditAction.ACCOUNT_LOCKED,
      AuthAuditAction.SUSPICIOUS_ACTIVITY,
      AuthAuditAction.PRIVILEGE_ESCALATION_ATTEMPT,
      AuthAuditAction.UNAUTHORIZED_API_ACCESS
    ]
    
    return criticalActions.includes(event.action) || 
           (event.metadata?.riskScore && event.metadata.riskScore >= 7)
  }

  /**
   * Send security alerts for critical events
   */
  private async sendSecurityAlert(event: AuthAuditEvent, riskScore: number): Promise<void> {
    try {
      const alert = {
        level: riskScore >= 8 ? "HIGH" : "MEDIUM",
        event: event.action,
        userId: event.userId,
        email: event.email,
        ipAddress: event.ipAddress,
        timestamp: new Date().toISOString(),
        riskScore,
        message: this.generateAlertMessage(event)
      }
      
      // In production, this would send to SIEM, email, SMS, etc.
      console.warn("SECURITY ALERT:", alert)
      
      // Log the alert itself
      await logAuditEvent({
        action: "SECURITY_ALERT_SENT",
        resource: "/system/security/alert",
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        timestamp: new Date().toISOString(),
        origin: "security_system",
        request_id: crypto.randomUUID(),
        result: "success",
        data: alert
      })
      
    } catch (error) {
      console.error("Failed to send security alert:", error)
    }
  }

  /**
   * Generate human-readable alert message
   */
  private generateAlertMessage(event: AuthAuditEvent): string {
    const messages: Record<string, string> = {
      [AuthAuditAction.ACCOUNT_LOCKED]: `Account locked due to multiple failed login attempts`,
      [AuthAuditAction.SUSPICIOUS_ACTIVITY]: `Suspicious authentication activity detected`,
      [AuthAuditAction.PRIVILEGE_ESCALATION_ATTEMPT]: `Attempt to escalate privileges detected`,
      [AuthAuditAction.UNAUTHORIZED_API_ACCESS]: `Unauthorized API access attempt`,
    }
    
    return messages[event.action] || `Security event: ${event.action}`
  }

  /**
   * Escalate audit logging failures
   */
  private async escalateAuditFailure(event: AuthAuditEvent, error: any): Promise<void> {
    try {
      console.error("CRITICAL: Auth audit logging failure", {
        event: event.action,
        userId: event.userId,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // In production, this would trigger immediate alerts to compliance team
      
    } catch (escalationError) {
      console.error("Failed to escalate audit failure:", escalationError)
    }
  }

  /**
   * Get authentication statistics for monitoring
   */
  getAuthStats(): {
    totalAttempts: number
    lockedAccounts: number
    averageRiskScore: number
    criticalEvents: number
  } {
    const locked = Array.from(this.loginAttempts.values()).filter(a => a.locked).length
    
    return {
      totalAttempts: this.loginAttempts.size,
      lockedAccounts: locked,
      averageRiskScore: 0, // Would calculate from recent events
      criticalEvents: 0 // Would count from recent events
    }
  }
}

// Singleton instance
export const authAuditLogger = AuthAuditLogger.getInstance()

// Convenience functions
export async function logAuthEvent(event: AuthAuditEvent): Promise<void> {
  return authAuditLogger.logAuthEvent(event)
}

// Helper functions for common auth events
export async function logLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  origin: string,
  result: "success" | "failure",
  error?: string,
  metadata?: any
): Promise<void> {
  return logAuthEvent({
    action: result === "success" ? AuthAuditAction.LOGIN_SUCCESS : AuthAuditAction.LOGIN_FAILED,
    email,
    ipAddress,
    userAgent,
    origin,
    result,
    errorMessage: error,
    metadata
  })
}

export async function logLogout(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  origin: string
): Promise<void> {
  return logAuthEvent({
    action: AuthAuditAction.LOGOUT,
    userId,
    email,
    ipAddress,
    userAgent,
    origin,
    result: "success"
  })
}

export async function logTokenEvent(
  action: AuthAuditAction.TOKEN_ISSUED | AuthAuditAction.TOKEN_REFRESHED | AuthAuditAction.TOKEN_REVOKED,
  userId: string,
  ipAddress: string,
  userAgent: string,
  origin: string,
  metadata?: any
): Promise<void> {
  return logAuthEvent({
    action,
    userId,
    ipAddress,
    userAgent,
    origin,
    result: "success",
    metadata
  })
}