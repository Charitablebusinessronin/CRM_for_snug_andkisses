import { type NextRequest, NextResponse } from "next/server"
import { logAuditEvent } from "@/lib/hipaa-audit"

// Helper to get Zoho refresh token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // Use the correct redirect URI from your environment
    const redirectUri = process.env.ZOHO_ONE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/zoho"
    const clientId = process.env.ZOHO_ONE_CLIENT_ID || process.env.ZOHO_CLIENT_ID

    const authUrl =
      `https://accounts.zoho.com/oauth/v2/auth?` +
      `scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoBooks.fullaccess.all&` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`

    return NextResponse.json({
      success: false,
      error: "No authorization code provided",
      message: "Please visit the authorization URL to get your refresh token",
      authUrl: authUrl,
      instructions: [
        "1. Click the authUrl link below",
        "2. Sign in to your Zoho account",
        "3. Authorize the application",
        "4. Copy the 'code' parameter from the redirect URL",
        "5. Visit this endpoint again with ?code=YOUR_CODE",
      ],
    })
  }

  try {
    // Exchange code for tokens using the correct environment variables
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ZOHO_ONE_CLIENT_ID || process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_ONE_CLIENT_SECRET || process.env.ZOHO_CLIENT_SECRET!,
        redirect_uri: process.env.ZOHO_ONE_REDIRECT_URI!,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`)
    }

    await logAuditEvent({
      action: "ZOHO_TOKEN_OBTAINED",
      resource: "/api/v1/zoho/auth",
      result: "success",
      ip_address: request.ip || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      timestamp: new Date().toISOString(),
      origin: request.headers.get("origin") || "unknown",
      request_id: crypto.randomUUID(),
    })

    return NextResponse.json({
      success: true,
      message: "🎉 Tokens obtained successfully!",
      data: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      },
      instructions: {
        step1: "✅ Copy the refresh_token value below",
        step2: "✅ Replace 'your_zoho_refresh_token_here' in your .env file",
        step3: "✅ Restart your application",
        step4: "✅ Test the integration at /api/v1/test/integration",
      },
      nextSteps: [
        "Update ZOHO_REFRESH_TOKEN in your .env file",
        "Restart your development server",
        "Test the Zoho CRM connection",
        "Submit a test contact form",
      ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to obtain tokens",
        details: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: [
          "Verify your Zoho Client ID and Secret are correct",
          "Ensure the redirect URI matches exactly in Zoho Console",
          "Check that your Zoho account has CRM access",
          "Make sure the authorization code hasn't expired",
        ],
      },
      { status: 500 },
    )
  }
}
