import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { secureTokenManager } from "@/lib/secure-token-manager"

// RS256 keys are handled by secureTokenManager (server-only)

// Mock user database - Replace with Zoho CRM integration
const DEMO_USERS = [
  {
    id: "admin-demo-1",
    email: "admin@snugandkisses.demo",
    password: "SecureDemo2025!",
    role: "ADMIN",
    name: "System Administrator"
  },
  {
    id: "employee-demo-1", 
    email: "employee@snugandkisses.demo",
    password: "SecureDemo2025!",
    role: "EMPLOYEE",
    name: "Demo Employee"
  },
  {
    id: "contractor-demo-1",
    email: "contractor@snugandkisses.demo", 
    password: "SecureDemo2025!",
    role: "CONTRACTOR",
    name: "Demo Contractor"
  },
  {
    id: "client-demo-1",
    email: "client@snugandkisses.demo",
    password: "SecureDemo2025!",
    role: "CLIENT",
    name: "Demo Client"
  }
]

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required" },
        { status: 400 }
      )
    }

    // Normalize role to uppercase to match enum values
    const normalizedRole = role?.toUpperCase()
    
    // Find user by email and normalized role
    const user = DEMO_USERS.find(u => u.email === email && u.role === normalizedRole)
    
    if (!user) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logAuditEvent({
        action: "LOGIN_FAILED",
        resource: "authentication",
        data: { email, role, reason: "user_not_found" },
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: request.headers.get("origin") || "unknown",
        request_id: crypto.randomUUID(),
        result: "failure"
      })

      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // For demo purposes, check against the demo password
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password)
    const isValidPassword = password === user.password // Demo password check

    if (!isValidPassword) {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logAuditEvent({
        action: "LOGIN_FAILED", 
        resource: "authentication",
        data: { email, role, reason: "invalid_password" },
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: request.headers.get("origin") || "unknown",
        request_id: crypto.randomUUID(),
        result: "failure"
      })

      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Issue RS256 access + refresh tokens (15m / 7d)
    const accessToken = await secureTokenManager.generateAccessToken(
      user.id,
      user.role.toLowerCase()
    )
    const refreshToken = await secureTokenManager.generateRefreshToken(user.id)

    // Log successful login
    {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logAuditEvent({
        action: "LOGIN_SUCCESS",
        resource: "authentication", 
        user_id: user.id,
        data: { email, role },
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: request.headers.get("origin") || "unknown",
        request_id: crypto.randomUUID(),
        result: "success"
      })
    }

    // Create response with token
    const response = NextResponse.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    })

    // Set HTTP-only cookies for additional security
    // Access token (15m)
    response.cookies.set("auth-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 // 15 minutes
    })

    // Refresh token (7d)
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/api/auth"
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    
    {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"
      await logAuditEvent({
        action: "LOGIN_ERROR",
        resource: "authentication",
        data: { error: error instanceof Error ? error.message : "Unknown error" },
        ip_address: ip, 
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: request.headers.get("origin") || "unknown",
        request_id: crypto.randomUUID(),
        result: "error"
      })
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}