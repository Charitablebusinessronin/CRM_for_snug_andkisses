/**
 * API Client for Snug & Kisses CRM
 * Centralized API calls with authentication and error handling
 */

import { logAuditEvent } from './hipaa-audit'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee' | 'contractor'
  avatar?: string
  phone?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  assignedEmployee?: string
  dueDate?: string
  serviceType?: string
}

export interface Shift {
  id: string
  clientId: string
  clientName: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  employeeId: string
}

export interface Job {
  id: string
  type: string
  client: string
  date: string
  time: string
  location: string
  rate: string
  status: 'pending' | 'confirmed' | 'completed'
  contractorId?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5369'
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Add auth token if available
      const token = this.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers
      })

      const data = await response.json()

      // Log HIPAA audit events for sensitive operations
      if (endpoint.includes('/clients') || endpoint.includes('/shifts')) {
        await logAuditEvent({
          action: 'API_ACCESS',
          resource: endpoint,
          method: options.method || 'GET',
          details: { status: response.status }
        })
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      console.error('API request failed:', error)
      
      await logAuditEvent({
        action: 'API_ERROR',
        resource: endpoint,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Authentication
  async login(email: string, password: string, role: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    }
    return { success: true }
  }

  // User management
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me')
  }

  // Client management
  async getClients(): Promise<ApiResponse<Client[]>> {
    return this.request('/clients')
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request(`/clients/${id}`)
  }

  // Shift management
  async getShifts(): Promise<ApiResponse<Shift[]>> {
    return this.request('/shifts')
  }

  async getShift(id: string): Promise<ApiResponse<Shift>> {
    return this.request(`/shifts/${id}`)
  }

  async createShift(shift: Partial<Shift>): Promise<ApiResponse<Shift>> {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(shift)
    })
  }

  async updateShift(id: string, shift: Partial<Shift>): Promise<ApiResponse<Shift>> {
    return this.request(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shift)
    })
  }

  // Job management
  async getJobs(): Promise<ApiResponse<Job[]>> {
    return this.request('/jobs')
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${id}`)
  }

  async applyJob(jobId: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST'
    })
  }

  // Profile management
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Dashboard data
  async getDashboardData(role: string): Promise<ApiResponse<any>> {
    return this.request(`/dashboard/${role}`)
  }
}

export const apiClient = new ApiClient()

// React hook for API calls
export function useApi() {
  return apiClient
}