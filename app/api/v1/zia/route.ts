import { NextRequest } from 'next/server'
import respond from '@/lib/api-respond'

const ZIA_FUNCTION_URL = process.env.ZIA_FUNCTION_URL

function missingUrl() {
  return respond.serverError('ZIA_FUNCTION_URL not configured', 'config_error')
}

export async function POST(request: NextRequest) {
  try {
    if (!ZIA_FUNCTION_URL) return missingUrl()
    const body = await request.json()
    const { action, data } = body || {}
    if (!action) return respond.badRequest('Missing action')

    const resp = await fetch(ZIA_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Snug-Kisses-CRM/2.0',
        'x-user-id': request.headers.get('x-user-id') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || ''
      },
      body: JSON.stringify({ action, params: data })
    })

    const json = await resp.json()
    if (!resp.ok) return respond.upstreamError('ZIA call failed', 'zia_upstream_error', json)
    return respond.ok(json)
  } catch (e: any) {
    return respond.serverError('ZIA proxy error', 'zia_proxy_error', e?.message || String(e))
  }
}
