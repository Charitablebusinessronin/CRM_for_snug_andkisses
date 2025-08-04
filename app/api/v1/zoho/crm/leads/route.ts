/**
 * Zoho CRM Leads API Endpoint
 * Phase 2: Lead management, interview scheduling, and workflow automation
 * Integrates with Zoho Bookings and Campaigns for complete automation
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { crmLeadManager } from "@/lib/zoho/crm-lead-management"

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
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body = await request.json()

    // Validate lead data
    const validationResult = createLeadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
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

    // Create lead in Zoho CRM
    const leadId = await crmLeadManager.createLead(leadData)

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

    return NextResponse.json({
      success: true,
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

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create lead in CRM",
        message: "Please try again or contact support"
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/zoho/crm/leads
 * Update lead status and trigger workflow progressions
 */
export async function PUT(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body = await request.json()

    // Validate update data
    const validationResult = updateLeadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
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
      await crmLeadManager.updateLeadInterviewScheduled(
        updateData.leadId,
        updateData.interviewScheduled
      )
      result.interview_scheduled = true
      result.next_phase = "phase_2_interview_scheduled"
    }

    // Handle interview completed update (convert to contact/deal)
    if (updateData.interviewCompleted) {
      const conversionResult = await crmLeadManager.convertLeadToContact(
        updateData.leadId,
        updateData.interviewCompleted
      )
      result.lead_converted = true
      result.contact_id = conversionResult.contactId
      result.deal_id = conversionResult.dealId
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

    return NextResponse.json({
      success: true,
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

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update lead in CRM",
        message: "Please try again or contact support"
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/zoho/crm/leads
 * Retrieve leads with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get("stage")
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assigned_to")
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = parseInt(searchParams.get("per_page") || "50")

    // Build query parameters for Zoho CRM API
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })

    if (stage) queryParams.append("criteria", `Lead_Stage:equals:${stage}`)
    if (status) queryParams.append("criteria", `Lead_Status:equals:${status}`)
    if (assignedTo) queryParams.append("criteria", `Owner:equals:${assignedTo}`)

    // Fetch leads from Zoho CRM
    const crmResponse = await fetch(
      `${process.env.ZOHO_CRM_API_URL}/crm/v2/Leads?${queryParams.toString()}`,
      {
        headers: {
          "Authorization": `Zoho-oauthtoken ${process.env.ZOHO_CRM_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!crmResponse.ok) {
      throw new Error(`CRM API error: ${crmResponse.status}`)
    }

    const crmData = await crmResponse.json()

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
        results_count: crmData.data?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: crmData.data || [],
      pagination: {
        page,
        per_page: perPage,
        total: crmData.info?.count || 0,
        more_records: crmData.info?.more_records || false
      },
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

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to retrieve leads from CRM",
        message: "Please try again or contact support"
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}