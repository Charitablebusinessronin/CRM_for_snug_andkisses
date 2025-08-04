/**
 * Token Management System with Refresh Token Rotation
 * HIPAA-compliant token lifecycle management
 */
import bcrypt from "bcryptjs"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { UserRole } from "@/types/auth"

interface RefreshToken {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  lastUsed: Date
  isRevoked: boolean
  revokedAt?: Date
  revokedReason?: string
  deviceFingerprint?: string
  ipAddress: string
  userAgent: string
}

interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

interface TokenValidationResult {
  valid: boolean
  userId?: string
  role?: UserRole
  error?: string
  shouldRotate?: boolean
}

class TokenManager {
  private refreshTokens: Map<string, RefreshToken> = new Map()
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  private readonly ACCESS_TOKEN_TTL = 15 * 60 * 1000 // 15 minutes
  private readonly ROTATION_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Generate a new access token with embedded user information
   */
  private async generateAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload = {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.ACCESS_TOKEN_TTL) / 1000),
      type: 'access'
    }

    // In production, use proper JWT signing with RS256
    const token = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return token
  }

  /**
   * Generate a cryptographically secure refresh token
   */
  private async generateRefreshTokenString(): Promise<string> {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const timestamp = Date.now().toString()
    const combined = timestamp + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    return Buffer.from(combined).toString('base64url')
  }

  /**
   * Create a new token pair for a user
   */
  async createTokenPair(
    userId: string, 
    role: UserRole,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string
  ): Promise<TokenPair> {
    try {
      // Generate tokens
      const accessToken = await this.generateAccessToken(userId, role)
      const refreshTokenString = await this.generateRefreshTokenString()
      const tokenHash = await bcrypt.hash(refreshTokenString, 12)
      
      const now = new Date()
      const expiresAt = new Date(now.getTime() + this.REFRESH_TOKEN_TTL)

      // Store refresh token metadata
      const refreshToken: RefreshToken = {
        id: crypto.randomUUID(),
        userId,
        tokenHash,
        expiresAt,
        createdAt: now,
        lastUsed: now,
        isRevoked: false,
        deviceFingerprint,
        ipAddress,
        userAgent
      }

      this.refreshTokens.set(refreshToken.id, refreshToken)

      // Clean up old tokens for this user (keep only 3 most recent)
      await this.cleanupUserTokens(userId)

      // Audit log
      await logAuditEvent({
        action: "TOKEN_CREATED",
        resource: "/api/auth/token",
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: "internal",
        request_id: crypto.randomUUID(),
        result: "success",
        data: { 
          tokenId: refreshToken.id,
          expiresAt: expiresAt.toISOString()
        }
      })

      return {
        accessToken,
        refreshToken: refreshTokenString,
        expiresAt
      }
    } catch (error) {
      await logAuditEvent({
        action: "TOKEN_CREATION_FAILED",
        resource: "/api/auth/token",
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: "internal",
        request_id: crypto.randomUUID(),
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error"
      })
      throw error
    }
  }

  /**
   * Validate and potentially rotate a refresh token
   */
  async validateAndRotateToken(
    refreshTokenString: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string
  ): Promise<{ valid: boolean; newTokenPair?: TokenPair; userId?: string; role?: UserRole; error?: string }> {
    try {
      // Find matching refresh token
      let matchingToken: RefreshToken | null = null
      let tokenId = ""

      for (const [id, token] of this.refreshTokens.entries()) {
        const isMatch = await bcrypt.compare(refreshTokenString, token.tokenHash)
        if (isMatch) {
          matchingToken = token
          tokenId = id
          break
        }
      }

      if (!matchingToken) {
        await logAuditEvent({
          action: "INVALID_REFRESH_TOKEN",
          resource: "/api/auth/token/refresh",
          ip_address: ipAddress,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
          origin: "internal",
          request_id: crypto.randomUUID(),
          result: "failure",
          error_message: "Refresh token not found"
        })
        return { valid: false, error: "Invalid refresh token" }
      }

      // Check if token is revoked
      if (matchingToken.isRevoked) {
        await logAuditEvent({
          action: "REVOKED_TOKEN_USED",
          resource: "/api/auth/token/refresh",
          user_id: matchingToken.userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
          origin: "internal",
          request_id: crypto.randomUUID(),
          result: "failure",
          error_message: "Revoked token attempted to be used",
          data: { tokenId: matchingToken.id }
        })
        return { valid: false, error: "Token has been revoked" }
      }

      // Check if token is expired
      if (new Date() > matchingToken.expiresAt) {
        await this.revokeToken(tokenId, "expired", ipAddress, userAgent)
        return { valid: false, error: "Refresh token expired" }
      }

      // Security check: verify device fingerprint if available
      if (matchingToken.deviceFingerprint && deviceFingerprint && 
          matchingToken.deviceFingerprint !== deviceFingerprint) {
        await this.revokeToken(tokenId, "device_mismatch", ipAddress, userAgent)
        await logAuditEvent({
          action: "SUSPICIOUS_TOKEN_USE",
          resource: "/api/auth/token/refresh",
          user_id: matchingToken.userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
          origin: "internal",
          request_id: crypto.randomUUID(),
          result: "failure",
          error_message: "Device fingerprint mismatch",
          data: { tokenId: matchingToken.id }
        })
        return { valid: false, error: "Security violation detected" }
      }

      // Update last used timestamp
      matchingToken.lastUsed = new Date()
      this.refreshTokens.set(tokenId, matchingToken)

      // Determine if we should rotate (after 24 hours or if nearing expiry)
      const age = Date.now() - matchingToken.createdAt.getTime()
      const timeUntilExpiry = matchingToken.expiresAt.getTime() - Date.now()
      const shouldRotate = age > this.ROTATION_THRESHOLD || timeUntilExpiry < (24 * 60 * 60 * 1000)

      if (shouldRotate) {
        // Get user role - in production this would query the database
        const userRole = this.getUserRole(matchingToken.userId)
        
        // Create new token pair
        const newTokenPair = await this.createTokenPair(
          matchingToken.userId,
          userRole,
          ipAddress,
          userAgent,
          deviceFingerprint
        )

        // Revoke old token
        await this.revokeToken(tokenId, "rotated", ipAddress, userAgent)

        await logAuditEvent({
          action: "TOKEN_ROTATED",
          resource: "/api/auth/token/refresh",
          user_id: matchingToken.userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
          origin: "internal",
          request_id: crypto.randomUUID(),
          result: "success",
          data: { 
            oldTokenId: tokenId,
            newTokenExpiresAt: newTokenPair.expiresAt.toISOString()
          }
        })

        return {
          valid: true,
          newTokenPair,
          userId: matchingToken.userId,
          role: userRole
        }
      }

      // Token is valid but no rotation needed
      await logAuditEvent({
        action: "TOKEN_VALIDATED",
        resource: "/api/auth/token/refresh",
        user_id: matchingToken.userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: "internal",
        request_id: crypto.randomUUID(),
        result: "success",
        data: { tokenId: matchingToken.id }
      })

      return {
        valid: true,
        userId: matchingToken.userId,
        role: this.getUserRole(matchingToken.userId)
      }

    } catch (error) {
      await logAuditEvent({
        action: "TOKEN_VALIDATION_ERROR",
        resource: "/api/auth/token/refresh",
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: "internal",
        request_id: crypto.randomUUID(),
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error"
      })
      return { valid: false, error: "Token validation failed" }
    }
  }

  /**
   * Revoke a refresh token
   */
  async revokeToken(
    tokenId: string, 
    reason: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    const token = this.refreshTokens.get(tokenId)
    if (!token) return false

    token.isRevoked = true
    token.revokedAt = new Date()
    token.revokedReason = reason
    this.refreshTokens.set(tokenId, token)

    await logAuditEvent({
      action: "TOKEN_REVOKED",
      resource: "/api/auth/token/revoke",
      user_id: token.userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin: "internal",
      request_id: crypto.randomUUID(),
      result: "success",
      data: { 
        tokenId,
        reason,
        revokedAt: token.revokedAt.toISOString()
      }
    })

    return true
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(
    userId: string,
    reason: string,
    ipAddress: string,
    userAgent: string
  ): Promise<number> {
    let revokedCount = 0

    for (const [tokenId, token] of this.refreshTokens.entries()) {
      if (token.userId === userId && !token.isRevoked) {
        await this.revokeToken(tokenId, reason, ipAddress, userAgent)
        revokedCount++
      }
    }

    return revokedCount
  }

  /**
   * Clean up old tokens for a user (keep only 3 most recent)
   */
  private async cleanupUserTokens(userId: string): Promise<void> {
    const userTokens = Array.from(this.refreshTokens.entries())
      .filter(([_, token]) => token.userId === userId && !token.isRevoked)
      .sort(([_, a], [__, b]) => b.createdAt.getTime() - a.createdAt.getTime())

    // Keep only the 3 most recent tokens
    const tokensToRevoke = userTokens.slice(3)

    for (const [tokenId, _] of tokensToRevoke) {
      await this.revokeToken(tokenId, "cleanup", "system", "system")
    }
  }

  /**
   * Get user role - mock implementation
   * In production, this would query the database
   */
  private getUserRole(userId: string): UserRole {
    // Mock implementation - in production, query database
    if (userId.includes('admin')) return UserRole.ADMIN
    if (userId.includes('contractor')) return UserRole.CONTRACTOR
    if (userId.includes('client')) return UserRole.CLIENT
    if (userId.includes('employee')) return UserRole.EMPLOYEE
    return UserRole.CLIENT // default
  }

  /**
   * Get token statistics for monitoring
   */
  getTokenStats(): {
    totalTokens: number
    activeTokens: number
    revokedTokens: number
    expiredTokens: number
  } {
    const now = new Date()
    const tokens = Array.from(this.refreshTokens.values())

    return {
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => !t.isRevoked && t.expiresAt > now).length,
      revokedTokens: tokens.filter(t => t.isRevoked).length,
      expiredTokens: tokens.filter(t => !t.isRevoked && t.expiresAt <= now).length
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date()
    let cleanupCount = 0

    for (const [tokenId, token] of this.refreshTokens.entries()) {
      if (!token.isRevoked && token.expiresAt <= now) {
        this.refreshTokens.delete(tokenId)
        cleanupCount++
      }
    }

    return cleanupCount
  }
}

// Singleton instance
const tokenManager = new TokenManager()

// Export the token manager instance and key functions
export { tokenManager, TokenManager }

export async function createTokenPair(
  userId: string,
  role: UserRole,
  ipAddress: string,
  userAgent: string,
  deviceFingerprint?: string
) {
  return tokenManager.createTokenPair(userId, role, ipAddress, userAgent, deviceFingerprint)
}

export async function validateAndRotateToken(
  refreshToken: string,
  ipAddress: string,
  userAgent: string,
  deviceFingerprint?: string
) {
  return tokenManager.validateAndRotateToken(refreshToken, ipAddress, userAgent, deviceFingerprint)
}

export async function revokeToken(
  tokenId: string,
  reason: string,
  ipAddress: string,
  userAgent: string
) {
  return tokenManager.revokeToken(tokenId, reason, ipAddress, userAgent)
}

export async function revokeAllUserTokens(
  userId: string,
  reason: string,
  ipAddress: string,
  userAgent: string
) {
  return tokenManager.revokeAllUserTokens(userId, reason, ipAddress, userAgent)
}

// Cleanup job - run every hour
if (typeof setInterval === 'function') {
  setInterval(async () => {
    const cleaned = await tokenManager.cleanupExpiredTokens()
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired refresh tokens`)
    }
  }, 60 * 60 * 1000) // 1 hour
}