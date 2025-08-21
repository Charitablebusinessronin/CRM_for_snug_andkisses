/**
 * Client-side authentication utilities with automatic token refresh
 * Handles seamless authentication flow with fallback mechanisms
 */

interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

interface AuthResponse {
  success: boolean
  data?: TokenInfo
  error?: string
}

class AuthClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: Date | null = null
  private refreshPromise: Promise<boolean> | null = null

  constructor() {
    // Initialize tokens from localStorage on client side
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage()
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('access_token')
      this.refreshToken = localStorage.getItem('refresh_token')
      const expiresAt = localStorage.getItem('token_expires_at')
      if (expiresAt) {
        this.tokenExpiresAt = new Date(expiresAt)
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error)
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(tokenInfo: TokenInfo) {
    try {
      localStorage.setItem('access_token', tokenInfo.accessToken)
      localStorage.setItem('refresh_token', tokenInfo.refreshToken)
      localStorage.setItem('token_expires_at', tokenInfo.expiresAt)
      
      this.accessToken = tokenInfo.accessToken
      this.refreshToken = tokenInfo.refreshToken
      this.tokenExpiresAt = new Date(tokenInfo.expiresAt)
    } catch (error) {
      console.error('Failed to save tokens to storage:', error)
    }
  }

  /**
   * Clear tokens from storage and memory
   */
  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiresAt = null
    
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expires_at')
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error)
    }
  }

  /**
   * Check if token needs refresh (expires in less than 5 minutes)
   */
  private needsRefresh(): boolean {
    if (!this.tokenExpiresAt) return true
    
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    return this.tokenExpiresAt <= fiveMinutesFromNow
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.warn('No refresh token available')
      return false
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          deviceFingerprint: this.getDeviceFingerprint()
        }),
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.data) {
        this.saveTokensToStorage(result.data)
        console.log('Token refreshed successfully')
        return true
      } else {
        console.error('Token refresh failed:', result.error)
        this.clearTokens()
        return false
      }
    } catch (error) {
      console.error('Token refresh request failed:', error)
      this.clearTokens()
      return false
    }
  }

  /**
   * Get device fingerprint for security
   */
  private getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server'
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }
    
    return btoa(
      navigator.userAgent +
      navigator.language +
      screen.width +
      screen.height +
      (canvas.toDataURL ? canvas.toDataURL() : 'no-canvas')
    ).slice(0, 32)
  }

  /**
   * Get valid access token with automatic refresh
   */
  public async getValidToken(): Promise<string | null> {
    // If we need to refresh and there's no ongoing refresh, start one
    if (this.needsRefresh() && !this.refreshPromise) {
      this.refreshPromise = this.refreshAccessToken()
    }

    // Wait for any ongoing refresh to complete
    if (this.refreshPromise) {
      const refreshSuccessful = await this.refreshPromise
      this.refreshPromise = null
      
      if (!refreshSuccessful) {
        return null
      }
    }

    return this.accessToken
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  public async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidToken()
    
    if (!token) {
      throw new Error('No valid authentication token available')
    }

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    }

    let response = await fetch(url, {
      ...options,
      headers,
    })

    // If we get 401, try to refresh token once more
    if (response.status === 401 && this.refreshToken) {
      console.log('Received 401, attempting token refresh...')
      
      const refreshSuccessful = await this.refreshAccessToken()
      if (refreshSuccessful) {
        const newToken = await this.getValidToken()
        if (newToken) {
          // Retry the request with new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          })
        }
      }
    }

    return response
  }

  /**
   * Initialize tokens after login
   */
  public setTokens(tokenInfo: TokenInfo) {
    this.saveTokensToStorage(tokenInfo)
  }

  /**
   * Logout and clear tokens
   */
  public logout() {
    this.clearTokens()
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.needsRefresh()
  }
}

// Export singleton instance
export const authClient = new AuthClient()

// Export convenience function for components
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  return authClient.authenticatedFetch(url, options)
}