/**
 * Authentication Service
 * Handles all authentication operations with HIPAA compliance
 */

import { LoginCredentials, AuthResponse, User, ValidationResult, AuditEvent } from '../types/AuthTypes'
import { HIPAAAuditService } from '../../hipaa-compliance/services/HIPAAAuditService'
import { ZohoAuthService } from './ZohoAuthService'

export class AuthService {
  private auditService: HIPAAAuditService
  private zohoAuth: ZohoAuthService

  constructor() {
    this.auditService = new HIPAAAuditService()
    this.zohoAuth = new ZohoAuthService()
  }

  /**
   * Authenticate user with credentials
   */
  async authenticateUser(
    credentials: LoginCredentials,
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResponse> {
    try {
      // Log authentication attempt
      await this.auditService.logEvent({
        eventType: 'AUTH_ATTEMPT',
        userEmail: credentials.email,
        timestamp: new Date().toISOString(),
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        details: { authMethod: 'credentials' },
        complianceLogged: true
      })

      // Validate credentials format
      const validation = this.validateCredentials(credentials)
      if (!validation.isValid) {
        await this.logFailedAuth(credentials.email, validation.reason || 'Invalid credentials', clientInfo)
        return {
          success: false,
          message: validation.reason || 'Invalid credentials'
        }
      }

      // Authenticate with Zoho
      const zohoResult = await this.zohoAuth.authenticate(credentials)
      if (!zohoResult.success) {
        await this.logFailedAuth(credentials.email, zohoResult.message || 'Authentication failed', clientInfo)
        return zohoResult
      }

      // Generate session tokens
      const tokens = await this.generateTokens(zohoResult.user!)
      
      // Log successful authentication
      await this.auditService.logEvent({
        eventType: 'AUTH_SUCCESS',
        userEmail: zohoResult.user!.email,
        timestamp: new Date().toISOString(),
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        details: {
          userId: zohoResult.user!.id,
          role: zohoResult.user!.role,
          hipaaAccess: zohoResult.user!.hipaaCompliant
        },
        complianceLogged: true
      })

      return {
        success: true,
        user: zohoResult.user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        message: 'Authentication successful'
      }

    } catch (error) {
      await this.logAuthError(credentials.email, error, clientInfo)
      return {
        success: false,
        message: 'Authentication service error'
      }
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = await this.validateRefreshToken(refreshToken)
      if (!decoded) {
        return { success: false, message: 'Invalid refresh token' }
      }

      const user = await this.getUserById(decoded.userId)
      if (!user) {
        return { success: false, message: 'User not found' }
      }

      const tokens = await this.generateTokens(user)
      
      return {
        success: true,
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }

    } catch (error) {
      return { success: false, message: 'Token refresh failed' }
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(userId: string, clientInfo?: { ipAddress?: string; userAgent?: string }): Promise<void> {
    try {
      const user = await this.getUserById(userId)
      
      // Invalidate all user tokens
      await this.invalidateUserTokens(userId)
      
      // Log logout event
      await this.auditService.logEvent({
        eventType: 'AUTH_LOGOUT',
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
        ipAddress: clientInfo?.ipAddress,
        userAgent: clientInfo?.userAgent,
        details: { userId },
        complianceLogged: true
      })

    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Validate user session
   */
  async validateSession(token: string): Promise<ValidationResult> {
    try {
      const decoded = await this.validateAccessToken(token)
      if (!decoded) {
        return { isValid: false, reason: 'Invalid or expired token' }
      }

      const user = await this.getUserById(decoded.userId)
      if (!user) {
        return { isValid: false, reason: 'User not found' }
      }

      if (user.status !== 'active') {
        return { isValid: false, reason: 'User account not active' }
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: decoded.permissions
        }
      }

    } catch (error) {
      return { isValid: false, reason: 'Session validation failed' }
    }
  }

  /**
   * Validate credentials format
   */
  private validateCredentials(credentials: LoginCredentials): ValidationResult {
    if (!credentials.email || !credentials.password) {
      return { isValid: false, reason: 'Email and password are required' }
    }

    if (!this.isValidEmail(credentials.email)) {
      return { isValid: false, reason: 'Invalid email format' }
    }

    if (credentials.password.length < 12) {
      return { isValid: false, reason: 'Password must be at least 12 characters' }
    }

    return { isValid: true }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Implementation would use JWT or similar
    // This is a placeholder for the token generation logic
    return {
      accessToken: `access_${user.id}_${Date.now()}`,
      refreshToken: `refresh_${user.id}_${Date.now()}`
    }
  }

  /**
   * Log failed authentication attempt
   */
  private async logFailedAuth(
    email: string, 
    reason: string, 
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.auditService.logEvent({
      eventType: 'AUTH_FAILED',
      userEmail: email,
      timestamp: new Date().toISOString(),
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      details: { reason },
      complianceLogged: true
    })
  }

  /**
   * Log authentication error
   */
  private async logAuthError(
    email: string, 
    error: any, 
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.auditService.logEvent({
      eventType: 'AUTH_ERROR',
      userEmail: email,
      timestamp: new Date().toISOString(),
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent,
      details: { 
        error: error.message,
        stack: error.stack
      },
      complianceLogged: true
    })
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Get user by ID (placeholder)
   */
  private async getUserById(userId: string): Promise<User | null> {
    // Implementation would fetch from database/CRM
    return null
  }

  /**
   * Validate access token (placeholder)
   */
  private async validateAccessToken(token: string): Promise<any> {
    // Implementation would validate JWT token
    return null
  }

  /**
   * Validate refresh token (placeholder)
   */
  private async validateRefreshToken(token: string): Promise<any> {
    // Implementation would validate refresh token
    return null
  }

  /**
   * Invalidate user tokens (placeholder)
   */
  private async invalidateUserTokens(userId: string): Promise<void> {
    // Implementation would invalidate all tokens for user
  }
}