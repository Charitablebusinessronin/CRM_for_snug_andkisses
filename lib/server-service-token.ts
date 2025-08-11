import type { TokenProvider } from '@/lib/unified-api-client'

// Returns a TokenProvider for backend-to-backend calls (no cookies).
// Reads from env (e.g., SERVICE_API_TOKEN) if present; otherwise returns null.
export function serviceTokenProvider(): TokenProvider {
  const token = process.env.SERVICE_API_TOKEN || null
  return () => token
}
