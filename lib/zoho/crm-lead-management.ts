/**
 * Zoho CRM Lead Management Configuration
 * Phase 2: Lead processing, qualification, and interview scheduling workflows
 * Integrates with Zoho Bookings and automated follow-up sequences
 */

interface ZohoCRMConfig {
  apiUrl: string
  accessToken: string
  refreshToken: string
  clientId: string
  clientSecret: string
}

interface LeadData {
  id?: string
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
  stage: string
  status: string
  assignedTo?: string
  createdAt: string
  lastModified?: string
}

export class ZohoCRMLeadManager {
  private config: ZohoCRMConfig

  constructor(config: ZohoCRMConfig) {
    this.config = config
  }

  /**
   * Create new lead in Zoho CRM with automatic workflow triggers
   */
  async createLead(leadData: Omit<LeadData, 'id' | 'createdAt' | 'lastModified'>): Promise<string> {
    try {
      const crmLeadData = {
        data: [{
          // Standard CRM fields
          First_Name: leadData.firstName,
          Last_Name: leadData.lastName,
          Email: leadData.email,
          Phone: leadData.phone,
          Company: "Snug & Kisses Client",
          
          // Custom fields for postpartum care
          Due_Date: leadData.dueDate,
          Current_Pregnancy_Week: leadData.currentWeek,
          Service_Type_Requested: leadData.serviceType,
          Location_City: leadData.location,
          Urgency_Level: leadData.urgency,
          Lead_Source: leadData.leadSource,
          Initial_Notes: leadData.notes,
          
          // Workflow and automation fields
          Lead_Stage: leadData.stage,
          Lead_Status: leadData.status,
          Client_Journey_Phase: "phase_1_initial_inquiry",
          Next_Action: "schedule_initial_interview",
          Assigned_Owner: leadData.assignedTo || process.env.ZOHO_DEFAULT_LEAD_OWNER,
          
          // HIPAA and compliance
          HIPAA_Consent_Date: new Date().toISOString(),
          Data_Collection_Consent: true,
          Marketing_Consent: true,
          
          // Automated workflow triggers
          Trigger_Interview_Scheduling: true,
          Trigger_Welcome_Email: true,
          Trigger_Initial_Assessment: true
        }],
        
        // Workflow rules and automations
        trigger: ["workflow", "approval", "blueprint"],
        
        // Duplicate check configuration
        duplicate_check_fields: ["Email", "Phone"],
        
        // Assignment rules
        apply_feature_execution: [{
          name: "assignment_rules",
          execution_details: [{
            module: "Leads",
            execution_time: "on_create"
          }]
        }]
      }

      const response = await fetch(`${this.config.apiUrl}/crm/v2/Leads`, {
        method: "POST",
        headers: {
          "Authorization": `Zoho-oauthtoken ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(crmLeadData)
      })

      if (!response.ok) {
        throw new Error(`CRM API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.data && result.data.length > 0) {
        const leadId = result.data[0].details.id
        
        // Trigger Phase 2 workflow: Interview Scheduling
        await this.triggerInterviewSchedulingWorkflow(leadId, leadData)
        
        return leadId
      } else {
        throw new Error("Failed to create lead in CRM")
      }

    } catch (error) {
      console.error("Error creating CRM lead:", error)
      throw error
    }
  }

  /**
   * Trigger interview scheduling workflow (Phase 2)
   */
  private async triggerInterviewSchedulingWorkflow(leadId: string, leadData: LeadData): Promise<void> {
    try {
      // Create follow-up task for interview scheduling
      const taskData = {
        data: [{
          Subject: `Schedule Initial Interview - ${leadData.firstName} ${leadData.lastName}`,
          Status: "Not Started",
          Priority: leadData.urgency === "immediate" ? "High" : "Normal",
          Due_Date: this.calculateInterviewDueDate(leadData.urgency),
          What_Id: leadId,
          Task_Type: "Interview Scheduling",
          Description: `Initial consultation interview for ${leadData.serviceType} services. 
                       Urgency: ${leadData.urgency}
                       Location: ${leadData.location}
                       Due Date: ${leadData.dueDate}
                       Notes: ${leadData.notes}`,
          Owner: leadData.assignedTo || process.env.ZOHO_DEFAULT_TASK_OWNER,
          
          // Automation triggers
          Trigger_Booking_Link_Email: true,
          Trigger_Calendar_Integration: true,
          Client_Journey_Phase: "phase_2_interview_scheduling"
        }]
      }

      await fetch(`${this.config.apiUrl}/crm/v2/Tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Zoho-oauthtoken ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      })

      // Trigger Zoho Bookings integration via webhook
      await this.triggerBookingsIntegration(leadId, leadData)

    } catch (error) {
      console.error("Error triggering interview scheduling workflow:", error)
    }
  }

  /**
   * Calculate interview due date based on urgency
   */
  private calculateInterviewDueDate(urgency?: string): string {
    const now = new Date()
    
    switch (urgency) {
      case "immediate":
        now.setHours(now.getHours() + 24) // 24 hours
        break
      case "week":
        now.setDate(now.getDate() + 3) // 3 days
        break
      case "month":
        now.setDate(now.getDate() + 7) // 1 week
        break
      default:
        now.setDate(now.getDate() + 2) // 2 days default
    }
    
    return now.toISOString().split('T')[0]
  }

  /**
   * Trigger Zoho Bookings integration for interview scheduling
   */
  private async triggerBookingsIntegration(leadId: string, leadData: LeadData): Promise<void> {
    try {
      const bookingsWebhook = {
        lead_id: leadId,
        client_info: {
          first_name: leadData.firstName,
          last_name: leadData.lastName,
          email: leadData.email,
          phone: leadData.phone,
          service_type: leadData.serviceType,
          urgency: leadData.urgency,
          location: leadData.location
        },
        booking_preferences: {
          service_duration: this.getServiceDuration(leadData.serviceType),
          preferred_method: "video_call",
          availability_window: this.getAvailabilityWindow(leadData.urgency),
          timezone: "America/New_York" // Default timezone
        },
        automation_trigger: "phase_2_interview_scheduling",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/zoho/bookings/callback`
      }

      await fetch(`${process.env.ZOHO_BOOKINGS_WEBHOOK_URL}/schedule-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ZOHO_BOOKINGS_API_KEY}`
        },
        body: JSON.stringify(bookingsWebhook)
      })

    } catch (error) {
      console.error("Error triggering Zoho Bookings integration:", error)
    }
  }

  /**
   * Get service duration based on service type
   */
  private getServiceDuration(serviceType?: string): number {
    switch (serviceType) {
      case "consultation":
        return 30 // 30 minutes
      case "both":
        return 60 // 1 hour
      default:
        return 45 // 45 minutes default
    }
  }

  /**
   * Get availability window based on urgency
   */
  private getAvailabilityWindow(urgency?: string): number {
    switch (urgency) {
      case "immediate":
        return 24 // 24 hours
      case "week":
        return 168 // 1 week in hours
      case "month":
        return 720 // 30 days in hours
      default:
        return 168 // 1 week default
    }
  }

  /**
   * Update lead status when interview is scheduled
   */
  async updateLeadInterviewScheduled(leadId: string, interviewDetails: {
    scheduledDate: string
    meetingId: string
    meetingUrl: string
  }): Promise<void> {
    try {
      const updateData = {
        data: [{
          id: leadId,
          Lead_Stage: "Interview Scheduled",
          Lead_Status: "Contacted",
          Interview_Scheduled_Date: interviewDetails.scheduledDate,
          Interview_Meeting_ID: interviewDetails.meetingId,
          Interview_Meeting_URL: interviewDetails.meetingUrl,
          Client_Journey_Phase: "phase_2_interview_scheduled",
          Next_Action: "conduct_interview",
          Last_Activity: `Interview scheduled for ${interviewDetails.scheduledDate}`
        }]
      }

      await fetch(`${this.config.apiUrl}/crm/v2/Leads`, {
        method: "PUT",
        headers: {
          "Authorization": `Zoho-oauthtoken ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })

    } catch (error) {
      console.error("Error updating lead interview status:", error)
    }
  }

  /**
   * Convert lead to contact and create deal when interview is completed successfully
   */
  async convertLeadToContact(leadId: string, conversionData: {
    interviewNotes: string
    serviceInterest: string
    nextSteps: string
  }): Promise<{ contactId: string; dealId: string }> {
    try {
      const conversionPayload = {
        data: [{
          Lead: leadId,
          overwrite: true,
          notify_lead_owner: true,
          notify_new_entity_owner: true,
          
          // Contact creation
          Contacts: {
            Interview_Completion_Date: new Date().toISOString(),
            Interview_Notes: conversionData.interviewNotes,
            Primary_Service_Interest: conversionData.serviceInterest,
            Client_Journey_Phase: "phase_3_interview_completed"
          },
          
          // Deal creation
          Deals: {
            Deal_Name: `${conversionData.serviceInterest} Services`,
            Stage: "Qualification",
            Probability: 50,
            Amount: this.getEstimatedDealValue(conversionData.serviceInterest),
            Closing_Date: this.getEstimatedClosingDate(),
            Next_Steps: conversionData.nextSteps,
            Client_Journey_Phase: "phase_3_interview_completed"
          }
        }]
      }

      const response = await fetch(`${this.config.apiUrl}/crm/v2/Leads/actions/convert`, {
        method: "POST",
        headers: {
          "Authorization": `Zoho-oauthtoken ${this.config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(conversionPayload)
      })

      if (!response.ok) {
        throw new Error(`Lead conversion failed: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        contactId: result.data[0].Contacts.details.id,
        dealId: result.data[0].Deals.details.id
      }

    } catch (error) {
      console.error("Error converting lead to contact:", error)
      throw error
    }
  }

  /**
   * Get estimated deal value based on service type
   */
  private getEstimatedDealValue(serviceType: string): number {
    const serviceRates = {
      "postpartum": 2500,
      "birth": 1800,
      "both": 4000,
      "overnight": 3500,
      "consultation": 150
    }
    
    return serviceRates[serviceType as keyof typeof serviceRates] || 2000
  }

  /**
   * Get estimated closing date (30 days from now)
   */
  private getEstimatedClosingDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  /**
   * Refresh access token when needed
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: "refresh_token"
        })
      })

      const result = await response.json()
      
      if (result.access_token) {
        this.config.accessToken = result.access_token
        return result.access_token
      } else {
        throw new Error("Failed to refresh access token")
      }

    } catch (error) {
      console.error("Error refreshing access token:", error)
      throw error
    }
  }
}

// Export singleton instance
export const crmLeadManager = new ZohoCRMLeadManager({
  apiUrl: process.env.ZOHO_CRM_API_URL || "https://www.zohoapis.com",
  accessToken: process.env.ZOHO_CRM_ACCESS_TOKEN || "",
  refreshToken: process.env.ZOHO_CRM_REFRESH_TOKEN || "",
  clientId: process.env.ZOHO_CLIENT_ID || "",
  clientSecret: process.env.ZOHO_CLIENT_SECRET || ""
})