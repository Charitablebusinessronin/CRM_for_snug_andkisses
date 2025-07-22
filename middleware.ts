import { type NextRequest, NextResponse } from "next/server"
import { logAuditEvent } from "@/lib/hipaa-audit"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // CORS Configuration for cross-origin requests
  const allowedOrigins = [
    "http://localhost:8000", // Website
    "http://localhost:8001", // CRM
    "https://snugsandkisses.com",
    process.env.NEXT_PUBLIC_WEBSITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean)

  const origin = request.headers.get("origin")

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name",
  )

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: response.headers })
  }

  // HIPAA Audit Logging for API access
  // Disabled in Edge Middleware: Node.js modules not supported in Vercel Edge Runtime
  // if (request.nextUrl.pathname.startsWith("/api/")) {
  //   try {
  //     await logAuditEvent({
  //       action: "API_ACCESS",
  //       resource: request.nextUrl.pathname,
  //       method: request.method,
  //       ip_address: request.ip || request.headers.get("x-forwarded-for") || "unknown",
  //       user_agent: request.headers.get("user-agent") || "unknown",
  //       timestamp: new Date().toISOString(),
  //       origin: origin || "unknown",
  //       request_id: crypto.randomUUID(),
  //     })
  //   } catch (error) {
  //     console.error("Audit logging failed:", error)
  //   }
  // }

  // Security Headers for HIPAA Compliance
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  )

  return response
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
}
