const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports = async (context, basicIO) => {
  try {
    const { email, password, role } = basicIO.getRequestObject()

    // Input validation
    if (!email || !password || !role) {
      return basicIO.setStatus(400).send({
        error: "Missing required fields: email, password, role",
      })
    }

    // Demo credentials for development
    const demoCredentials = {
      admin: {
        email: "admin@snugandkisses.com",
        password: "admin",
        name: "Sabir (Owner)",
        role: "admin",
      },
      contractor: {
        email: "contractor@snugandkisses.com",
        password: "contractor",
        name: "Jessica Davis",
        role: "contractor",
      },
      client: {
        email: "client@snugandkisses.com",
        password: "client",
        name: "Sarah Mitchell",
        role: "client",
      },
      employee: {
        email: "employee@snugandkisses.com",
        password: "employee",
        name: "Maria Rodriguez",
        role: "employee",
      },
    }

    // Check demo credentials
    const demoUser = demoCredentials[role]
    if (demoUser && (email === demoUser.email || email === role) && password === demoUser.password) {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: `demo_${role}`,
          email: demoUser.email,
          role: demoUser.role,
          name: demoUser.name,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        },
        process.env.JWT_SECRET || "demo-secret-key",
      )

      // Log successful login (using console.log instead of catalyst.log)
      console.log(`User ${email} with role ${role} logged in successfully`)

      return basicIO.setStatus(200).send({
        token,
        user: {
          id: `demo_${role}`,
          email: demoUser.email,
          firstName: demoUser.name.split(" ")[0],
          lastName: demoUser.name.split(" ").slice(1).join(" "),
          role: demoUser.role,
          name: demoUser.name,
          avatar: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    }

    // If not demo credentials, return invalid credentials
    console.log(`Failed login attempt for ${email} with role ${role}`)
    return basicIO.setStatus(401).send({
      error: "Invalid credentials",
    })
  } catch (err) {
    console.error("Authentication error:", err)
    return basicIO.setStatus(500).send({
      error: "Authentication failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
}
