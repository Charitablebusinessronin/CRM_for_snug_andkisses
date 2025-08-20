import { test, expect } from '@playwright/test';

test.describe('Client Portal Authentication', () => {
  test('should redirect to signin for unauthenticated users', async ({ page }) => {
    await page.goto('/client-dashboard');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should authenticate client user successfully', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('[data-testid="email-input"]', 'client@snugandkisses.demo');
    await page.fill('[data-testid="password-input"]', 'SecureDemo2025!');
    await page.click('[data-testid="signin-button"]');
    
    await expect(page).toHaveURL(/.*client-dashboard/);
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="signin-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

test.describe('Client Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-role', 'client');
    });
  });

  test('should navigate to care plan page', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.click('[data-testid="nav-care-plan"]');
    
    await expect(page).toHaveURL(/.*care-plan/);
    await expect(page.locator('[data-testid="care-plan-title"]')).toBeVisible();
  });

  test('should navigate to service requests page', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.click('[data-testid="nav-service-requests"]');
    
    await expect(page).toHaveURL(/.*service-requests/);
    await expect(page.locator('[data-testid="service-requests-title"]')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/client-dashboard');
    await page.click('[data-testid="nav-profile"]');
    
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('[data-testid="profile-title"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-role', 'client');
    });
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8
    await page.goto('/client-dashboard');
    
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/client-dashboard');
    
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    await expect(page.locator('body')).toBeVisible();
  });
});