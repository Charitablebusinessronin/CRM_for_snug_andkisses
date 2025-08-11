/**
 * Zoho CRM Lead Management Service
 * Phase 2: Advanced lead management with interview scheduling and conversion
 * Integrates with Zoho Bookings and automated workflows
 */
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dueDate?: string
  currentWeek?: string
  serviceType?: string
  location?: string
  urgency?: string
  leadSource?: string
  notes?: string
  stage?: string
  status?: string
  assignedTo?: string
}

interface InterviewScheduledData {
  scheduledDate: string
  meetingId: string
  meetingUrl: string
}

interface InterviewCompletedData {
  interviewNotes: string
  serviceInterest: string
  nextSteps: string
}

interface ConversionResult {
  contactId: string
  dealId: string
  accountId?: string
}

class CRMLeadManager {
  private apiUrl: string
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor() {
    this.apiUrl = process.env.ZOHO_CRM_API_URL || "https://www.zohoapis.com/crm/v2"
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
          refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
          client_id: process.env.ZOHO_CLIENT_ID!,
          client_secret: process.env.ZOHO_CLIENT_SECRET!,
          grant_type: "refresh_token",
        }),
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000 // 1 minute buffer

      await logAuditEvent({
        action: "ZOHO_CRM_TOKEN_REFRESH",
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
        action: "ZOHO_CRM_TOKEN_REFRESH",
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

  private async makeZohoRequest(endpoint: string, method = "GET", data?: any): Promise<any> {
    const token = await this.getAccessToken()
    const url = `${this.apiUrl}${endpoint}`

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

    try {
      const response = await fetch(url, requestOptions)
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(`Zoho CRM API error: ${responseData.message || response.statusText}`)
      }

      await logAuditEvent({
        action: "ZOHO_CRM_API_REQUEST",
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
    } catch (error) {
      await logAuditEvent({
        action: "ZOHO_CRM_API_REQUEST",
        resource: endpoint,
        method,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { endpoint, method, success: false },
      })
      throw error
    }
  }

  /**
   * Create a new lead in Zoho CRM with healthcare-specific fields
   */
  async createLead(leadData: LeadData): Promise<string> {
    const zohoLead = {
      First_Name: leadData.firstName,
      Last_Name: leadData.lastName,
      Email: leadData.email,
      Phone: leadData.phone,
      Company: "Individual Client",
      Lead_Source: leadData.leadSource || "Website",
      Lead_Status: leadData.status || "New",
      Lead_Stage: leadData.stage || "Initial Inquiry",
      Description: leadData.notes,
      // Healthcare-specific custom fields
      Due_Date: leadData.dueDate,
      Current_Pregnancy_Week: leadData.currentWeek,
      Service_Type: leadData.serviceType,
      Location: leadData.location,
      Urgency_Level: leadData.urgency,
      // Workflow automation fields
      Workflow_Stage: "phase_1_lead_created",
      Created_Via: "Client Portal",
      HIPAA_Consent: true,
      // Assignment
      Owner: leadData.assignedTo || process.env.ZOHO_DEFAULT_OWNER_ID
    }

    try {
      const response = await this.makeZohoRequest("/Leads", "POST", {
        data: [zohoLead],
      })

      const leadId = response.data?.[0]?.details?.id
      if (!leadId) {
        throw new Error("Failed to get lead ID from Zoho response")
      }

      // Trigger Zoho Flow automation for lead processing
      await this.triggerLeadWorkflow(leadId, "lead_created", {
        service_type: leadData.serviceType,
        urgency: leadData.urgency,
        due_date: leadData.dueDate
      })

      await logAuditEvent({
        action: "CRM_LEAD_CREATED",
        resource: "Zoho CRM Lead",
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          lead_id: leadId,
          email: leadData.email,
          service_type: leadData.serviceType,
          full_name: `${leadData.firstName} ${leadData.lastName}`,
        },
      })

      return leadId
    } catch (error) {
      await logAuditEvent({
        action: "CRM_LEAD_CREATION_FAILED",
        resource: "Zoho CRM Lead",
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          email: leadData.email,
          service_type: leadData.serviceType,
        },
      })
      throw error
    }
  }

  /**
   * Update lead when interview is scheduled
   */
  async updateLeadInterviewScheduled(
    leadId: string,
    interviewData: InterviewScheduledData
  ): Promise<void> {
    const updateData = {
      Lead_Stage: "Interview Scheduled",
      Lead_Status: "Contacted",
      Interview_Scheduled_Date: interviewData.scheduledDate,
      Meeting_ID: interviewData.meetingId,
      Meeting_URL: interviewData.meetingUrl,
      Workflow_Stage: "phase_2_interview_scheduled",
      Last_Activity_Time: new Date().toISOString()
    }

    try {
      await this.makeZohoRequest(`/Leads/${leadId}`, "PUT", {
        data: [updateData],
      })

      // Trigger interview reminder workflow
      await this.triggerLeadWorkflow(leadId, "interview_scheduled", {
        meeting_date: interviewData.scheduledDate,
        meeting_url: interviewData.meetingUrl
      })

      await logAuditEvent({
        action: "CRM_LEAD_INTERVIEW_SCHEDULED",
        resource: `Zoho CRM Lead ${leadId}`,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          lead_id: leadId,
          interview_date: interviewData.scheduledDate,
          meeting_id: interviewData.meetingId
        },
      })
    } catch (error) {
      await logAuditEvent({
        action: "CRM_LEAD_INTERVIEW_SCHEDULE_FAILED",
        resource: `Zoho CRM Lead ${leadId}`,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { lead_id: leadId },
      })
      throw error
    }
  }

  /**
   * Convert lead to contact and deal after successful interview
   */
  async convertLeadToContact(
    leadId: string,
    interviewData: InterviewCompletedData
  ): Promise<ConversionResult> {
    try {
      // First, get the lead details
      const leadResponse = await this.makeZohoRequest(`/Leads/${leadId}`)
      const lead = leadResponse.data[0]

      // Create contact
      const contactData = {
        First_Name: lead.First_Name,
        Last_Name: lead.Last_Name,
        Email: lead.Email,
        Phone: lead.Phone,
        Lead_Source: lead.Lead_Source,
        Description: lead.Description,
        // Healthcare-specific fields
        Due_Date: lead.Due_Date,
        Current_Pregnancy_Week: lead.Current_Pregnancy_Week,
        Service_Type: lead.Service_Type,
        Location: lead.Location,
        // Interview results
        Interview_Notes: interviewData.interviewNotes,
        Service_Interest_Level: interviewData.serviceInterest,
        Next_Steps: interviewData.nextSteps,
        Conversion_Date: new Date().toISOString(),
        Client_Status: "Active Prospect"
      }

      const contactResponse = await this.makeZohoRequest("/Contacts", "POST", {
        data: [contactData],
      })

      const contactId = contactResponse.data?.[0]?.details?.id
      if (!contactId) {
        throw new Error("Failed to create contact")
      }

      // Create deal/opportunity
      const dealData = {
        Deal_Name: `${lead.First_Name} ${lead.Last_Name} - ${lead.Service_Type}`,
        Contact_Name: contactId,
        Stage: "Qualification",
        Amount: this.calculateEstimatedValue(lead.Service_Type, lead.Urgency_Level),
        Closing_Date: this.calculateClosingDate(lead.Due_Date, lead.Urgency_Level),
        Lead_Source: lead.Lead_Source,
        Description: `Converted from lead. Service needed: ${lead.Service_Type}. ${interviewData.interviewNotes}`,
        // Healthcare-specific deal fields
        Service_Type: lead.Service_Type,
        Expected_Start_Date: lead.Due_Date,
        Client_Location: lead.Location,
        Urgency_Level: lead.Urgency_Level,
        Interview_Score: interviewData.serviceInterest,
        Next_Steps: interviewData.nextSteps
      }

      const dealResponse = await this.makeZohoRequest("/Deals", "POST", {
        data: [dealData],
      })

      const dealId = dealResponse.data?.[0]?.details?.id
      if (!dealId) {
        throw new Error("Failed to create deal")
      }

      // Update original lead to converted status
      await this.makeZohoRequest(`/Leads/${leadId}`, "PUT", {
        data: [{
          Lead_Status: "Converted",
          Lead_Stage: "Converted to Contact",
          Converted_Contact: contactId,
          Converted_Deal: dealId,
          Conversion_Date: new Date().toISOString(),
          Workflow_Stage: "phase_3_converted"
        }],
      })

      // Trigger post-conversion workflow
      await this.triggerLeadWorkflow(leadId, "lead_converted", {
        contact_id: contactId,
        deal_id: dealId,
        service_type: lead.Service_Type
      })

      const result: ConversionResult = {
        contactId,
        dealId
      }

      await logAuditEvent({
        action: "CRM_LEAD_CONVERTED",
        resource: `Zoho CRM Lead ${leadId}`,
        result: "success",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: {
          lead_id: leadId,
          contact_id: contactId,
          deal_id: dealId,
          service_type: lead.Service_Type
        },
      })

      return result
    } catch (error) {
      await logAuditEvent({
        action: "CRM_LEAD_CONVERSION_FAILED",
        resource: `Zoho CRM Lead ${leadId}`,
        result: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: "server",
        user_agent: "server",
        timestamp: new Date().toISOString(),
        origin: "server",
        request_id: crypto.randomUUID(),
        data: { lead_id: leadId },
      })
      throw error
    }
  }

  /**
   * Trigger Zoho Flow automation workflows
   */
  private async triggerLeadWorkflow(
    leadId: string,
    workflowType: string,
    data: any
  ): Promise<void> {
    if (!process.env.ZOHO_FLOW_WEBHOOK_URL) {
      console.warn("Zoho Flow webhook URL not configured, skipping workflow trigger")
      return
    }

    try {
      await fetch(`${process.env.ZOHO_FLOW_WEBHOOK_URL}/lead-workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ZOHO_FLOW_API_KEY}`
        },
        body: JSON.stringify({
          lead_id: leadId,
          workflow_type: workflowType,
          data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error("Failed to trigger Zoho Flow workflow:", error)
      // Don't throw error as this is not critical for lead management
    }
  }

  /**
   * Calculate estimated deal value based on service type and urgency
   */
  private calculateEstimatedValue(serviceType?: string, urgency?: string): number {
    const baseValues = {
      "postpartum-care": 2500,
      "birth-doula": 1500,
      "lactation-support": 800,
      "newborn-care": 3000,
      "overnight-care": 4000,
      "consultation": 200
    }

    let baseValue = baseValues[serviceType as keyof typeof baseValues] || 1000

    // Urgency multiplier
    if (urgency === "immediate") {
      baseValue *= 1.5
    } else if (urgency === "this-week") {
      baseValue *= 1.2
    }

    return baseValue
  }

  /**
   * Calculate expected closing date based on due date and urgency
   */
  private calculateClosingDate(dueDate?: string, urgency?: string): string {
    const now = new Date()
    let closingDate = new Date(now)

    if (urgency === "immediate") {
      closingDate.setDate(now.getDate() + 3)
    } else if (urgency === "this-week") {
      closingDate.setDate(now.getDate() + 7)
    } else if (dueDate) {
      const due = new Date(dueDate)
      closingDate = new Date(due.getTime() - (30 * 24 * 60 * 60 * 1000)) // 30 days before due date
    } else {
      closingDate.setDate(now.getDate() + 14) // Default 2 weeks
    }

    return closingDate.toISOString().split('T')[0]
  }
}

// Singleton instance
const crmLeadManager = new CRMLeadManager()

export { crmLeadManager, type LeadData, type InterviewScheduledData, type InterviewCompletedData, type ConversionResult }
export default crmLeadManager