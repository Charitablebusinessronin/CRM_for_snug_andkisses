/**
 * Shift Notes API Endpoint
 * HIPAA-compliant shift note submission and retrieval
 * Integrates with Zoho Catalyst backend
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { verifyAuthToken } from "@/lib/auth-middleware"

// Shift Note validation schema
const shiftNoteSchema = z.object({
  client: z.string().min(1, "Client is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  totalHours: z.string().min(1, "Total hours is required"),
  activities: z.array(z.string()).min(1, "At least one activity is required"),
  notes: z.string().min(10, "Detailed notes are required (minimum 10 characters)"),
  signature: z.string().optional(),
  // HIPAA compliance
  hipaaCompliant: z.boolean().refine((val) => val === true, "HIPAA compliance acknowledgment required"),
})

/**
 * GET /api/v1/shift-notes
 * Retrieve shift notes for authenticated user
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const contractorId = searchParams.get("contractor_id") || authResult.userId
    const status = searchParams.get("status")

    // Log audit event
    await logAuditEvent({
      action: "SHIFT_NOTES_ACCESS",
      resource: "/api/v1/shift-notes",
      method: "GET",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      user_id: authResult.userId,
      data: { contractor_id: contractorId, status }
    })

    // Call Catalyst function
    const catalystResponse = await fetch(
      `${process.env.CATALYST_FUNCTION_URL}/shift-notes?contractor_id=${contractorId}&status=${status || ''}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.CATALYST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!catalystResponse.ok) {
      throw new Error(`Catalyst API error: ${catalystResponse.status}`)
    }

    const shiftNotes = await catalystResponse.json()

    return NextResponse.json({
      success: true,
      data: shiftNotes,
      requestId
    })

  } catch (error) {
    console.error("Get shift notes error:", error)
    
    await logAuditEvent({
      action: "SHIFT_NOTES_ACCESS_ERROR",
      resource: "/api/v1/shift-notes",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return NextResponse.json(
      { success: false, error: "Failed to retrieve shift notes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/shift-notes
 * Submit new shift note with HIPAA compliance
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"

  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request)
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate shift note data
    const validationResult = shiftNoteSchema.safeParse(body)
    if (!validationResult.success) {
      await logAuditEvent({
        action: "SHIFT_NOTE_VALIDATION_FAILED",
        resource: "/api/v1/shift-notes",
        result: "failure",
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
        user_id: authResult.userId,
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

    const shiftNoteData = validationResult.data

    // Prepare data for Catalyst function
    const catalystPayload = {
      contractor_id: authResult.userId,
      contractor_name: authResult.userName || "Unknown",
      client_name: shiftNoteData.client,
      shift_date: shiftNoteData.date,
      start_time: shiftNoteData.startTime,
      end_time: shiftNoteData.endTime,
      hours: parseFloat(shiftNoteData.totalHours),
      activities: shiftNoteData.activities,
      notes: shiftNoteData.notes,
      signature_data: shiftNoteData.signature,
      status: "submitted",
      created_at: new Date().toISOString(),
      hipaa_compliant: shiftNoteData.hipaaCompliant
    }

    // Log HIPAA audit event
    await logAuditEvent({
      action: "SHIFT_NOTE_SUBMISSION",
      resource: "/api/v1/shift-notes",
      method: "POST",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      user_id: authResult.userId,
      data: {
        client: shiftNoteData.client,
        date: shiftNoteData.date,
        hours: shiftNoteData.totalHours,
        activities_count: shiftNoteData.activities.length,
        hipaa_compliant: shiftNoteData.hipaaCompliant
      }
    })

    // Submit to Catalyst function
    const catalystResponse = await fetch(`${process.env.CATALYST_FUNCTION_URL}/shift-notes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CATALYST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(catalystPayload),
    })

    if (!catalystResponse.ok) {
      throw new Error(`Catalyst API error: ${catalystResponse.status}`)
    }

    const result = await catalystResponse.json()

    // Log successful submission
    await logAuditEvent({
      action: "SHIFT_NOTE_SUBMITTED",
      resource: "/api/v1/shift-notes",
      result: "success",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      user_id: authResult.userId,
      data: {
        shift_note_id: result.ROWID,
        client: shiftNoteData.client,
        hours: shiftNoteData.totalHours
      }
    })

    return NextResponse.json({
      success: true,
      message: "Shift note submitted successfully",
      data: {
        id: result.ROWID,
        status: "submitted",
        submittedAt: new Date().toISOString()
      },
      requestId
    })

  } catch (error) {
    console.error("Submit shift note error:", error)
    
    await logAuditEvent({
      action: "SHIFT_NOTE_SUBMISSION_ERROR",
      resource: "/api/v1/shift-notes",
      result: "error",
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      error_message: error instanceof Error ? error.message : "Unknown error"
    })

    return NextResponse.json(
      { success: false, error: "Failed to submit shift note" },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}