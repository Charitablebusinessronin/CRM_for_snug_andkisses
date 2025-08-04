/**
 * Forgot Password API Endpoint
 * HIPAA-compliant password reset request handling
 */
import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/hipaa-audit-edge'
import { DEMO_ACCOUNTS } from '@/types/auth'
import { z } from 'zod'

// Rate limiting for password reset requests
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>()

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  timestamp: z.string(),
  userAgent: z.string().optional()
})

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 3 // Maximum 3 password reset attempts per 15 minutes

  const clientData = rateLimitMap.get(ip) || { count: 0, lastAttempt: now }
  
  if (now - clientData.lastAttempt > windowMs) {
    // Reset window
    clientData.count = 1
    clientData.lastAttempt = now
  } else {
    clientData.count++
  }
  
  rateLimitMap.set(ip, clientData)
  
  return clientData.count > maxAttempts
}

function generateResetToken(): string {
  // In production, this would generate a cryptographically secure token
  // For demo purposes, generating a simple token
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

function isValidDemoAccount(email: string): boolean {
  return Object.values(DEMO_ACCOUNTS).some(account => account.email === email)
}

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"
  const requestId = crypto.randomUUID()

  try {
    // Check rate limiting
    if (isRateLimited(ip)) {
      await logAuditEvent({
        action: "PASSWORD_RESET_RATE_LIMITED",
        resource: "/api/auth/forgot-password",
        method: "POST",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: origin,
        request_id: requestId,
        result: "failure",
        error_message: "Rate limit exceeded for password reset attempts"
      })

      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          message: "Too many password reset attempts. Please try again in 15 minutes."
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(body)

    if (!validationResult.success) {
      await logAuditEvent({
        action: "PASSWORD_RESET_INVALID_INPUT",
        resource: "/api/auth/forgot-password",
        method: "POST",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: origin,
        request_id: requestId,
        result: "failure",
        error_message: "Invalid input data",
        data: { validationErrors: validationResult.error.errors }
      })

      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          message: "Please provide a valid email address."
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Log the password reset attempt (always log, regardless of whether email exists)
    await logAuditEvent({
      action: "PASSWORD_RESET_REQUESTED",
      resource: "/api/auth/forgot-password",
      method: "POST",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin: origin,
      request_id: requestId,
      result: "success",
      data: { 
        email: email,
        requestTimestamp: validationResult.data.timestamp
      }
    })

    // Check if it's a valid demo account
    if (isValidDemoAccount(email)) {
      // Generate reset token (in production, this would be stored in database)
      const resetToken = generateResetToken()
      const resetUrl = `${origin}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

      // Log successful reset token generation
      await logAuditEvent({
        action: "PASSWORD_RESET_TOKEN_GENERATED",
        resource: "/api/auth/forgot-password",
        method: "POST",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: origin,
        request_id: requestId,
        result: "success",
        data: { 
          email: email,
          tokenGenerated: true,
          expiryTime: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }
      })

      // In production, this would send an actual email
      console.log(`Password reset email would be sent to: ${email}`)
      console.log(`Reset URL: ${resetUrl}`)
      console.log(`Token expires in 1 hour`)

      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent password reset instructions.",
        data: {
          email: email,
          // In development, return the reset URL for testing
          ...(process.env.NODE_ENV === 'development' && { resetUrl })
        }
      })
    } else {
      // For security, always return success message even if email doesn't exist
      // This prevents email enumeration attacks
      await logAuditEvent({
        action: "PASSWORD_RESET_UNKNOWN_EMAIL",
        resource: "/api/auth/forgot-password",
        method: "POST",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin: origin,
        request_id: requestId,
        result: "success",
        data: { 
          email: email,
          accountExists: false
        }
      })

      // Return same success message to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent password reset instructions.",
        data: {
          email: email
        }
      })
    }

  } catch (error) {
    console.error('Forgot password error:', error)
    
    await logAuditEvent({
      action: "PASSWORD_RESET_ERROR",
      resource: "/api/auth/forgot-password",
      method: "POST",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin: origin,
      request_id: requestId,
      result: "error",
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    )
  }
}

// Export rate limiting cleanup function
export function cleanupRateLimitMap() {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.lastAttempt > windowMs) {
      rateLimitMap.delete(ip)
    }
  }
}

// Clean up rate limit map every hour
if (typeof setInterval === 'function') {
  setInterval(cleanupRateLimitMap, 60 * 60 * 1000) // 1 hour
}