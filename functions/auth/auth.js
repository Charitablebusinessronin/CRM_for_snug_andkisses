const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "POST":
      return handleLogin(catalystApp, req, res)
    case "GET":
      return handleGetUser(catalystApp, req, res)
    default:
      return res.status(405).json({ error: "Method not allowed" })
  }
}

async function handleLogin(catalystApp, req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // Query the Users table in Catalyst DataStore
    const datastore = catalystApp.datastore()
    const table = datastore.table("Users")

    const users = await table.getRows({
      filter: {
        email: email,
      },
    })

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = users[0]

    // In production, use proper password hashing (bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const jwt = require("jsonwebtoken")
    const token = jwt.sign(
      {
        userId: user.ROWID,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    // Log successful login for HIPAA compliance
    await logAuditEvent(catalystApp, {
      user_id: user.ROWID,
      action: "LOGIN",
      details: `User ${email} logged in successfully`,
      ip_address: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    })

    res.status(200).json({
      user: {
        id: user.ROWID,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

async function handleGetUser(catalystApp, req, res) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const jwt = require("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const datastore = catalystApp.datastore()
    const table = datastore.table("Users")

    const user = await table.getRow(decoded.userId)

    res.status(200).json({
      id: user.ROWID,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(401).json({ error: "Invalid token" })
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
