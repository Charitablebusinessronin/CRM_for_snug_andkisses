import { NextRequest } from "next/server"
import type { TokenProvider } from "@/lib/unified-api-client"

// Builds a TokenProvider bound to the incoming request's cookies.
// This avoids importing any server-only crypto in client code paths.
export function cookieTokenProvider(req: NextRequest): TokenProvider {
  const token = req.cookies.get("auth-token")?.value || null
  return () => token
}

// Simple no-op provider for unauthenticated calls
export const nullTokenProvider: TokenProvider = () => null
