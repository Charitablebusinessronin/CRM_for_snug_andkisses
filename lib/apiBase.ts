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

  // Public env var for browser requests (should include /api suffix)
  const publicBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (publicBase) return publicBase;

  // Backend API URL from env
  const backendBase = process.env.BACKEND_API_URL;
  if (backendBase) return backendBase;

  // Legacy support
  const legacy = process.env.EXPRESS_BACKEND_URL;
  if (legacy) return legacy;

  // Default fallback with /api suffix to match your env
  return 'http://localhost:4728/api';
}
