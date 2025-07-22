
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logApiRequest } from './lib/hipaa-audit';

// Define allowed origins
const allowedOrigins = [
  'http://localhost:8000',
  'https://snugsandkisses.com',
];

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const origin = requestHeaders.get('origin');

  // Default response
  let response: NextResponse;

  // Handle preflight requests first
  if (request.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      response = new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    } else {
      response = new NextResponse(null, { status: 403, statusText: "Forbidden" });
    }
    // Log the preflight request and return
    await logApiRequest(request, { status: response.status, statusText: response.statusText });
    return response;
  }

  // Handle actual API requests
  response = NextResponse.next();
  
  // Add Vary: Origin header to all responses
  response.headers.set('Vary', 'Origin');

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Log the request
  await logApiRequest(request, { status: response.status, statusText: response.statusText });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
