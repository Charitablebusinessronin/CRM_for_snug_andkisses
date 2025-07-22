"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { User } from "@/lib/types"
import { getStoredAuth, setStoredAuth, clearStoredAuth, isTokenExpired } from "@/lib/auth"
import { authAPI } from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuth()

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken)
      setUser(storedUser)
    } else {
      clearStoredAuth()
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await authAPI.login({ email, password, role })
      const { token: newToken, user: newUser } = response.data || {};

      setToken(newToken)
      setUser(newUser as User)
      setStoredAuth(newToken, newUser as User)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    clearStoredAuth()
    authAPI.logout().catch(() => {
      // Ignore logout errors
    })
  }

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken()
      const { token: newToken, user: newUser } = response.data || {};

      setToken(newToken)
      setUser(newUser as User)
      setStoredAuth(newToken, newUser as User)
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  }
}

export { AuthContext }
