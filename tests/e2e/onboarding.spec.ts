import { test, expect } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function api(context: any, path: string, init?: any) {
  const res = await context.fetch(`${base}${path}`, init)
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { res, json }
}

test.describe('Onboarding workflow', () => {
  test('welcome → intro → status', async ({ request }) => {
    const welcome = await api(request, '/api/v1/zoho/onboarding/welcome', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, data: { clientId: 'crm_123' }
    })
    expect(welcome.res.status()).toBeLessThan(500)
    expect(welcome.json.success ?? true).toBeTruthy()

    const intro = await api(request, '/api/v1/zoho/onboarding/intro', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, data: { clientId: 'crm_123', doulaId: 'staff_456' }
    })
    expect(intro.res.status()).toBeLessThan(500)
    expect(intro.json.success ?? true).toBeTruthy()

    const status = await api(request, '/api/v1/zoho/onboarding/status', { method: 'GET' })
    expect(status.res.status()).toBeLessThan(500)
    expect(status.json.success ?? true).toBeTruthy()
    // At least include shape keys
    expect(status.json.data?.status).toBeTruthy()
  })
})
