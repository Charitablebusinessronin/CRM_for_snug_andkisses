const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "GET":
      return handleGetJobs(catalystApp, req, res)
    case "POST":
      return req.url.includes("/apply")
        ? handleJobApplication(catalystApp, req, res)
        : handleCreateJob(catalystApp, req, res)
    case "PUT":
      return handleUpdateJob(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleGetJobs(catalystApp, req, res) {
  try {
    const { status, type, location, contractor_id } = req.query

    const datastore = catalystApp.datastore()
    const table = datastore.table("Jobs")

    const filter = { status: status || "open" }
    if (type) filter.service_type = type
    if (location) filter.location = location

    const jobs = await table.getRows({ filter })

    // Filter based on contractor preferences and qualifications
    let filteredJobs = jobs
    if (contractor_id) {
      filteredJobs = await filterJobsByContractorPreferences(catalystApp, jobs, contractor_id)
    }

    res.status(200).json(filteredJobs)
  } catch (error) {
    console.error("Get jobs error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleCreateJob(catalystApp, req, res) {
  try {
    const jobData = {
      ...req.body,
      status: "open",
      created_at: new Date().toISOString(),
      created_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Jobs")

    const newJob = await table.insertRow(jobData)

    // Notify qualified contractors
    await notifyQualifiedContractors(catalystApp, newJob)

    // Log audit event
    await logAuditEvent(catalystApp, {
      user_id: req.user?.id,
      action: "CREATE_JOB",
      details: `Created job: ${jobData.title}`,
      resource_id: newJob.ROWID,
    })

    res.status(201).json(newJob)
  } catch (error) {
    console.error("Create job error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleJobApplication(catalystApp, req, res) {
  try {
    const jobId = req.url.split("/")[2] // Extract job ID from URL
    const { contractor_id } = req.body

    const datastore = catalystApp.datastore()
    const applicationsTable = datastore.table("JobApplications")

    // Check if already applied
    const existingApplications = await applicationsTable.getRows({
      filter: {
        job_id: jobId,
        contractor_id: contractor_id,
      },
    })

    if (existingApplications.length > 0) {
      return res.status(400).json({ error: "Already applied to this job" })
    }

    const applicationData = {
      job_id: jobId,
      contractor_id: contractor_id,
      status: "pending",
      applied_at: new Date().toISOString(),
    }

    const newApplication = await applicationsTable.insertRow(applicationData)

    // Notify admin of new application
    await notifyJobApplication(catalystApp, newApplication)

    res.status(201).json(newApplication)
  } catch (error) {
    console.error("Job application error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleUpdateJob(catalystApp, req, res) {
  try {
    const jobId = req.url.split("/").pop()
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.id,
    }

    const datastore = catalystApp.datastore()
    const table = datastore.table("Jobs")

    const updatedJob = await table.updateRow({
      ROWID: jobId,
      ...updateData,
    })

    // If job was assigned, notify contractor and client
    if (updateData.status === "assigned" && updateData.assigned_contractor) {
      await notifyJobAssignment(catalystApp, updatedJob)
    }

    res.status(200).json(updatedJob)
  } catch (error) {
    console.error("Update job error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function filterJobsByContractorPreferences(catalystApp, jobs, contractorId) {
  try {
    const datastore = catalystApp.datastore()
    const contractorsTable = datastore.table("Contractors")

    const contractor = await contractorsTable.getRow(contractorId)

    if (!contractor) return jobs

    return jobs.filter((job) => {
      // Filter by service types
      if (contractor.service_types && !contractor.service_types.includes(job.service_type)) {
        return false
      }

      // Filter by location preferences
      if (contractor.max_distance && job.distance > contractor.max_distance) {
        return false
      }

      // Filter by availability
      if (contractor.availability && !isAvailable(contractor.availability, job.schedule)) {
        return false
      }

      return true
    })
  } catch (error) {
    console.error("Filter jobs error:", error)
    return jobs
  }
}

async function notifyQualifiedContractors(catalystApp, job) {
  try {
    const datastore = catalystApp.datastore()
    const contractorsTable = datastore.table("Contractors")

    // Get contractors who match job requirements
    const contractors = await contractorsTable.getRows({
      filter: {
        status: "active",
        service_types: job.service_type,
      },
    })

    const mailService = catalystApp.email()

    for (const contractor of contractors) {
      const emailContent = {
        to: contractor.email,
        from: "noreply@snugandkisses.com",
        subject: "New Job Opportunity Available",
        html: `
                    <h3>New Job Opportunity</h3>
                    <p><strong>Service Type:</strong> ${job.service_type}</p>
                    <p><strong>Date:</strong> ${job.date}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Rate:</strong> ${job.hourly_rate}/hour</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                    <p>Log in to your portal to apply for this opportunity.</p>
                `,
      }

      await mailService.sendMail(emailContent)
    }
  } catch (error) {
    console.error("Notify contractors error:", error)
  }
}

async function notifyJobApplication(catalystApp, application) {
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
        subject: "New Job Application Received",
        html: `
                    <h3>New Job Application</h3>
                    <p>A contractor has applied for job ID: ${application.job_id}</p>
                    <p>Please review the application in the admin dashboard.</p>
                `,
      }

      await mailService.sendMail(emailContent)
    }
  } catch (error) {
    console.error("Notify job application error:", error)
  }
}

async function notifyJobAssignment(catalystApp, job) {
  try {
    const datastore = catalystApp.datastore()
    const contractorsTable = datastore.table("Contractors")
    const clientsTable = datastore.table("Clients")

    const contractor = await contractorsTable.getRow(job.assigned_contractor)
    const client = await clientsTable.getRow(job.client_id)

    const mailService = catalystApp.email()

    // Notify contractor
    if (contractor) {
      await mailService.sendMail({
        to: contractor.email,
        from: "noreply@snugandkisses.com",
        subject: "Job Assignment Confirmation",
        html: `
                    <h3>Job Assignment Confirmed</h3>
                    <p>You have been assigned to a new job:</p>
                    <p><strong>Client:</strong> ${client?.name || "Anonymous"}</p>
                    <p><strong>Date:</strong> ${job.date}</p>
                    <p><strong>Time:</strong> ${job.time}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p>Please confirm your availability and prepare for the assignment.</p>
                `,
      })
    }

    // Notify client
    if (client) {
      await mailService.sendMail({
        to: client.email,
        from: "noreply@snugandkisses.com",
        subject: "Doula Assignment Confirmed",
        html: `
                    <h3>Your Doula Has Been Assigned</h3>
                    <p>We're pleased to confirm your doula assignment:</p>
                    <p><strong>Doula:</strong> ${contractor?.name}</p>
                    <p><strong>Date:</strong> ${job.date}</p>
                    <p><strong>Time:</strong> ${job.time}</p>
                    <p>Your doula will contact you soon to discuss the details.</p>
                `,
      })
    }
  } catch (error) {
    console.error("Notify job assignment error:", error)
  }
}

function isAvailable(availability, schedule) {
  // Implementation would check if contractor is available for the job schedule
  return true
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
