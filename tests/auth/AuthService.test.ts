/**
 * AuthService Unit Tests
 * Comprehensive testing for authentication service with HIPAA compliance
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { AuthService } from '../../modules/auth/services/AuthService'
import { HIPAAAuditService } from '../../modules/hipaa-compliance/services/HIPAAAuditService'
import type { 
  LoginCredentials, 
  AuthResponse, 
  MFASetupRequest,
  MFAVerificationRequest 
} from '../../modules/auth/types/AuthTypes'

// Mock dependencies
jest.mock('../../modules/hipaa-compliance/services/HIPAAAuditService')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')
jest.mock('crypto')

describe('AuthService', () => {
  let authService: AuthService
  let mockAuditService: jest.Mocked<HIPAAAuditService>

  const mockUser = {
    id: 'user-123',
    email: 'test@snugkisses.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'client' as const,
    passwordHash: '$2a$12$mockHashedPassword',
    isActive: true,
    mfaEnabled: false
  }

  const mockCredentials: LoginCredentials = {
    email: 'test@snugkisses.com',
    password: 'SecurePassword123!',
    rememberMe: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuditService = new HIPAAAuditService() as jest.Mocked<HIPAAAuditService>
    authService = new AuthService()
    
    // Set up default mocks
    jest.spyOn(authService as any, 'findUserByEmail').mockResolvedValue(mockUser)
    jest.spyOn(authService as any, 'validatePassword').mockResolvedValue(true)
    jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('authenticateUser', () => {
    test('should successfully authenticate valid user', async () => {
      const clientInfo = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }

      const result = await authService.authenticateUser(mockCredentials, clientInfo)

      expect(result.success).toBe(true)
      expect(result.data?.user.email).toBe(mockCredentials.email)
      expect(result.data?.accessToken).toBe('mock-access-token')
      expect(result.data?.refreshToken).toBe('mock-refresh-token')
    })

    test('should fail authentication for non-existent user', async () => {
      jest.spyOn(authService as any, 'findUserByEmail').mockResolvedValue(null)

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid credentials')
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILED',
          userEmail: mockCredentials.email
        })
      )
    })

    test('should fail authentication for invalid password', async () => {
      jest.spyOn(authService as any, 'validatePassword').mockResolvedValue(false)

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid credentials')
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILED',
          details: expect.objectContaining({
            reason: 'invalid_password'
          })
        })
      )
    })

    test('should fail authentication for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false }
      jest.spyOn(authService as any, 'findUserByEmail').mockResolvedValue(inactiveUser)

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Account is inactive')
    })

    test('should require MFA when enabled for user', async () => {
      const mfaUser = { ...mockUser, mfaEnabled: true }
      jest.spyOn(authService as any, 'findUserByEmail').mockResolvedValue(mfaUser)

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.requiresMFA).toBe(true)
      expect(result.mfaToken).toBeDefined()
    })

    test('should log HIPAA audit events for successful login', async () => {
      const clientInfo = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }

      await authService.authenticateUser(mockCredentials, clientInfo)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_SUCCESS',
          userEmail: mockCredentials.email,
          details: expect.objectContaining({
            role: mockUser.role,
            ipAddress: clientInfo.ipAddress
          })
        })
      )
    })

    test('should handle authentication errors gracefully', async () => {
      jest.spyOn(authService as any, 'findUserByEmail').mockRejectedValue(
        new Error('Database connection failed')
      )

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Authentication service error')
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTH_ERROR'
        })
      )
    })
  })

  describe('setupMFA', () => {
    const mfaSetupRequest: MFASetupRequest = {
      userId: 'user-123',
      method: 'sms',
      phoneNumber: '+1234567890'
    }

    test('should successfully set up MFA for user', async () => {
      jest.spyOn(authService as any, 'generateMFASecret').mockReturnValue('secret123')
      jest.spyOn(authService as any, 'updateUserMFASettings').mockResolvedValue(true)

      const result = await authService.setupMFA(mfaSetupRequest)

      expect(result.success).toBe(true)
      expect(result.data?.secret).toBe('secret123')
      expect(result.data?.qrCode).toBeDefined()
    })

    test('should validate phone number for SMS MFA', async () => {
      const invalidRequest = { ...mfaSetupRequest, phoneNumber: 'invalid-phone' }

      const result = await authService.setupMFA(invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone number')
    })

    test('should log MFA setup in audit trail', async () => {
      jest.spyOn(authService as any, 'generateMFASecret').mockReturnValue('secret123')
      jest.spyOn(authService as any, 'updateUserMFASettings').mockResolvedValue(true)

      await authService.setupMFA(mfaSetupRequest)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'MFA_SETUP',
          details: expect.objectContaining({
            userId: mfaSetupRequest.userId,
            method: mfaSetupRequest.method
          })
        })
      )
    })
  })

  describe('verifyMFA', () => {
    const mfaVerificationRequest: MFAVerificationRequest = {
      mfaToken: 'mfa-token-123',
      verificationCode: '123456',
      method: 'sms'
    }

    test('should successfully verify MFA code', async () => {
      jest.spyOn(authService as any, 'validateMFAToken').mockResolvedValue(mockUser)
      jest.spyOn(authService as any, 'verifyMFACode').mockResolvedValue(true)
      jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
        accessToken: 'final-access-token',
        refreshToken: 'final-refresh-token'
      })

      const result = await authService.verifyMFA(mfaVerificationRequest)

      expect(result.success).toBe(true)
      expect(result.data?.accessToken).toBe('final-access-token')
      expect(result.data?.user.email).toBe(mockUser.email)
    })

    test('should fail verification for invalid MFA token', async () => {
      jest.spyOn(authService as any, 'validateMFAToken').mockResolvedValue(null)

      const result = await authService.verifyMFA(mfaVerificationRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid or expired MFA token')
    })

    test('should fail verification for incorrect code', async () => {
      jest.spyOn(authService as any, 'validateMFAToken').mockResolvedValue(mockUser)
      jest.spyOn(authService as any, 'verifyMFACode').mockResolvedValue(false)

      const result = await authService.verifyMFA(mfaVerificationRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid verification code')
    })

    test('should log MFA verification attempts', async () => {
      jest.spyOn(authService as any, 'validateMFAToken').mockResolvedValue(mockUser)
      jest.spyOn(authService as any, 'verifyMFACode').mockResolvedValue(true)

      await authService.verifyMFA(mfaVerificationRequest)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'MFA_VERIFIED',
          userEmail: mockUser.email
        })
      )
    })
  })

  describe('refreshToken', () => {
    test('should successfully refresh valid token', async () => {
      const refreshToken = 'valid-refresh-token'
      jest.spyOn(authService as any, 'validateRefreshToken').mockResolvedValue(mockUser)
      jest.spyOn(authService as any, 'generateAccessToken').mockResolvedValue('new-access-token')

      const result = await authService.refreshToken(refreshToken)

      expect(result.success).toBe(true)
      expect(result.data?.accessToken).toBe('new-access-token')
    })

    test('should fail refresh for invalid token', async () => {
      const invalidToken = 'invalid-refresh-token'
      jest.spyOn(authService as any, 'validateRefreshToken').mockResolvedValue(null)

      const result = await authService.refreshToken(invalidToken)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid refresh token')
    })
  })

  describe('logoutUser', () => {
    test('should successfully logout user', async () => {
      const userId = 'user-123'
      jest.spyOn(authService as any, 'invalidateUserTokens').mockResolvedValue(true)

      const result = await authService.logoutUser(userId)

      expect(result.success).toBe(true)
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGOUT',
          details: expect.objectContaining({
            userId
          })
        })
      )
    })

    test('should handle logout errors gracefully', async () => {
      const userId = 'user-123'
      jest.spyOn(authService as any, 'invalidateUserTokens').mockRejectedValue(
        new Error('Token invalidation failed')
      )

      const result = await authService.logoutUser(userId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Logout failed')
    })
  })

  describe('validateSession', () => {
    test('should successfully validate active session', async () => {
      const accessToken = 'valid-access-token'
      jest.spyOn(authService as any, 'decodeToken').mockReturnValue({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      })
      jest.spyOn(authService as any, 'isTokenActive').mockResolvedValue(true)

      const result = await authService.validateSession(accessToken)

      expect(result.success).toBe(true)
      expect(result.data?.valid).toBe(true)
      expect(result.data?.user.email).toBe(mockUser.email)
    })

    test('should fail validation for expired token', async () => {
      const expiredToken = 'expired-access-token'
      jest.spyOn(authService as any, 'decodeToken').mockImplementation(() => {
        throw new Error('Token expired')
      })

      const result = await authService.validateSession(expiredToken)

      expect(result.success).toBe(true)
      expect(result.data?.valid).toBe(false)
    })
  })

  describe('HIPAA Compliance', () => {
    test('should log all authentication attempts', async () => {
      await authService.authenticateUser(mockCredentials)

      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(1)
    })

    test('should include required audit fields', async () => {
      const clientInfo = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }

      await authService.authenticateUser(mockCredentials, clientInfo)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: expect.any(String),
          userEmail: expect.any(String),
          timestamp: expect.any(String),
          details: expect.any(Object)
        })
      )
    })

    test('should handle audit logging failures gracefully', async () => {
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit logging failed'))

      const result = await authService.authenticateUser(mockCredentials)

      // Authentication should still succeed even if audit logging fails
      expect(result.success).toBe(true)
    })
  })

  describe('Security Features', () => {
    test('should implement rate limiting for login attempts', async () => {
      // Simulate multiple failed login attempts
      jest.spyOn(authService as any, 'validatePassword').mockResolvedValue(false)
      jest.spyOn(authService as any, 'checkRateLimit').mockResolvedValue(false)

      const result = await authService.authenticateUser(mockCredentials)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Too many failed attempts')
    })

    test('should sanitize user input', async () => {
      const maliciousCredentials = {
        email: 'test@snugkisses.com<script>alert("xss")</script>',
        password: 'password'
      }

      const sanitizeSpy = jest.spyOn(authService as any, 'sanitizeInput')

      await authService.authenticateUser(maliciousCredentials as LoginCredentials)

      expect(sanitizeSpy).toHaveBeenCalled()
    })

    test('should hash passwords securely', async () => {
      const bcrypt = require('bcryptjs')
      const hashSpy = jest.spyOn(bcrypt, 'hash')

      await authService.hashPassword('testPassword123!')

      expect(hashSpy).toHaveBeenCalledWith('testPassword123!', 12)
    })
  })
})