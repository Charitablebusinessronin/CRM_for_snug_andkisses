const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "GET":
      return handleGetSchedule(catalystApp, req, res)
    case "POST":
      return handleCreateAppointment(catalystApp, req, res)
    case "PUT":
      return handleUpdateAppointment(catalystApp, req, res)
    case "DELETE":
      return handleDeleteAppointment(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleGetSchedule(catalystApp, req, res) {
  try {
    const { user_id, user_type, start_date, end_date } = req.query

    const datastore = catalystApp.datastore()
    const table = datastore.table("Appointments")

    const filter = {}

    if (user_type === "contractor") {
      filter.contractor_id = user_id
    } else if (user_type === "client") {
      filter.client_id = user_id
    }

    if (start_date && end_date) {
      filter.date = {
        $gte: start_date,
        $lte: end_date,
      }
    }

    const appointments = await table.getRows({ filter })

    // Format for calendar display
    const formattedAppointments = appointments.map((apt) => ({
      id: apt.ROWID,
      title: `${apt.service_type} - ${apt.client_name}`,
      start: `${apt.date}T${apt.start_time}`,
      end: `${apt.date}T${apt.end_time}`,
      status: apt.status,
      contractor_id: apt.contractor_id,
      client_id: apt.client_id,
      location: apt.location,
      notes: apt.notes,
    }))

    res.status(200).json(formattedAppointments)
  } catch (error) {
    console.error("Get schedule error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleCreateAppointment(catalystApp, req, res) {
  try {
    const appointmentData = {
      ...req.body,
      status: "scheduled",
      created_at: new Date().toISOString(),
      created_by: req.user?.id,
    }

    // Check for conflicts
    const hasConflict = await checkScheduleConflict(catalystApp, appointmentData)
    if (hasConflict) {
      return res.status(409).json({ error: "Schedule conflict detected" })
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Appointments")

    const newAppointment = await table.insertRow(appointmentData)

    // Send confirmation emails
    await sendAppointmentConfirmation(catalystApp, newAppointment)

    // Create calendar events
    await createCalendarEvents(catalystApp, newAppointment)

    // Log audit event
    await logAuditEvent(catalystApp, {
      user_id: req.user?.id,
      action: "CREATE_APPOINTMENT",
      details: `Created appointment for ${appointmentData.date} ${appointmentData.start_time}`,
      resource_id: newAppointment.ROWID,
    })

    res.status(201).json(newAppointment)
  } catch (error) {
    console.error("Create appointment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleUpdateAppointment(catalystApp, req, res) {
  try {
    const appointmentId = req.url.split("/").pop()
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Appointments")

    // Get existing appointment
    const existingAppointment = await table.getRow(appointmentId)

    if (!existingAppointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    // Check for conflicts if time/date changed
    if (updateData.date || updateData.start_time || updateData.end_time) {
      const hasConflict = await checkScheduleConflict(
        catalystApp,
        {
          ...existingAppointment,
          ...updateData,
        },
        appointmentId,
      )

      if (hasConflict) {
        return res.status(409).json({ error: "Schedule conflict detected" })
      }
    }

    const updatedAppointment = await table.updateRow({
      ROWID: appointmentId,
      ...updateData,
    })

    // Send update notifications
    await sendAppointmentUpdate(catalystApp, updatedAppointment, existingAppointment)

    res.status(200).json(updatedAppointment)
  } catch (error) {
    console.error("Update appointment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleDeleteAppointment(catalystApp, req, res) {
  try {
    const appointmentId = req.url.split("/").pop()

    const datastore = catalystApp.datastore()
    const table = datastore.table("Appointments")

    // Get appointment before deletion
    const appointment = await table.getRow(appointmentId)

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    // Soft delete - mark as cancelled
    const cancelledAppointment = await table.updateRow({
      ROWID: appointmentId,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: req.user?.id,
    })

    // Send cancellation notifications
    await sendAppointmentCancellation(catalystApp, cancelledAppointment)

    res.status(200).json({ message: "Appointment cancelled successfully" })
  } catch (error) {
    console.error("Delete appointment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function checkScheduleConflict(catalystApp, appointmentData, excludeId = null) {
  try {
    const datastore = catalystApp.datastore()
    const table = datastore.table("Appointments")

    // Check contractor availability
    const contractorConflicts = await table.getRows({
      filter: {
        contractor_id: appointmentData.contractor_id,
        date: appointmentData.date,
        status: { $ne: "cancelled" },
      },
    })

    for (const conflict of contractorConflicts) {
      if (excludeId && conflict.ROWID === excludeId) continue

      if (timeOverlap(appointmentData.start_time, appointmentData.end_time, conflict.start_time, conflict.end_time)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Check schedule conflict error:", error)
    return false
  }
}

function timeOverlap(start1, end1, start2, end2) {
  const s1 = new Date(`2000-01-01T${start1}`)
  const e1 = new Date(`2000-01-01T${end1}`)
  const s2 = new Date(`2000-01-01T${start2}`)
  const e2 = new Date(`2000-01-01T${end2}`)

  return s1 < e2 && s2 < e1
}

async function sendAppointmentConfirmation(catalystApp, appointment) {
  try {
    const datastore = catalystApp.datastore()
    const contractorsTable = datastore.table("Contractors")
    const clientsTable = datastore.table("Clients")

    const contractor = await contractorsTable.getRow(appointment.contractor_id)
    const client = await clientsTable.getRow(appointment.client_id)

    const mailService = catalystApp.email()

    // Email to contractor
    if (contractor) {
      await mailService.sendMail({
        to: contractor.email,
        from: "noreply@snugandkisses.com",
        subject: "New Appointment Scheduled",
        html: `
                    <h3>New Appointment Scheduled</h3>
                    <p><strong>Client:</strong> ${client?.name || "Anonymous"}</p>
                    <p><strong>Date:</strong> ${appointment.date}</p>
                    <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
                    <p><strong>Location:</strong> ${appointment.location}</p>
                    <p><strong>Service:</strong> ${appointment.service_type}</p>
                    <p><strong>Notes:</strong> ${appointment.notes || "None"}</p>
                `,
      })
    }

    // Email to client
    if (client) {
      await mailService.sendMail({
        to: client.email,
        from: "noreply@snugandkisses.com",
        subject: "Appointment Confirmation",
        html: `
                    <h3>Appointment Confirmed</h3>
                    <p><strong>Doula:</strong> ${contractor?.name}</p>
                    <p><strong>Date:</strong> ${appointment.date}</p>
                    <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
                    <p><strong>Location:</strong> ${appointment.location}</p>
                    <p><strong>Service:</strong> ${appointment.service_type}</p>
                    <p>We look forward to supporting you!</p>
                `,
      })
    }
  } catch (error) {
    console.error("Send appointment confirmation error:", error)
  }
}

async function sendAppointmentUpdate(catalystApp, updatedAppointment, originalAppointment) {
  try {
    // Implementation would send update notifications
    // Similar to confirmation but highlighting changes
  } catch (error) {
    console.error("Send appointment update error:", error)
  }
}

async function sendAppointmentCancellation(catalystApp, appointment) {
  try {
    // Implementation would send cancellation notifications
  } catch (error) {
    console.error("Send appointment cancellation error:", error)
  }
}

async function createCalendarEvents(catalystApp, appointment) {
  try {
    // Implementation would create calendar events
    // Could integrate with Google Calendar, Outlook, etc.
  } catch (error) {
    console.error("Create calendar events error:", error)
  }
}

async function logAuditEvent(catalystApp, eventData) {
  try {
    const datastore = catalystApp.datastore()
    const auditTable = datastore.table("AuditLogs")

    await auditTable.insertRow({
      ...eventData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Audit logging error:", error)
  }
}
