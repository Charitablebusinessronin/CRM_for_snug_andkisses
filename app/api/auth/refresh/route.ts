/**
 * Token refresh endpoint with rotation support
 * HIPAA-compliant refresh token rotation
 */
import { NextRequest, NextResponse } from "next/server"
import { validateAndRotateToken } from "@/lib/token-manager"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { headers } from "next/headers"

interface RefreshTokenRequest {
  refreshToken: string
  deviceFingerprint?: string
}

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body: RefreshTokenRequest = await request.json()
    
    if (!body.refreshToken) {
      await logAuditEvent({
        action: "TOKEN_REFRESH_FAILED",
        resource: "/api/auth/refresh",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: origin,
        request_id: crypto.randomUUID(),
        result: "failure",
        error_message: "Missing refresh token"
      })

      return NextResponse.json(
        { 
          error: "Bad Request", 
          message: "Refresh token is required" 
        },
        { status: 400 }
      )
    }

    // Validate and potentially rotate the token
    const result = await validateAndRotateToken(
      body.refreshToken,
      ip,
      userAgent,
      body.deviceFingerprint
    )

    if (!result.valid) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: result.error || "Invalid refresh token" 
        },
        { status: 401 }
      )
    }

    // If token was rotated, return new token pair
    if (result.newTokenPair) {
      const response = NextResponse.json({
        success: true,
        message: "Token refreshed and rotated",
        data: {
          accessToken: result.newTokenPair.accessToken,
          refreshToken: result.newTokenPair.refreshToken,
          expiresAt: result.newTokenPair.expiresAt.toISOString(),
          rotated: true
        },
        user: {
          id: result.userId,
          role: result.role
        }
      })

      // Set secure HTTP-only cookie for refresh token
      response.cookies.set("refresh-token", result.newTokenPair.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/api/auth"
      })

      return response
    }

    // Token is valid but no rotation needed
    return NextResponse.json({
      success: true,
      message: "Token is still valid",
      data: {
        rotated: false
      },
      user: {
        id: result.userId,
        role: result.role
      }
    })

  } catch (error) {
    console.error("Token refresh error:", error)
    
    await logAuditEvent({
      action: "TOKEN_REFRESH_ERROR",
      resource: "/api/auth/refresh",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin: origin,
      request_id: crypto.randomUUID(),
      result: "error",
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Token refresh failed" 
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}