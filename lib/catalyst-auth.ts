
// Catalyst Authentication Utilities for Snug & Kisses
export interface CatalystUser {
  user_id: string
  email: string
  first_name: string
  last_name: string
  roles: UserRole[]
  organization_id?: string
}

export type UserRole = 'admin' | 'employee' | 'contractor' | 'client'

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/employee': ['admin', 'employee'],
  '/contractor': ['admin', 'contractor'],
  '/client': ['admin', 'employee', 'contractor', 'client']
}

export class CatalystAuth {
  static async getCurrentUser(): Promise<CatalystUser | null> {
    if (typeof window === 'undefined' || !window.catalyst) {
      return null
    }

    try {
      const isSignedIn = await window.catalyst.auth.isUserSignedIn()
      if (!isSignedIn) {
        return null
      }

      const user = await window.catalyst.auth.getCurrentUser()
      return {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles || ['client'], // Default to client role
        organization_id: user.organization_id
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  static async signOut(): Promise<void> {
    if (typeof window !== 'undefined' && window.catalyst) {
      try {
        await window.catalyst.auth.signOut()
        // Redirect to login page
        window.location.href = '/auth/signin'
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
  }

  static hasPermission(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role))
  }

  static getDefaultRoute(roles: UserRole[]): string {
    if (roles.includes('admin')) return '/admin/dashboard'
    if (roles.includes('employee')) return '/employee/dashboard'
    if (roles.includes('contractor')) return '/contractor/dashboard'
    return '/client/dashboard'
  }

  static async redirectToAppropriatePortal(): Promise<void> {
    const user = await this.getCurrentUser()
    if (user) {
      const defaultRoute = this.getDefaultRoute(user.roles)
      window.location.href = defaultRoute
    } else {
      window.location.href = '/auth/signin'
    }
  }
}

// HIPAA Audit Logging for Authentication Events
export class AuthAuditLogger {
  static async logAuthEvent(
    event: 'login' | 'logout' | 'access_attempt' | 'permission_denied',
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/audit/auth-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          user_id: userId,
          timestamp: new Date().toISOString(),
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          details: details || {}
        })
      })
    } catch (error) {
      console.error('Failed to log auth event:', error)
    }
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}
