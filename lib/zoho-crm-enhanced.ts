/**
 * This file contains an enhanced service for interacting with the Zoho CRM API.
 * It provides methods for creating, updating, and retrieving contacts and cases,
 * as well as handling authentication and error logging.
 */
import { logAuditEvent } from "./hipaa-audit-edge"

interface ZohoConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  apiUrl: string
}

interface ContactData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  serviceType?: string
  message?: string
  source?: string
}

interface ZohoContact {
  First_Name: string
  Last_Name: string
  Email: string
  Phone?: string
  Account_Name?: string
  Lead_Source: string
  Description?: string
  Service_Type?: string
  Contact_Source?: string
}

interface ZohoCase {
  Subject: string
  Description: string
  Status: string
  Priority: string
  Contact_Name?: string
  Account_Name?: string
  Case_Origin: string
  Service_Type?: string
}

class ZohoCRMService {
  private config: ZohoConfig
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor() {
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID!,
      clientSecret: process.env.ZOHO_CLIENT_SECRET!,
      refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
      apiUrl: process.env.ZOHO_CRM_API_URL || "https://www.zohoapis.com/crm/v2",
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: "refresh_token",
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Zoho Token Refresh Error:', errorBody);
        throw new Error(`Token refresh failed: ${response.statusText} - ${JSON.stringify(errorBody)}`);
      }

      const data = await response.json()
      if (!data.access_token) {
        throw new Error('No access token in response')
      }
      
      this.accessToken = data.access_token as string
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer

      await logAuditEvent({
        action: "ZOHO_TOKEN_REFRESH",
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
      })

      return this.accessToken
    } catch (error) {
      await logAuditEvent({
        action: "ZOHO_TOKEN_REFRESH",
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
      })
      throw error
    }
  }

  // Rate limiting configuration
  private lastRequestTime = 0
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private static readonly MIN_REQUEST_INTERVAL = 1000 // 1 second between requests
  private static readonly MAX_RETRIES = 3
  private static readonly INITIAL_RETRY_DELAY = 1000 // 1 second initial delay

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    try {
      while (this.requestQueue.length > 0) {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime
        
        // Ensure we respect the rate limit
        if (timeSinceLastRequest < ZohoCRMService.MIN_REQUEST_INTERVAL) {
          await new Promise(resolve => 
            setTimeout(resolve, ZohoCRMService.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
          )
        }

        const request = this.requestQueue.shift()
        if (request) {
          this.lastRequestTime = Date.now()
          await request()
        }
      }
    } finally {
      this.isProcessingQueue = false
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = ZohoCRMService.MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        // If we get rate limited or a server error, wait before retrying
        const isRateLimitError = error instanceof Error && 
          (error.message.includes('429') || 
           error.message.includes('too many requests') ||
           error.message.includes('rate limit'))
           
        const isServerError = error instanceof Error && 
          error.message.match(/5\d{2}/) !== null
          
        if ((isRateLimitError || isServerError) && attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = ZohoCRMService.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
          console.warn(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // If it's not a rate limit error or we've exhausted retries, rethrow
        if (!isRateLimitError || attempt === retries) {
          throw error
        }
      }
    }
    
    throw lastError || new Error('Unknown error in withRetry')
  }

  private async makeZohoRequest(endpoint: string, method = "GET", data?: any, attempt = 1): Promise<any> {
    const executeRequest = async (): Promise<any> => {
      const token = await this.getAccessToken()
      const url = `${this.config.apiUrl}${endpoint}`

      const requestOptions: RequestInit = {
        method,
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
      }

      if (data && (method === "POST" || method === "PUT")) {
        requestOptions.body = JSON.stringify(data)
      }

      const response = await fetch(url, requestOptions)
      let responseData
      
      try {
        responseData = await response.json()
      } catch (e) {
        // If we can't parse JSON, it's probably an HTML error page
        const text = await response.text()
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || response.statusText
        const error = new Error(`Zoho API error (${response.status}): ${errorMessage}`)
        ;(error as any).status = response.status
        ;(error as any).responseData = responseData
        throw error
      }

      await logAuditEvent({
        action: "ZOHO_API_REQUEST",
        resource: endpoint,
        method,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { endpoint, method, success: true },
      })

      return responseData
    }

    try {
      // Queue the request and process the queue
      return await new Promise((resolve, reject) => {
        const wrappedRequest = async () => {
          try {
            const result = await this.withRetry(executeRequest)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
        
        this.requestQueue.push(wrappedRequest)
        this.processQueue()
      })
    } catch (error) {
      const errorData: Record<string, any> = { 
        endpoint, 
        method, 
        success: false,
        attempt,
      }
      
      if (error && typeof error === 'object') {
        if ('status' in error) errorData.status = (error as any).status
        if ('responseData' in error) errorData.response_data = (error as any).responseData
      }
      
      await logAuditEvent({
        action: "ZOHO_API_REQUEST",
        resource: endpoint,
        method,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: errorData,
      })
      
      throw error
    }
  }

  async createContact(contactData: ContactData, userId?: string): Promise<any> {
    const zohoContact: ZohoContact = {
      First_Name: contactData.firstName,
      Last_Name: contactData.lastName,
      Email: contactData.email,
      Phone: contactData.phone,
      Account_Name: contactData.company || "Individual Client",
      Lead_Source: contactData.source || "Website Contact Form",
      Description: contactData.message,
      Service_Type: contactData.serviceType,
      Contact_Source: "Snugs & Kisses Website",
    }

    try {
      const response = await this.makeZohoRequest("/Contacts", "POST", {
        data: [zohoContact],
      })

      await logAuditEvent({
        action: "CREATE_CONTACT",
        resource: "Zoho CRM Contact",
        user_id: userId,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          contact_email: contactData.email,
          contact_name: `${contactData.firstName} ${contactData.lastName}`,
          zoho_id: response.data?.[0]?.details?.id,
        },
      })

      return response
    } catch (error) {
      await logAuditEvent({
        action: "CREATE_CONTACT",
        resource: "Zoho CRM Contact",
        user_id: userId,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          contact_email: contactData.email,
          contact_name: `${contactData.firstName} ${contactData.lastName}`,
        },
      })
      throw error
    }
  }

  async createCase(caseData: {
    subject: string
    description: string
    priority: "High" | "Medium" | "Low"
    serviceType?: string
    contactEmail?: string
    userId?: string
  }): Promise<any> {
    const zohoCase: ZohoCase = {
      Subject: caseData.subject,
      Description: caseData.description,
      Status: "Open",
      Priority: caseData.priority,
      Case_Origin: "Employee Portal",
      Service_Type: caseData.serviceType,
    }

    // If contact email provided, try to link to existing contact
    if (caseData.contactEmail) {
      try {
        const contacts = await this.searchContacts(caseData.contactEmail)
        if (contacts.data && contacts.data.length > 0) {
          zohoCase.Contact_Name = contacts.data[0].id
          zohoCase.Account_Name = contacts.data[0].Account_Name
        }
      } catch (error) {
        console.warn("Could not link case to contact:", error)
      }
    }

    try {
      const response = await this.makeZohoRequest("/Cases", "POST", {
        data: [zohoCase],
      })

      await logAuditEvent({
        action: "CREATE_CASE",
        resource: "Zoho CRM Case",
        user_id: caseData.userId,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          case_subject: caseData.subject,
          case_priority: caseData.priority,
          zoho_id: response.data?.[0]?.details?.id,
        },
      })

      return response
    } catch (error) {
      await logAuditEvent({
        action: "CREATE_CASE",
        resource: "Zoho CRM Case",
        user_id: caseData.userId,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          case_subject: caseData.subject,
          case_priority: caseData.priority,
        },
      })
      throw error
    }
  }

  async searchContacts(email: string): Promise<any> {
    return this.makeZohoRequest(`/Contacts/search?email=${encodeURIComponent(email)}`)
  }

  async getContacts(page = 1, perPage = 200): Promise<any> {
    return this.makeZohoRequest(`/Contacts?page=${page}&per_page=${perPage}`)
  }

  async getCases(page = 1, perPage = 200): Promise<any> {
    return this.makeZohoRequest(`/Cases?page=${page}&per_page=${perPage}`)
  }

  async updateContact(contactId: string, updateData: Partial<ZohoContact>, userId?: string): Promise<any> {
    try {
      const response = await this.makeZohoRequest(`/Contacts/${contactId}`, "PUT", {
        data: [updateData],
      })

      await logAuditEvent({
        action: "UPDATE_CONTACT",
        resource: `Zoho CRM Contact ${contactId}`,
        user_id: userId,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { contact_id: contactId, updates: Object.keys(updateData) },
      })

      return response
    } catch (error) {
      await logAuditEvent({
        action: "UPDATE_CONTACT",
        resource: `Zoho CRM Contact ${contactId}`,
        user_id: userId,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { contact_id: contactId },
      })
      throw error
    }
  }
}

// Singleton instance
const zohoCRM = new ZohoCRMService()

export { zohoCRM, type ContactData }
export default zohoCRM
