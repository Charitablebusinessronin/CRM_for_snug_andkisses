/**
 * Token refresh endpoint with rotation support
 * HIPAA-compliant refresh token rotation
 */
import { NextRequest, NextResponse } from "next/server"
import { secureTokenManager } from "@/lib/secure-token-manager"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

interface RefreshTokenRequest {
  refreshToken: string
  deviceFingerprint?: string
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    let body: RefreshTokenRequest | null = null
    try { body = await request.json() } catch { /* ignore */ }

    const cookieToken = request.cookies.get("refresh-token")?.value
    const incomingToken = body?.refreshToken || cookieToken

    if (!incomingToken) {
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

    // Rotate token via SecureTokenManager (RS256)
    const newPair = await secureTokenManager.rotateRefreshToken(incomingToken)

    if (!newPair) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: "Invalid refresh token" 
        },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: "Token refreshed and rotated",
      data: {
        accessToken: newPair.accessToken,
        refreshToken: newPair.refreshToken,
        rotated: true
      }
    })

    // Set secure HTTP-only cookie for refresh token (7d)
    response.cookies.set("refresh-token", newPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth"
    })

    // Also refresh access token cookie (15m)
    response.cookies.set("auth-token", newPair.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60
    })

    return response

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