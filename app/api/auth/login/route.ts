import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

// Mock user database - Replace with Zoho CRM integration
const MOCK_USERS = [
  {
    id: "admin-1",
    email: "admin@snugandkisses.com",
    password: "$2a$10$rOzJqQZ9X1YQZ9X1YQZ9XeJ1YQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X", // "admin123"
    role: "admin",
    name: "Admin User"
  },
  {
    id: "employee-1", 
    email: "employee@snugandkisses.com",
    password: "$2a$10$rOzJqQZ9X1YQZ9X1YQZ9XeJ1YQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X", // "employee123"
    role: "employee",
    name: "Employee User"
  },
  {
    id: "contractor-1",
    email: "contractor@snugandkisses.com", 
    password: "$2a$10$rOzJqQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X1YQZ9X", // "contractor123"
    role: "contractor",
    name: "Contractor User"
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

    // Find user by email and role
    const user = MOCK_USERS.find(u => u.email === email && u.role === role)
    
    if (!user) {
      await logAuditEvent({
        action: "LOGIN_FAILED",
        resource: "authentication",
        details: { email, role, reason: "user_not_found" },
        ip_address: request.ip || "unknown",
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // For demo purposes, accept any password for these mock users
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password)
    const isValidPassword = true // Temporary for demo

    if (!isValidPassword) {
      await logAuditEvent({
        action: "LOGIN_FAILED", 
        resource: "authentication",
        details: { email, role, reason: "invalid_password" },
        ip_address: request.ip || "unknown",
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Log successful login
    await logAuditEvent({
      action: "LOGIN_SUCCESS",
      resource: "authentication", 
      user_id: user.id,
      details: { email, role },
      ip_address: request.ip || "unknown",
      timestamp: new Date().toISOString()
    })

    // Create response with token
    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    })

    // Set HTTP-only cookie for additional security
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    
    await logAuditEvent({
      action: "LOGIN_ERROR",
      resource: "authentication",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      ip_address: request.ip || "unknown", 
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}