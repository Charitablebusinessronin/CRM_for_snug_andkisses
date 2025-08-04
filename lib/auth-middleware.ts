import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

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
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userRole = payload.role as string

    // Role-based route protection
    const roleRoutes = {
      admin: ["/admin"],
      employee: ["/employee"],
      contractor: ["/contractor"]
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
                          userRole === "contractor" ? "/contractor/dashboard" : "/login"
      
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next()
    response.headers.set("x-user-id", payload.sub as string)
    response.headers.set("x-user-role", userRole)
    response.headers.set("x-user-email", payload.email as string)

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

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    return {
      valid: true,
      userId: payload.sub as string,
      userName: payload.name as string,
      role: payload.role as string,
      email: payload.email as string
    }

  } catch (error) {
    console.error("Token verification failed:", error)
    return { valid: false, error: "Invalid token" }
  }
}