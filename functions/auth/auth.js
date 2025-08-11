const catalyst = require("zcatalyst-sdk-node")

module.exports = (req, res) => {
  const catalystApp = catalyst.initialize(req)

  switch (req.method) {
    case "POST":
      return handleLogin(catalystApp, req, res)
    case "GET":
      if (req.path === '/auth/zoho/callback') {
        return handleZohoOAuthCallback(catalystApp, req, res)
      } else {
        return handleGetUser(catalystApp, req, res)
      }
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

async function handleZohoOAuthCallback(catalystApp, req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Exchange authorization code for access and refresh tokens
    const client_id = process.env.ZOHO_CLIENT_ID;
    const client_secret = process.env.ZOHO_CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URI;

    const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&grant_type=authorization_code`;

    const axios = require('axios');
    const response = await axios.post(tokenUrl);
    const { access_token, refresh_token, expires_in } = response.data;

    // Store refresh token securely (e.g., in Catalyst DataStore)
    const datastore = catalystApp.datastore();
    const zohoConfigTable = datastore.table('ZohoConfig'); // Assuming a table named ZohoConfig

    // For simplicity, storing a single config. In a real app, link to a user or org.
    await zohoConfigTable.upsertRow({
      ROWID: 'zoho_tokens',
      access_token: access_token,
      refresh_token: refresh_token,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
    });

    res.status(200).json({ message: 'Zoho OAuth successful', access_token, refresh_token });

  } catch (error) {
    console.error('Zoho OAuth callback error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to complete Zoho OAuth' });
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
