import { NextRequest, NextResponse } from 'next/server'
import { respondOk, respondError } from '@/lib/unified-response'

// v2 wrapper: proxies to existing v1 ZIA chat route
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const proxied = new URL('/api/v1/zia/chat', url.origin)

    const res = await fetch(proxied.toString(), {
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      cache: 'no-store'
    })

    const text = await res.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json(respondOk(json))
    } catch {
      const { body, status } = respondError('API_001', 'Upstream response not JSON', text, res.status)
      return NextResponse.json(body, { status })
    }
  } catch (error: any) {
    const { body, status } = respondError('API_001', error?.message || 'Proxy error')
    return NextResponse.json(body, { status })
  }
}
