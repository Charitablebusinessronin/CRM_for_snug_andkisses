const { getSdk } = require("zcatalyst-sdk-node")
const bcrypt = require("bcryptjs")

module.exports = async (context, basicIO) => {
  const catalyst = getSdk(context)
  const { email, password, role, firstName, lastName } = basicIO.getRequestObject()

  if (!email || !password || !role || !firstName || !lastName) {
    return basicIO.setStatus(400).send({ error: "Missing required fields" })
  }

  try {
    const datastore = catalyst.datastore()
    const usersTable = datastore.table("Users")

    // Check if user already exists
    const existingUser = await usersTable.searchRecords(`email = '${email}'`)
    if (existingUser.length > 0) {
      return basicIO.setStatus(409).send({ error: "User with this email already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await usersTable.insertRecord({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      status: "active",
    })

    console.log(`User ${email} registered successfully.`)
    basicIO.setStatus(201).send({
      message: "User registered successfully",
      data: {
        id: newUser.ROWID,
        email: newUser.Users.email,
        role: newUser.Users.role,
      },
    })
  } catch (err) {
    console.error("Error in /auth/register:", err)
    basicIO.setStatus(500).send({
      error: "Internal server error",
      details: err.message,
    })
  }
}
