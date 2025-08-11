import { NextRequest, NextResponse } from 'next/server'
// Temporarily simplified for Docker build compatibility

export async function POST(request: NextRequest) {
  try {
    // Temporarily simplified for Docker build
    return NextResponse.json(
      { message: 'Urgent care endpoint - Docker build mode', status: 'pending' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}