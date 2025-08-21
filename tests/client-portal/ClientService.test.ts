/**
 * Client Portal Service Unit Tests
 * Comprehensive testing for client data service with HIPAA compliance
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { ClientDataService } from '../../modules/client-portal/services/ClientDataService'
import { HIPAAAuditService } from '../../modules/hipaa-compliance/services/HIPAAAuditService'
import type { 
  ClientProfile, 
  ServiceRequest, 
  AppointmentData,
  ServiceHistory
} from '../../modules/client-portal/types/ClientTypes'

// Mock dependencies
jest.mock('../../modules/hipaa-compliance/services/HIPAAAuditService')

describe('ClientDataService', () => {
  let clientService: ClientDataService
  let mockAuditService: jest.Mocked<HIPAAAuditService>

  const mockClientId = 'client-123'
  const mockClientProfile: ClientProfile = {
    id: mockClientId,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-05-15',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    },
    emergencyContact: {
      name: 'John Doe',
      relationship: 'spouse',
      phone: '+1234567891'
    },
    insuranceInfo: {
      provider: 'Health Insurance Co',
      policyNumber: 'POL123456',
      groupNumber: 'GRP789'
    },
    medicalInfo: {
      allergies: ['penicillin'],
      medications: ['prenatal vitamins'],
      conditions: ['pregnancy']
    },
    preferences: {
      preferredCaregiverGender: 'female',
      servicePreferences: ['lactation support', 'meal preparation']
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const mockServiceRequest: ServiceRequest = {
    id: 'service-123',
    clientId: mockClientId,
    serviceType: 'lactation support',
    description: 'Need help with breastfeeding',
    urgency: 'normal',
    preferredDate: '2024-02-01',
    preferredTime: '10:00',
    status: 'pending',
    createdAt: '2024-01-15T00:00:00.000Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuditService = new HIPAAAuditService() as jest.Mocked<HIPAAAuditService>
    clientService = new ClientDataService()

    // Mock external API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getClientProfile', () => {
    test('should successfully retrieve client profile', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockClientProfile)

      const result = await clientService.getClientProfile(mockClientId)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(mockClientId)
      expect(result.data?.email).toBe(mockClientProfile.email)
    })

    test('should return error for non-existent client', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(null)

      const result = await clientService.getClientProfile('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Client not found')
    })

    test('should log PHI access event', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockClientProfile)

      await clientService.getClientProfile(mockClientId)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PHI_ACCESS',
          details: expect.objectContaining({
            clientId: mockClientId,
            dataType: 'client_profile'
          })
        })
      )
    })

    test('should handle API errors gracefully', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockRejectedValue(
        new Error('Network error')
      )

      const result = await clientService.getClientProfile(mockClientId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to retrieve client profile')
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PHI_ACCESS_ERROR'
        })
      )
    })

    test('should filter sensitive data based on access level', async () => {
      const sensitiveProfile = {
        ...mockClientProfile,
        ssn: '123-45-6789',
        medicalRecordNumber: 'MRN123456'
      }
      
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(sensitiveProfile)
      jest.spyOn(clientService as any, 'filterSensitiveData').mockReturnValue(mockClientProfile)

      const result = await clientService.getClientProfile(mockClientId, 'basic')

      expect(result.data).not.toHaveProperty('ssn')
      expect(result.data).not.toHaveProperty('medicalRecordNumber')
    })
  })

  describe('updateClientProfile', () => {
    const updateData = {
      phone: '+1987654321',
      address: {
        ...mockClientProfile.address,
        street: '456 Oak Ave'
      }
    }

    test('should successfully update client profile', async () => {
      const updatedProfile = { ...mockClientProfile, ...updateData }
      jest.spyOn(clientService as any, 'validateUpdateData').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'updateInAPI').mockResolvedValue(updatedProfile)

      const result = await clientService.updateClientProfile(mockClientId, updateData)

      expect(result.success).toBe(true)
      expect(result.data?.phone).toBe(updateData.phone)
    })

    test('should validate update data before processing', async () => {
      const invalidData = { email: 'invalid-email' }
      jest.spyOn(clientService as any, 'validateUpdateData').mockReturnValue({
        valid: false,
        errors: ['Invalid email format']
      })

      const result = await clientService.updateClientProfile(mockClientId, invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email format')
    })

    test('should log PHI modification event', async () => {
      jest.spyOn(clientService as any, 'validateUpdateData').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'updateInAPI').mockResolvedValue(mockClientProfile)

      await clientService.updateClientProfile(mockClientId, updateData)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PHI_MODIFY',
          details: expect.objectContaining({
            clientId: mockClientId,
            changes: updateData
          })
        })
      )
    })

    test('should handle concurrent update conflicts', async () => {
      jest.spyOn(clientService as any, 'validateUpdateData').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'updateInAPI').mockRejectedValue(
        new Error('Conflict: Record was modified by another user')
      )

      const result = await clientService.updateClientProfile(mockClientId, updateData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Record was modified by another user')
    })
  })

  describe('getServiceHistory', () => {
    const mockServiceHistory: ServiceHistory[] = [
      {
        id: 'service-1',
        serviceType: 'lactation support',
        providedBy: 'Caregiver Jane',
        date: '2024-01-10',
        duration: 60,
        notes: 'Successful session',
        status: 'completed'
      },
      {
        id: 'service-2',
        serviceType: 'meal preparation',
        providedBy: 'Caregiver John',
        date: '2024-01-12',
        duration: 90,
        notes: 'Prepared meals for week',
        status: 'completed'
      }
    ]

    test('should retrieve complete service history', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockServiceHistory)

      const result = await clientService.getServiceHistory(mockClientId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].serviceType).toBe('lactation support')
    })

    test('should support pagination', async () => {
      const paginatedHistory = mockServiceHistory.slice(0, 1)
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(paginatedHistory)

      const result = await clientService.getServiceHistory(mockClientId, { limit: 1, offset: 0 })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.pagination).toEqual({
        limit: 1,
        offset: 0,
        total: expect.any(Number)
      })
    })

    test('should filter by date range', async () => {
      const filteredHistory = [mockServiceHistory[0]]
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(filteredHistory)

      const result = await clientService.getServiceHistory(mockClientId, {
        startDate: '2024-01-01',
        endDate: '2024-01-11'
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    test('should log service history access', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockServiceHistory)

      await clientService.getServiceHistory(mockClientId)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SERVICE_HISTORY_ACCESSED',
          details: expect.objectContaining({
            clientId: mockClientId,
            recordsAccessed: 2
          })
        })
      )
    })
  })

  describe('createServiceRequest', () => {
    const newServiceRequest = {
      serviceType: 'postpartum care',
      description: 'Need help with newborn care',
      urgency: 'high' as const,
      preferredDate: '2024-02-01',
      preferredTime: '14:00'
    }

    test('should successfully create service request', async () => {
      const createdRequest = { ...mockServiceRequest, ...newServiceRequest, id: 'service-456' }
      jest.spyOn(clientService as any, 'validateServiceRequest').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'createInAPI').mockResolvedValue(createdRequest)

      const result = await clientService.createServiceRequest(mockClientId, newServiceRequest)

      expect(result.success).toBe(true)
      expect(result.data?.serviceType).toBe(newServiceRequest.serviceType)
      expect(result.data?.urgency).toBe('high')
    })

    test('should validate service request data', async () => {
      const invalidRequest = { ...newServiceRequest, preferredDate: 'invalid-date' }
      jest.spyOn(clientService as any, 'validateServiceRequest').mockReturnValue({
        valid: false,
        errors: ['Invalid date format']
      })

      const result = await clientService.createServiceRequest(mockClientId, invalidRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid date format')
    })

    test('should check service availability', async () => {
      jest.spyOn(clientService as any, 'validateServiceRequest').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'checkServiceAvailability').mockResolvedValue(false)

      const result = await clientService.createServiceRequest(mockClientId, newServiceRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Service not available at requested time')
    })

    test('should log service request creation', async () => {
      jest.spyOn(clientService as any, 'validateServiceRequest').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'checkServiceAvailability').mockResolvedValue(true)
      jest.spyOn(clientService as any, 'createInAPI').mockResolvedValue(mockServiceRequest)

      await clientService.createServiceRequest(mockClientId, newServiceRequest)

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SERVICE_REQUEST_CREATED',
          details: expect.objectContaining({
            clientId: mockClientId,
            serviceType: newServiceRequest.serviceType
          })
        })
      )
    })
  })

  describe('getUpcomingAppointments', () => {
    const mockAppointments: AppointmentData[] = [
      {
        id: 'apt-1',
        clientId: mockClientId,
        caregiverId: 'caregiver-1',
        serviceType: 'lactation support',
        scheduledDate: '2024-02-01T10:00:00.000Z',
        duration: 60,
        status: 'scheduled',
        notes: 'Initial consultation'
      }
    ]

    test('should retrieve upcoming appointments', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockAppointments)

      const result = await clientService.getUpcomingAppointments(mockClientId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].status).toBe('scheduled')
    })

    test('should filter by date range', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockAppointments)

      const result = await clientService.getUpcomingAppointments(mockClientId, {
        startDate: '2024-02-01',
        endDate: '2024-02-07'
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    test('should sort by scheduled date', async () => {
      const unsortedAppointments = [
        { ...mockAppointments[0], scheduledDate: '2024-02-03T10:00:00.000Z' },
        { ...mockAppointments[0], scheduledDate: '2024-02-01T10:00:00.000Z' }
      ]
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(unsortedAppointments)

      const result = await clientService.getUpcomingAppointments(mockClientId)

      expect(result.success).toBe(true)
      expect(result.data?.[0].scheduledDate).toBe('2024-02-01T10:00:00.000Z')
      expect(result.data?.[1].scheduledDate).toBe('2024-02-03T10:00:00.000Z')
    })
  })

  describe('HIPAA Compliance', () => {
    test('should encrypt sensitive data at rest', async () => {
      const encryptSpy = jest.spyOn(clientService as any, 'encryptSensitiveData')
      jest.spyOn(clientService as any, 'updateInAPI').mockResolvedValue(mockClientProfile)

      await clientService.updateClientProfile(mockClientId, { phone: '+1987654321' })

      expect(encryptSpy).toHaveBeenCalled()
    })

    test('should maintain audit trail for all operations', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockClientProfile)

      await clientService.getClientProfile(mockClientId)

      expect(mockAuditService.logEvent).toHaveBeenCalled()
    })

    test('should implement data retention policies', async () => {
      const retentionSpy = jest.spyOn(clientService as any, 'applyRetentionPolicy')
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue([])

      await clientService.getServiceHistory(mockClientId)

      expect(retentionSpy).toHaveBeenCalled()
    })

    test('should handle audit logging failures gracefully', async () => {
      mockAuditService.logEvent.mockRejectedValue(new Error('Audit logging failed'))
      jest.spyOn(clientService as any, 'fetchFromAPI').mockResolvedValue(mockClientProfile)

      const result = await clientService.getClientProfile(mockClientId)

      // Service should still work even if audit logging fails
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('should handle network timeouts', async () => {
      jest.spyOn(clientService as any, 'fetchFromAPI').mockRejectedValue(
        new Error('Request timeout')
      )

      const result = await clientService.getClientProfile(mockClientId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Service temporarily unavailable')
    })

    test('should implement retry logic for transient failures', async () => {
      const fetchSpy = jest.spyOn(clientService as any, 'fetchFromAPI')
      fetchSpy.mockRejectedValueOnce(new Error('Temporary error'))
      fetchSpy.mockResolvedValueOnce(mockClientProfile)

      const result = await clientService.getClientProfile(mockClientId)

      expect(result.success).toBe(true)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    test('should validate input parameters', async () => {
      const result = await clientService.getClientProfile('')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Client ID is required')
    })

    test('should sanitize user inputs', async () => {
      const maliciousData = {
        firstName: '<script>alert("xss")</script>',
        email: 'test@example.com'
      }
      
      const sanitizeSpy = jest.spyOn(clientService as any, 'sanitizeInput')
      jest.spyOn(clientService as any, 'validateUpdateData').mockReturnValue({ valid: true })
      jest.spyOn(clientService as any, 'updateInAPI').mockResolvedValue(mockClientProfile)

      await clientService.updateClientProfile(mockClientId, maliciousData)

      expect(sanitizeSpy).toHaveBeenCalled()
    })
  })
})