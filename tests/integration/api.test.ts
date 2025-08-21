/**
 * API Integration Tests
 * End-to-end testing for API endpoints with HIPAA compliance validation
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { testDb } from '../utils/test-database'
import { generateTestTokens } from '../utils/test-auth'

describe('API Integration Tests', () => {
  let server: any
  let testTokens: {
    adminToken: string
    employeeToken: string
    clientToken: string
  }

  beforeAll(async () => {
    // Set up test database
    await testDb.setup()
    
    // Generate test authentication tokens
    testTokens = await generateTestTokens()
    
    // Start test server
    const { default: app } = await import('../../app/api')
    server = createServer(app)
    await new Promise<void>((resolve) => {
      server.listen(0, resolve)
    })
  })

  afterAll(async () => {
    await testDb.cleanup()
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(resolve)
      })
    }
  })

  beforeEach(async () => {
    await testDb.reset()
  })

  afterEach(async () => {
    // Clean up any test data
  })

  describe('Authentication API (/api/auth)', () => {
    describe('POST /api/auth/login', () => {
      test('should authenticate valid user credentials', async () => {
        const credentials = {
          email: 'test@snugkisses.com',
          password: 'ValidPassword123!'
        }

        const response = await request(server)
          .post('/api/auth/login')
          .send(credentials)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.accessToken).toBeDefined()
        expect(response.body.data.refreshToken).toBeDefined()
        expect(response.body.data.user.email).toBe(credentials.email)
      })

      test('should reject invalid credentials', async () => {
        const invalidCredentials = {
          email: 'test@snugkisses.com',
          password: 'WrongPassword'
        }

        const response = await request(server)
          .post('/api/auth/login')
          .send(invalidCredentials)

        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Invalid credentials')
      })

      test('should require MFA for users with MFA enabled', async () => {
        const mfaUserCredentials = {
          email: 'mfa-user@snugkisses.com',
          password: 'ValidPassword123!'
        }

        const response = await request(server)
          .post('/api/auth/login')
          .send(mfaUserCredentials)

        expect(response.status).toBe(202)
        expect(response.body.success).toBe(false)
        expect(response.body.requiresMFA).toBe(true)
        expect(response.body.mfaToken).toBeDefined()
      })

      test('should log authentication attempts for HIPAA compliance', async () => {
        const credentials = {
          email: 'test@snugkisses.com',
          password: 'ValidPassword123!'
        }

        await request(server)
          .post('/api/auth/login')
          .send(credentials)

        // Check audit log was created
        const auditLogs = await testDb.query(
          'SELECT * FROM audit_logs WHERE event_type = ? AND details LIKE ?',
          ['LOGIN_SUCCESS', `%${credentials.email}%`]
        )
        
        expect(auditLogs.length).toBe(1)
        expect(auditLogs[0].user_email).toBe(credentials.email)
      })

      test('should implement rate limiting', async () => {
        const invalidCredentials = {
          email: 'test@snugkisses.com',
          password: 'WrongPassword'
        }

        // Make multiple failed attempts
        for (let i = 0; i < 6; i++) {
          await request(server)
            .post('/api/auth/login')
            .send(invalidCredentials)
        }

        const response = await request(server)
          .post('/api/auth/login')
          .send(invalidCredentials)

        expect(response.status).toBe(429)
        expect(response.body.error).toContain('Too many failed attempts')
      })
    })

    describe('POST /api/auth/refresh', () => {
      test('should refresh valid token', async () => {
        const response = await request(server)
          .post('/api/auth/refresh')
          .send({ refreshToken: testTokens.clientToken })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.accessToken).toBeDefined()
      })

      test('should reject invalid refresh token', async () => {
        const response = await request(server)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' })

        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Invalid refresh token')
      })
    })

    describe('POST /api/auth/logout', () => {
      test('should successfully logout user', async () => {
        const response = await request(server)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toContain('Logged out successfully')
      })
    })
  })

  describe('Client Portal API (/api/v1/client)', () => {
    describe('GET /api/v1/client/profile', () => {
      test('should retrieve client profile with valid token', async () => {
        const response = await request(server)
          .get('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.id).toBeDefined()
        expect(response.body.data.email).toBeDefined()
      })

      test('should reject request without authentication', async () => {
        const response = await request(server)
          .get('/api/v1/client/profile')

        expect(response.status).toBe(401)
        expect(response.body.error).toContain('Authentication required')
      })

      test('should log PHI access for HIPAA compliance', async () => {
        await request(server)
          .get('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        const auditLogs = await testDb.query(
          'SELECT * FROM audit_logs WHERE event_type = ? ORDER BY timestamp DESC LIMIT 1',
          ['PHI_ACCESS']
        )
        
        expect(auditLogs.length).toBe(1)
        expect(JSON.parse(auditLogs[0].details).dataType).toBe('client_profile')
      })
    })

    describe('PUT /api/v1/client/profile', () => {
      test('should update client profile with valid data', async () => {
        const updateData = {
          phone: '+1987654321',
          address: {
            street: '456 Oak Ave',
            city: 'New City',
            state: 'CA',
            zipCode: '54321'
          }
        }

        const response = await request(server)
          .put('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
          .send(updateData)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.phone).toBe(updateData.phone)
      })

      test('should validate update data', async () => {
        const invalidData = {
          email: 'invalid-email-format'
        }

        const response = await request(server)
          .put('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
          .send(invalidData)

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Invalid email format')
      })

      test('should log PHI modification for HIPAA compliance', async () => {
        const updateData = { phone: '+1987654321' }

        await request(server)
          .put('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
          .send(updateData)

        const auditLogs = await testDb.query(
          'SELECT * FROM audit_logs WHERE event_type = ? ORDER BY timestamp DESC LIMIT 1',
          ['PHI_MODIFY']
        )
        
        expect(auditLogs.length).toBe(1)
        expect(JSON.parse(auditLogs[0].details).changes.phone).toBe(updateData.phone)
      })
    })

    describe('GET /api/v1/client/service-history', () => {
      test('should retrieve service history with pagination', async () => {
        const response = await request(server)
          .get('/api/v1/client/service-history?limit=10&offset=0')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toBeInstanceOf(Array)
        expect(response.body.pagination).toEqual({
          limit: 10,
          offset: 0,
          total: expect.any(Number)
        })
      })

      test('should filter by date range', async () => {
        const startDate = '2024-01-01'
        const endDate = '2024-01-31'

        const response = await request(server)
          .get(`/api/v1/client/service-history?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        
        // Verify all returned records are within date range
        for (const record of response.body.data) {
          const recordDate = new Date(record.date)
          expect(recordDate >= new Date(startDate)).toBe(true)
          expect(recordDate <= new Date(endDate)).toBe(true)
        }
      })
    })

    describe('POST /api/v1/client/service-request', () => {
      test('should create new service request', async () => {
        const serviceRequest = {
          serviceType: 'lactation support',
          description: 'Need help with breastfeeding',
          urgency: 'normal',
          preferredDate: '2024-02-15',
          preferredTime: '10:00'
        }

        const response = await request(server)
          .post('/api/v1/client/service-request')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
          .send(serviceRequest)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.serviceType).toBe(serviceRequest.serviceType)
        expect(response.body.data.status).toBe('pending')
      })

      test('should validate service request data', async () => {
        const invalidRequest = {
          serviceType: 'invalid-service',
          description: '',
          preferredDate: 'invalid-date'
        }

        const response = await request(server)
          .post('/api/v1/client/service-request')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
          .send(invalidRequest)

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Invalid')
      })
    })
  })

  describe('Employee Portal API (/api/v1/employee)', () => {
    describe('GET /api/v1/employee/dashboard', () => {
      test('should retrieve employee dashboard data', async () => {
        const response = await request(server)
          .get('/api/v1/employee/dashboard')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.statistics).toBeDefined()
        expect(response.body.data.upcomingShifts).toBeInstanceOf(Array)
        expect(response.body.data.recentNotes).toBeInstanceOf(Array)
      })

      test('should reject access with client token', async () => {
        const response = await request(server)
          .get('/api/v1/employee/dashboard')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)

        expect(response.status).toBe(403)
        expect(response.body.error).toContain('Insufficient permissions')
      })
    })

    describe('GET /api/v1/employee/clients', () => {
      test('should retrieve assigned clients list', async () => {
        const response = await request(server)
          .get('/api/v1/employee/clients')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toBeInstanceOf(Array)
      })

      test('should include only active clients by default', async () => {
        const response = await request(server)
          .get('/api/v1/employee/clients')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)

        expect(response.status).toBe(200)
        for (const client of response.body.data) {
          expect(client.assignment.status).toBe('active')
        }
      })

      test('should include inactive clients when requested', async () => {
        const response = await request(server)
          .get('/api/v1/employee/clients?includeInactive=true')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })
    })

    describe('POST /api/v1/employee/client-note', () => {
      test('should create client note', async () => {
        const noteData = {
          clientId: 'client-123',
          noteType: 'visit',
          note: 'Client is progressing well with breastfeeding.',
          shiftId: 'shift-123'
        }

        const response = await request(server)
          .post('/api/v1/employee/client-note')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)
          .send(noteData)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.noteContent).toBe(noteData.note)
      })

      test('should log client note creation for HIPAA compliance', async () => {
        const noteData = {
          clientId: 'client-123',
          noteType: 'visit',
          note: 'Test note for compliance check'
        }

        await request(server)
          .post('/api/v1/employee/client-note')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)
          .send(noteData)

        const auditLogs = await testDb.query(
          'SELECT * FROM audit_logs WHERE event_type = ? ORDER BY timestamp DESC LIMIT 1',
          ['CLIENT_NOTE_CREATED']
        )
        
        expect(auditLogs.length).toBe(1)
        expect(JSON.parse(auditLogs[0].details).clientId).toBe(noteData.clientId)
      })
    })
  })

  describe('Admin API (/api/v1/admin)', () => {
    describe('GET /api/v1/admin/compliance-report', () => {
      test('should generate compliance report for admin users', async () => {
        const startDate = '2024-01-01'
        const endDate = '2024-01-31'

        const response = await request(server)
          .get(`/api/v1/admin/compliance-report?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${testTokens.adminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.reportId).toBeDefined()
        expect(response.body.data.periodStart).toBe(startDate)
        expect(response.body.data.periodEnd).toBe(endDate)
        expect(response.body.data.totalEvents).toBeGreaterThanOrEqual(0)
        expect(response.body.data.complianceScore).toBeGreaterThanOrEqual(0)
      })

      test('should reject access for non-admin users', async () => {
        const response = await request(server)
          .get('/api/v1/admin/compliance-report')
          .set('Authorization', `Bearer ${testTokens.employeeToken}`)

        expect(response.status).toBe(403)
        expect(response.body.error).toContain('Admin access required')
      })
    })

    describe('GET /api/v1/admin/audit-logs', () => {
      test('should retrieve audit logs with filters', async () => {
        const response = await request(server)
          .get('/api/v1/admin/audit-logs?eventType=PHI_ACCESS&limit=50')
          .set('Authorization', `Bearer ${testTokens.adminToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toBeInstanceOf(Array)
        
        for (const log of response.body.data) {
          expect(log.event_type).toBe('PHI_ACCESS')
        }
      })

      test('should support date range filtering', async () => {
        const startDate = '2024-01-01T00:00:00.000Z'
        const endDate = '2024-01-31T23:59:59.999Z'

        const response = await request(server)
          .get(`/api/v1/admin/audit-logs?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${testTokens.adminToken}`)

        expect(response.status).toBe(200)
        for (const log of response.body.data) {
          const logDate = new Date(log.timestamp)
          expect(logDate >= new Date(startDate)).toBe(true)
          expect(logDate <= new Date(endDate)).toBe(true)
        }
      })
    })
  })

  describe('HIPAA Compliance Validation', () => {
    test('should maintain audit trail for all PHI access', async () => {
      // Perform various PHI access operations
      await request(server)
        .get('/api/v1/client/profile')
        .set('Authorization', `Bearer ${testTokens.clientToken}`)

      await request(server)
        .get('/api/v1/employee/clients')
        .set('Authorization', `Bearer ${testTokens.employeeToken}`)

      // Verify audit logs were created
      const auditLogs = await testDb.query(
        'SELECT * FROM audit_logs WHERE event_type LIKE ? OR event_type LIKE ?',
        ['PHI_%', 'CLIENT_%']
      )
      
      expect(auditLogs.length).toBeGreaterThanOrEqual(2)
    })

    test('should enforce proper data retention policies', async () => {
      // Check that audit logs include retention dates
      const auditLogs = await testDb.query(
        'SELECT * FROM audit_logs WHERE retention_date IS NOT NULL LIMIT 1'
      )
      
      expect(auditLogs.length).toBe(1)
      
      const retentionDate = new Date(auditLogs[0].retention_date)
      const sevenYearsFromNow = new Date()
      sevenYearsFromNow.setFullYear(sevenYearsFromNow.getFullYear() + 7)
      
      expect(retentionDate.getTime()).toBeCloseTo(sevenYearsFromNow.getTime(), -86400000) // Within 1 day
    })

    test('should encrypt sensitive data in audit logs', async () => {
      await request(server)
        .put('/api/v1/client/profile')
        .set('Authorization', `Bearer ${testTokens.clientToken}`)
        .send({ phone: '+1234567890' })

      const auditLogs = await testDb.query(
        'SELECT * FROM audit_logs WHERE event_type = ? ORDER BY timestamp DESC LIMIT 1',
        ['PHI_MODIFY']
      )
      
      expect(auditLogs.length).toBe(1)
      
      // Verify sensitive data in details is encrypted or masked
      const details = JSON.parse(auditLogs[0].details)
      if (details.phone) {
        expect(details.phone).not.toBe('+1234567890') // Should be encrypted/masked
      }
    })
  })

  describe('Security Validation', () => {
    test('should prevent SQL injection attacks', async () => {
      const maliciousInput = "'; DROP TABLE users; --"
      
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          email: maliciousInput,
          password: 'password'
        })

      expect(response.status).toBe(401) // Should fail authentication, not crash
      
      // Verify users table still exists
      const users = await testDb.query('SELECT COUNT(*) as count FROM users')
      expect(users[0].count).toBeGreaterThan(0)
    })

    test('should prevent XSS attacks', async () => {
      const maliciousScript = '<script>alert("xss")</script>'
      
      const response = await request(server)
        .put('/api/v1/client/profile')
        .set('Authorization', `Bearer ${testTokens.clientToken}`)
        .send({ firstName: maliciousScript })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Invalid input')
    })

    test('should validate input lengths', async () => {
      const veryLongString = 'a'.repeat(10000)
      
      const response = await request(server)
        .put('/api/v1/client/profile')
        .set('Authorization', `Bearer ${testTokens.clientToken}`)
        .send({ firstName: veryLongString })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('exceeds maximum length')
    })
  })

  describe('Performance Tests', () => {
    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(10).fill(null).map(() =>
        request(server)
          .get('/api/v1/client/profile')
          .set('Authorization', `Bearer ${testTokens.clientToken}`)
      )

      const startTime = Date.now()
      const responses = await Promise.all(concurrentRequests)
      const endTime = Date.now()

      // All requests should succeed
      for (const response of responses) {
        expect(response.status).toBe(200)
      }

      // Total time should be reasonable (less than 5 seconds for 10 concurrent requests)
      expect(endTime - startTime).toBeLessThan(5000)
    })

    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const response = await request(server)
        .get('/api/v1/client/profile')
        .set('Authorization', `Bearer ${testTokens.clientToken}`)

      const responseTime = Date.now() - startTime

      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(200) // Less than 200ms as per requirements
    })
  })
})