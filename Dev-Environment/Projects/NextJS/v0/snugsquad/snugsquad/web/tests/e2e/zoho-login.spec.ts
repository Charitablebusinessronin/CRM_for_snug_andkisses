import { test, expect } from '@playwright/test';

test('should display the Zoho login button', async ({ page }) => {
  await page.goto('http://localhost:3000/signin');
  await expect(page.getByRole('button', { name: 'Continue with Zoho' })).toBeVisible();
});
