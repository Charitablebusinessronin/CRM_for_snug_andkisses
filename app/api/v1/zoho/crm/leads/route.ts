/**
 * Zoho CRM Leads API Endpoint
 * Phase 2: Lead management, interview scheduling, and workflow automation
 * Integrates with Zoho Bookings and Campaigns for complete automation
 * Refactored to use Catalyst-native integration
 */
import { NextRequest } from "next/server"
import { z } from "zod"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import respond from "@/lib/api-respond"
import { UnifiedApiClient } from "@/lib/unified-api-client"
import { cookieTokenProvider } from "@/lib/server-token-provider"
import { getIntegrationMode } from "@/lib/integration-mode"
import { getCrmEndpoint } from "@/lib/service-endpoints"

// Catalyst Function URL for CRM operations
const CATALYST_FUNCTION_URL = process.env.CATALYST_FUNCTION_URL || 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function';

// Lead creation schema
const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  dueDate: z.string().optional(),
  currentWeek: z.string().optional(),
  serviceType: z.string().optional(),
  location: z.string().optional(),
  urgency: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
  stage: z.string().default("New"),
  status: z.string().default("New"),
  assignedTo: z.string().optional()
})

// Lead update schema
const updateLeadSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  interviewScheduled: z.object({
    scheduledDate: z.string(),
    meetingId: z.string(),
    meetingUrl: z.string()
  }).optional(),
  interviewCompleted: z.object({
    interviewNotes: z.string(),
    serviceInterest: z.string(),
    nextSteps: z.string()
  }).optional(),
  status: z.string().optional(),
  stage: z.string().optional()
})

/**
 * POST /api/v1/zoho/crm/leads
 * Create new lead in Zoho CRM with automatic workflow triggers
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body = await request.json()

    // Validate lead data
    const validationResult = createLeadSchema.safeParse(body)
    if (!validationResult.success) {
      return respond.badRequest("Validation failed", "validation_error", {
        details: validationResult.error.issues,
      })
    }

    const leadData = validationResult.data

    // Log audit event
    await logAuditEvent({
      action: "CRM_LEAD_CREATION",
      resource: "/api/v1/zoho/crm/leads",
      method: "POST",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        email: leadData.email,
        service_type: leadData.serviceType,
        urgency: leadData.urgency,
        lead_source: leadData.leadSource
      }
    })

    // Create lead using UnifiedApiClient
    const client = new UnifiedApiClient('', cookieTokenProvider(request))
    const targetUrl = getCrmEndpoint()
    const catalystRes = await client.request<any>({
      method: 'POST',
      url: targetUrl,
      headers: { 'User-Agent': 'Snug-Kisses-CRM/2.0' },
      body: {
        action: 'createLead',
        params: {
          first_name: leadData.firstName,
          last_name: leadData.lastName,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.serviceType || 'Individual',
          lead_source: leadData.leadSource || 'CRM API v1',
          notes: leadData.notes
        }
      },
      requiresAuth: false,
      auditContext: {
        action: 'CRM_LEAD_CREATE_CALL',
        resource: targetUrl,
        userId: undefined,
        ip,
        userAgent,
      }
    })
    if (!catalystRes.success) {
      throw new Error(`Catalyst function call failed: ${catalystRes.status}`)
    }

    const catalystData = catalystRes.data;
    const leadId = catalystData.data?.ROWID || 'generated-id';

    // Log successful creation
    await logAuditEvent({
      action: "CRM_LEAD_CREATED",
      resource: "/api/v1/zoho/crm/leads",
      result: "success",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        lead_id: leadId,
        email: leadData.email,
        workflow_triggered: true
      }
    })

    return respond.created({
      message: "Lead created successfully in CRM",
      data: {
        lead_id: leadId,
        status: "created",
        workflows_triggered: [
          "interview_scheduling",
          "welcome_email",
          "initial_assessment"
        ],
        next_steps: [
          "Interview scheduling email sent",
          "Task created for team follow-up",
          "Zoho Bookings integration triggered"
        ]
      },
      requestId
    })

  } catch (error) {
    console.error("CRM lead creation error:", error)
    
    await logAuditEvent({
      action: "CRM_LEAD_CREATION_ERROR",
      resource: "/api/v1/zoho/crm/leads",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return respond.serverError(
      "Failed to create lead in CRM",
      "crm_lead_create_failed",
      { details: error instanceof Error ? error.message : String(error) }
    )
  }
}

/**
 * PUT /api/v1/zoho/crm/leads
 * Update lead status and trigger workflow progressions
 */
export async function PUT(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body = await request.json()

    // Validate update data
    const validationResult = updateLeadSchema.safeParse(body)
    if (!validationResult.success) {
      return respond.badRequest("Validation failed", "validation_error", {
        details: validationResult.error.issues,
      })
    }

    const updateData = validationResult.data

    // Log audit event
    await logAuditEvent({
      action: "CRM_LEAD_UPDATE",
      resource: "/api/v1/zoho/crm/leads",
      method: "PUT",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        lead_id: updateData.leadId,
        update_type: updateData.interviewScheduled ? "interview_scheduled" : 
                    updateData.interviewCompleted ? "interview_completed" : "status_update"
      }
    })

    let result: any = {}

    // Handle interview scheduled update
    if (updateData.interviewScheduled) {
      // Update lead via UnifiedApiClient
      const client = new UnifiedApiClient('', cookieTokenProvider(request))
      const targetUrl = getCrmEndpoint()
      const updateRes = await client.request<any>({
        method: 'POST',
        url: targetUrl,
        headers: { 'User-Agent': 'Snug-Kisses-CRM/2.0' },
        body: {
          action: 'updateLead',
          params: {
            lead_id: updateData.leadId,
            interview_scheduled: updateData.interviewScheduled
          }
        },
        requiresAuth: false,
        auditContext: {
          action: 'CRM_LEAD_UPDATE_CALL',
          resource: targetUrl,
          userId: undefined,
          ip,
          userAgent,
        }
      })
      if (!updateRes.success) {
        throw new Error(`Catalyst function call failed: ${updateRes.status}`)
      }

      result.interview_scheduled = true
      result.next_phase = "phase_2_interview_scheduled"
    }

    // Handle interview completed update (convert to contact/deal)
    if (updateData.interviewCompleted) {
      const client2 = new UnifiedApiClient('', cookieTokenProvider(request))
      const targetUrl2 = getCrmEndpoint()
      const convRes = await client2.request<any>({
        method: 'POST',
        url: targetUrl2,
        headers: { 'User-Agent': 'Snug-Kisses-CRM/2.0' },
        body: {
          action: 'convertLeadToContact',
          params: {
            lead_id: updateData.leadId,
            interview_completed: updateData.interviewCompleted
          }
        },
        requiresAuth: false,
        auditContext: {
          action: 'CRM_LEAD_CONVERT_CALL',
          resource: targetUrl2,
          userId: undefined,
          ip,
          userAgent,
        }
      })
      if (!convRes.success) {
        throw new Error(`Catalyst function call failed: ${convRes.status}`)
      }

      const convData = convRes.data
      result.lead_converted = true
      result.contact_id = convData.contactId
      result.deal_id = convData.dealId
      result.next_phase = "phase_3_interview_completed"
    }

    // Log successful update
    await logAuditEvent({
      action: "CRM_LEAD_UPDATED",
      resource: "/api/v1/zoho/crm/leads",
      result: "success",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        lead_id: updateData.leadId,
        update_result: result
      }
    })

    return respond.ok({
      message: "Lead updated successfully",
      data: {
        lead_id: updateData.leadId,
        updates: result,
        timestamp: new Date().toISOString()
      },
      requestId
    })

  } catch (error) {
    console.error("CRM lead update error:", error)
    
    await logAuditEvent({
      action: "CRM_LEAD_UPDATE_ERROR",
      resource: "/api/v1/zoho/crm/leads",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return respond.serverError(
      "Failed to update lead in CRM",
      "crm_lead_update_failed",
      { details: error instanceof Error ? error.message : String(error) }
    )
  }
}

/**
 * GET /api/v1/zoho/crm/leads
 * Retrieve leads with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get("stage")
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assigned_to")
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = parseInt(searchParams.get("per_page") || "50")

    // Fetch leads via UnifiedApiClient
    const client = new UnifiedApiClient('', cookieTokenProvider(request))
    const targetUrl = getCrmEndpoint()
    const listRes = await client.request<any>({
      method: 'POST',
      url: targetUrl,
      headers: { 'User-Agent': 'Snug-Kisses-CRM/2.0' },
      body: {
        action: 'getLeads',
        params: { 
          page, 
          limit: perPage, 
          stage, 
          status, 
          assigned_to: assignedTo 
        }
      },
      requiresAuth: false,
      auditContext: {
        action: 'CRM_LEADS_LIST_CALL',
        resource: targetUrl,
        userId: undefined,
        ip,
        userAgent,
      }
    })
    if (!listRes.success) {
      throw new Error(`Catalyst function call failed: ${listRes.status}`)
    }

    const catalystData = listRes.data;

    // Log audit event
    await logAuditEvent({
      action: "CRM_LEADS_RETRIEVED",
      resource: "/api/v1/zoho/crm/leads",
      method: "GET",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        filters: { stage, status, assignedTo },
        page,
        per_page: perPage,
        results_count: catalystData.data?.length || 0
      }
    })

    return respond.ok({
      data: catalystData.data || [],
      pagination: {
        page,
        per_page: perPage,
        total: catalystData.total || 0,
        more_records: (page * perPage) < (catalystData.total || 0)
      },
      source: 'catalyst-native-integration',
      requestId
    })

  } catch (error) {
    console.error("CRM leads retrieval error:", error)
    
    await logAuditEvent({
      action: "CRM_LEADS_RETRIEVAL_ERROR",
      resource: "/api/v1/zoho/crm/leads",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return respond.serverError(
      "Failed to retrieve leads from CRM",
      "crm_leads_get_failed",
      { details: error instanceof Error ? error.message : String(error) }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}