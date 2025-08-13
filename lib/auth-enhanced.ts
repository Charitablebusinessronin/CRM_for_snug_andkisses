/**
 * Enhanced NextAuth configuration for Snugs and Kisses CRM
 * HIPAA-compliant authentication with comprehensive audit logging
 */
import type { NextAuthOptions, User as NextAuthUser } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole, DEMO_ACCOUNTS, SESSION_CONFIG } from "@/types/auth"
import { logAuditEvent } from "@/lib/hipaa-audit-edge"
import bcrypt from "bcryptjs"

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string | null
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    userId: string
    refreshTokenHash?: string
    sessionStart: number
  }
}

// Mock user verification function - in production this would connect to Zoho Catalyst
async function verifyUserCredentials(email: string, password: string) {
  // For now, we'll use demo accounts and basic validation
  const demoAccount = Object.values(DEMO_ACCOUNTS).find(
    account => account.email === email
  )
  
  if (demoAccount && password === demoAccount.password) {
    const role = Object.keys(DEMO_ACCOUNTS).find(
      key => DEMO_ACCOUNTS[key as UserRole].email === email
    ) as UserRole
    
    return {
      id: `demo-${role.toLowerCase()}`,
      email: email,
      name: demoAccount.name,
      role: role,
      image: null
    }
  }
  
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const ip = req?.headers?.["x-forwarded-for"] as string || 
                  req?.headers?.["x-real-ip"] as string || 
                  "unknown"
        const userAgent = req?.headers?.["user-agent"] || "unknown"

        try {
          // Log authentication attempt
          await logAuditEvent({
            action: "LOGIN_ATTEMPT",
            resource: "/api/auth/callback/credentials",
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date().toISOString(),
            origin: req?.headers?.origin || "unknown",
            request_id: crypto.randomUUID(),
            data: { email: credentials.email }
          })

          // Normalize input to avoid copy/paste whitespace errors
          const email = String(credentials.email).trim()
          const password = String(credentials.password).trim()

          // Verify user credentials
          const user = await verifyUserCredentials(
            email,
            password
          )

          if (user) {
            await logAuditEvent({
              action: "LOGIN_SUCCESS",
              resource: "/api/auth/callback/credentials",
              user_id: user.id,
              ip_address: ip,
              user_agent: userAgent,
              timestamp: new Date().toISOString(),
              origin: req?.headers?.origin || "unknown",
              request_id: crypto.randomUUID(),
              result: "success",
              data: { email: credentials.email, role: user.role }
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image || null
            }
          }

          // Log failed authentication
          await logAuditEvent({
            action: "LOGIN_FAILED",
            resource: "/api/auth/callback/credentials",
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date().toISOString(),
            origin: req?.headers?.origin || "unknown",
            request_id: crypto.randomUUID(),
            result: "failure",
            error_message: "Invalid credentials",
            data: { email: credentials.email }
          })

          return null
        } catch (error) {
          console.error("Authentication error:", error)
          
          await logAuditEvent({
            action: "LOGIN_FAILED",
            resource: "/api/auth/callback/credentials",
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date().toISOString(),
            origin: req?.headers?.origin || "unknown",
            request_id: crypto.randomUUID(),
            result: "error",
            error_message: error instanceof Error ? error.message : "Unknown error",
            data: { email: credentials.email }
          })

          return null
        }
      },
    }),
  ],
  session: {
    strategy: SESSION_CONFIG.strategy,
    maxAge: SESSION_CONFIG.maxAge,
    updateAge: SESSION_CONFIG.updateAge,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: SESSION_CONFIG.httpOnly,
        sameSite: SESSION_CONFIG.sameSite,
        path: "/",
        secure: SESSION_CONFIG.secure,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.userId = user.id
        token.role = user.role
        token.sessionStart = Date.now()
        
        // Generate refresh token hash for rotation
        token.refreshTokenHash = await bcrypt.hash(
          `${user.id}-${Date.now()}-${Math.random()}`,
          12
        )
      }

      // Return previous token if the access token has not expired yet
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.role = token.role
        
        // Check session timeout (HIPAA compliance)
        const sessionAge = Date.now() - token.sessionStart
        if (sessionAge > SESSION_CONFIG.maxAge * 1000) {
          // Session expired - this should trigger re-authentication
          throw new Error("Session expired")
        }
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Additional security checks can be added here
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signOut({ token, session }) {
      if (token?.userId) {
        await logAuditEvent({
          action: "LOGOUT",
          resource: "/api/auth/signout",
          user_id: token.userId,
          ip_address: "unknown", // Request object not available in events
          user_agent: "unknown",
          timestamp: new Date().toISOString(),
          origin: "unknown",
          request_id: crypto.randomUUID(),
          result: "success"
        })
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to check if user has permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = {
    [UserRole.ADMIN]: ['*'], // Admin has all permissions
    [UserRole.EMPLOYEE]: ['viewAssignedData', 'updateProfile', 'viewSchedule', 'manageClients', 'viewReports'],
    [UserRole.CONTRACTOR]: ['viewOwnData', 'updateProfile', 'viewSchedule', 'submitNotes', 'viewPayments'],
    [UserRole.CLIENT]: ['viewOwnData', 'updateProfile', 'viewServices', 'requestServices', 'viewInvoices']
  }
  
  const userPermissions = permissions[userRole] || []
  return userPermissions.includes('*') || userPermissions.includes(permission)
}

// Helper to get redirect URL based on role
export function getRoleRedirectUrl(role: UserRole): string {
  const redirects = {
    [UserRole.ADMIN]: '/admin/dashboard',
    [UserRole.CONTRACTOR]: '/contractor/dashboard', 
    [UserRole.CLIENT]: '/client/dashboard',
    [UserRole.EMPLOYEE]: '/employee/dashboard'
  }
  
  return redirects[role] || '/dashboard'
}