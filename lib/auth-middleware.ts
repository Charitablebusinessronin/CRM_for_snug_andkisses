import { NextRequest, NextResponse } from "next/server"
import { secureTokenManager } from "@/lib/secure-token-manager"

/**
 * Authentication middleware for route protection
 * Handles JWT token verification and role-based access control
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/api/auth/login",
    "/api/health",
    "/_next",
    "/favicon.ico"
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get("auth-token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    // Redirect to login for protected routes
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify RS256 JWT access token
    const payload = secureTokenManager.verifyAccessToken(token)
    if (!payload) throw new Error("Invalid token")
    const userRole = (payload.role as string).toLowerCase()

    // Role-based route protection
    const roleRoutes = {
      admin: ["/admin"],
      employee: ["/employee"],
      contractor: ["/contractor"],
      client: ["/client"],
    }

    // Check if user has access to the requested route
    const hasAccess = Object.entries(roleRoutes).some(([role, routes]) => {
      if (userRole === role) {
        return routes.some(route => pathname.startsWith(route))
      }
      return false
    })

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const dashboardUrl = userRole === "admin" ? "/admin/dashboard" :
                          userRole === "employee" ? "/employee/dashboard" :
                          userRole === "contractor" ? "/contractor/dashboard" :
                          userRole === "client" ? "/client/dashboard" : "/login"
      
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", payload.userId as string)
    response.headers.set("x-user-role", userRole)
    
    return response

  } catch (error) {
    console.error("JWT verification failed:", error)
    
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }
}

/**
 * Verify authentication token for API routes
 * @param request - NextRequest object
 * @returns Promise<{valid: boolean, userId?: string, userName?: string, role?: string}>
 */
export async function verifyAuthToken(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get("Authorization")
    let token = authHeader?.replace("Bearer ", "")
    
    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return { valid: false, error: "No token provided" }
    }

    // Verify RS256 JWT token via SecureTokenManager
    const payload = secureTokenManager.verifyAccessToken(token)
    if (!payload) {
      return { valid: false, error: "Invalid token" }
    }

    return {
      valid: true,
      userId: payload.userId as string,
      role: payload.role as string,
    }

  } catch (error) {
    console.error("Token verification failed:", error)
    return { valid: false, error: "Invalid token" }
  }
}