import type { User } from "./types"

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const getStoredAuth = (): { token: string | null; user: User | null } => {
  if (typeof window === "undefined") return { token: null, user: null }

  const token = localStorage.getItem("auth_token")
  const userStr = localStorage.getItem("auth_user")
  const user = userStr ? JSON.parse(userStr) : null

  return { token, user }
}

export const setStoredAuth = (token: string, user: User) => {
  localStorage.setItem("auth_token", token)
  localStorage.setItem("auth_user", JSON.stringify(user))
}

export const clearStoredAuth = () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("auth_user")
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
