import { type NextRequest, NextResponse } from "next/server"
import { zohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=missing_code", request.url))
  }

  try {
    await zohoClient.exchangeCodeForTokens(code)
    return NextResponse.redirect(new URL("/dashboard?success=zoho_connected", request.url))
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent("token_exchange_failed")}`, request.url),
    )
  }
}
