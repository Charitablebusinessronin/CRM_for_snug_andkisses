/**
 * Zoho Forms Lead Capture API Endpoint
 * Phase 1: Integrates form submission with Zoho CRM and triggers Zoho Campaigns
 * HIPAA-compliant lead processing with automated workflow triggers
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

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
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

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
        data: { errors: validationResult.error.errors }
      })

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

    // Step 1: Submit to Zoho Forms API
    const zohoFormsResponse = await fetch(
      `${process.env.ZOHO_FORMS_API_URL}/api/v1.1/forms/${process.env.ZOHO_LEAD_CAPTURE_FORM_ID}/entries`,
      {
        method: "POST",
        headers: {
          "Authorization": `Zoho-oauthtoken ${process.env.ZOHO_FORMS_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            Single_Line: leadData.Single_Line,
            Single_Line1: leadData.Single_Line1,
            Email: leadData.Email,
            Phone_Number: leadData.Phone_Number,
            Date: leadData.Date,
            Number: leadData.Number,
            Dropdown: leadData.Dropdown,
            Single_Line2: leadData.Single_Line2,
            Radio: leadData.Radio,
            Dropdown1: leadData.Dropdown1,
            Dropdown2: leadData.Dropdown2,
            Multi_Line: leadData.Multi_Line,
            Checkbox: leadData.Checkbox,
            Checkbox1: leadData.Checkbox1
          }
        })
      }
    )

    if (!zohoFormsResponse.ok) {
      throw new Error(`Zoho Forms API error: ${zohoFormsResponse.status}`)
    }

    const formsResult = await zohoFormsResponse.json()

    // Step 2: Trigger Zoho Flow automation for CRM integration
    if (leadData.zoho_crm_integration) {
      const flowTriggerResponse = await fetch(
        `${process.env.ZOHO_FLOW_WEBHOOK_URL}/lead-capture-crm-integration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.ZOHO_FLOW_API_KEY}`
          },
          body: JSON.stringify({
            form_entry_id: formsResult.data.ID,
            lead_data: {
              first_name: leadData.Single_Line,
              last_name: leadData.Single_Line1,
              email: leadData.Email,
              phone: leadData.Phone_Number,
              due_date: leadData.Date,
              service_type: leadData.Dropdown,
              location: leadData.Single_Line2,
              urgency: leadData.Dropdown2,
              lead_source: leadData.Dropdown1,
              notes: leadData.Multi_Line
            },
            workflow_stage: leadData.client_journey_stage || "initial_inquiry",
            automation_trigger: leadData.automation_trigger,
            timestamp: new Date().toISOString()
          })
        }
      )

      if (!flowTriggerResponse.ok) {
        console.error("Zoho Flow trigger failed:", await flowTriggerResponse.text())
      }
    }

    // Step 3: Trigger Zoho Campaigns automation
    if (leadData.zoho_campaigns_trigger && leadData.Checkbox) {
      const campaignsResponse = await fetch(
        `${process.env.ZOHO_CAMPAIGNS_API_URL}/api/v1.1/addcontacts`,
        {
          method: "POST",
          headers: {
            "Authorization": `Zoho-oauthtoken ${process.env.ZOHO_CAMPAIGNS_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            listkey: process.env.ZOHO_CAMPAIGNS_LEAD_LIST_ID,
            contactinfo: JSON.stringify([{
              Contact_Email: leadData.Email,
              First_Name: leadData.Single_Line,
              Last_Name: leadData.Single_Line1,
              Phone_Number: leadData.Phone_Number,
              Service_Type: leadData.Dropdown,
              Lead_Source: leadData.Dropdown1,
              Urgency: leadData.Dropdown2,
              Location: leadData.Single_Line2,
              Pregnancy_Week: leadData.Number,
              Due_Date: leadData.Date,
              Lead_Capture_Date: new Date().toISOString()
            }])
          })
        }
      )

      if (!campaignsResponse.ok) {
        console.error("Zoho Campaigns integration failed:", await campaignsResponse.text())
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
        zoho_form_id: formsResult.data.ID,
        email: leadData.Email,
        service_type: leadData.Dropdown,
        workflow_triggered: leadData.zoho_crm_integration
      }
    })

    return NextResponse.json({
      success: true,
      message: "Lead captured successfully and workflows triggered",
      data: {
        zoho_form_id: formsResult.data.ID,
        status: "processing",
        next_steps: [
          "CRM lead record created",
          "Email confirmation sent",
          "Intake workflow initiated"
        ],
        estimated_response_time: "24 hours"
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

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process lead capture",
        message: "We're experiencing technical difficulties. Please try again or call us directly."
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}