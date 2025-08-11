import { NextRequest } from 'next/server'
import respond from '@/lib/api-respond'
import { HIPAAComplianceLogger } from '@/lib/hipaa-audit'

// In-memory fallback store for development
let fallbackSettingsStore: Record<string, any> = {}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const prefs = fallbackSettingsStore[userId] || {
      notifications: { email: true, sms: false, push: true },
      timezone: 'America/New_York',
      dateFormat: 'MMM d, yyyy',
      language: 'en-US',
    }

    return respond.ok({ data: prefs, message: 'Settings retrieved' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return respond.serverError('Failed to load settings', 'settings_get_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous'
    const payload = await request.json().catch(() => ({}))

    // Basic shape validation (keep lightweight here)
    if (typeof payload !== 'object' || payload == null) {
      return respond.badRequest('Invalid payload', 'invalid_payload')
    }

    // Store in fallback in-memory for dev; production would persist via Catalyst function
    fallbackSettingsStore[userId] = {
      ...(fallbackSettingsStore[userId] || {}),
      ...payload,
      updatedAt: new Date().toISOString(),
    }

    return respond.ok({ data: fallbackSettingsStore[userId], message: 'Settings updated' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return respond.serverError('Failed to update settings', 'settings_put_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined,
    })
  }
}
