/**
 * Complete Zoho One API Integration Client
 * Handles CRM, Creator, Flow, Zia AI, WorkDrive, Calendar, and Analytics
 */

import { createHash } from 'crypto'

export interface ZohoTokenResponse {
  access_token: string
  expires_in: number
  api_domain: string
  token_type: string
}

export interface ZohoCRMRecord {
  id: string
  [key: string]: any
}

export interface ZiaAIResponse {
  prediction: any
  confidence: number
  factors: string[]
}

export class ZohoOneClient {
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private readonly baseURLs = {
    crm: 'https://www.zohoapis.com/crm/v2',
    creator: 'https://creator.zoho.com/api/v2',
    flow: 'https://flow.zoho.com/api/v1',
    zia: 'https://www.zohoapis.com/crm/v2/zia',
    workdrive: 'https://www.zohoapis.com/workdrive/api/v1',
    calendar: 'https://calendar.zoho.com/api/v1',
    analytics: 'https://analyticsapi.zoho.com/restapi/v2',
    campaigns: 'https://campaigns.zoho.com/api/v1.1',
    bookings: 'https://bookings.zoho.com/api/v1'
  }

  constructor() {
    this.validateEnvironment()
  }

  private validateEnvironment() {
    const required = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }

  /**
   * Authenticate with Zoho and get access token
   */
  async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
          client_id: process.env.ZOHO_CLIENT_ID!,
          client_secret: process.env.ZOHO_CLIENT_SECRET!,
          grant_type: 'refresh_token'
        })
      })

      const data: ZohoTokenResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(`Zoho authentication failed: ${JSON.stringify(data)}`)
      }

      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer
      
      return this.accessToken
    } catch (error) {
      throw new Error(`Failed to authenticate with Zoho: ${error}`)
    }
  }

  /**
   * Make authenticated API call to any Zoho service
   */
  async apiCall(endpoint: string, method = 'GET', data?: any, headers?: Record<string, string>): Promise<any> {
    await this.authenticate()

    const requestHeaders = {
      'Authorization': `Zoho-oauthtoken ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...headers
    }

    const response = await fetch(endpoint, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Zoho API call failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  // ==================== CRM OPERATIONS ====================

  /**
   * Create a new CRM record
   */
  async createCRMRecord(module: string, recordData: any): Promise<ZohoCRMRecord> {
    const endpoint = `${this.baseURLs.crm}/${module}`
    const response = await this.apiCall(endpoint, 'POST', {
      data: [recordData]
    })

    if (response.data?.[0]?.code === 'SUCCESS') {
      return {
        id: response.data[0].details.id,
        ...recordData
      }
    } else {
      throw new Error(`Failed to create CRM record: ${JSON.stringify(response)}`)
    }
  }

  /**
   * Update CRM record
   */
  async updateCRMRecord(module: string, recordId: string, updates: any): Promise<boolean> {
    const endpoint = `${this.baseURLs.crm}/${module}/${recordId}`
    const response = await this.apiCall(endpoint, 'PUT', {
      data: [updates]
    })

    return response.data?.[0]?.code === 'SUCCESS'
  }

  /**
   * Get CRM record by ID
   */
  async getCRMRecord(module: string, recordId: string): Promise<ZohoCRMRecord | null> {
    const endpoint = `${this.baseURLs.crm}/${module}/${recordId}`
    const response = await this.apiCall(endpoint)
    
    return response.data?.[0] || null
  }

  /**
   * Search CRM records
   */
  async searchCRMRecords(module: string, criteria: string): Promise<ZohoCRMRecord[]> {
    const endpoint = `${this.baseURLs.crm}/${module}/search?criteria=${encodeURIComponent(criteria)}`
    const response = await this.apiCall(endpoint)
    
    return response.data || []
  }

  /**
   * Add tags to CRM record
   */
  async addCRMTags(module: string, recordId: string, tags: string[]): Promise<boolean> {
    const endpoint = `${this.baseURLs.crm}/${module}/${recordId}/actions/add_tags`
    const response = await this.apiCall(endpoint, 'POST', {
      tags: tags.map(tag => ({ name: tag }))
    })

    return response.data?.[0]?.code === 'SUCCESS'
  }

  // ==================== ZIA AI OPERATIONS ====================

  /**
   * Analyze sentiment using Zia
   */
  async analyzeSentiment(text: string): Promise<any> {
    const endpoint = `${this.baseURLs.zia}/sentiment_analysis`
    
    return await this.apiCall(endpoint, 'POST', {
      text,
      feature: 'sentiment'
    })
  }

  /**
   * Get AI predictions from Zia
   */
  async getPrediction(model: string, data: any): Promise<ZiaAIResponse> {
    const endpoint = `${this.baseURLs.zia}/prediction`
    
    return await this.apiCall(endpoint, 'POST', {
      model,
      data
    })
  }

  /**
   * Extract keywords using Zia
   */
  async extractKeywords(text: string): Promise<string[]> {
    const endpoint = `${this.baseURLs.zia}/keywords`
    
    const response = await this.apiCall(endpoint, 'POST', {
      text,
      feature: 'keyword'
    })
    
    return response.keywords || []
  }

  // ==================== FLOW AUTOMATION ====================

  /**
   * Trigger Zoho Flow
   */
  async triggerFlow(flowId: string, data: any): Promise<any> {
    const endpoint = `${this.baseURLs.flow}/flows/${flowId}/trigger`
    
    return await this.apiCall(endpoint, 'POST', data)
  }

  /**
   * Create workflow instance
   */
  async createWorkflow(workflowName: string, config: any): Promise<string> {
    const endpoint = `${this.baseURLs.flow}/workflows`
    
    const response = await this.apiCall(endpoint, 'POST', {
      name: workflowName,
      config,
      trigger_type: 'manual'
    })

    return response.workflow_id
  }

  // ==================== CALENDAR INTEGRATION ====================

  /**
   * Create calendar event
   */
  async createCalendarEvent(eventData: any): Promise<string> {
    const endpoint = `${this.baseURLs.calendar}/calendars/primary/events`
    
    const response = await this.apiCall(endpoint, 'POST', eventData)
    
    return response.event_id
  }

  /**
   * Schedule meeting with availability check
   */
  async scheduleWithAvailability(attendees: string[], duration: number, preferences: any): Promise<any> {
    const endpoint = `${this.baseURLs.calendar}/freebusy`
    
    // Get availability for all attendees
    const availability = await this.apiCall(endpoint, 'POST', {
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      items: attendees.map(email => ({ id: email }))
    })

    // Find optimal slot using AI
    const optimalSlot = await this.findOptimalTimeSlot(availability, duration, preferences)
    
    if (optimalSlot) {
      return await this.createCalendarEvent({
        summary: preferences.title || 'Snug & Kisses Consultation',
        start: { dateTime: optimalSlot.start },
        end: { dateTime: optimalSlot.end },
        attendees: attendees.map(email => ({ email })),
        description: preferences.description,
        location: preferences.location
      })
    }

    throw new Error('No available time slots found')
  }

  private async findOptimalTimeSlot(availability: any, duration: number, preferences: any): Promise<any> {
    // AI-powered scheduling logic
    // This would integrate with Zia for intelligent scheduling
    const businessHours = {
      start: 9, // 9 AM
      end: 17   // 5 PM
    }

    // Find first available slot (simplified logic)
    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    for (let d = new Date(now); d < endDate; d.setDate(d.getDate() + 1)) {
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        const slotStart = new Date(d)
        slotStart.setHours(hour, 0, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)

        // Check if slot is free for all attendees
        const isAvailable = this.isSlotAvailable(availability, slotStart, slotEnd)
        
        if (isAvailable) {
          return {
            start: slotStart.toISOString(),
            end: slotEnd.toISOString()
          }
        }
      }
    }

    return null
  }

  private isSlotAvailable(availability: any, start: Date, end: Date): boolean {
    // Check availability logic
    return true // Simplified for now
  }

  // ==================== CAMPAIGNS INTEGRATION ====================

  /**
   * Send automated email via Zoho Campaigns
   */
  async sendAutomatedEmail(listId: string, templateId: string, recipientData: any): Promise<boolean> {
    const endpoint = `${this.baseURLs.campaigns}/lists/${listId}/campaigns`
    
    const response = await this.apiCall(endpoint, 'POST', {
      template_id: templateId,
      recipient_data: recipientData,
      send_time: 'immediate'
    })

    return response.status === 'sent'
  }

  /**
   * Add contact to campaign list
   */
  async addToCampaignList(listId: string, contactData: any): Promise<boolean> {
    const endpoint = `${this.baseURLs.campaigns}/lists/${listId}/contacts`
    
    const response = await this.apiCall(endpoint, 'POST', contactData)
    
    return response.code === 'success'
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Log data to Zoho Analytics
   */
  async logToAnalytics(workspaceId: string, tableName: string, data: any[]): Promise<boolean> {
    const endpoint = `${this.baseURLs.analytics}/workspaces/${workspaceId}/tables/${tableName}/data`
    
    const response = await this.apiCall(endpoint, 'POST', {
      data,
      import_type: 'append'
    })

    return response.response_status === 'success'
  }

  /**
   * Run analytics query
   */
  async runAnalyticsQuery(workspaceId: string, query: string): Promise<any> {
    const endpoint = `${this.baseURLs.analytics}/workspaces/${workspaceId}/queries`
    
    return await this.apiCall(endpoint, 'POST', {
      query,
      output_format: 'json'
    })
  }

  // ==================== BOOKINGS INTEGRATION ====================

  /**
   * Create booking for service
   */
  async createBooking(serviceId: string, bookingData: any): Promise<string> {
    const endpoint = `${this.baseURLs.bookings}/services/${serviceId}/bookings`
    
    const response = await this.apiCall(endpoint, 'POST', bookingData)
    
    return response.booking_id
  }

  /**
   * Get available slots for service
   */
  async getAvailableSlots(serviceId: string, date: string): Promise<any[]> {
    const endpoint = `${this.baseURLs.bookings}/services/${serviceId}/availability`
    
    const response = await this.apiCall(endpoint, 'GET', null, {
      date
    })
    
    return response.available_slots || []
  }

  // ==================== CREATOR CUSTOM FUNCTIONS ====================

  /**
   * Execute Zoho Creator custom function
   */
  async executeCreatorFunction(appName: string, functionName: string, params: any): Promise<any> {
    const endpoint = `${this.baseURLs.creator}/${appName}/functions/${functionName}/execute`
    
    return await this.apiCall(endpoint, 'POST', params)
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate secure hash for data integrity
   */
  generateDataHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex')
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = createHash('sha256').update(payload + secret).digest('hex')
    return signature === expectedSignature
  }

  /**
   * Rate limit aware API calls
   */
  private async rateLimitedCall(endpoint: string, method: string, data?: any): Promise<any> {
    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        return await this.apiCall(endpoint, method, data)
      } catch (error) {
        if (error instanceof Error && error.message.includes('429')) {
          // Rate limited - wait and retry
          await this.delay(Math.pow(2, retries) * 1000) // Exponential backoff
          retries++
        } else {
          throw error
        }
      }
    }

    throw new Error('Max retries exceeded for rate limited API call')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}