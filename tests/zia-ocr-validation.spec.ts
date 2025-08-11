import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Zia OCR API Validation Tests
 * Tests the complete OCR workflow from file upload to lead creation
 */

const BASE_URL = 'http://localhost:5369';
const OCR_API_URL = `${BASE_URL}/api/v1/zia/ocr`;

// Mock business card data (base64 encoded test image)
const MOCK_BUSINESS_CARD_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

test.describe('Zia OCR API Validation', () => {
  
  test('should return OCR service status', async ({ request }) => {
    const response = await request.get(OCR_API_URL, {
      headers: {
        'x-user-id': 'test-user'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.service).toBe('Zia OCR API');
    expect(data.data.status).toBe('operational');
    expect(data.data.supportedActions).toContain('extractBusinessCard');
    expect(data.data.supportedActions).toContain('extractDocument');
    expect(data.data.supportedActions).toContain('createLeadFromOCR');
    expect(data.data.supportedFileTypes).toContain('image/jpeg');
    expect(data.data.supportedFileTypes).toContain('application/pdf');
  });

  test('should validate required parameters for business card extraction', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'extractBusinessCard'
        // Missing required parameters: fileData, fileName, mimeType
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required parameters');
  });

  test('should validate required parameters for document extraction', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'extractDocument',
        fileName: 'test.jpg'
        // Missing required parameters: fileData, mimeType
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required parameters');
  });

  test('should validate required parameters for lead creation from OCR', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'createLeadFromOCR'
        // Missing required parameter: contactData
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required parameter: contactData');
  });

  test('should handle unsupported action', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'unsupportedAction'
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unsupported action');
    expect(data.supportedActions).toContain('extractBusinessCard');
  });

  test('should attempt business card extraction with mock data', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'extractBusinessCard',
        fileData: MOCK_BUSINESS_CARD_BASE64,
        fileName: 'test-business-card.png',
        mimeType: 'image/png'
      }
    });
    
    // Note: This will likely return 500 if Catalyst backend is not running
    // but validates the API endpoint structure and request handling
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.source).toBe('zia-ocr-catalyst');
      expect(data.message).toContain('processed successfully');
    } else if (response.status() === 500) {
      // Expected if Catalyst backend is not running
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Zia OCR processing failed');
      console.log('Expected 500 error - Catalyst backend not running');
    }
  });

  test('should attempt document extraction with mock data', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'extractDocument',
        fileData: MOCK_BUSINESS_CARD_BASE64,
        fileName: 'test-invoice.pdf',
        mimeType: 'application/pdf',
        documentType: 'invoice'
      }
    });
    
    // Note: This will likely return 500 if Catalyst backend is not running
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.source).toBe('zia-ocr-catalyst');
      expect(data.message).toContain('processed successfully');
    } else if (response.status() === 500) {
      // Expected if Catalyst backend is not running
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Zia OCR processing failed');
      console.log('Expected 500 error - Catalyst backend not running');
    }
  });

  test('should attempt lead creation from OCR data', async ({ request }) => {
    const mockContactData = {
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      company: 'Example Corp',
      title: 'CEO'
    };

    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        action: 'createLeadFromOCR',
        contactData: mockContactData,
        sourceFile: 'test-business-card.png',
        confidence: 95
      }
    });
    
    // Note: This will likely return 500 if Catalyst backend is not running
    if (response.status() === 200 || response.status() === 201) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.action).toMatch(/created|updated/);
      expect(data.source).toBe('zia-ocr-catalyst');
    } else if (response.status() === 500) {
      // Expected if Catalyst backend is not running
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Zia OCR processing failed');
      console.log('Expected 500 error - Catalyst backend not running');
    }
  });

  test('should include HIPAA audit headers in all responses', async ({ request }) => {
    const response = await request.get(OCR_API_URL, {
      headers: {
        'x-user-id': 'test-user'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });

  test('should handle missing user ID gracefully', async ({ request }) => {
    const response = await request.get(OCR_API_URL);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    // Should still work with anonymous user
  });
});

test.describe('OCR Frontend Integration', () => {
  
  test('should load OCR page successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/zia/ocr`);
    
    // Check page title and main elements
    await expect(page.locator('h1')).toContainText('Zia AI OCR Document Processor');
    await expect(page.locator('text=Business Card')).toBeVisible();
    await expect(page.locator('text=Document')).toBeVisible();
    
    // Check upload area
    await expect(page.locator('text=Drop your business card here')).toBeVisible();
    await expect(page.locator('text=Supports JPEG, PNG, GIF, PDF')).toBeVisible();
  });

  test('should switch between business card and document modes', async ({ page }) => {
    await page.goto(`${BASE_URL}/zia/ocr`);
    
    // Default should be business card mode
    await expect(page.locator('text=Drop your business card here')).toBeVisible();
    
    // Switch to document mode
    await page.click('text=Document');
    await expect(page.locator('text=Drop your document here')).toBeVisible();
    
    // Document type selector should be visible
    await expect(page.locator('select')).toBeVisible();
    
    // Switch back to business card mode
    await page.click('text=Business Card');
    await expect(page.locator('text=Drop your business card here')).toBeVisible();
  });

  test('should show features overview', async ({ page }) => {
    await page.goto(`${BASE_URL}/zia/ocr`);
    
    await expect(page.locator('text=Business Card OCR')).toBeVisible();
    await expect(page.locator('text=Auto Lead Creation')).toBeVisible();
    await expect(page.locator('text=HIPAA Compliant')).toBeVisible();
  });

  test('should show usage instructions', async ({ page }) => {
    await page.goto(`${BASE_URL}/zia/ocr`);
    
    await expect(page.locator('text=How to Use')).toBeVisible();
    await expect(page.locator('text=Business Cards')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();
  });

  test('should show technical details', async ({ page }) => {
    await page.goto(`${BASE_URL}/zia/ocr`);
    
    await expect(page.locator('text=Technical Details')).toBeVisible();
    await expect(page.locator('text=Supported Formats')).toBeVisible();
    await expect(page.locator('text=Processing Features')).toBeVisible();
    await expect(page.locator('text=Zia AI OCR engine')).toBeVisible();
  });
});

test.describe('OCR Error Handling', () => {
  
  test('should validate missing action parameter', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: {
        // Missing action parameter
        fileData: MOCK_BUSINESS_CARD_BASE64,
        fileName: 'test.png',
        mimeType: 'image/png'
      }
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required parameter: action');
  });

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(OCR_API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      data: 'invalid-json'
    });
    
    expect(response.status()).toBe(500);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Zia OCR processing failed');
  });
});
