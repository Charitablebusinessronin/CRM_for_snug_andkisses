// Centralized API base URL resolver for Next.js (server and client)
// Priority:
// 1) SERVER_API_BASE_URL (server-only, e.g., Docker container can talk to backend service name)
// 2) NEXT_PUBLIC_API_BASE_URL (browser)
// 3) EXPRESS_BACKEND_URL (legacy)
// 4) Fallback: http://localhost:4728

export function getApiBase(): string {
  // Server-side only env var to reach docker service name
  const serverBase = process.env.SERVER_API_BASE_URL;
  if (serverBase && typeof window === 'undefined') return serverBase;

  // Public env var for browser requests
  const publicBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (publicBase) return publicBase;

  // Legacy support
  const legacy = process.env.EXPRESS_BACKEND_URL;
  if (legacy) return legacy;

  return 'http://localhost:4728';
}
