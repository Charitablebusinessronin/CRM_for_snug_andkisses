// API client for backend communication
class ApiClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
    this.headers = {
      "Content-Type": "application/json",
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`

    const config: RequestInit = {
      headers: this.headers,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  // Contractor API methods
  async getContractors() {
    return this.request("/contractors")
  }

  async getContractor(id: string) {
    return this.request(`/contractors/${id}`)
  }

  async updateContractor(id: string, data: any) {
    return this.request(`/contractors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Client API methods
  async getClients() {
    return this.request("/clients")
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`)
  }

  async createClient(data: any) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Shift Notes API methods
  async getShiftNotes(contractorId?: string) {
    const query = contractorId ? `?contractor_id=${contractorId}` : ""
    return this.request(`/shift-notes${query}`)
  }

  async createShiftNote(data: any) {
    return this.request("/shift-notes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateShiftNote(id: string, data: any) {
    return this.request(`/shift-notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Job Board API methods
  async getJobs() {
    return this.request("/jobs")
  }

  async applyToJob(jobId: string, contractorId: string) {
    return this.request(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify({ contractor_id: contractorId }),
    })
  }

  // Scheduling API methods
  async getSchedule(userId: string, userType: "contractor" | "client") {
    return this.request(`/schedule?user_id=${userId}&user_type=${userType}`)
  }

  async createAppointment(data: any) {
    return this.request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
