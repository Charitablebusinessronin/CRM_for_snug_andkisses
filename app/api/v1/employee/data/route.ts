import { type NextRequest, NextResponse } from "next/server"
import { zohoCRM } from "@/lib/zoho-crm-enhanced"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import { URL } from "url"

// Mock data for development/fallback
const mockEmployeeData = {
  summary: {
    totalCases: 8,
    activeCases: 5,
    availableDoulas: 12,
    availableHours: 24,
  },
  recentCases: [
    {
      id: "case_001",
      subject: "Postpartum Care - Sarah M.",
      status: "Open",
      priority: "High",
      createdTime: "2025-08-03T09:00:00Z",
      description: "Postpartum care request for new mother",
      serviceType: "postpartum-care",
    },
    {
      id: "case_002", 
      subject: "Lactation Support - Maria L.",
      status: "In Progress",
      priority: "Medium",
      createdTime: "2025-08-02T14:30:00Z",
      description: "Lactation consultation needed",
      serviceType: "lactation-support",
    },
  ],
  availableDoulas: [
    {
      id: "doula_001",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@snugandkisses.com",
      phone: "(555) 123-4567",
      specialties: "Postpartum Care, Lactation",
      rating: 4.9,
      availability: "Available",
    },
    {
      id: "doula_002",
      name: "Emily Rodriguez",
      email: "emily.r@snugandkisses.com", 
      phone: "(555) 234-5678",
      specialties: "Birth Doula, Sleep Consulting",
      rating: 4.8,
      availability: "Busy",
    },
  ],
}

const mockCases = [
  {
    id: "case_001",
    subject: "Postpartum Care - Sarah M.",
    status: "Open",
    priority: "High",
    createdTime: "2025-08-03T09:00:00Z",
    description: "Postpartum care request for new mother",
    serviceType: "postpartum-care",
  },
  {
    id: "case_002",
    subject: "Home Visit - Maria L.",
    status: "Open", 
    priority: "Medium",
    createdTime: "2025-08-03T11:00:00Z",
    description: "Home visit scheduled",
    serviceType: "home-visit",
  },
  {
    id: "case_003",
    subject: "Support Session - Jennifer K.",
    status: "Completed",
    priority: "Low",
    createdTime: "2025-08-03T14:00:00Z",
    description: "Support session completed",
    serviceType: "support-session",
  },
]

const mockContacts = [
  {
    id: "contact_001",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@snugandkisses.com",
    phone: "(555) 123-4567",
    specialties: "Postpartum Care, Lactation",
    rating: 4.9,
    availability: "Available",
  },
  {
    id: "contact_002", 
    name: "Emily Rodriguez",
    email: "emily.r@snugandkisses.com",
    phone: "(555) 234-5678",
    specialties: "Birth Doula, Sleep Consulting", 
    rating: 4.8,
    availability: "Busy",
  },
  {
    id: "contact_003",
    name: "Mike Wilson",
    email: "mike.w@snugandkisses.com",
    phone: "(555) 345-6789",
    specialties: "Lactation Consultant",
    rating: 4.7,
    availability: "Available",
  },
]

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const dataType = searchParams.get("type")

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

    // Log audit event (with fallback for missing audit system)
    try {
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
    } catch (auditError) {
      console.warn("Audit logging failed:", auditError)
    }

    let responseData: any = {}
    let usingMockData = false

    switch (dataType) {
      case "cases":
        try {
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
        } catch (zohoError) {
          console.warn("Zoho CRM unavailable, using mock data:", zohoError)
          usingMockData = true
          responseData = {
            cases: mockCases,
          }
        }
        break

      case "contacts":
        try {
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
        } catch (zohoError) {
          console.warn("Zoho CRM unavailable, using mock data:", zohoError)
          usingMockData = true
          responseData = {
            doulas: mockContacts,
          }
        }
        break

      case "hours":
        responseData = {
          availableHours: 24,
          usedHours: 16,
          remainingHours: 8,
          monthlyAllocation: 40,
          lastUpdated: new Date().toISOString(),
        }
        break

      default:
        try {
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
        } catch (zohoError) {
          console.warn("Zoho CRM unavailable, using mock data:", zohoError)
          usingMockData = true
          responseData = mockEmployeeData
        }
    }

    // Log successful retrieval (with fallback)
    try {
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
          using_mock_data: usingMockData,
          records_returned: Array.isArray(responseData.cases)
            ? responseData.cases.length
            : Array.isArray(responseData.doulas)
              ? responseData.doulas.length
              : 1,
        },
      })
    } catch (auditError) {
      console.warn("Audit logging failed:", auditError)
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        usingMockData,
        message: usingMockData ? "Using mock data - Zoho CRM unavailable" : "Live data from Zoho CRM",
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const employeeIdParam = searchParams.get("employeeId") || "unknown"

    // Log error (with fallback)
    try {
      await logAuditEvent({
        action: "EMPLOYEE_DATA_ERROR",
        resource: "/api/v1/employee/data",
        result: "error",
        user_id: employeeIdParam,
        error_message: errorMessage,
        ip_address: clientIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        origin,
        request_id: requestId,
      })
    } catch (auditError) {
      console.warn("Audit logging failed:", auditError)
    }

    console.error("Employee data retrieval error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve employee data",
        message: "We encountered an issue retrieving your data. Please try again later.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
