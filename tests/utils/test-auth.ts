/**
 * Test Authentication Utilities
 * Generate test tokens and handle auth setup for testing
 */

import jwt from 'jsonwebtoken'
import { testDb } from './test-database'

interface TestTokenPayload {
  userId: string
  email: string
  role: 'admin' | 'employee' | 'client' | 'contractor'
  firstName: string
  lastName: string
}

interface TestTokens {
  adminToken: string
  employeeToken: string
  clientToken: string
}

/**
 * Generate test JWT tokens for different user roles
 */
export async function generateTestTokens(): Promise<TestTokens> {
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key'
  
  // Get test users from database
  const users = await Promise.all([
    testDb.query('SELECT * FROM users WHERE email = ?', ['admin@snugkisses.com']),
    testDb.query('SELECT * FROM users WHERE email = ?', ['employee@snugkisses.com']),
    testDb.query('SELECT * FROM users WHERE email = ?', ['test@snugkisses.com'])
  ])

  const [adminUsers, employeeUsers, clientUsers] = users
  
  if (!adminUsers[0] || !employeeUsers[0] || !clientUsers[0]) {
    throw new Error('Test users not found in database')
  }

  const adminPayload: TestTokenPayload = {
    userId: adminUsers[0].id.toString(),
    email: adminUsers[0].email,
    role: 'admin',
    firstName: adminUsers[0].first_name,
    lastName: adminUsers[0].last_name
  }

  const employeePayload: TestTokenPayload = {
    userId: employeeUsers[0].id.toString(),
    email: employeeUsers[0].email,
    role: 'employee',
    firstName: employeeUsers[0].first_name,
    lastName: employeeUsers[0].last_name
  }

  const clientPayload: TestTokenPayload = {
    userId: clientUsers[0].id.toString(),
    email: clientUsers[0].email,
    role: 'client',
    firstName: clientUsers[0].first_name,
    lastName: clientUsers[0].last_name
  }

  const tokenOptions = {
    expiresIn: '1h',
    issuer: 'snug-kisses-crm-test'
  }

  return {
    adminToken: jwt.sign(adminPayload, jwtSecret, tokenOptions),
    employeeToken: jwt.sign(employeePayload, jwtSecret, tokenOptions),
    clientToken: jwt.sign(clientPayload, jwtSecret, tokenOptions)
  }
}

/**
 * Generate MFA token for testing MFA verification
 */
export function generateMFAToken(userId: string): string {
  const mfaSecret = process.env.MFA_SECRET || 'test-mfa-secret'
  
  const payload = {
    userId,
    type: 'mfa',
    timestamp: Date.now()
  }

  return jwt.sign(payload, mfaSecret, { expiresIn: '5m' })
}

/**
 * Generate expired token for testing token validation
 */
export function generateExpiredToken(userId: string, role: string): string {
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key'
  
  const payload: TestTokenPayload = {
    userId,
    email: 'expired@snugkisses.com',
    role: role as any,
    firstName: 'Expired',
    lastName: 'User'
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: '-1h' }) // Already expired
}

/**
 * Mock authentication middleware for testing
 */
export function createMockAuthMiddleware() {
  return {
    verifyToken: jest.fn().mockImplementation((token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key')
        return { success: true, user: decoded }
      } catch (error) {
        return { success: false, error: 'Invalid token' }
      }
    }),
    
    hasPermission: jest.fn().mockImplementation((userRole: string, requiredRole: string) => {
      const roleHierarchy: Record<string, number> = {
        'client': 1,
        'contractor': 2,
        'employee': 3,
        'admin': 4
      }
      
      return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
    }),
    
    requireAuth: jest.fn().mockImplementation((req: any, res: any, next: any) => {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      
      const verification = this.verifyToken(token)
      if (!verification.success) {
        return res.status(401).json({ error: verification.error })
      }
      
      req.user = verification.user
      next()
    }),
    
    requireRole: jest.fn().mockImplementation((requiredRole: string) => {
      return (req: any, res: any, next: any) => {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' })
        }
        
        if (!this.hasPermission(req.user.role, requiredRole)) {
          return res.status(403).json({ error: 'Insufficient permissions' })
        }
        
        next()
      }
    })
  }
}

/**
 * Create mock audit service for testing
 */
export function createMockAuditService() {
  return {
    logEvent: jest.fn().mockResolvedValue(true),
    logPHIAccess: jest.fn().mockResolvedValue(true),
    generateComplianceReport: jest.fn().mockResolvedValue({
      reportId: 'test-report-123',
      generatedAt: new Date().toISOString(),
      totalEvents: 100,
      complianceScore: 95,
      violations: []
    }),
    detectViolations: jest.fn().mockResolvedValue([])
  }
}

/**
 * Setup test environment with proper mocks
 */
export async function setupTestEnvironment() {
  // Mock environment variables
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret-key'
  process.env.MFA_SECRET = 'test-mfa-secret-key'
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!'
  
  // Mock external services
  jest.mock('../../lib/zoho-config', () => ({
    ZohoConfig: {
      authenticate: jest.fn().mockResolvedValue({ success: true }),
      apiCall: jest.fn().mockResolvedValue({ success: true, data: {} })
    }
  }))
  
  jest.mock('../../modules/hipaa-compliance/services/HIPAAAuditService')
  
  // Setup database
  await testDb.setup()
  
  return {
    tokens: await generateTestTokens(),
    authMock: createMockAuthMiddleware(),
    auditMock: createMockAuditService()
  }
}

/**
 * Cleanup test environment
 */
export async function cleanupTestEnvironment() {
  await testDb.cleanup()
  jest.restoreAllMocks()
}

/**
 * Create test request headers with authentication
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'snug-kisses-test-client/1.0'
  }
}

/**
 * Create mock client info for audit logging
 */
export function createMockClientInfo(): Record<string, any> {
  return {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Test) AppleWebKit/537.36 Chrome/91.0.4472.124',
    timestamp: new Date().toISOString(),
    sessionId: 'test-session-123'
  }
}

/**
 * Validate HIPAA audit log entry
 */
export function validateAuditLogEntry(logEntry: any): boolean {
  const requiredFields = ['event_type', 'timestamp', 'details', 'retention_date']
  
  for (const field of requiredFields) {
    if (!logEntry[field]) {
      console.error(`Missing required audit field: ${field}`)
      return false
    }
  }
  
  // Validate retention date is approximately 7 years from now
  const retentionDate = new Date(logEntry.retention_date)
  const sevenYearsFromNow = new Date()
  sevenYearsFromNow.setFullYear(sevenYearsFromNow.getFullYear() + 7)
  
  const timeDifference = Math.abs(retentionDate.getTime() - sevenYearsFromNow.getTime())
  const oneDayInMs = 24 * 60 * 60 * 1000
  
  if (timeDifference > oneDayInMs) {
    console.error('Retention date is not approximately 7 years from now')
    return false
  }
  
  return true
}

/**
 * Mock rate limiter for testing
 */
export function createMockRateLimiter() {
  const attempts: Record<string, number> = {}
  
  return {
    checkLimit: jest.fn().mockImplementation((identifier: string, limit: number = 5) => {
      const currentAttempts = attempts[identifier] || 0
      return currentAttempts < limit
    }),
    
    recordAttempt: jest.fn().mockImplementation((identifier: string) => {
      attempts[identifier] = (attempts[identifier] || 0) + 1
    }),
    
    resetAttempts: jest.fn().mockImplementation((identifier: string) => {
      delete attempts[identifier]
    }),
    
    getAttempts: jest.fn().mockImplementation((identifier: string) => {
      return attempts[identifier] || 0
    })
  }
}