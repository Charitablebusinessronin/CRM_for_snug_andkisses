import { test, expect } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function api(context: any, path: string, init?: any) {
  const res = await context.fetch(`${base}${path}`, init)
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { res, json }
}

// Basic validation for OCR API and page availability

test.describe('ZIA OCR validation', () => {
  test('page renders', async ({ request }) => {
    const res = await request.get(`${base}/zia/ocr`)
    expect(res.status()).toBeLessThan(500)
    const html = await res.text()
    expect(html).toContain('Zia AI OCR Document Processor')
  })

  test('API rejects missing file', async ({ request }) => {
    const { res, json } = await api(request, '/api/v1/zia/ocr', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, data: { mode: 'business_card' }
    })
    // Either 400 from route or 200 with success:false from function
    expect([200, 400]).toContain(res.status())
    if (res.status() === 200) expect(json.success).not.toBe(true)
  })
})
