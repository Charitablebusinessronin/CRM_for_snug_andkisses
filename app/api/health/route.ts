/**
 * Health check endpoint for Docker container monitoring
 */
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      service: "Snugs & Kisses CRM",
      environment: process.env.NODE_ENV || "development",
      checks: {
        server: "running",
        memory: process.memoryUsage ? "available" : "unknown",
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : "unknown"
      }
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}