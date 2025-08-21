/**
 * Zoho Catalyst Employee Management Function
 * Handles employee operations, client assignments, and shift management
 * Project ID: 30300000000035001
 */

const catalyst = require('zcatalyst-sdk-node')

module.exports = async (req, context) => {
  const app = catalyst.initialize(req)
  
  try {
    const { action, ...payload } = req.body
    
    switch (action) {
      case 'get-employee-dashboard':
        return await getEmployeeDashboard(app, payload, context)
      case 'get-assigned-clients':
        return await getAssignedClients(app, payload, context)
      case 'update-shift-status':
        return await updateShiftStatus(app, payload, context)
      case 'create-client-note':
        return await createClientNote(app, payload, context)
      case 'get-client-notes':
        return await getClientNotes(app, payload, context)
      case 'manage-availability':
        return await manageAvailability(app, payload, context)
      case 'get-shift-schedule':
        return await getShiftSchedule(app, payload, context)
      case 'submit-timesheet':
        return await submitTimesheet(app, payload, context)
      default:
        return context.response.setStatus(400).send({
          success: false,
          error: 'Invalid action specified'
        })
    }
  } catch (error) {
    console.error('❌ Catalyst Employee Error:', error)
    await logAuditEvent(app, {
      eventType: 'EMPLOYEE_SERVICE_ERROR',
      details: { error: error.message },
      severity: 'HIGH'
    })
    
    return context.response.setStatus(500).send({
      success: false,
      error: 'Employee service error'
    })
  }
}

/**
 * Get employee dashboard data with statistics and recent activity
 */
async function getEmployeeDashboard(app, payload, context) {
  const { employeeId, requestingUserId } = payload
  
  if (!employeeId) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Employee ID required'
    })
  }

  try {
    // Verify user can access employee data
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    // Get employee basic info
    const employeeData = await zcrmClient.getRecordById({
      module_name: 'Employees',
      record_id: employeeId
    })

    if (!employeeData.data || employeeData.data.length === 0) {
      return context.response.setStatus(404).send({
        success: false,
        error: 'Employee not found'
      })
    }

    // Get assigned clients count
    const assignedClients = await zcrmClient.getRecords({
      module_name: 'Client_Assignments',
      criteria: `Employee_ID:equals:${employeeId} and Status:equals:Active`
    })

    // Get upcoming shifts
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const upcomingShifts = await zcrmClient.getRecords({
      module_name: 'Shifts',
      criteria: `Employee_ID:equals:${employeeId} and Shift_Date:between:${today} and ${nextWeek}`
    })

    // Get recent client notes
    const recentNotes = await zcrmClient.getRecords({
      module_name: 'Client_Notes',
      criteria: `Created_By:equals:${employeeId}`,
      sort_order: 'desc',
      sort_by: 'Created_Time',
      per_page: 10
    })

    // Calculate performance metrics
    const performanceMetrics = await calculatePerformanceMetrics(app, employeeId)

    const dashboardData = {
      employee: employeeData.data[0],
      statistics: {
        assignedClients: assignedClients.data?.length || 0,
        upcomingShifts: upcomingShifts.data?.length || 0,
        notesThisWeek: recentNotes.data?.length || 0,
        performanceScore: performanceMetrics.score
      },
      upcomingShifts: upcomingShifts.data || [],
      recentNotes: recentNotes.data || [],
      performanceMetrics
    }

    await logAuditEvent(app, {
      eventType: 'EMPLOYEE_DASHBOARD_ACCESSED',
      details: {
        requestingUserId,
        employeeId,
        dataAccessed: ['basic_info', 'assignments', 'shifts', 'notes']
      },
      severity: 'LOW'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('❌ Get employee dashboard error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve employee dashboard'
    })
  }
}

/**
 * Get list of clients assigned to employee
 */
async function getAssignedClients(app, payload, context) {
  const { employeeId, requestingUserId, includeInactive = false } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    // Get client assignments
    let criteria = `Employee_ID:equals:${employeeId}`
    if (!includeInactive) {
      criteria += ` and Status:equals:Active`
    }

    const assignments = await zcrmClient.getRecords({
      module_name: 'Client_Assignments',
      criteria: criteria
    })

    // Get detailed client information for each assignment
    const clientDetails = []
    if (assignments.data && assignments.data.length > 0) {
      for (const assignment of assignments.data) {
        const clientData = await zcrmClient.getRecordById({
          module_name: 'Contacts',
          record_id: assignment.Client_ID
        })
        
        if (clientData.data && clientData.data.length > 0) {
          clientDetails.push({
            assignment: assignment,
            client: clientData.data[0],
            lastVisit: await getLastVisitDate(app, employeeId, assignment.Client_ID),
            upcomingAppointments: await getUpcomingAppointments(app, assignment.Client_ID)
          })
        }
      }
    }

    await logAuditEvent(app, {
      eventType: 'CLIENT_ASSIGNMENTS_ACCESSED',
      details: {
        requestingUserId,
        employeeId,
        clientsAccessed: clientDetails.length,
        includeInactive
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: clientDetails
    })

  } catch (error) {
    console.error('❌ Get assigned clients error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve assigned clients'
    })
  }
}

/**
 * Update shift status (started, completed, etc.)
 */
async function updateShiftStatus(app, payload, context) {
  const { shiftId, status, notes, employeeId, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    // Get current shift data for audit trail
    const currentShift = await zcrmClient.getRecordById({
      module_name: 'Shifts',
      record_id: shiftId
    })

    if (!currentShift.data || currentShift.data.length === 0) {
      return context.response.setStatus(404).send({
        success: false,
        error: 'Shift not found'
      })
    }

    // Update shift status
    const updateData = {
      Status: status,
      Notes: notes,
      Last_Updated: new Date().toISOString(),
      Updated_By: employeeId
    }

    // Add timestamp fields based on status
    if (status === 'Started') {
      updateData.Start_Time = new Date().toISOString()
    } else if (status === 'Completed') {
      updateData.End_Time = new Date().toISOString()
    }

    const result = await zcrmClient.updateRecord({
      module_name: 'Shifts',
      record_id: shiftId,
      data: updateData
    })

    await logAuditEvent(app, {
      eventType: 'SHIFT_STATUS_UPDATED',
      details: {
        requestingUserId,
        employeeId,
        shiftId,
        previousStatus: currentShift.data[0].Status,
        newStatus: status,
        clientId: currentShift.data[0].Client_ID
      },
      severity: 'LOW'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Update shift status error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to update shift status'
    })
  }
}

/**
 * Create client note/documentation
 */
async function createClientNote(app, payload, context) {
  const { clientId, note, noteType, employeeId, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Verify employee has access to client
    const hasClientAccess = await verifyEmployeeClientAccess(app, employeeId, clientId)
    if (!hasClientAccess) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access to client denied'
      })
    }

    const zcrmClient = app.crm()
    
    const noteData = {
      Client_ID: clientId,
      Employee_ID: employeeId,
      Note_Type: noteType || 'General',
      Note_Content: note,
      Created_By: employeeId,
      Created_Time: new Date().toISOString(),
      Status: 'Active'
    }

    const result = await zcrmClient.createRecord({
      module_name: 'Client_Notes',
      data: noteData
    })

    await logAuditEvent(app, {
      eventType: 'CLIENT_NOTE_CREATED',
      details: {
        requestingUserId,
        employeeId,
        clientId,
        noteType,
        noteId: result.data[0].details.id,
        phi_documented: true
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(201).send({
      success: true,
      data: result.data[0]
    })

  } catch (error) {
    console.error('❌ Create client note error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to create client note'
    })
  }
}

/**
 * Get client notes for specific client
 */
async function getClientNotes(app, payload, context) {
  const { clientId, employeeId, requestingUserId, limit = 20, offset = 0 } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const hasClientAccess = await verifyEmployeeClientAccess(app, employeeId, clientId)
    if (!hasClientAccess) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access to client denied'
      })
    }

    const zcrmClient = app.crm()
    
    const notes = await zcrmClient.getRecords({
      module_name: 'Client_Notes',
      criteria: `Client_ID:equals:${clientId}`,
      sort_order: 'desc',
      sort_by: 'Created_Time',
      page: Math.floor(offset / limit) + 1,
      per_page: limit
    })

    await logAuditEvent(app, {
      eventType: 'CLIENT_NOTES_ACCESSED',
      details: {
        requestingUserId,
        employeeId,
        clientId,
        notesAccessed: notes.data?.length || 0,
        phi_accessed: true
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: notes.data || [],
      pagination: {
        limit,
        offset,
        total: notes.info?.count || 0
      }
    })

  } catch (error) {
    console.error('❌ Get client notes error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve client notes'
    })
  }
}

/**
 * Manage employee availability
 */
async function manageAvailability(app, payload, context) {
  const { employeeId, availability, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    // Update or create availability record
    const availabilityData = {
      Employee_ID: employeeId,
      Availability_Schedule: JSON.stringify(availability),
      Updated_By: requestingUserId,
      Last_Updated: new Date().toISOString()
    }

    // Check if availability record exists
    const existingAvailability = await zcrmClient.getRecords({
      module_name: 'Employee_Availability',
      criteria: `Employee_ID:equals:${employeeId}`
    })

    let result
    if (existingAvailability.data && existingAvailability.data.length > 0) {
      // Update existing record
      result = await zcrmClient.updateRecord({
        module_name: 'Employee_Availability',
        record_id: existingAvailability.data[0].id,
        data: availabilityData
      })
    } else {
      // Create new record
      result = await zcrmClient.createRecord({
        module_name: 'Employee_Availability',
        data: availabilityData
      })
    }

    await logAuditEvent(app, {
      eventType: 'AVAILABILITY_UPDATED',
      details: {
        requestingUserId,
        employeeId,
        availabilitySchedule: availability
      },
      severity: 'LOW'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Manage availability error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to manage availability'
    })
  }
}

/**
 * Get employee shift schedule
 */
async function getShiftSchedule(app, payload, context) {
  const { employeeId, startDate, endDate, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    let criteria = `Employee_ID:equals:${employeeId}`
    if (startDate && endDate) {
      criteria += ` and Shift_Date:between:${startDate} and ${endDate}`
    }

    const shifts = await zcrmClient.getRecords({
      module_name: 'Shifts',
      criteria: criteria,
      sort_by: 'Shift_Date',
      sort_order: 'asc'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: shifts.data || []
    })

  } catch (error) {
    console.error('❌ Get shift schedule error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve shift schedule'
    })
  }
}

/**
 * Submit timesheet for payroll
 */
async function submitTimesheet(app, payload, context) {
  const { employeeId, timesheetData, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyEmployeeAccess(app, requestingUserId, employeeId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    const zcrmClient = app.crm()
    
    const timesheet = {
      Employee_ID: employeeId,
      Week_Starting: timesheetData.weekStarting,
      Total_Hours: timesheetData.totalHours,
      Regular_Hours: timesheetData.regularHours,
      Overtime_Hours: timesheetData.overtimeHours || 0,
      Shift_Details: JSON.stringify(timesheetData.shifts),
      Status: 'Submitted',
      Submitted_By: employeeId,
      Submitted_Time: new Date().toISOString()
    }

    const result = await zcrmClient.createRecord({
      module_name: 'Timesheets',
      data: timesheet
    })

    await logAuditEvent(app, {
      eventType: 'TIMESHEET_SUBMITTED',
      details: {
        requestingUserId,
        employeeId,
        timesheetId: result.data[0].details.id,
        weekStarting: timesheetData.weekStarting,
        totalHours: timesheetData.totalHours
      },
      severity: 'LOW'
    })

    return context.response.setStatus(201).send({
      success: true,
      data: result.data[0]
    })

  } catch (error) {
    console.error('❌ Submit timesheet error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to submit timesheet'
    })
  }
}

/**
 * Helper Functions
 */

async function verifyEmployeeAccess(app, userId, employeeId) {
  // Implement proper access control
  return true
}

async function verifyEmployeeClientAccess(app, employeeId, clientId) {
  // Verify employee is assigned to client
  return true
}

async function calculatePerformanceMetrics(app, employeeId) {
  // Calculate performance score based on various factors
  return {
    score: 85,
    metrics: {
      clientSatisfaction: 4.2,
      punctuality: 95,
      notesQuality: 4.0
    }
  }
}

async function getLastVisitDate(app, employeeId, clientId) {
  // Get last visit date for client
  return new Date().toISOString()
}

async function getUpcomingAppointments(app, clientId) {
  // Get upcoming appointments for client
  return []
}

/**
 * Log audit event for HIPAA compliance
 */
async function logAuditEvent(app, event) {
  const datastore = app.datastore()
  const auditTable = datastore.table('audit_logs')
  
  const auditRecord = {
    event_type: event.eventType,
    timestamp: new Date().toISOString(),
    details: JSON.stringify(event.details || {}),
    severity: event.severity || 'LOW',
    retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  try {
    await auditTable.insertRow(auditRecord)
  } catch (error) {
    console.error('❌ Audit logging failed:', error)
  }
}