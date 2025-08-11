import { test, expect } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function api(context: any, path: string, init?: any) {
  const res = await context.fetch(`${base}${path}`, init)
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { res, json }
}

// Validate error handling for missing params and invalid signatures
(test as any).describe.configure({ mode: 'serial' })

test.describe('API error handling', () => {
  test('contracts/generate missing params → 400 or success:false', async ({ request }) => {
    const { res, json } = await api(request, '/api/v1/zoho/contracts/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, data: {}
    })
    // Allow either explicit 400 from proxy or 200 with success:false from function validation
    expect([200, 400]).toContain(res.status())
    if (res.status() === 200) expect(json.success).not.toBe(true)
  })

  test('onboarding/welcome missing clientId → 400 or success:false', async ({ request }) => {
    const { res, json } = await api(request, '/api/v1/zoho/onboarding/welcome', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, data: {}
    })
    expect([200, 400]).toContain(res.status())
    if (res.status() === 200) expect(json.success).not.toBe(true)
  })

  test('contracts/process-signature invalid signature rejected', async ({ request }) => {
    const payload = { event: 'completed', documentId: 'ctr_invalid' }
    const { res, json } = await api(request, '/api/v1/zoho/contracts/process-signature', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Zoho-Signature': 'invalid' }, data: payload
    })
    expect([200, 400]).toContain(res.status())
    if (res.status() === 200) expect(json.success).not.toBe(true)
  })
})
