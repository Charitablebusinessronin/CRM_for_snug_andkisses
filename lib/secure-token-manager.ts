/*
 * SecureTokenManager
 * RS256-signed JWT access tokens + refresh tokens persisted in Catalyst DataStore
 * NOTE: This module is server-side only. Do not import in client bundles.
 */
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

// Edge Runtime compatibility checks
const isEdgeRuntime = typeof EdgeRuntime !== 'undefined'
const isNodeRuntime = typeof process !== 'undefined' && process?.versions?.node

// Lazy import to avoid bundling Catalyst SDK on the client
let catalyst: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  catalyst = require('zcatalyst-sdk-node')
} catch {
  // ignore in non-catalyst environments
}

export interface SecureTokenData extends JwtPayload {
  userId: string
  role: string
  permissions?: string[]
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class SecureTokenManager {
  private readonly issuer = 'project-rainfall'
  private readonly audience = 'crm-system'

  private getPrivateKey(): Buffer | string {
    // In Edge Runtime, use environment variable directly
    if (isEdgeRuntime) {
      const key = process.env.JWT_SECRET_KEY_BASE64
      if (!key) throw new Error('JWT_SECRET_KEY_BASE64 not set for Edge Runtime')
      return Buffer.from(key, 'base64')
    }

    // Node.js runtime - read from file
    if (!isNodeRuntime) {
      throw new Error('Unsupported runtime for JWT key operations')
    }

    const fs = require('fs')
    const path = require('path')
    
    const keyPath = process.env.JWT_SECRET_KEY
    const passphrase = process.env.JWT_PASSPHRASE
    if (!keyPath) throw new Error('JWT_SECRET_KEY not set')

    const resolved = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath)
    const key = fs.readFileSync(resolved)
    if (passphrase) {
      return { key, passphrase }
    }
    return key
  }

  private getPublicKey(): Buffer {
    // In Edge Runtime, use environment variable directly
    if (isEdgeRuntime) {
      const key = process.env.JWT_PUBLIC_KEY_BASE64
      if (!key) throw new Error('JWT_PUBLIC_KEY_BASE64 not set for Edge Runtime')
      return Buffer.from(key, 'base64')
    }

    // Node.js runtime - read from file
    if (!isNodeRuntime) {
      throw new Error('Unsupported runtime for JWT key operations')
    }

    const fs = require('fs')
    const path = require('path')
    
    const keyPath = process.env.JWT_PUBLIC_KEY
    if (!keyPath) throw new Error('JWT_PUBLIC_KEY not set')
    const resolved = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath)
    return fs.readFileSync(resolved)
  }

  private getRefreshPrivateKey(): Buffer | string {
    // In Edge Runtime, use environment variable directly
    if (isEdgeRuntime) {
      const key = process.env.JWT_REFRESH_SECRET_BASE64 || process.env.JWT_SECRET_KEY_BASE64
      if (!key) throw new Error('JWT_REFRESH_SECRET_BASE64 not set for Edge Runtime')
      return Buffer.from(key, 'base64')
    }

    // Node.js runtime - read from file
    if (!isNodeRuntime) {
      throw new Error('Unsupported runtime for JWT key operations')
    }

    const fs = require('fs')
    const path = require('path')
    
    const keyPath = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_KEY
    const passphrase = process.env.JWT_PASSPHRASE
    if (!keyPath) throw new Error('JWT_REFRESH_SECRET (or JWT_SECRET_KEY) not set')
    const resolved = path.isAbsolute(keyPath) ? keyPath : path.join(process.cwd(), keyPath)
    const key = fs.readFileSync(resolved)
    if (passphrase) {
      return { key, passphrase }
    }
    return key
  }

  async generateAccessToken(userId: string, role: string, permissions: string[] = []): Promise<string> {
    const payload: SecureTokenData = {
      userId,
      role,
      permissions,
      iat: Math.floor(Date.now() / 1000),
    }

    const options: SignOptions = {
      algorithm: 'RS256',
      issuer: this.issuer,
      audience: this.audience,
      expiresIn: '15m',
    }

    return jwt.sign(payload, this.getPrivateKey() as any, options)
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const payload: JwtPayload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    }

    const token = jwt.sign(payload, this.getRefreshPrivateKey() as any, {
      algorithm: 'RS256',
      expiresIn: '7d',
      issuer: this.issuer,
      audience: this.audience,
    })

    await this.storeRefreshToken(userId, token)
    return token
  }

  verifyAccessToken(token: string): SecureTokenData | null {
    try {
      return jwt.verify(token, this.getPublicKey(), {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience,
      }) as SecureTokenData
    } catch {
      return null
    }
  }

  async rotateRefreshToken(oldToken: string): Promise<TokenPair | null> {
    try {
      const decoded = jwt.verify(oldToken, this.getPublicKey(), {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience,
      }) as JwtPayload

      const userId = (decoded as any).userId as string
      if (!userId) return null

      // Revoke old token
      await this.revokeRefreshToken(oldToken, 'rotated')

      // Issue new pair – role/permissions should come from your user store
      const role = 'client'
      const accessToken = await this.generateAccessToken(userId, role)
      const refreshToken = await this.generateRefreshToken(userId)
      return { accessToken, refreshToken }
    } catch {
      return null
    }
  }

  // ============= Persistence =============
  private async getDatastoreTable() {
    if (!catalyst) throw new Error('Catalyst SDK not available')
    const app = catalyst.initialize()
    const datastore = app.datastore()
    return datastore.table('RefreshTokens')
  }

  private async hashToken(token: string): Promise<string> {
    const { createHash } = await import('crypto')
    return createHash('sha256').update(token).digest('hex')
  }

  private getExpiryFromJwt(token: string): string {
    const decoded = jwt.decode(token) as JwtPayload | null
    const exp = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000
    return new Date(exp).toISOString()
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const table = await this.getDatastoreTable()
    await table.insertRow({
      userId,
      refreshToken: await this.hashToken(refreshToken),
      createdAt: new Date().toISOString(),
      expiresAt: this.getExpiryFromJwt(refreshToken),
      isActive: true,
    })
  }

  async revokeRefreshToken(refreshToken: string, reason: string): Promise<void> {
    // Soft revoke by marking matching hash inactive
    const table = await this.getDatastoreTable()
    const hash = await this.hashToken(refreshToken)

    try {
      const zcql = (await (table as any).zcql?.()) || (await catalyst.initialize().zcql?.())
      if (zcql && zcql.executeZCQLQuery) {
        const rows = await zcql.executeZCQLQuery(
          "SELECT ROWID FROM RefreshTokens WHERE refreshToken = '" + hash + "' AND isActive = true"
        )
        const rowId = rows?.[0]?.RefreshTokens?.ROWID
        if (rowId) {
          await table.updateRow({ ROWID: rowId, isActive: false, revokedReason: reason, revokedAt: new Date().toISOString() })
        }
      }
    } catch {
      // best-effort; consider adding an index + exact update by ROWID in your app
    }
  }
}

export const secureTokenManager = new SecureTokenManager()
