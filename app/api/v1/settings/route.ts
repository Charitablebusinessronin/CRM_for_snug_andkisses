import { NextRequest, NextResponse } from 'next/server'
import hipaaLogger from '@/lib/hipaa-audit'

export async function GET() {
  const baseUrl = process.env.SETTINGS_FUNCTIONS_URL || (process.env.CATALYST_APP_URL ? `${process.env.CATALYST_APP_URL}/server/settings-functions` : undefined)
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}`, { method: 'GET' })
      const result = await res.json().catch(() => ({}))
      if (res.ok && (result?.status === 'success' || result?.success)) {
        return NextResponse.json({ success: true, data: result.data || {} })
      }
    } catch (e) {
      console.error('Settings GET proxy failed:', e)
    }
  }
  return NextResponse.json({ success: true, data: { notifications: true, defaultApp: 'overview', theme: 'system' } })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    await hipaaLogger.logWorkflowEvent('admin', 'settings_update', { payload })

    const baseUrl = process.env.SETTINGS_FUNCTIONS_URL || (process.env.CATALYST_APP_URL ? `${process.env.CATALYST_APP_URL}/server/settings-functions` : undefined)
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = await res.json().catch(() => ({}))
        if (res.ok && (result?.status === 'success' || result?.success)) {
          return NextResponse.json({ success: true, data: result.data || {} })
        }
      } catch (e) {
        console.error('Settings POST proxy failed:', e)
      }
    }

    return NextResponse.json({ success: true, data: { stored: 'local_fallback' } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Invalid payload' }, { status: 400 })
  }
}
