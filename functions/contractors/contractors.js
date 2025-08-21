const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "GET":
      return req.url.includes("/contractors/")
        ? handleGetContractor(catalystApp, req, res)
        : handleGetContractors(catalystApp, req, res)
    case "POST":
      return handleCreateContractor(catalystApp, req, res)
    case "PUT":
      return handleUpdateContractor(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleGetContractors(catalystApp, req, res) {
  try {
    const datastore = catalystApp.datastore()
    const table = datastore.table("Contractors")

    const contractors = await table.getAllRows()

    // Sync with Zoho CRM if needed
    await syncWithZohoCRM(catalystApp, "contractors")

    res.status(200).json(contractors)
  } catch (error) {
    console.error("Get contractors error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleGetContractor(catalystApp, req, res) {
  try {
    const contractorId = req.url.split("/").pop()

    const datastore = catalystApp.datastore()
    const table = datastore.table("Contractors")

    const contractor = await table.getRow(contractorId)

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" })
    }

    res.status(200).json(contractor)
  } catch (error) {
    console.error("Get contractor error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleCreateContractor(catalystApp, req, res) {
  try {
    const contractorData = req.body

    const datastore = catalystApp.datastore()
    const table = datastore.table("Contractors")

    // Create contractor in Catalyst
    const newContractor = await table.insertRow(contractorData)

    // Sync to Zoho CRM
    await createZohoContact(catalystApp, newContractor)

    // Log audit event
    await logAuditEvent(catalystApp, {
      user_id: req.user?.id,
      action: "CREATE_CONTRACTOR",
      details: `Created contractor: ${contractorData.name}`,
      resource_id: newContractor.ROWID,
    })

    res.status(201).json(newContractor)
  } catch (error) {
    console.error("Create contractor error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleUpdateContractor(catalystApp, req, res) {
  try {
    const contractorId = req.url.split("/").pop()
    const updateData = req.body

    const datastore = catalystApp.datastore()
    const table = datastore.table("Contractors")

    const updatedContractor = await table.updateRow({
      ROWID: contractorId,
      ...updateData,
    })

    // Sync to Zoho CRM
    await updateZohoContact(catalystApp, updatedContractor)

    res.status(200).json(updatedContractor)
  } catch (error) {
    console.error("Update contractor error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function syncWithZohoCRM(catalystApp, entityType) {
  try {
    const zohoClient = await getZohoClient(catalystApp)

    // Implementation would sync data between Catalyst and Zoho
    console.log(`Syncing ${entityType} with Zoho CRM`)
  } catch (error) {
    console.error("Zoho sync error:", error)
  }
}

async function createZohoContact(catalystApp, contractor) {
  try {
    const zohoClient = await getZohoClient(catalystApp)

    const contactData = {
      First_Name: contractor.first_name,
      Last_Name: contractor.last_name,
      Email: contractor.email,
      Phone: contractor.phone,
      Account_Name: "Snugs & Kisses Contractors",
      Lead_Source: "CRM Application",
    }

    // Make API call to Zoho CRM
    // Implementation would use Zoho CRM API
  } catch (error) {
    console.error("Zoho contact creation error:", error)
  }
}

async function updateZohoContact(catalystApp, contractor) {
  try {
    const zohoClient = await getZohoClient(catalystApp)

    // Update contact in Zoho CRM
    // Implementation would use Zoho CRM API
  } catch (error) {
    console.error("Zoho contact update error:", error)
  }
}

async function getZohoClient(catalystApp) {
  // Initialize Zoho API client with stored tokens
  // Implementation would handle OAuth token management
  return null
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
