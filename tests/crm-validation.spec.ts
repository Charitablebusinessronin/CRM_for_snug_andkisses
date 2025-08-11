import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5369';

test.describe('CRM Routes Validation - Catalyst Native Integration', () => {
  
  test('should validate contacts endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/contacts`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('source', 'catalyst-native-integration');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should validate leads endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/leads`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should validate accounts endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/accounts`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should validate deals endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/deals`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should validate advanced leads endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/zoho/crm/leads`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('source', 'catalyst-native-integration');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should validate quick actions endpoint (GET)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/quick-actions?action=quick-stats`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('timestamp');
  });

  test('should validate contacts creation (POST)', async ({ request }) => {
    const testContact = {
      name: 'Test Contact Validation',
      email: `test-validation-${Date.now()}@example.com`,
      phone: '555-0123',
      company: 'Test Company'
    };

    const response = await request.post(`${BASE_URL}/api/crm/contacts`, {
      data: testContact
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Contact created successfully');
    expect(data).toHaveProperty('source', 'catalyst-native-integration');
  });

  test('should validate leads creation (POST)', async ({ request }) => {
    const testLead = {
      first_name: 'Test',
      last_name: 'Lead Validation',
      email: `test-lead-validation-${Date.now()}@example.com`,
      phone: '555-0124',
      company: 'Test Lead Company',
      lead_source: 'Validation Test'
    };

    const response = await request.post(`${BASE_URL}/api/crm/leads`, {
      data: testLead
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Lead created successfully');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
  });

  test('should validate accounts creation (POST)', async ({ request }) => {
    const testAccount = {
      account_name: `Test Account Validation ${Date.now()}`,
      account_type: 'Customer',
      industry: 'Technology',
      phone: '555-0125',
      email: `test-account-validation-${Date.now()}@example.com`
    };

    const response = await request.post(`${BASE_URL}/api/crm/accounts`, {
      data: testAccount
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Account created successfully');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
  });

  test('should validate deals creation (POST)', async ({ request }) => {
    const testDeal = {
      name: `Test Deal Validation ${Date.now()}`,
      customer_id: 'test-customer-123',
      amount: 5000,
      stage: 'Qualification',
      probability: 25,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await request.post(`${BASE_URL}/api/crm/deals`, {
      data: testDeal
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Deal created successfully');
    expect(data).toHaveProperty('source', 'catalyst-crm-backend');
  });

  test('should validate advanced leads creation (POST)', async ({ request }) => {
    const testLead = {
      firstName: 'Advanced',
      lastName: 'Lead Test',
      email: `advanced-lead-test-${Date.now()}@example.com`,
      phone: '5550126789',
      serviceType: 'Premium Service',
      leadSource: 'Validation Test',
      notes: 'This is a validation test lead'
    };

    const response = await request.post(`${BASE_URL}/api/v1/zoho/crm/leads`, {
      data: testLead
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Lead created successfully in CRM');
    expect(data.data).toHaveProperty('lead_id');
    expect(data.data).toHaveProperty('status', 'created');
  });

  test('should validate quick actions - create note (POST)', async ({ request }) => {
    const testNote = {
      action: 'create-note',
      data: {
        note_title: 'Validation Test Note',
        note_content: 'This is a test note for validation',
        related_to: 'validation-test'
      }
    };

    const response = await request.post(`${BASE_URL}/api/v1/quick-actions`, {
      data: testNote
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message', 'Note created successfully');
  });

  test('should validate error handling for invalid data', async ({ request }) => {
    const invalidLead = {
      // Missing required fields
      email: 'invalid-test@example.com'
    };

    const response = await request.post(`${BASE_URL}/api/crm/leads`, {
      data: invalidLead
    });
    
    expect(response.status()).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });

  test('should validate HIPAA audit logging headers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/crm/contacts`, {
      headers: {
        'x-user-id': 'validation-test-user',
        'user-agent': 'CRM-Validation-Test/1.0'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('timestamp');
  });
});
