import { NextRequest, NextResponse } from 'next/server'

const ANALYTICS_FUNCTION_URL = process.env.ANALYTICS_FUNCTION_URL

function missingUrl() {
  return NextResponse.json({ error: 'ANALYTICS_FUNCTION_URL not configured' }, { status: 503 })
}

export async function GET(request: NextRequest) {
  try {
    if (!ANALYTICS_FUNCTION_URL) return missingUrl()
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'getDashboardMetrics'
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)

    const resp = await fetch(ANALYTICS_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Snug-Kisses-CRM/2.0',
        'x-user-id': request.headers.get('x-user-id') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || ''
      },
      body: JSON.stringify({ action, params: { limit } })
    })
    const json = await resp.json()
    if (!resp.ok) return NextResponse.json({ error: 'Analytics call failed', details: json }, { status: 502 })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: 'Analytics proxy error', details: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!ANALYTICS_FUNCTION_URL) return missingUrl()
    const { action, data } = await request.json()
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

    const resp = await fetch(ANALYTICS_FUNCTION_URL, {
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
    if (!resp.ok) return NextResponse.json({ error: 'Analytics call failed', details: json }, { status: 502 })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: 'Analytics proxy error', details: e?.message || String(e) }, { status: 500 })
  }
}
