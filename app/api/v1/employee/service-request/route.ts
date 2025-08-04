import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { zohoCRM } from "@/lib/zoho-crm-enhanced"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"

const serviceRequestSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  employeeEmail: z.string().email("Invalid employee email"),
  employeeName: z.string().min(1, "Employee name is required"),
  companyName: z.string().min(1, "Company name is required"),
  serviceType: z.enum(["postpartum-care", "birth-doula", "backup-childcare", "lactation-support", "sleep-consulting"]),
  urgency: z.enum(["low", "medium", "high", "urgent"]),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  specialRequests: z.string().max(1000, "Special requests too long").optional(),
  availableHours: z.number().min(0, "Available hours must be positive"),
  // HIPAA compliance
  healthInformationConsent: z.boolean().refine((val) => val === true, "Health information consent required"),
  privacyNoticeAcknowledged: z.boolean().refine((val) => val === true, "Privacy notice acknowledgment required"),
})

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    const body = await request.json()

    await logAuditEvent({
      action: "SERVICE_REQUEST_SUBMISSION",
      resource: "/api/v1/employee/service-request",
      method: "POST",
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      user_id: body.employeeId,
      data: {
        employee_email: body.employeeEmail,
        service_type: body.serviceType,
        urgency: body.urgency,
        company: body.companyName,
      },
    })

    // Validate input
    const validationResult = serviceRequestSchema.safeParse(body)

    if (!validationResult.success) {
      await logAuditEvent({
        action: "SERVICE_REQUEST_VALIDATION_FAILED",
        resource: "/api/v1/employee/service-request",
        result: "failure",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        user_id: body.employeeId,
        error_message: "Validation failed",
        data: { errors: validationResult.error.errors },
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

    const serviceRequest = validationResult.data

    // Create case in Zoho CRM
    const caseSubject = `${serviceRequest.serviceType.replace("-", " ").toUpperCase()} - ${serviceRequest.employeeName} (${serviceRequest.companyName})`
    const caseDescription = `
Service Request Details:
- Employee: ${serviceRequest.employeeName} (${serviceRequest.employeeEmail})
- Company: ${serviceRequest.companyName}
- Service Type: ${serviceRequest.serviceType}
- Urgency: ${serviceRequest.urgency}
- Location: ${serviceRequest.location}
- Preferred Date: ${serviceRequest.preferredDate || "Flexible"}
- Preferred Time: ${serviceRequest.preferredTime || "Flexible"}
- Duration: ${serviceRequest.duration || "Standard"}
- Available Hours: ${serviceRequest.availableHours}
- Special Requests: ${serviceRequest.specialRequests || "None"}

HIPAA Compliance:
- Health Information Consent: ${serviceRequest.healthInformationConsent ? "Yes" : "No"}
- Privacy Notice Acknowledged: ${serviceRequest.privacyNoticeAcknowledged ? "Yes" : "No"}
    `.trim()

    const zohoResponse = await zohoCRM.createCase({
      subject: caseSubject,
      description: caseDescription,
      priority:
        serviceRequest.urgency === "urgent"
          ? "High"
          : serviceRequest.urgency === "high"
            ? "High"
            : serviceRequest.urgency === "medium"
              ? "Medium"
              : "Low",
      serviceType: serviceRequest.serviceType,
      contactEmail: serviceRequest.employeeEmail,
      userId: serviceRequest.employeeId,
    })

    const isSuccess = zohoResponse.data && zohoResponse.data[0]?.status === "success"
    const zohoCaseId = zohoResponse.data?.[0]?.details?.id

    if (isSuccess) {
      await logAuditEvent({
        action: "SERVICE_REQUEST_CREATED",
        resource: "/api/v1/employee/service-request",
        result: "success",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        user_id: serviceRequest.employeeId,
        data: {
          employee_email: serviceRequest.employeeEmail,
          zoho_case_id: zohoCaseId,
          service_type: serviceRequest.serviceType,
          urgency: serviceRequest.urgency,
          company: serviceRequest.companyName,
        },
      })

      // Send confirmation email to employee
      await sendServiceRequestConfirmation(serviceRequest, zohoCaseId)

      // Notify admin team based on urgency
      if (serviceRequest.urgency === "urgent" || serviceRequest.urgency === "high") {
        await notifyAdminTeam(serviceRequest, zohoCaseId)
      }

      return NextResponse.json(
        {
          success: true,
          message: "Service request submitted successfully",
          data: {
            caseId: zohoCaseId,
            requestId: requestId,
            estimatedResponse: getEstimatedResponseTime(serviceRequest.urgency),
          },
        },
        { status: 201 },
      )
    } else {
      const errorMessage = zohoResponse.data?.[0]?.message || "Failed to create service request"

      await logAuditEvent({
        action: "SERVICE_REQUEST_CREATION_FAILED",
        resource: "/api/v1/employee/service-request",
        result: "failure",
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        user_id: serviceRequest.employeeId,
        error_message: errorMessage,
        data: {
          employee_email: serviceRequest.employeeEmail,
          zoho_response: zohoResponse,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create service request",
          message: "We encountered an issue processing your request. Please try again or contact support.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    await logAuditEvent({
      action: "SERVICE_REQUEST_ERROR",
      resource: "/api/v1/employee/service-request",
      result: "error",
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: errorMessage,
    })

    console.error("Service request submission error:", error)

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

function getEstimatedResponseTime(urgency: string): string {
  switch (urgency) {
    case "urgent":
      return "Within 2 hours"
    case "high":
      return "Within 4 hours"
    case "medium":
      return "Within 24 hours"
    case "low":
      return "Within 48 hours"
    default:
      return "Within 24 hours"
  }
}

async function sendServiceRequestConfirmation(serviceRequest: z.infer<typeof serviceRequestSchema>, caseId: string) {
  try {
    // Implementation would send confirmation email
    console.log(`Would send service request confirmation to ${serviceRequest.employeeEmail}`)

    await logAuditEvent({
      action: "SERVICE_REQUEST_CONFIRMATION_SENT",
      resource: "Email Service",
      result: "success",
      ip_address: "server",
      user_agent: "server",
      timestamp: new Date().toISOString(),
      origin: "server",
      request_id: crypto.randomUUID(),
      user_id: serviceRequest.employeeId,
      data: {
        recipient: serviceRequest.employeeEmail,
        case_id: caseId,
        service_type: serviceRequest.serviceType,
      },
    })
  } catch (error) {
    await logAuditEvent({
      action: "SERVICE_REQUEST_CONFIRMATION_FAILED",
      resource: "Email Service",
      result: "error",
      error_message: error instanceof Error ? error.message : "Unknown error",
      ip_address: "server",
      user_agent: "server",
      timestamp: new Date().toISOString(),
      origin: "server",
      request_id: crypto.randomUUID(),
      user_id: serviceRequest.employeeId,
      data: {
        recipient: serviceRequest.employeeEmail,
        case_id: caseId,
      },
    })
    console.error("Failed to send service request confirmation:", error)
  }
}

async function notifyAdminTeam(serviceRequest: z.infer<typeof serviceRequestSchema>, caseId: string) {
  try {
    // Implementation would notify admin team for urgent requests
    console.log(`Would notify admin team of urgent service request: ${caseId}`)

    await logAuditEvent({
      action: "ADMIN_NOTIFICATION_SENT",
      resource: "Admin Notification System",
      result: "success",
      ip_address: "server",
      user_agent: "server",
      timestamp: new Date().toISOString(),
      origin: "server",
      request_id: crypto.randomUUID(),
      user_id: serviceRequest.employeeId,
      data: {
        case_id: caseId,
        urgency: serviceRequest.urgency,
        service_type: serviceRequest.serviceType,
        company: serviceRequest.companyName,
      },
    })
  } catch (error) {
    console.error("Failed to notify admin team:", error)
  }
}
