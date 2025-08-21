import { type NextRequest, NextResponse } from "next/server"

// This handles the Zoho OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.json({
      success: false,
      error: "Authorization failed",
      details: error,
      message: "Please try the authorization process again",
    })
  }

  if (code) {
    // Redirect to our token exchange endpoint
    return NextResponse.redirect(new URL(`/api/v1/zoho/auth?code=${code}`, request.url))
  }

  return NextResponse.json({
    success: false,
    error: "No authorization code received",
    message: "Please restart the authorization process",
  })
}
