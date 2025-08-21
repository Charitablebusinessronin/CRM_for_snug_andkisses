const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "GET":
      return handleGetShiftNotes(catalystApp, req, res)
    case "POST":
      return handleCreateShiftNote(catalystApp, req, res)
    case "PUT":
      return handleUpdateShiftNote(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleGetShiftNotes(catalystApp, req, res) {
  try {
    const { contractor_id, client_id, status } = req.query

    const datastore = catalystApp.datastore()
    const table = datastore.table("ShiftNotes")

    const filter = {}
    if (contractor_id) filter.contractor_id = contractor_id
    if (client_id) filter.client_id = client_id
    if (status) filter.status = status

    const shiftNotes = await table.getRows({ filter })

    // Filter based on user permissions
    const filteredNotes = await filterShiftNotesByPermissions(req.user, shiftNotes)

    res.status(200).json(filteredNotes)
  } catch (error) {
    console.error("Get shift notes error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleCreateShiftNote(catalystApp, req, res) {
  try {
    const shiftNoteData = {
      ...req.body,
      status: "submitted",
      created_at: new Date().toISOString(),
      submitted_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("ShiftNotes")

    const newShiftNote = await table.insertRow(shiftNoteData)

    // Send notification to admin/supervisor
    await sendShiftNoteNotification(catalystApp, newShiftNote)

    // Update contractor hours
    await updateContractorHours(catalystApp, shiftNoteData.contractor_id, shiftNoteData.hours)

    // Log audit event
    await logAuditEvent(catalystApp, {
      user_id: req.user?.id,
      action: "CREATE_SHIFT_NOTE",
      details: `Submitted shift note for ${shiftNoteData.hours} hours`,
      resource_id: newShiftNote.ROWID,
    })

    res.status(201).json(newShiftNote)
  } catch (error) {
    console.error("Create shift note error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleUpdateShiftNote(catalystApp, req, res) {
  try {
    const shiftNoteId = req.url.split("/").pop()
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("ShiftNotes")

    // Get existing shift note
    const existingNote = await table.getRow(shiftNoteId)

    if (!existingNote) {
      return res.status(404).json({ error: "Shift note not found" })
    }

    // Check permissions
    if (!(await hasShiftNoteAccess(req.user, existingNote))) {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedShiftNote = await table.updateRow({
      ROWID: shiftNoteId,
      ...updateData,
    })

    // If status changed to approved, update billing
    if (updateData.status === "approved" && existingNote.status !== "approved") {
      await processApprovedShiftNote(catalystApp, updatedShiftNote)
    }

    res.status(200).json(updatedShiftNote)
  } catch (error) {
    console.error("Update shift note error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function filterShiftNotesByPermissions(user, shiftNotes) {
  if (!user) return []

  switch (user.role) {
    case "admin":
    case "employee":
      return shiftNotes
    case "contractor":
      return shiftNotes.filter((note) => note.contractor_id === user.id)
    case "client":
      return shiftNotes.filter((note) => note.client_id === user.id)
    default:
      return []
  }
}

async function hasShiftNoteAccess(user, shiftNote) {
  if (!user) return false

  switch (user.role) {
    case "admin":
    case "employee":
      return true
    case "contractor":
      return shiftNote.contractor_id === user.id
    case "client":
      return shiftNote.client_id === user.id
    default:
      return false
  }
}

async function sendShiftNoteNotification(catalystApp, shiftNote) {
  try {
    const mailService = catalystApp.email()

    // Get admin emails
    const datastore = catalystApp.datastore()
    const usersTable = datastore.table("Users")
    const admins = await usersTable.getRows({
      filter: { role: "admin" },
    })

    for (const admin of admins) {
      const emailContent = {
        to: admin.email,
        from: "noreply@snugandkisses.com",
        subject: "New Shift Note Submitted",
        html: `
                    <h3>New Shift Note Submitted</h3>
                    <p><strong>Contractor:</strong> ${shiftNote.contractor_name}</p>
                    <p><strong>Client:</strong> ${shiftNote.client_name}</p>
                    <p><strong>Date:</strong> ${shiftNote.shift_date}</p>
                    <p><strong>Hours:</strong> ${shiftNote.hours}</p>
                    <p><strong>Notes:</strong> ${shiftNote.notes}</p>
                    <p>Please review and approve in the admin dashboard.</p>
                `,
      }

      await mailService.sendMail(emailContent)
    }
  } catch (error) {
    console.error("Shift note notification error:", error)
  }
}

async function updateContractorHours(catalystApp, contractorId, hours) {
  try {
    const datastore = catalystApp.datastore()
    const contractorsTable = datastore.table("Contractors")

    const contractor = await contractorsTable.getRow(contractorId)

    if (contractor) {
      const updatedHours = (contractor.total_hours || 0) + Number.parseFloat(hours)

      await contractorsTable.updateRow({
        ROWID: contractorId,
        total_hours: updatedHours,
        last_shift_date: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Update contractor hours error:", error)
  }
}

async function processApprovedShiftNote(catalystApp, shiftNote) {
  try {
    // Create billing record
    const datastore = catalystApp.datastore()
    const billingTable = datastore.table("Billing")

    const billingRecord = {
      contractor_id: shiftNote.contractor_id,
      client_id: shiftNote.client_id,
      shift_note_id: shiftNote.ROWID,
      hours: shiftNote.hours,
      rate: shiftNote.hourly_rate,
      amount: shiftNote.hours * shiftNote.hourly_rate,
      status: "pending_payment",
      created_at: new Date().toISOString(),
    }

    await billingTable.insertRow(billingRecord)

    // Sync to Zoho Books for invoicing
    await createZohoInvoice(catalystApp, billingRecord)
  } catch (error) {
    console.error("Process approved shift note error:", error)
  }
}

async function createZohoInvoice(catalystApp, billingRecord) {
  try {
    // Create invoice in Zoho Books
    // Implementation would use Zoho Books API
  } catch (error) {
    console.error("Zoho invoice creation error:", error)
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
