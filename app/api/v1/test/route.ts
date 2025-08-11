import { NextRequest, NextResponse } from 'next/server'
import { UnifiedApiClient } from '@/lib/unified-api-client'
import { cookieTokenProvider } from '@/lib/server-token-provider'

export async function GET(request: NextRequest) {
  const client = new UnifiedApiClient('', cookieTokenProvider(request))

  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const res = await client.request<{ status: string }>({
      method: 'GET',
      url: '/api/health',
      requiresAuth: false,
      auditContext: {
        action: 'TEST_HEALTH_CHECK',
        resource: '/api/health',
        userId: undefined,
        ip,
        userAgent,
      },
    })

    return NextResponse.json({ message: 'Test API is working!', health: res.data }, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ message: 'Test API failed', error: err?.message || 'unknown' }, { status: 500 })
  }
}