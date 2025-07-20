import { type NextRequest, NextResponse } from "next/server"
import { getAuthorizationUrl } from "@/lib/zoho-config"

export async function GET(request: NextRequest) {
  try {
    const authUrl = getAuthorizationUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error generating authorization URL:", error)
    return NextResponse.json({ error: "Failed to generate authorization URL" }, { status: 500 })
  }
}
