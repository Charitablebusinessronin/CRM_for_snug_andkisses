import { NextRequest, NextResponse } from 'next/server'
// Temporarily simplified for Docker build compatibility

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    // Temporarily simplified for Docker build
    return NextResponse.json(
      { message: 'HR employee endpoint - Docker build mode', employeeId: params.employeeId, status: 'pending' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    return NextResponse.json(
      { message: 'HR employee update - Docker build mode', employeeId: params.employeeId, status: 'pending' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    return NextResponse.json(
      { message: 'HR employee delete - Docker build mode', employeeId: params.employeeId, status: 'pending' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}