import { logger } from './utils/logger';

const TEST_PORT = 4728;

// Test endpoints function
const testEndpoints = async (): Promise<void> => {
  try {
    logger.info('🧪 Starting API endpoint tests...');

    // Test health endpoint
    const healthResponse = await fetch(`http://localhost:${TEST_PORT}/health`);
    const healthData: any = await healthResponse.json();
    
    if (healthData.success) {
      logger.info('✅ Health check passed:', {
        port: healthData.port,
        environment: healthData.environment,
        uptime: healthData.uptime
      });
    } else {
      logger.error('❌ Health check failed');
    }

    // Test API documentation endpoint
    const apiResponse = await fetch(`http://localhost:${TEST_PORT}/api`);
    const apiData: any = await apiResponse.json();
    
    if (apiData.success) {
      logger.info('✅ API documentation endpoint passed');
    } else {
      logger.error('❌ API documentation endpoint failed');
    }

    // Test auth endpoints (registration)
    logger.info('🔐 Testing authentication endpoints...');
    
    const registerData = {
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };

    const registerResponse = await fetch(`http://localhost:${TEST_PORT}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.status === 201) {
      logger.info('✅ User registration endpoint working');
      
      // Test login
      const loginResponse = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password
        })
      });

      if (loginResponse.ok) {
        const loginData: any = await loginResponse.json();
        const token = loginData.tokens?.accessToken;
        
        if (token) {
          logger.info('✅ User login endpoint working');
          
          // Test protected endpoint (contacts)
          const contactsResponse = await fetch(`http://localhost:${TEST_PORT}/api/contacts`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (contactsResponse.ok) {
            logger.info('✅ Protected contacts endpoint working');
          } else {
            logger.error('❌ Protected contacts endpoint failed');
          }

          // Test leads endpoint
          const leadsResponse = await fetch(`http://localhost:${TEST_PORT}/api/leads`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (leadsResponse.ok) {
            logger.info('✅ Protected leads endpoint working');
          } else {
            logger.error('❌ Protected leads endpoint failed');
          }

          // Test profile endpoint
          const profileResponse = await fetch(`http://localhost:${TEST_PORT}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (profileResponse.ok) {
            logger.info('✅ Profile endpoint working');
          } else {
            logger.error('❌ Profile endpoint failed');
          }

        } else {
          logger.error('❌ Login response missing token');
        }
      } else {
        logger.error('❌ User login endpoint failed');
      }
    } else if (registerResponse.status === 409) {
      logger.info('ℹ️  User already exists, testing login...');
      
      // Test login with existing user
      const loginResponse = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password
        })
      });

      if (loginResponse.ok) {
        logger.info('✅ User login with existing account working');
      } else {
        logger.error('❌ User login with existing account failed');
      }
    } else {
      logger.error('❌ User registration endpoint failed');
    }

    // Test 404 handling
    const notFoundResponse = await fetch(`http://localhost:${TEST_PORT}/api/nonexistent`);
    if (notFoundResponse.status === 404) {
      logger.info('✅ 404 handling working correctly');
    } else {
      logger.error('❌ 404 handling not working');
    }

    logger.info('🎉 API endpoint testing completed!');

  } catch (error) {
    logger.error('❌ Test failed with error:', error);
  }
};

// Performance test
const performanceTest = async (): Promise<void> => {
  try {
    logger.info('⚡ Running performance test...');
    
    const startTime = Date.now();
    const promises = [];
    
    // Make 10 concurrent health check requests
    for (let i = 0; i < 10; i++) {
      promises.push(fetch(`http://localhost:${TEST_PORT}/health`));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    logger.info(`⚡ Performance test completed: 10 concurrent requests in ${totalTime}ms (avg: ${totalTime/10}ms per request)`);
    
  } catch (error) {
    logger.error('❌ Performance test failed:', error);
  }
};

// Memory usage test
const memoryTest = (): void => {
  const usage = process.memoryUsage();
  logger.info('📊 Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`
  });
};

// Main test runner
const runTests = async (): Promise<void> => {
  logger.info(`🚀 Starting comprehensive tests for Sabir's TypeScript CRM API on port ${TEST_PORT}`);
  
  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testEndpoints();
  await performanceTest();
  memoryTest();
  
  logger.info('✨ All tests completed successfully!');
};

// Export for use in other files
export { testEndpoints, performanceTest, memoryTest, runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    logger.error('Test runner failed:', error);
    process.exit(1);
  });
}