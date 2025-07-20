const { login } = require("../functions/auth/login")
const jest = require("jest")

// Mock the Catalyst SDK
jest.mock("zcatalyst-sdk-node", () => ({
  getSdk: jest.fn(() => ({
    authentication: jest.fn(() => ({
      clientId: jest.fn().mockReturnThis(),
      clientSecret: jest.fn().mockReturnThis(),
      refreshToken: jest.fn().mockReturnThis(),
      grantRefreshToken: jest.fn().mockResolvedValue({ access_token: "mock-token" }),
    })),
    datastore: jest.fn(() => ({
      table: jest.fn(() => ({
        getRecords: jest.fn().mockResolvedValue([
          {
            ROWID: "1",
            email: "test@example.com",
            password: "$2b$10$hashedpassword",
            firstName: "Test",
            lastName: "User",
            role: "admin",
          },
        ]),
      })),
    })),
    log: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
    })),
  })),
}))

// Mock bcrypt
jest.mock("bcrypt", () => ({
  compare: jest.fn().mockResolvedValue(true),
}))

// Mock jwt
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}))

describe("Authentication", () => {
  test("login with valid credentials", async () => {
    const mockBasicIO = {
      getRequestObject: () => ({
        email: "test@example.com",
        password: "password123",
        role: "admin",
      }),
      setStatus: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    await login({}, mockBasicIO)

    expect(mockBasicIO.setStatus).toHaveBeenCalledWith(200)
    expect(mockBasicIO.send).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "mock-jwt-token",
        user: expect.objectContaining({
          email: "test@example.com",
          role: "admin",
        }),
      }),
    )
  })

  test("login with invalid credentials", async () => {
    // Mock empty user query result
    const mockSdk = require("zcatalyst-sdk-node").getSdk()
    mockSdk.datastore().table().getRecords.mockResolvedValueOnce([])

    const mockBasicIO = {
      getRequestObject: () => ({
        email: "invalid@example.com",
        password: "wrongpassword",
        role: "admin",
      }),
      setStatus: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    await login({}, mockBasicIO)

    expect(mockBasicIO.setStatus).toHaveBeenCalledWith(401)
    expect(mockBasicIO.send).toHaveBeenCalledWith({
      error: "Invalid credentials",
    })
  })
})
