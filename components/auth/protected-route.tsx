
"use client"

import { useEffect, useState } from 'react'
import { CatalystAuth, UserRole, ROUTE_PERMISSIONS, CatalystUser } from '@/lib/catalyst-auth'
import { AuthAuditLogger } from '@/lib/catalyst-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallbackRoute?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = ['client'],
  fallbackRoute = '/auth/signin' 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<CatalystUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const currentUser = await CatalystAuth.getCurrentUser()
      
      if (!currentUser) {
        // Not authenticated - redirect to signin
        await AuthAuditLogger.logAuthEvent('access_attempt', undefined, {
          attempted_route: window.location.pathname,
          result: 'unauthenticated'
        })
        window.location.href = fallbackRoute
        return
      }

      setUser(currentUser)

      // Check route permissions
      const currentPath = window.location.pathname
      const pathPermissions = ROUTE_PERMISSIONS[currentPath] || requiredRoles
      const hasPermission = CatalystAuth.hasPermission(currentUser.roles, pathPermissions)

      if (!hasPermission) {
        // No permission - log and redirect
        await AuthAuditLogger.logAuthEvent('permission_denied', currentUser.user_id, {
          attempted_route: currentPath,
          user_roles: currentUser.roles,
          required_roles: pathPermissions
        })
        
        // Redirect to their default portal
        const defaultRoute = CatalystAuth.getDefaultRoute(currentUser.roles)
        window.location.href = defaultRoute
        return
      }

      // Success - log access
      await AuthAuditLogger.logAuthEvent('access_attempt', currentUser.user_id, {
        route: currentPath,
        result: 'authorized'
      })

      setHasAccess(true)
    } catch (error) {
      console.error('Authentication check failed:', error)
      window.location.href = fallbackRoute
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D7C7ED]/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2352] mx-auto"></div>
          <p className="text-[#3B2352]" style={{ fontFamily: 'Lato' }}>
            Verifying your access...
          </p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // Will redirect
  }

  return <>{children}</>
}
