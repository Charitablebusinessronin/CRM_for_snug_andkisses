import { test, expect, request } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Helpers
async function api(context: any, path: string, init?: any) {
  const res = await context.fetch(`${base}${path}`, init)
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { res, json }
}

// Contract lifecycle: initiate → generate → webhook → status
(test as any).describe.configure({ mode: 'serial' })

test.describe('Contracts lifecycle', () => {
  let ctrId: string | undefined

  test('initiate', async ({ request }) => {
    const { res, json } = await api(request, '/api/v1/zoho/contracts/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        clientId: 'crm_123',
        doulaId: 'staff_456',
        serviceType: 'birth',
      }
    })
    expect(res.status()).toBeLessThan(500)
    expect(json.success ?? true).toBeTruthy()
    expect(json.data?.prepId).toBeTruthy()
  })

  test('generate', async ({ request }) => {
    const { res, json } = await api(request, '/api/v1/zoho/contracts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        clientId: 'crm_123',
        templateId: 'TEMPLATE_DEFAULT',
        subject: 'Snug & Kisses Doula Agreement',
        recipients: [{ role: 'Client', email: 'client@example.com', name: 'Test Client' }],
        fields: { Client_Name: 'Test Client', Service_Type: 'Birth' }
      }
    })
    expect(res.status()).toBeLessThan(500)
    expect(json.success ?? true).toBeTruthy()
    expect(json.data?.contractId).toBeTruthy()
    ctrId = json.data?.contractId
  })

  test('webhook (invalid signature rejected)', async ({ request }) => {
    const payload = { event: 'completed', documentId: ctrId }
    const { res, json } = await api(request, '/api/v1/zoho/contracts/process-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Zoho-Signature': 'invalid' },
      data: payload
    })
    // Route returns 200 with success:false or 400 depending on proxy impl; accept either but ensure not 5xx
    expect([200, 400]).toContain(res.status())
    // If 200, expect the function to indicate error
    if (res.status() === 200) {
      expect(json.success).not.toBe(true)
    }
  })

  test('status', async ({ request }) => {
    const id = encodeURIComponent(ctrId || 'ctr_mock')
    const { res, json } = await api(request, `/api/v1/zoho/contracts/status/${id}`)
    expect(res.status()).toBeLessThan(500)
    // For stub or real, ensure shape exists
    expect(json.success ?? true).toBeTruthy()
    expect(json.data?.status).toBeTruthy()
  })
})
