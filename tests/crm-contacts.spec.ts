import { test, expect } from '@playwright/test';

test.describe('CRM Contacts API', () => {
  test('should fetch contacts successfully', async ({ request }) => {
    const response = await request.get('/api/crm/contacts');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });
});
