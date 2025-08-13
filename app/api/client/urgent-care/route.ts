import { NextRequest } from 'next/server'
import { getApiBase } from '@/lib/apiBase'

export async function POST(request: NextRequest) {
  try {
    const apiBase = getApiBase()
    const body = await request.json()
    const { clientId } = body || {}
    if (!clientId) {
      return new Response(JSON.stringify({ success: false, error: 'clientId is required' }), { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch(`${apiBase}/api/client/urgent-care`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal
      })
      clearTimeout(timeout)

      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        return new Response(JSON.stringify({ success: false, ...data }), { status: resp.status })
      }
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err: any) {
      const aborted = err?.name === 'AbortError'
      const message = aborted ? 'Request timed out' : err?.message || 'Backend error'
      return new Response(JSON.stringify({ success: false, error: message }), { status: aborted ? 504 : 502 })
    }
  } catch (error: any) {
    const message = error?.message || 'Failed to create urgent-care request'
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 })
  }
}