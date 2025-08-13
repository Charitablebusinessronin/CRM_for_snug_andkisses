
#!/usr/bin/env node

/**
 * Catalyst Integration Testing Suite
 * Comprehensive E2E testing for Snug & Kisses CRM
 */

const https = require('https');
const fs = require('fs');

class IntegrationTestSuite {
  constructor() {
    this.baseUrl = process.env.CATALYST_APP_URL || 'https://snugcrm-891124823.development.catalystserverless.com';
    this.testResults = [];
    this.testToken = null;
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running: ${testName}`);
    
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', result });
      console.log(`✅ PASS: ${testName}`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
      throw error;
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Catalyst-Integration-Test',
          ...headers
        }
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: jsonBody
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Authentication Tests
  async testHealthEndpoint() {
    const response = await this.makeRequest('/api/health');
    if (response.status !== 200) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.body;
  }

  async testAuthenticationFlow() {
    const testUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User'
    };

    const response = await this.makeRequest('/api/auth/login', 'POST', testUser);
    
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Authentication test failed: ${response.status}`);
    }

    return response.body;
  }

  // CRM Module Tests
  async testCustomerCreation() {
    const testCustomer = {
      name: 'Integration Test Customer',
      email: 'integration.test@example.com',
      phone: '555-0123',
      company: 'Test Company Inc.',
      source: 'integration_test'
    };

    const response = await this.makeRequest(
      '/api/catalyst/integration?module=crm&action=create-customer',
      'POST',
      testCustomer
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Customer creation failed: ${response.status}`);
    }

    return response.body;
  }

  async testCustomerRetrieval() {
    const response = await this.makeRequest(
      '/api/catalyst/integration?module=crm&action=list-customers'
    );

    if (response.status !== 200) {
      throw new Error(`Customer retrieval failed: ${response.status}`);
    }

    return response.body;
  }

  // Support Module Tests
  async testSupportTicketCreation() {
    const testTicket = {
      title: 'Integration Test Ticket',
      description: 'This is a test ticket created during integration testing',
      customer_email: 'integration.test@example.com',
      priority: 'medium',
      category: 'technical'
    };

    const response = await this.makeRequest(
      '/api/catalyst/integration?module=support&action=create-ticket',
      'POST',
      testTicket
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Support ticket creation failed: ${response.status}`);
    }

    return response.body;
  }

  // Finance Module Tests
  async testInvoiceGeneration() {
    const testInvoice = {
      customer_name: 'Integration Test Customer',
      customer_email: 'integration.test@example.com',
      total_amount: 1000.00,
      payment_terms: 'Net 30',
      line_items: [
        {
          description: 'Test Service',
          quantity: 1,
          rate: 1000.00
        }
      ]
    };

    const response = await this.makeRequest(
      '/api/catalyst/integration?module=finance&action=create-invoice',
      'POST',
      testInvoice
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Invoice generation failed: ${response.status}`);
    }

    return response.body;
  }

  // HR Module Tests
  async testEmployeeDataAccess() {
    const response = await this.makeRequest(
      '/api/catalyst/integration?module=hr&action=list-employees'
    );

    if (response.status !== 200) {
      throw new Error(`Employee data access failed: ${response.status}`);
    }

    return response.body;
  }

  // Dashboard Tests
  async testDashboardMetrics() {
    const response = await this.makeRequest(
      '/api/catalyst/integration?module=dashboard&action=get-metrics'
    );

    if (response.status !== 200) {
      throw new Error(`Dashboard metrics failed: ${response.status}`);
    }

    return response.body;
  }

  // Security Tests
  async testUnauthorizedAccess() {
    const response = await this.makeRequest('/api/v1/admin/dashboard');
    
    // Should return 401 or 403 for unauthorized access
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`Security test failed: Expected 401/403, got ${response.status}`);
    }

    return response.body;
  }

  // Data Integrity Tests
  async testAuditLogging() {
    const response = await this.makeRequest(
      '/api/catalyst/integration?module=audit&action=verify-logging'
    );

    if (response.status !== 200) {
      throw new Error(`Audit logging test failed: ${response.status}`);
    }

    return response.body;
  }

  // Performance Tests
  async testConcurrentRequests() {
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(this.makeRequest('/api/health'));
    }

    const results = await Promise.all(promises);
    
    const allSuccessful = results.every(result => result.status === 200);
    if (!allSuccessful) {
      throw new Error('Concurrent request test failed');
    }

    return { message: 'All concurrent requests successful', count: results.length };
  }

  async runAllTests() {
    console.log('🚀 Starting Catalyst Integration Test Suite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 Target URL: ${this.baseUrl}`);
    console.log('');

    try {
      // Basic Health Tests
      console.log('📊 BASIC HEALTH TESTS');
      await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
      await this.runTest('Concurrent Requests', () => this.testConcurrentRequests());
      console.log('');

      // Authentication Tests
      console.log('🔐 AUTHENTICATION TESTS');
      await this.runTest('Authentication Flow', () => this.testAuthenticationFlow());
      await this.runTest('Unauthorized Access', () => this.testUnauthorizedAccess());
      console.log('');

      // CRM Module Tests
      console.log('👥 CRM MODULE TESTS');
      await this.runTest('Customer Creation', () => this.testCustomerCreation());
      await this.runTest('Customer Retrieval', () => this.testCustomerRetrieval());
      console.log('');

      // Support Module Tests
      console.log('🎫 SUPPORT MODULE TESTS');
      await this.runTest('Support Ticket Creation', () => this.testSupportTicketCreation());
      console.log('');

      // Finance Module Tests
      console.log('💰 FINANCE MODULE TESTS');
      await this.runTest('Invoice Generation', () => this.testInvoiceGeneration());
      console.log('');

      // HR Module Tests
      console.log('👔 HR MODULE TESTS');
      await this.runTest('Employee Data Access', () => this.testEmployeeDataAccess());
      console.log('');

      // Dashboard Tests
      console.log('📈 DASHBOARD TESTS');
      await this.runTest('Dashboard Metrics', () => this.testDashboardMetrics());
      console.log('');

      // Security & Compliance Tests
      console.log('🔒 SECURITY & COMPLIANCE TESTS');
      await this.runTest('Audit Logging', () => this.testAuditLogging());
      console.log('');

      this.generateTestReport();

    } catch (error) {
      console.log(`💥 Test suite failed: ${error.message}`);
      this.generateTestReport();
      process.exit(1);
    }
  }

  generateTestReport() {
    console.log('');
    console.log('📋 INTEGRATION TEST REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.status === 'PASS').length;
    const failedTests = this.testResults.filter(test => test.status === 'FAIL').length;

    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    console.log('');

    if (failedTests > 0) {
      console.log('❌ FAILED TESTS:');
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
      console.log('');
    }

    console.log('✅ PASSED TESTS:');
    this.testResults
      .filter(test => test.status === 'PASS')
      .forEach(test => {
        console.log(`   • ${test.name}`);
      });

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: Math.round((passedTests / totalTests) * 100)
      },
      results: this.testResults
    };

    fs.writeFileSync(
      `integration-test-report-${new Date().toISOString().split('T')[0]}.json`,
      JSON.stringify(reportData, null, 2)
    );

    console.log('');
    console.log('📄 Detailed report saved to integration-test-report-*.json');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// Execute test suite
if (require.main === module) {
  const testSuite = new IntegrationTestSuite();
  testSuite.runAllTests();
}

module.exports = IntegrationTestSuite;
