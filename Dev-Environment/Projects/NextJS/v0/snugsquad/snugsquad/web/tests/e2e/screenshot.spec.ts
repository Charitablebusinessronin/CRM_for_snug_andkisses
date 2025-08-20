import { test, expect } from '@playwright/test';

test('take screenshot of the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SnugSquad' })).toBeVisible();
  await page.screenshot({ path: 'screenshot.png' });
});
