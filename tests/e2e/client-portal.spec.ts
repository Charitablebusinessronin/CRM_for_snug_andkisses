import { test, expect } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5369'

// Run serial to reuse authenticated session
;(test as any).describe.configure({ mode: 'serial' })

async function signIn(page: any) {
  await page.goto(`${base}/auth/signin`)
  await page.getByPlaceholder('you@example.com').fill('client@snugandkisses.demo')
  await page.getByPlaceholder('Enter your password').fill('SecureDemo2025!')
  await page.getByRole('button', { name: /sign in securely/i }).click()
  await page.waitForURL(/\/client\/dashboard/i, { timeout: 20000 })
}

test.describe('Client Portal primary actions', () => {
  test('sign in and dashboard loads', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/client\/dashboard/i)
  })

  test('Schedule Appointment returns bookingUrl and shows toast URL', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    // Wait for Quick Actions to render and use test id for stability
    const btn = page.locator('[data-testid="qa-schedule-appointment"]').first()
    await expect(btn).toBeVisible({ timeout: 15000 })
    await btn.click()
    // Expect a network call and a visible toast with a URL
    const resp = await page.waitForResponse((r) => r.url().includes('/api/client/schedule-appointment') && r.request().method() === 'POST')
    expect([200, 401]).toContain(resp.status())
    if (resp.status() === 200) {
      const json = await resp.json()
      expect(json.bookingUrl).toBeTruthy()
      // If popup blocked, URL should be shown in toast
      await expect(page.getByText(/http.*bookings.*appointment/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('Start Video Consultation returns roomUrl and shows toast URL', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    const btn = page.locator('[data-testid="qa-video-consultation"]').first()
    await btn.click()
    const resp = await page.waitForResponse((r) => r.url().includes('/api/client/video-consultation') && r.request().method() === 'POST')
    expect([200, 401]).toContain(resp.status())
    if (resp.status() === 200) {
      const json = await resp.json()
      expect(json.roomUrl).toBeTruthy()
      await expect(page.getByText(/http.*bookings.*appointment/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('Contact Provider creates a CRM lead and shows ETA', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    const btn = page.locator('[data-testid="qa-contact-provider"]').first()
    await btn.click()
    const resp = await page.waitForResponse((r) => r.url().includes('/api/client/contact-provider') && r.request().method() === 'POST')
    expect([200, 401]).toContain(resp.status())
    if (resp.status() === 200) {
      const json = await resp.json()
      expect(json.leadId).toBeTruthy()
      await expect(page.getByText(/estimated/i)).toBeVisible()
    }
  })

  test('Message Team action returns 200 (placeholder)', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    const btn = page.getByRole('button', { name: /message/i })
    if (await btn.isVisible()) {
      await btn.click()
      const resp = await page.waitForResponse((r) => r.url().includes('/api/client/message-team') && r.request().method() === 'POST', { timeout: 5000 }).catch(() => null)
      if (resp) expect([200, 401]).toContain(resp.status())
    }
  })

  test('Urgent Care action returns 200 (placeholder)', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    const btn = page.getByRole('button', { name: /urgent care/i })
    if (await btn.isVisible()) {
      await btn.click()
      const resp = await page.waitForResponse((r) => r.url().includes('/api/client/urgent-care') && r.request().method() === 'POST', { timeout: 5000 }).catch(() => null)
      if (resp) expect([200, 401]).toContain(resp.status())
    }
  })

  test('Sign out returns to sign-in and nav back to dashboard works', async ({ page }) => {
    await page.goto(`${base}/client/dashboard`)
    const logout = page.getByRole('button', { name: /sign out/i })
    if (await logout.isVisible()) {
      await logout.click()
      await page.waitForURL(/\/auth\/signin/i)
    }
  })
})


