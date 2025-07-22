import { type NextRequest, NextResponse } from "next/server"
import { zohoCRM } from "@/lib/zoho-crm-enhanced"
import { logAuditEvent } from "@/lib/hipaa-audit"
import { URL } from "url"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const dataType = searchParams.get("type") // 'cases', 'contacts', 'hours'

  try {
    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee ID is required",
        },
        { status: 400 },
      )
    }

    await logAuditEvent({
      action: "EMPLOYEE_DATA_REQUEST",
      resource: "/api/v1/employee/data",
      method: "GET",
      user_id: employeeId,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: { data_type: dataType },
    })

    let responseData: any = {}

    switch (dataType) {
      case "cases":
        // Get employee's service requests (cases)
        const cases = await zohoCRM.getCases()
        const employeeCases =
          cases.data?.filter(
            (caseData: any) =>
              caseData.Description?.includes(employeeId) || caseData.Contact_Name?.Email === searchParams.get("email"),
          ) || []

        responseData = {
          cases: employeeCases.map((caseData: any) => ({
            id: caseData.id,
            subject: caseData.Subject,
            status: caseData.Status,
            priority: caseData.Priority,
            createdTime: caseData.Created_Time,
            description: caseData.Description,
            serviceType: caseData.Service_Type,
          })),
        }
        break

      case "contacts":
        // Get available doulas/contractors
        const contacts = await zohoCRM.getContacts()
        const doulas =
          contacts.data?.filter(
            (contact: any) => contact.Account_Name?.includes("Contractor") || contact.Account_Name?.includes("Doula"),
          ) || []

        responseData = {
          doulas: doulas.map((contact: any) => ({
            id: contact.id,
            name: `${contact.First_Name} ${contact.Last_Name}`,
            email: contact.Email,
            phone: contact.Phone,
            specialties: contact.Service_Type || "General Care",
            rating: contact.Rating || 4.8,
            availability: contact.Availability || "Available",
          })),
        }
        break

      case "hours":
        // Get employee's available hours (would be stored in custom fields)
        responseData = {
          availableHours: 40, // This would come from Zoho custom fields
          usedHours: 16,
          remainingHours: 24,
          monthlyAllocation: 40,
          lastUpdated: new Date().toISOString(),
        }
        break

      default:
        // Get all employee data
        const [allCases, allContacts] = await Promise.all([zohoCRM.getCases(), zohoCRM.getContacts()])

        const userCases = allCases.data?.filter((caseData: any) => caseData.Description?.includes(employeeId)) || []

        const availableDoulas =
          allContacts.data?.filter((contact: any) => contact.Account_Name?.includes("Contractor")) || []

        responseData = {
          summary: {
            totalCases: userCases.length,
            activeCases: userCases.filter((c: any) => c.Status === "Open").length,
            availableDoulas: availableDoulas.length,
            availableHours: 24,
          },
          recentCases: userCases.slice(0, 5),
          availableDoulas: availableDoulas.slice(0, 10),
        }
    }

    await logAuditEvent({
      action: "EMPLOYEE_DATA_RETRIEVED",
      resource: "/api/v1/employee/data",
      result: "success",
      user_id: employeeId,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        data_type: dataType,
        records_returned: Array.isArray(responseData.cases)
          ? responseData.cases.length
          : Array.isArray(responseData.doulas)
            ? responseData.doulas.length
            : 1,
      },
    })

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const employeeId = searchParams.get("employeeId") || "unknown"

    await logAuditEvent({
      action: "EMPLOYEE_DATA_ERROR",
      resource: "/api/v1/employee/data",
      result: "error",
      user_id: employeeId,
      error_message: errorMessage,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
    })

    console.error("Employee data retrieval error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve employee data",
        message: "We encountered an issue retrieving your data. Please try again later.",
      },
      { status: 500 },
    )
  }
}
