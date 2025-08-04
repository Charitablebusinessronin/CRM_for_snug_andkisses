import { type NextRequest, NextResponse } from "next/server"
import { zohoCRM } from "@/lib/zoho-crm-enhanced"
import { getAuditTrail, generateComplianceReport, logAuditEvent } from "@/lib/hipaa-audit-edge"

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const origin = request.headers.get("origin") || "unknown"
  const { searchParams } = new URL(request.url)
  const adminId = searchParams.get("adminId")
  const timeframe = searchParams.get("timeframe") || "30" // days

  try {
    if (!adminId) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin ID is required",
        },
        { status: 401 },
      )
    }

    await logAuditEvent({
      action: "ADMIN_DASHBOARD_ACCESS",
      resource: "/api/v1/admin/dashboard",
      method: "GET",
      user_id: adminId,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
    })

    // Get data from Zoho CRM
    const [contacts, cases] = await Promise.all([zohoCRM.getContacts(), zohoCRM.getCases()])

    // Calculate metrics
    const totalContacts = contacts.data?.length || 0
    const totalCases = cases.data?.length || 0
    const openCases = cases.data?.filter((c: any) => c.Status === "Open").length || 0
    const urgentCases = cases.data?.filter((c: any) => c.Priority === "High").length || 0

    // Get contractors and clients
    const contractors =
      contacts.data?.filter((c: any) => c.Account_Name?.includes("Contractor") || c.Account_Name?.includes("Doula")) ||
      []

    const clients =
      contacts.data?.filter(
        (c: any) => !c.Account_Name?.includes("Contractor") && !c.Account_Name?.includes("Doula"),
      ) || []

    // Recent activity from audit logs
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(timeframe))

    const auditTrail = await getAuditTrail({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
    })

    // Generate compliance report
    const complianceReport = await generateComplianceReport(startDate.toISOString(), new Date().toISOString())

    const dashboardData = {
      metrics: {
        totalContractors: contractors.length,
        totalClients: clients.length,
        totalCases: totalCases,
        openCases: openCases,
        urgentCases: urgentCases,
        monthlyRevenue: 31200, // This would be calculated from billing data
        completionRate: 94,
        clientSatisfaction: 4.8,
      },
      recentActivity: auditTrail.slice(0, 10).map((log) => ({
        id: log.id,
        action: log.action,
        user: log.user_id || "System",
        timestamp: log.timestamp,
        resource: log.resource,
        result: log.result,
      })),
      alerts: [
        ...(urgentCases > 0
          ? [
              {
                type: "urgent",
                message: `${urgentCases} urgent cases need immediate attention`,
                action: "Review Cases",
              },
            ]
          : []),
        ...(openCases > 10
          ? [
              {
                type: "warning",
                message: `${openCases} open cases pending review`,
                action: "Process Cases",
              },
            ]
          : []),
        ...(!complianceReport.integrityStatus.valid
          ? [
              {
                type: "error",
                message: "HIPAA audit integrity issues detected",
                action: "Review Audit Logs",
              },
            ]
          : []),
      ],
      compliance: {
        auditEvents: complianceReport.totalEvents,
        failedEvents: complianceReport.failedEvents,
        integrityStatus: complianceReport.integrityStatus.valid,
        lastAuditCheck: new Date().toISOString(),
      },
      contractors: contractors.slice(0, 5).map((contractor: any) => ({
        id: contractor.id,
        name: `${contractor.First_Name} ${contractor.Last_Name}`,
        email: contractor.Email,
        status: contractor.Status || "Active",
        specialties: contractor.Service_Type || "General Care",
        rating: contractor.Rating || 4.8,
        totalHours: contractor.Total_Hours || 0,
      })),
      clients: clients.slice(0, 5).map((client: any) => ({
        id: client.id,
        name: `${client.First_Name} ${client.Last_Name}`,
        email: client.Email,
        status: client.Status || "Active",
        lastContact: client.Modified_Time,
        serviceType: client.Service_Type || "General",
      })),
    }

    await logAuditEvent({
      action: "ADMIN_DASHBOARD_DATA_RETRIEVED",
      resource: "/api/v1/admin/dashboard",
      result: "success",
      user_id: adminId,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
      data: {
        metrics_retrieved: Object.keys(dashboardData.metrics).length,
        contractors_count: contractors.length,
        clients_count: clients.length,
        audit_events: complianceReport.totalEvents,
      },
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    await logAuditEvent({
      action: "ADMIN_DASHBOARD_ERROR",
      resource: "/api/v1/admin/dashboard",
      result: "error",
      user_id: adminId || "unknown",
      error_message: errorMessage,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      origin,
      request_id: requestId,
    })

    console.error("Admin dashboard error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve dashboard data",
        message: "We encountered an issue loading the dashboard. Please try again later.",
      },
      { status: 500 },
    )
  }
}
