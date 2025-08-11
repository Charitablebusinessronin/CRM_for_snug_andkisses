import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Verify the email token
    const result = await verifyEmailToken(token)

    if (result.success) {
      // Create audit log for successful verification
      await createAuditLog({
        action: 'EMAIL_VERIFIED',
        resourceId: result.user.id,
        resourceType: 'user',
        userId: result.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        data: {
          email: result.user.email,
          verificationMethod: 'email_token'
        },
        result: 'success'
      })

      // Advance workflow to Phase 2 (Initial Contact)
      await advanceClientWorkflow(result.user.id, 2)

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! Your account is now active.',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
        nextSteps: [
          'Sign in to your account',
          'Complete your profile setup',
          'Schedule your initial consultation',
          'Explore available services'
        ]
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Email verification error:', error)

    // Create audit log for failed verification
    await createAuditLog({
      action: 'EMAIL_VERIFICATION_FAILED',
      resourceId: 'unknown',
      resourceType: 'user',
      userId: null,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      result: 'error'
    })

    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 410 } // Gone
      )
    }

    return NextResponse.json(
      { error: 'Email verification failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Helper functions
async function createAuditLog(logData: any) {
  // Mock implementation - replace with actual audit log creation
  console.log('Audit Log:', logData)
}

async function advanceClientWorkflow(userId: string, phase: number) {
  // Mock implementation - replace with actual workflow advancement
  console.log(`Advancing workflow for user ${userId} to phase ${phase}`)
  
  // In a real implementation:
  /*
  await db.clientWorkflows.update({
    where: { client_id: userId },
    data: { current_phase: phase }
  })
  
  await executeWorkflowPhase(userId, phase)
  */
}