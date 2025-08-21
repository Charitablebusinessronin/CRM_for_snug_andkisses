/**
 * Authentication Hook - HIPAA Compliant Authentication State Management
 * Provides centralized authentication state and methods for the application
 */

'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { User, LoginCredentials, AuthResponse, UserRole } from '../types/AuthTypes'
import { AuthService } from '../services/AuthService'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  hasRole: (role: string | string[]) => boolean
  hasPermission: (permission: string) => boolean
  isHIPAACompliant: () => boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const authService = new AuthService()

  const clearAuthData = () => {
    localStorage.removeItem('snug_auth_token')
    sessionStorage.removeItem('snug_auth_token')
    sessionStorage.removeItem('mfa_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setError(null)

      const clientInfo = {
        ipAddress: '192.168.1.1', // TODO: Get actual IP
        userAgent: navigator.userAgent
      }

      const response = await authService.authenticateUser(credentials, clientInfo)

      if (response.success && response.user && response.token) {
        setUser(response.user)
        setIsAuthenticated(true)
        
        // Store token based on remember preference
        const storage = credentials.rememberMe ? localStorage : sessionStorage
        storage.setItem('snug_auth_token', response.token)
      }

      return response

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage,
        user: null,
        token: null,
        requiresMFA: false
      }
    }
  }, [authService])

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Get current token for logout API call
      const token = localStorage.getItem('snug_auth_token') || 
                   sessionStorage.getItem('snug_auth_token')
      
      if (token && user) {
        // Call logout API to invalidate token server-side
        await authService.logout(token, user.id)
      }
      
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state regardless of API call success
      clearAuthData()
      setError(null)
      
      // Redirect to login
      window.location.href = '/auth/signin'
    }
  }, [user, authService])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem('snug_auth_token') || 
                          sessionStorage.getItem('snug_auth_token')
      
      if (!currentToken) {
        return false
      }

      const newTokenData = await authService.refreshToken(currentToken)
      
      if (newTokenData.token && newTokenData.user) {
        // Update stored token
        const storage = localStorage.getItem('snug_auth_token') ? localStorage : sessionStorage
        storage.setItem('snug_auth_token', newTokenData.token)
        
        setUser(newTokenData.user)
        setIsAuthenticated(true)
        return true
      }
      
      return false
      
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuthData()
      return false
    }
  }, [authService])

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false
      
      const updatedUser = await authService.updateUserProfile(user.id, updates)
      
      if (updatedUser) {
        setUser(updatedUser)
        return true
      }
      
      return false
      
    } catch (error) {
      console.error('Profile update error:', error)
      setError("Failed to update profile. Please try again.")
      return false
    }
  }, [user, authService])

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }, [user])

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'admin') return true
    
    // Role-based permission mapping
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // All permissions
      employee: [
        'view_clients',
        'manage_clients', 
        'view_appointments',
        'manage_appointments',
        'view_services',
        'create_services',
        'view_health_records'
      ],
      contractor: [
        'view_assignments',
        'update_assignments',
        'view_schedule',
        'manage_availability'
      ],
      client: [
        'view_own_profile',
        'update_own_profile',
        'view_own_appointments',
        'book_appointments',
        'view_own_services',
        'request_services',
        'view_own_health_records'
      ]
    }
    
    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }, [user])

  const isHIPAACompliant = useCallback((): boolean => {
    return user?.hipaaCompliant ?? false
  }, [user])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        
        // Check for stored token
        const token = localStorage.getItem('snug_auth_token') || 
                     sessionStorage.getItem('snug_auth_token')
        
        if (!token) {
          setIsLoading(false)
          return
        }

        // Validate token and get user data
        const userData = await authService.validateToken(token)
        
        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear storage
          clearAuthData()
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuthData()
        setError("Session expired. Please sign in again.")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [authService])

  // Set up token refresh interval
  useEffect(() => {
    if (!user || !isAuthenticated) return

    // Refresh token every 25 minutes (assuming 30-minute expiry)
    const refreshInterval = setInterval(refreshToken, 25 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [user, isAuthenticated, refreshToken])

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshToken,
    updateProfile,
    hasRole,
    hasPermission,
    isHIPAACompliant,
    clearError
  }
}

/**
 * Get client IP address
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    // In a real implementation, you might use a service to get the client IP
    // For now, return undefined (server-side can determine IP from request)
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuthState()

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}