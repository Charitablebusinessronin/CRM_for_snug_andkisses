/**
 * Health check endpoint for Docker container monitoring
 */
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "CRM Frontend"
  }, { status: 200 })
}