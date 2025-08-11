import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { WorkflowEngine } from '@/lib/workflow-engine'

// GET /api/v1/workflows - Get workflow status for client
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')
    const clientId = searchParams.get('clientId')

    // If specific workflow requested
    if (workflowId) {
      const progress = await WorkflowEngine.getWorkflowProgress(workflowId)
      return NextResponse.json(progress)
    }

    // If client workflows requested
    if (clientId) {
      // Check authorization - clients can only see their own workflows
      if (session.user.role === 'client' && session.user.id !== clientId) {
        return NextResponse.json(
          { error: 'Unauthorized - Access denied' }, 
          { status: 403 }
        )
      }

      const workflows = await getClientWorkflows(clientId)
      return NextResponse.json({ workflows })
    }

    // Admin/Employee can see all workflows
    if (session.user.role === 'admin' || session.user.role === 'employee') {
      const allWorkflows = await getAllWorkflows()
      return NextResponse.json({ workflows: allWorkflows })
    }

    return NextResponse.json(
      { error: 'Insufficient parameters' }, 
      { status: 400 }
    )

  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/v1/workflows - Initialize or advance workflow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, workflowId, clientId, serviceType, serviceRequestId, actionData } = body

    switch (action) {
      case 'initialize':
        // Only admin/employees can initialize workflows
        if (session.user.role !== 'admin' && session.user.role !== 'employee') {
          return NextResponse.json(
            { error: 'Unauthorized - Admin/Employee access required' }, 
            { status: 403 }
          )
        }

        if (!clientId || !serviceType) {
          return NextResponse.json(
            { error: 'clientId and serviceType are required for initialization' },
            { status: 400 }
          )
        }

        const newWorkflow = await WorkflowEngine.initializeClientWorkflow(
          clientId, 
          serviceType, 
          serviceRequestId
        )

        // Create audit log
        await createAuditLog({
          action: 'WORKFLOW_INITIALIZED',
          resourceId: newWorkflow.id,
          resourceType: 'workflow',
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
          data: {
            clientId,
            serviceType,
            serviceRequestId
          },
          result: 'success'
        })

        return NextResponse.json({
          success: true,
          workflow: newWorkflow,
          message: 'Workflow initialized successfully'
        })

      case 'advance':
        // Admin/employees can advance any workflow, clients cannot advance their own
        if (session.user.role === 'client') {
          return NextResponse.json(
            { error: 'Unauthorized - Workflow advancement is automated' }, 
            { status: 403 }
          )
        }

        if (!workflowId) {
          return NextResponse.json(
            { error: 'workflowId is required for advancement' },
            { status: 400 }
          )
        }

        await WorkflowEngine.manuallyAdvanceWorkflow(workflowId, actionData)

        // Create audit log
        await createAuditLog({
          action: 'WORKFLOW_ADVANCED',
          resourceId: workflowId,
          resourceType: 'workflow',
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
          data: actionData,
          result: 'success'
        })

        const updatedProgress = await WorkflowEngine.getWorkflowProgress(workflowId)

        return NextResponse.json({
          success: true,
          workflow: updatedProgress,
          message: 'Workflow advanced successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "initialize" or "advance"' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Workflow POST error:', error)

    // Create audit log for error
    await createAuditLog({
      action: 'WORKFLOW_ERROR',
      resourceId: 'unknown',
      resourceType: 'workflow',
      userId: (await getServerSession(authOptions))?.user?.id || null,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      result: 'error'
    })

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper functions (mock implementations - replace with actual database queries)

async function getClientWorkflows(clientId: string) {
  // Mock implementation - replace with actual database query
  return [
    {
      id: 'wf_123',
      clientId,
      currentPhase: 5,
      status: 'active',
      startedAt: '2024-02-01T10:00:00Z',
      progress: 28
    }
  ]
}

async function getAllWorkflows() {
  // Mock implementation - replace with actual database query
  return [
    {
      id: 'wf_123',
      clientId: 'client_123',
      currentPhase: 5,
      status: 'active',
      startedAt: '2024-02-01T10:00:00Z',
      progress: 28
    },
    {
      id: 'wf_124', 
      clientId: 'client_124',
      currentPhase: 12,
      status: 'active',
      startedAt: '2024-01-15T14:30:00Z',
      progress: 67
    }
  ]
}

async function createAuditLog(logData: any) {
  // Mock implementation - replace with actual audit log creation
  console.log('Audit Log:', logData)
  
  // In production:
  /*
  await db.auditLogs.create({
    data: logData
  })
  */
}