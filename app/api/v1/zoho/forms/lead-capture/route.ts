/**
 * Zoho Forms Lead Capture API Endpoint
 * Phase 1: Integrates form submission with Zoho CRM and triggers Zoho Campaigns
 * HIPAA-compliant lead processing with automated workflow triggers
 */
import { NextRequest } from "next/server"
import { z } from "zod"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { headers } from "next/headers"
import respond from "@/lib/api-respond"

// Lead capture validation schema matching Zoho Forms structure
const leadCaptureSchema = z.object({
  // Zoho Forms field mapping (field names match form configuration)
  Single_Line: z.string().min(1, "First name is required"),
  Single_Line1: z.string().min(1, "Last name is required"),
  Email: z.string().email("Valid email address is required"),
  Phone_Number: z.string().min(10, "Valid phone number is required"),
  Date: z.string().optional(),
  Number: z.string().optional(),
  Dropdown: z.string().optional(),
  Single_Line2: z.string().optional(),
  Radio: z.string().optional(),
  Dropdown1: z.string().optional(),
  Dropdown2: z.string().optional(),
  Multi_Line: z.string().optional(),
  Checkbox: z.boolean().optional(),
  Checkbox1: z.boolean().refine((val) => val === true, "HIPAA consent is required"),
  // Workflow automation triggers
  automation_trigger: z.string().optional(),
  client_journey_stage: z.string().optional(),
  zoho_crm_integration: z.boolean().optional(),
  zoho_campaigns_trigger: z.boolean().optional()
})

/**
 * POST /api/v1/zoho/forms/lead-capture
 * Submit lead to Zoho Forms with automatic CRM and Campaigns integration
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  // Derive origin robustly for server-side internal calls
  const hdrs = await headers()
  const url = new URL(request.url)
  const proto = hdrs.get("x-forwarded-proto") || url.protocol.replace(":", "") || "https"
  const host = hdrs.get("x-forwarded-host") || url.host
  const origin = request.headers.get("origin") || `${proto}://${host}`

  try {
    const body = await request.json()

    // Validate lead capture data
    const validationResult = leadCaptureSchema.safeParse(body)
    if (!validationResult.success) {
      await logAuditEvent({
        action: "LEAD_CAPTURE_VALIDATION_FAILED",
        resource: "/api/v1/zoho/forms/lead-capture",
        result: "failure",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        error_message: "Validation failed",
        data: { errors: validationResult.error.issues }
      })

      return respond.badRequest("Validation failed", "validation_error", {
        details: validationResult.error.issues,
      })
    }

    const leadData = validationResult.data

    // Log HIPAA audit event for lead capture
    await logAuditEvent({
      action: "LEAD_CAPTURE_SUBMISSION",
      resource: "/api/v1/zoho/forms/lead-capture",
      method: "POST",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        email: leadData.Email,
        phone: leadData.Phone_Number?.slice(-4), // Only log last 4 digits for privacy
        service_type: leadData.Dropdown,
        urgency: leadData.Dropdown2,
        hipaa_consent: leadData.Checkbox1,
        automation_trigger: leadData.automation_trigger
      }
    })

    // Phase 1: Create Lead via internal Catalyst-backed endpoint
    const createLeadResp = await fetch(`${origin}/api/crm/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'public-form',
        'user-agent': 'Snug-Kisses-CRM/2.0'
      },
      body: JSON.stringify({
        First_Name: leadData.Single_Line,
        Last_Name: leadData.Single_Line1,
        Email: leadData.Email,
        Phone: leadData.Phone_Number,
        Service_Type: leadData.Dropdown,
        Expected_Due_Date: leadData.Date,
        Notes: leadData.Multi_Line,
        Intake_Source: 'Zoho Forms',
        HIPAA_Consent: leadData.Checkbox1 === true,
        automation_trigger: leadData.automation_trigger,
        client_journey_stage: leadData.client_journey_stage
      })
    })

    if (!createLeadResp.ok) {
      const text = await createLeadResp.text()
      throw new Error(`Lead creation failed: ${createLeadResp.status} ${text}`)
    }

    const createdLead = await createLeadResp.json()

    // Phase 2/3: Trigger follow-up email via internal email automation API
    await fetch(`${origin}/api/v1/zoho/email-automation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'trigger_email',
        event: 'lead_captured',
        clientData: {
          email: leadData.Email,
          firstName: leadData.Single_Line,
          lastName: leadData.Single_Line1,
          serviceType: leadData.Dropdown,
          leadId: createdLead?.data?.id || createdLead?.data?.Lead_Id || null
        }
      })
    })

    // Optional: Phase 3 extension – auto book interview if requested
    if (leadData.automation_trigger === 'book_interview') {
      try {
        await fetch(`${origin}/api/v1/zoho/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'book_appointment',
            service_id: leadData?.Dropdown1 || 'interview_service',
            client_id: createdLead?.data?.id || createdLead?.data?.Lead_Id || 'lead_temp',
            appointment_date: leadData?.Date || new Date().toISOString().slice(0, 10),
            start_time: '10:00',
            notes: `Auto-interview booking for ${leadData.Email}`
          })
        })
      } catch (e) {
        console.warn('Auto booking skipped:', e)
      }
    }

    // Log successful submission
    await logAuditEvent({
      action: "LEAD_CAPTURE_SUCCESS",
      resource: "/api/v1/zoho/forms/lead-capture",
      result: "success",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        zoho_form_id: createdLead?.data?.id || createdLead?.data?.Lead_Id || null,
        email: leadData.Email,
        service_type: leadData.Dropdown,
        workflow_triggered: leadData.zoho_crm_integration
      }
    })

    return respond.ok({
      message: "Lead captured successfully and workflows triggered",
      data: {
        status: "processing",
        next_steps: [
          "CRM lead record created",
          "Email confirmation sent",
          "Intake workflow initiated"
        ],
        estimated_response_time: "24 hours",
        lead_id: createdLead?.data?.id || createdLead?.data?.Lead_Id || null
      },
      requestId
    })

  } catch (error) {
    console.error("Lead capture error:", error)
    
    await logAuditEvent({
      action: "LEAD_CAPTURE_ERROR",
      resource: "/api/v1/zoho/forms/lead-capture",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return respond.serverError(
      "Failed to process lead capture",
      "lead_capture_failed",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}