import { api } from '@/services/api/client'

// Mock the fetch function for testing
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  describe('Authentication API', () => {
    it('should call beginAuth with correct parameters', async () => {
      const mockResponse = { success: true, token: 'mock-token' }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.beginAuth({ email: 'test@example.com', password: 'password' })

      expect(fetch).toHaveBeenCalledWith('/api/auth/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid credentials')
      })

      await expect(api.beginAuth({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('HTTP 401 Unauthorized: Invalid credentials')
    })
  })

  describe('Care Plans API', () => {
    it('should fetch care plans', async () => {
      const mockCarePlans = [
        { id: '1', name: 'Basic Care', status: 'active' },
        { id: '2', name: 'Premium Care', status: 'pending' }
      ]
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ carePlans: mockCarePlans })
      })

      const result = await api.listCarePlans()

      expect(fetch).toHaveBeenCalledWith('/api/care-plans', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result.carePlans).toEqual(mockCarePlans)
    })
  })

  describe('Service Requests API', () => {
    it('should create service request', async () => {
      const mockRequest = {
        type: 'postpartum-care',
        urgency: 'normal',
        description: 'Need help with newborn'
      }
      const mockResponse = { id: '123', status: 'submitted' }
      
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await api.createServiceRequest(mockRequest)

      expect(fetch).toHaveBeenCalledWith('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockRequest)
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Health Check API', () => {
    it('should check application health', async () => {
      const mockHealth = { status: 'healthy', timestamp: '2025-01-01T00:00:00Z' }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHealth)
      })

      const result = await api.health()

      expect(fetch).toHaveBeenCalledWith('/api/health', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockHealth)
    })
  })
})