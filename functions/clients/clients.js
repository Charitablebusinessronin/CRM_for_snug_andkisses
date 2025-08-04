const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "GET":
      return req.url.includes("/clients/")
        ? handleGetClient(catalystApp, req, res)
        : handleGetClients(catalystApp, req, res)
    case "POST":
      return handleCreateClient(catalystApp, req, res)
    case "PUT":
      return handleUpdateClient(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleGetClients(catalystApp, req, res) {
  try {
    const datastore = catalystApp.datastore()
    const table = datastore.table("Clients")

    const clients = await table.getAllRows()

    // Filter based on user role and permissions
    const filteredClients = await filterClientsByPermissions(req.user, clients)

    res.status(200).json(filteredClients)
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleGetClient(catalystApp, req, res) {
  try {
    const clientId = req.url.split("/").pop()

    const datastore = catalystApp.datastore()
    const table = datastore.table("Clients")

    const client = await table.getRow(clientId)

    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    // Check permissions
    if (!(await hasClientAccess(req.user, client))) {
      return res.status(403).json({ error: "Access denied" })
    }

    res.status(200).json(client)
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleCreateClient(catalystApp, req, res) {
  try {
    const clientData = {
      ...req.body,
      status: "prospect",
      created_at: new Date().toISOString(),
      created_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Clients")

    const newClient = await table.insertRow(clientData)

    // Create Zoho CRM lead/contact
    await createZohoLead(catalystApp, newClient)

    // Send welcome email
    await sendWelcomeEmail(catalystApp, newClient)

    // Log audit event
    await logAuditEvent(catalystApp, {
      user_id: req.user?.id,
      action: "CREATE_CLIENT",
      details: `Created client: ${clientData.name}`,
      resource_id: newClient.ROWID,
    })

    res.status(201).json(newClient)
  } catch (error) {
    console.error("Create client error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleUpdateClient(catalystApp, req, res) {
  try {
    const clientId = req.url.split("/").pop()
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Clients")

    const updatedClient = await table.updateRow({
      ROWID: clientId,
      ...updateData,
    })

    // Update Zoho CRM
    await updateZohoLead(catalystApp, updatedClient)

    res.status(200).json(updatedClient)
  } catch (error) {
    console.error("Update client error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function filterClientsByPermissions(user, clients) {
  if (!user) return []

  switch (user.role) {
    case "admin":
      return clients
    case "employee":
      // Return clients assigned to this employee
      return clients.filter((client) => client.assigned_employee === user.id)
    case "contractor":
      // Return clients this contractor is working with
      return clients.filter((client) => client.assigned_contractors?.includes(user.id))
    case "client":
      // Return only their own record
      return clients.filter((client) => client.user_id === user.id)
    default:
      return []
  }
}

async function hasClientAccess(user, client) {
  if (!user) return false

  switch (user.role) {
    case "admin":
      return true
    case "employee":
      return client.assigned_employee === user.id
    case "contractor":
      return client.assigned_contractors?.includes(user.id)
    case "client":
      return client.user_id === user.id
    default:
      return false
  }
}

async function createZohoLead(catalystApp, client) {
  try {
    const leadData = {
      First_Name: client.first_name,
      Last_Name: client.last_name,
      Email: client.email,
      Phone: client.phone,
      Company: client.company || "Individual",
      Lead_Source: "CRM Application",
      Lead_Status: "New",
      Industry: "Healthcare Services",
    }

    // Make API call to Zoho CRM
    // Implementation would use Zoho CRM API
  } catch (error) {
    console.error("Zoho lead creation error:", error)
  }
}

async function updateZohoLead(catalystApp, client) {
  try {
    // Update lead/contact in Zoho CRM
    // Implementation would use Zoho CRM API
  } catch (error) {
    console.error("Zoho lead update error:", error)
  }
}

async function sendWelcomeEmail(catalystApp, client) {
  try {
    const mailService = catalystApp.email()

    const emailContent = {
      to: client.email,
      from: "noreply@snugandkisses.com",
      subject: "Welcome to Snugs & Kisses",
      html: `
                <h2>Welcome to Snugs & Kisses, ${client.first_name}!</h2>
                <p>Thank you for choosing our services. We're here to support you and your family.</p>
                <p>Our team will be in touch soon to discuss your needs and schedule your first consultation.</p>
                <p>Best regards,<br>The Snugs & Kisses Team</p>
            `,
    }

    await mailService.sendMail(emailContent)
  } catch (error) {
    console.error("Welcome email error:", error)
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
