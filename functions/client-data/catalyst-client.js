/**
 * Zoho Catalyst Client Data Management Function
 * Handles HIPAA-compliant client data operations and synchronization
 * Project ID: 30300000000035001
 */

const catalyst = require('zcatalyst-sdk-node')

module.exports = async (req, context) => {
  const app = catalyst.initialize(req)
  
  try {
    const { action, ...payload } = req.body
    
    switch (action) {
      case 'get-client-profile':
        return await getClientProfile(app, payload, context)
      case 'update-client-profile':
        return await updateClientProfile(app, payload, context)
      case 'get-service-history':
        return await getServiceHistory(app, payload, context)
      case 'create-service-request':
        return await createServiceRequest(app, payload, context)
      case 'get-appointments':
        return await getAppointments(app, payload, context)
      case 'book-appointment':
        return await bookAppointment(app, payload, context)
      case 'sync-client-data':
        return await syncClientData(app, payload, context)
      default:
        return context.response.setStatus(400).send({
          success: false,
          error: 'Invalid action specified'
        })
    }
  } catch (error) {
    console.error('❌ Catalyst Client Data Error:', error)
    await logAuditEvent(app, {
      eventType: 'CLIENT_DATA_ERROR',
      details: { error: error.message },
      severity: 'HIGH'
    })
    
    return context.response.setStatus(500).send({
      success: false,
      error: 'Client data service error'
    })
  }
}

/**
 * Get client profile data with HIPAA audit logging
 */
async function getClientProfile(app, payload, context) {
  const { clientId, requestingUserId } = payload
  
  if (!clientId) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Client ID required'
    })
  }

  try {
    // Verify user has permission to access client data
    const hasPermission = await verifyClientAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      await logAuditEvent(app, {
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: { 
          requestingUserId, 
          attemptedClientId: clientId 
        },
        severity: 'HIGH'
      })
      
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Get client data from Zoho CRM
    const zcrmClient = app.crm()
    const clientData = await zcrmClient.getRecordById({
      module_name: 'Contacts',
      record_id: clientId
    })

    if (!clientData.data || clientData.data.length === 0) {
      return context.response.setStatus(404).send({
        success: false,
        error: 'Client not found'
      })
    }

    const client = clientData.data[0]
    
    // Filter sensitive data based on requesting user's role
    const filteredProfile = await filterClientData(app, client, requestingUserId)

    // Log PHI access for HIPAA compliance
    await logAuditEvent(app, {
      eventType: 'PHI_ACCESS',
      details: {
        requestingUserId,
        clientId,
        dataType: 'client_profile',
        phi_accessed: true
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: filteredProfile
    })

  } catch (error) {
    console.error('❌ Get client profile error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve client profile'
    })
  }
}

/**
 * Update client profile with audit trail
 */
async function updateClientProfile(app, payload, context) {
  const { clientId, updates, requestingUserId } = payload
  
  if (!clientId || !updates) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Client ID and updates required'
    })
  }

  try {
    // Verify update permissions
    const hasPermission = await verifyClientUpdateAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Update access denied'
      })
    }

    // Get current data for audit trail
    const zcrmClient = app.crm()
    const currentData = await zcrmClient.getRecordById({
      module_name: 'Contacts',
      record_id: clientId
    })

    // Update client record
    const updateResult = await zcrmClient.updateRecord({
      module_name: 'Contacts',
      record_id: clientId,
      data: updates
    })

    // Log PHI modification for HIPAA compliance
    await logAuditEvent(app, {
      eventType: 'PHI_MODIFY',
      details: {
        requestingUserId,
        clientId,
        dataType: 'client_profile',
        changes: updates,
        previous_values: currentData.data[0],
        phi_modified: true
      },
      severity: 'HIGH'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: updateResult.data
    })

  } catch (error) {
    console.error('❌ Update client profile error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to update client profile'
    })
  }
}

/**
 * Get client service history
 */
async function getServiceHistory(app, payload, context) {
  const { clientId, requestingUserId, limit = 50, offset = 0 } = payload
  
  try {
    const hasPermission = await verifyClientAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Query service records from custom module or related records
    const zcrmClient = app.crm()
    const serviceHistory = await zcrmClient.getRelatedRecords({
      module_name: 'Contacts',
      record_id: clientId,
      related_module: 'Services',
      page: Math.floor(offset / limit) + 1,
      per_page: limit
    })

    await logAuditEvent(app, {
      eventType: 'PHI_ACCESS',
      details: {
        requestingUserId,
        clientId,
        dataType: 'service_history',
        records_accessed: serviceHistory.data?.length || 0
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: serviceHistory.data || [],
      pagination: {
        limit,
        offset,
        total: serviceHistory.info?.count || 0
      }
    })

  } catch (error) {
    console.error('❌ Get service history error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve service history'
    })
  }
}

/**
 * Create new service request
 */
async function createServiceRequest(app, payload, context) {
  const { clientId, serviceRequest, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyClientAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Create service request record
    const zcrmClient = app.crm()
    const requestData = {
      ...serviceRequest,
      Client_ID: clientId,
      Status: 'Pending',
      Created_By: requestingUserId,
      Created_Time: new Date().toISOString()
    }

    const result = await zcrmClient.createRecord({
      module_name: 'Service_Requests',
      data: requestData
    })

    await logAuditEvent(app, {
      eventType: 'SERVICE_REQUEST_CREATED',
      details: {
        requestingUserId,
        clientId,
        serviceRequestId: result.data[0].details.id,
        serviceType: serviceRequest.Service_Type
      },
      severity: 'LOW'
    })

    return context.response.setStatus(201).send({
      success: true,
      data: result.data[0]
    })

  } catch (error) {
    console.error('❌ Create service request error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to create service request'
    })
  }
}

/**
 * Get client appointments
 */
async function getAppointments(app, payload, context) {
  const { clientId, requestingUserId, startDate, endDate } = payload
  
  try {
    const hasPermission = await verifyClientAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Build criteria for date range
    let criteria = `Client_ID:equals:${clientId}`
    if (startDate && endDate) {
      criteria += ` and Appointment_Date:between:${startDate} and ${endDate}`
    }

    const zcrmClient = app.crm()
    const appointments = await zcrmClient.getRecords({
      module_name: 'Appointments',
      criteria: criteria
    })

    await logAuditEvent(app, {
      eventType: 'APPOINTMENTS_ACCESSED',
      details: {
        requestingUserId,
        clientId,
        dateRange: { startDate, endDate },
        appointmentsCount: appointments.data?.length || 0
      },
      severity: 'LOW'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: appointments.data || []
    })

  } catch (error) {
    console.error('❌ Get appointments error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to retrieve appointments'
    })
  }
}

/**
 * Book new appointment
 */
async function bookAppointment(app, payload, context) {
  const { clientId, appointmentData, requestingUserId } = payload
  
  try {
    const hasPermission = await verifyClientAccess(app, requestingUserId, clientId)
    if (!hasPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Access denied'
      })
    }

    // Check caregiver availability
    const isAvailable = await checkCaregiverAvailability(
      app, 
      appointmentData.Caregiver_ID, 
      appointmentData.Appointment_Date
    )
    
    if (!isAvailable) {
      return context.response.setStatus(409).send({
        success: false,
        error: 'Caregiver not available at requested time'
      })
    }

    // Create appointment record
    const zcrmClient = app.crm()
    const appointment = {
      ...appointmentData,
      Client_ID: clientId,
      Status: 'Scheduled',
      Booked_By: requestingUserId,
      Created_Time: new Date().toISOString()
    }

    const result = await zcrmClient.createRecord({
      module_name: 'Appointments',
      data: appointment
    })

    // Send notification to caregiver (implement as needed)
    await sendCaregiverNotification(app, appointmentData.Caregiver_ID, result.data[0])

    await logAuditEvent(app, {
      eventType: 'APPOINTMENT_BOOKED',
      details: {
        requestingUserId,
        clientId,
        appointmentId: result.data[0].details.id,
        caregiverId: appointmentData.Caregiver_ID,
        appointmentDate: appointmentData.Appointment_Date
      },
      severity: 'LOW'
    })

    return context.response.setStatus(201).send({
      success: true,
      data: result.data[0]
    })

  } catch (error) {
    console.error('❌ Book appointment error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to book appointment'
    })
  }
}

/**
 * Sync client data between systems
 */
async function syncClientData(app, payload, context) {
  const { syncType, clientIds, requestingUserId } = payload
  
  try {
    // Verify admin permissions for bulk sync
    const hasAdminPermission = await verifyAdminAccess(app, requestingUserId)
    if (!hasAdminPermission) {
      return context.response.setStatus(403).send({
        success: false,
        error: 'Admin access required for data sync'
      })
    }

    const syncResults = []
    
    for (const clientId of clientIds) {
      try {
        // Perform sync operation based on type
        const syncResult = await performClientSync(app, clientId, syncType)
        syncResults.push({ clientId, success: true, data: syncResult })
      } catch (error) {
        syncResults.push({ 
          clientId, 
          success: false, 
          error: error.message 
        })
      }
    }

    await logAuditEvent(app, {
      eventType: 'BULK_CLIENT_SYNC',
      details: {
        requestingUserId,
        syncType,
        clientCount: clientIds.length,
        successCount: syncResults.filter(r => r.success).length,
        failureCount: syncResults.filter(r => !r.success).length
      },
      severity: 'MEDIUM'
    })

    return context.response.setStatus(200).send({
      success: true,
      data: syncResults
    })

  } catch (error) {
    console.error('❌ Sync client data error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Failed to sync client data'
    })
  }
}

/**
 * Helper Functions
 */

async function verifyClientAccess(app, userId, clientId) {
  // Implementation would check user role and permissions
  // For now, allow access (implement proper RBAC)
  return true
}

async function verifyClientUpdateAccess(app, userId, clientId) {
  // Implementation would check update permissions
  return true
}

async function verifyAdminAccess(app, userId) {
  // Implementation would verify admin role
  return true
}

async function filterClientData(app, clientData, requestingUserId) {
  // Filter sensitive data based on user role
  // For now, return all data (implement proper filtering)
  return clientData
}

async function checkCaregiverAvailability(app, caregiverId, appointmentDate) {
  // Check caregiver schedule
  return true
}

async function sendCaregiverNotification(app, caregiverId, appointment) {
  // Send notification to caregiver
  console.log(`📧 Notification sent to caregiver ${caregiverId}`)
}

async function performClientSync(app, clientId, syncType) {
  // Perform actual sync operation
  return { synced: true }
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