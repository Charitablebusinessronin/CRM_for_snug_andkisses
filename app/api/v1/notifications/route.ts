import { NextRequest, NextResponse } from 'next/server'

const NOTIFICATIONS_FUNCTION_URL = process.env.NOTIFICATIONS_FUNCTION_URL

function missingUrl() {
  return NextResponse.json({ error: 'NOTIFICATIONS_FUNCTION_URL not configured' }, { status: 503 })
}

export async function GET(request: NextRequest) {
  try {
    if (!NOTIFICATIONS_FUNCTION_URL) return missingUrl()
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)

    const resp = await fetch(NOTIFICATIONS_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Snug-Kisses-CRM/2.0',
        'x-user-id': request.headers.get('x-user-id') || '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || ''
      },
      body: JSON.stringify({ action: 'getNotifications', params: { limit } })
    })
    const json = await resp.json()
    if (!resp.ok) return NextResponse.json({ error: 'Notifications call failed', details: json }, { status: 502 })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: 'Notifications proxy error', details: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!NOTIFICATIONS_FUNCTION_URL) return missingUrl()
    const { action, data } = await request.json()
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

    const resp = await fetch(NOTIFICATIONS_FUNCTION_URL, {
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
    if (!resp.ok) return NextResponse.json({ error: 'Notifications call failed', details: json }, { status: 502 })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: 'Notifications proxy error', details: e?.message || String(e) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!NOTIFICATIONS_FUNCTION_URL) return missingUrl()
    const { action, data } = await request.json()
    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

    const resp = await fetch(NOTIFICATIONS_FUNCTION_URL, {
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
    if (!resp.ok) return NextResponse.json({ error: 'Notifications call failed', details: json }, { status: 502 })
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: 'Notifications proxy error', details: e?.message || String(e) }, { status: 500 })
  }
}
