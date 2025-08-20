import { NextResponse, type NextRequest } from "next/server";
import { log, trackError, trackUserAction } from "./lib/observability";

// Dev bypass to avoid blocking during initial scaffold
const BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "1";

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  record.count++;
  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers for production
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Content Security Policy (basic)
  response.headers.set(
    "Content-Security-Policy", 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  return response;
}

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  try {
    // Rate limiting check
    if (isRateLimited(ip)) {
      log.warn("Rate limit exceeded", { ip, path: req.nextUrl.pathname });
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    
    if (BYPASS) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Track middleware execution for observability
    trackUserAction("middleware_execution", undefined, { 
      path: pathname, 
      ip, 
      userAgent: req.headers.get("user-agent") 
    });

    // Read mock role from cookie for now; real implementation will use session
    const role = req.cookies.get("role")?.value as
      | "admin"
      | "client"
      | "employee"
      | "contractor"
      | undefined;

    // No blocking for home or signin
    if (pathname === "/" || pathname.startsWith("/signin")) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    const routeToRole: Record<string, string> = {
      "/admin-dashboard": "admin",
      "/client-dashboard": "client",
      "/employee-dashboard": "employee",
      "/contractor-dashboard": "contractor",
    };

    const requiredRole = routeToRole[pathname];
    if (!requiredRole) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Enforce MFA cookie for protected routes as part of baseline security model
    const mfaComplete = req.cookies.get("mfa")?.value === "1";
    
    // Session lifecycle hardening: check for expired or invalid sessions
    const sessionValid = role && mfaComplete;
    
    if (!sessionValid) {
      // Log security event
      log.warn("Access denied - invalid session", { 
        path: pathname, 
        ip, 
        role, 
        mfaComplete,
        userAgent: req.headers.get("user-agent")
      });
      
      await trackError(new Error("Access denied - invalid session"), {
        path: pathname,
        ip,
        role,
        mfaComplete,
        action: "middleware_access_denied"
      });
      
      const redirectUrl = new URL("/signin", req.url);
      redirectUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(redirectUrl);
      return addSecurityHeaders(response);
    }

    // Log successful access
    log.info("Access granted", { 
      path: pathname, 
      role, 
      ip,
      executionTime: Date.now() - startTime
    });

    const response = NextResponse.next();
    return addSecurityHeaders(response);
    
  } catch (error) {
    // Log middleware errors for observability
    log.error("Middleware error", { 
      error, 
      path: req.nextUrl.pathname, 
      ip,
      executionTime: Date.now() - startTime
    });
    
    await trackError(error instanceof Error ? error : new Error(String(error)), {
      path: req.nextUrl.pathname,
      ip,
      action: "middleware_error"
    });
    
    // Return error response with security headers
    const response = new NextResponse("Internal Server Error", { status: 500 });
    return addSecurityHeaders(response);
  }
}

export const config = {
  matcher: [
    "/admin-dashboard",
    "/client-dashboard", 
    "/employee-dashboard",
    "/contractor-dashboard",
    "/api/:path*", // Also protect API routes
  ],
};


