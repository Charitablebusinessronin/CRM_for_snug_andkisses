import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()
    const ziaUrl = process.env.ZIA_FUNCTION_URL

    if (!ziaUrl) {
      return NextResponse.json({ error: 'ZIA_FUNCTION_URL not configured' }, { status: 503 })
    }

    const res = await fetch(ziaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Snug-Kisses-CRM/2.0'
      },
      body: JSON.stringify({ message, userId })
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'ZIA call failed', details: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('ZIA chat error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
