import { zohoClient } from "./zoho-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Customer {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  emergencyContact?: string
  children?: string
  preferences?: string
  status: "active" | "inactive" | "pending"
  crmId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Appointment {
  id?: string
  customerId: string
  contractorId: string
  serviceType: "babysitting" | "doula" | "overnight" | "consultation"
  startDateTime: string
  endDateTime: string
  location: string
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"
  notes?: string
  rate: number
  totalAmount: number
  createdAt?: string
  updatedAt?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/api${endpoint}`

    const token = localStorage.getItem("auth_token")

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Authentication
  async login(email: string, password: string, role: string) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    })
  }

  async logout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    zohoClient.clearTokens()
    return { success: true }
  }

  // Customers
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.request<Customer[]>("/customers")
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(`/customers/${id}`)
  }

  async createCustomer(customer: Omit<Customer, "id">): Promise<ApiResponse<Customer>> {
    const response = await this.request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    })

    // Sync to Zoho CRM if authenticated
    if (response.success && response.data && zohoClient.isAuthenticated()) {
      try {
        const crmId = await zohoClient.createContact({
          First_Name: customer.firstName,
          Last_Name: customer.lastName,
          Email: customer.email,
          Phone: customer.phone,
          Mailing_Street: customer.address,
          Description: customer.preferences,
        })

        // Update customer with CRM ID
        await this.updateCustomer(response.data.id!, { crmId })
      } catch (error) {
        console.warn("Failed to sync customer to Zoho CRM:", error)
      }
    }

    return response
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response = await this.request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })

    // Sync updates to Zoho CRM if authenticated and has CRM ID
    if (response.success && response.data?.crmId && zohoClient.isAuthenticated()) {
      try {
        await zohoClient.updateContact(response.data.crmId, {
          First_Name: updates.firstName,
          Last_Name: updates.lastName,
          Email: updates.email,
          Phone: updates.phone,
          Mailing_Street: updates.address,
          Description: updates.preferences,
        })
      } catch (error) {
        console.warn("Failed to sync customer updates to Zoho CRM:", error)
      }
    }

    return response
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/customers/${id}`, {
      method: "DELETE",
    })
  }

  // Appointments
  async getAppointments(): Promise<ApiResponse<Appointment[]>> {
    return this.request<Appointment[]>("/appointments")
  }

  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${id}`)
  }

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<ApiResponse<Appointment>> {
    const response = await this.request<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    })

    // Create deal in Zoho CRM if authenticated
    if (response.success && response.data && zohoClient.isAuthenticated()) {
      try {
        const customer = await this.getCustomer(appointment.customerId)
        if (customer.success && customer.data) {
          await zohoClient.createDeal({
            Deal_Name: `${appointment.serviceType} - ${customer.data.firstName} ${customer.data.lastName}`,
            Stage: "Qualification",
            Amount: appointment.totalAmount,
            Contact_Name: customer.data.crmId || `${customer.data.firstName} ${customer.data.lastName}`,
            Closing_Date: appointment.startDateTime.split("T")[0],
            Description: appointment.notes,
          })
        }
      } catch (error) {
        console.warn("Failed to create deal in Zoho CRM:", error)
      }
    }

    return response
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/appointments/${id}`, {
      method: "DELETE",
    })
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request<any>("/analytics")
  }
}

export const api = new ApiClient()
