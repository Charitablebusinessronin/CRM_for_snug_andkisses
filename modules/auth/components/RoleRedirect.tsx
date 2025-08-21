"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Loader2, Shield, AlertCircle } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import type { UserRole } from "../types/AuthTypes"

interface RoleRedirectProps {
  allowedRoles?: UserRole[]
  redirectTo?: string
  children: React.ReactNode
}

/**
 * Role Redirect Component - HIPAA Compliant Access Control
 * Protects routes based on user roles and provides secure redirects
 */
export function RoleRedirect({ allowedRoles, redirectTo, children }: RoleRedirectProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      setIsRedirecting(true)
      const currentPath = window.location.pathname + window.location.search
      window.location.href = `/auth/signin?redirect=${encodeURIComponent(currentPath)}`
      return
    }

    // No role restrictions - allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return
    }

    // Check if user has required role
    const hasAccess = allowedRoles.includes(user.role)
    
    if (!hasAccess) {
      setIsRedirecting(true)
      
      // Redirect to role-specific default or provided redirect
      const defaultRedirects: Record<UserRole, string> = {
        admin: '/admin/dashboard',
        employee: '/employee/dashboard',
        client: '/client/dashboard',
        contractor: '/contractor/dashboard'
      }
      
      const targetUrl = redirectTo || defaultRedirects[user.role] || '/dashboard'
      
      // Add access denied message
      const url = new URL(targetUrl, window.location.origin)
      url.searchParams.set('access_denied', 'true')
      
      setTimeout(() => {
        window.location.href = url.toString()
      }, 2000)
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-[#3B2352] mx-auto mb-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#3B2352]" />
                <span className="text-[#3B2352] font-medium">Loading...</span>
              </div>
              <p className="text-gray-600 text-sm">
                Verifying your access permissions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirecting state
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-[#3B2352] mx-auto mb-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#3B2352]" />
                <span className="text-[#3B2352] font-medium">Redirecting...</span>
              </div>
              <p className="text-gray-600 text-sm">
                {!isAuthenticated 
                  ? "Please sign in to continue"
                  : "Redirecting to your authorized area"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access denied state (shouldn't normally render due to redirect)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
              <p className="text-gray-600 text-sm">
                You don't have permission to access this area. 
                You will be redirected to your authorized dashboard.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User has access - render children
  return <>{children}</>
}

/**
 * Higher-order component for role-based protection
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[],
  redirectTo?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleRedirect allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <Component {...props} />
      </RoleRedirect>
    )
  }
}

/**
 * Role-specific wrapper components for common use cases
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['admin']}>{children}</RoleRedirect>
}

export function EmployeeOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['employee']}>{children}</RoleRedirect>
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['client']}>{children}</RoleRedirect>
}

export function ContractorOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['contractor']}>{children}</RoleRedirect>
}

export function StaffOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['admin', 'employee']}>{children}</RoleRedirect>
}

export function ProviderOnly({ children }: { children: React.ReactNode }) {
  return <RoleRedirect allowedRoles={['admin', 'employee', 'contractor']}>{children}</RoleRedirect>
}