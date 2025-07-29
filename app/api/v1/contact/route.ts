import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { zohoCRM } from "@/lib/zoho-crm-enhanced"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

// Zod validation schema for contact form data
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || /^[+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-$$$$]/g, "")),
      "Invalid phone number format",
    ),
  company: z.string().max(100, "Company name too long").optional(),
  serviceType: z
    .enum(["postpartum-care", "birth-doula", "childcare", "corporate-partnership", "general-inquiry"])
    .optional(),
  message: z.string().max(1000, "Message too long").optional(),
  source: z.string().optional(),
  // HIPAA compliance fields
  consentToContact: z.boolean().refine((val) => val === true, "Consent to contact is required"),
  privacyPolicyAccepted: z.boolean().refine((val) => val === true, "Privacy policy acceptance is required"),
})

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    // Parse and validate request body
    const body = await request.json()

    await logAuditEvent({
      action: "CONTACT_FORM_SUBMISSION",
      resource: "/api/v1/contact",
      method: "POST",
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        email: body.email,
        service_type: body.serviceType,
        has_consent: body.consentToContact,
        privacy_accepted: body.privacyPolicyAccepted,
      },
    })

    // Validate input data
    const validationResult = contactSchema.safeParse(body)

    if (!validationResult.success) {
      await logAuditEvent({
        action: "CONTACT_FORM_VALIDATION_FAILED",
        resource: "/api/v1/contact",
        result: "failure",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        error_message: "Validation failed",
        data: {
          errors: validationResult.error.errors,
          email: body.email,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const contactData = validationResult.data

    // Create contact in Zoho CRM
    const zohoResponse = await zohoCRM.createContact({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      company: contactData.company,
      serviceType: contactData.serviceType,
      message: contactData.message,
      source: contactData.source || "Website Contact Form",
    })

    // Check if contact creation was successful
    const isSuccess = zohoResponse.data && zohoResponse.data[0]?.status === "success"
    const zohoContactId = zohoResponse.data?.[0]?.details?.id

    if (isSuccess) {
      await logAuditEvent({
        action: "CONTACT_CREATED_SUCCESSFULLY",
        resource: "/api/v1/contact",
        result: "success",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        data: {
          email: contactData.email,
          zoho_contact_id: zohoContactId,
          service_type: contactData.serviceType,
          full_name: `${contactData.firstName} ${contactData.lastName}`,
        },
      })

      // Send confirmation email (optional)
      if (process.env.SEND_CONFIRMATION_EMAILS === "true") {
        await sendConfirmationEmail(contactData)
      }

      return NextResponse.json(
        {
          success: true,
          message: "Contact created successfully",
          data: {
            contactId: zohoContactId,
            email: contactData.email,
            name: `${contactData.firstName} ${contactData.lastName}`,
          },
        },
        { status: 201 },
      )
    } else {
      // Handle Zoho CRM errors
      const errorMessage = zohoResponse.data?.[0]?.message || "Failed to create contact"

      await logAuditEvent({
        action: "CONTACT_CREATION_FAILED",
        resource: "/api/v1/contact",
        result: "failure",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        error_message: errorMessage,
        data: {
          email: contactData.email,
          zoho_response: zohoResponse,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create contact",
          message: "We encountered an issue processing your request. Please try again or contact support.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    await logAuditEvent({
      action: "CONTACT_FORM_ERROR",
      resource: "/api/v1/contact",
      result: "error",
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: errorMessage,
    })

    console.error("Contact form submission error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "We encountered an unexpected error. Please try again later.",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    await logAuditEvent({
      action: "CONTACT_API_ACCESS",
      resource: "/api/v1/contact",
      method: "GET",
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
    })

    return NextResponse.json({
      success: true,
      message: "Contact API is operational",
      endpoints: {
        POST: "Submit contact form",
        GET: "API status check",
      },
      validation: {
        required: ["firstName", "lastName", "email", "consentToContact", "privacyPolicyAccepted"],
        optional: ["phone", "company", "serviceType", "message", "source"],
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Service unavailable",
      },
      { status: 503 },
    )
  }
}

async function sendConfirmationEmail(contactData: z.infer<typeof contactSchema>) {
  try {
    // Implementation would send confirmation email
    // Using your preferred email service (SendGrid, AWS SES, etc.)
    console.log(`Would send confirmation email to ${contactData.email}`)

    await logAuditEvent({
      action: "CONFIRMATION_EMAIL_SENT",
      resource: "Email Service",
      result: "success",
      ip_address: "server",
      user_agent: "server",
      timestamp: new Date().toISOString(),
      origin: "server",
      request_id: crypto.randomUUID(),
      data: {
        recipient: contactData.email,
        email_type: "contact_confirmation",
      },
    })
  } catch (error) {
    await logAuditEvent({
      action: "CONFIRMATION_EMAIL_FAILED",
      resource: "Email Service",
      result: "error",
      error_message: error instanceof Error ? error.message : "Unknown error",
      ip_address: "server",
      user_agent: "server",
      timestamp: new Date().toISOString(),
      origin: "server",
      request_id: crypto.randomUUID(),
      data: {
        recipient: contactData.email,
        email_type: "contact_confirmation",
      },
    })
    console.error("Failed to send confirmation email:", error)
  }
}
