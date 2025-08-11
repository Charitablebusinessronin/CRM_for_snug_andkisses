/**
 * Quick Actions API - Core CRM functionality
 * Handles notes, tasks, appointments, and quick record creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';
import zohoCRM from '@/lib/zoho-crm-enhanced';

// Catalyst Function URL for Quick Actions (env-only, no fallback)
const CATALYST_FUNCTION_URL = process.env.CATALYST_FUNCTION_URL;

function buildAuditHeaders(req: NextRequest) {
  return {
    'Content-Type': 'application/json',
    'User-Agent': req.headers.get('user-agent') || 'Snug-Kisses-CRM/2.0',
    'x-user-id': req.headers.get('x-user-id') || '',
    'x-forwarded-for': req.headers.get('x-forwarded-for') || ''
  } as Record<string, string>
}

export async function GET(request: NextRequest) {
  try {
    // Ensure Catalyst URL configured
    if (!CATALYST_FUNCTION_URL) {
      return NextResponse.json(
        {
          error: 'Catalyst function URL not configured',
          details: 'Set CATALYST_FUNCTION_URL in your environment to enable quick-actions.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `QUICK_ACTION_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/v1/quick-actions',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'quick-actions',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    let catalystResponse;
    let data;
    const baseHeaders = buildAuditHeaders(request)

    switch (action) {
      case 'recent-notes':
        const noteLimit = parseInt(searchParams.get('limit') || '10');
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'getRecentNotes',
            params: { limit: noteLimit }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        data = await catalystResponse.json();
        const recentNotes = data.data;
        
        return NextResponse.json({
          success: true,
          data: recentNotes,
          limit: noteLimit,
          timestamp: new Date().toISOString()
        });

      case 'pending-tasks':
        const taskLimit = parseInt(searchParams.get('limit') || '20');
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'getPendingTasks',
            params: { limit: taskLimit }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        data = await catalystResponse.json();
        const pendingTasks = data.data;
        
        return NextResponse.json({
          success: true,
          data: pendingTasks,
          limit: taskLimit,
          timestamp: new Date().toISOString()
        });

      case 'upcoming-appointments':
        const days = parseInt(searchParams.get('days') || '7');
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'getUpcomingAppointments',
            params: { days: days }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        data = await catalystResponse.json();
        const appointments = data.data;
        
        return NextResponse.json({
          success: true,
          data: appointments,
          days_ahead: days,
          timestamp: new Date().toISOString()
        });

      case 'quick-stats':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'getQuickStats',
            params: {}
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        data = await catalystResponse.json();
        const stats = data.data;
        
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });

      case 'recent-activities':
        const activityLimit = parseInt(searchParams.get('limit') || '15');
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'getRecentActivities',
            params: { limit: activityLimit }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        data = await catalystResponse.json();
        const activities = data.data;
        
        return NextResponse.json({
          success: true,
          data: activities,
          limit: activityLimit,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: recent-notes, pending-tasks, upcoming-appointments, quick-stats, recent-activities' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Quick Actions API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'QUICK_ACTION_ERROR',
      resource: '/api/v1/quick-actions',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'quick-actions',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to process quick action',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure Catalyst URL configured
    if (!CATALYST_FUNCTION_URL) {
      return NextResponse.json(
        {
          error: 'Catalyst function URL not configured',
          details: 'Set CATALYST_FUNCTION_URL in your environment to enable quick-actions.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    const body = await request.json();
    const { action, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `QUICK_ACTION_CREATE_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/v1/quick-actions',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'quick-actions',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action }
    });

    let catalystResponse;
    let responseData;
    const baseHeaders = buildAuditHeaders(request)

    switch (action) {
      case 'create-note':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'createQuickNote',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const newNote = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: newNote,
          message: 'Note created successfully',
          timestamp: new Date().toISOString()
        });

      case 'create-task':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            action: 'createQuickTask',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const newTask = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: newTask,
          message: 'Task created successfully',
          timestamp: new Date().toISOString()
        });

      case 'create-appointment':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'createQuickAppointment',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const newAppointment = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: newAppointment,
          message: 'Appointment scheduled successfully',
          timestamp: new Date().toISOString()
        });

      case 'quick-contact':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'createQuickContact',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const quickContact = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: quickContact,
          message: 'Contact created successfully',
          timestamp: new Date().toISOString()
        });

      case 'quick-lead':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'createQuickLead',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const quickLead = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: quickLead,
          message: 'Lead created successfully',
          timestamp: new Date().toISOString()
        });

      case 'record-payment':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'recordPayment',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const recordedPayment = responseData.data;

        return NextResponse.json({
          success: true,
          data: recordedPayment,
          message: 'Payment recorded successfully',
          timestamp: new Date().toISOString()
        });

      case 'generate-report':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'generateReport',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const generatedReport = responseData.data;

        return NextResponse.json({
          success: true,
          data: generatedReport,
          message: 'Report generated successfully',
          timestamp: new Date().toISOString()
        });

      case 'track-expense':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'trackExpense',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const trackedExpense = responseData.data;

        return NextResponse.json({
          success: true,
          data: trackedExpense,
          message: 'Expense tracked successfully',
          timestamp: new Date().toISOString()
        });

      case 'trigger-workflow':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'triggerWorkflow',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const workflowResult = responseData.data;

        return NextResponse.json({
          success: true,
          data: workflowResult,
          message: 'Workflow triggered',
          timestamp: new Date().toISOString()
        });

      case 'update-availability':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'updateAvailability',
            params: data
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const updatedAvailability = responseData.data;

        return NextResponse.json({
          success: true,
          data: updatedAvailability,
          message: 'Availability updated successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: create-note, create-task, create-appointment, quick-contact, quick-lead, record-payment, generate-report, track-expense, update-availability' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Quick Actions POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create quick action',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Ensure Catalyst URL configured
    if (!CATALYST_FUNCTION_URL) {
      return NextResponse.json(
        {
          error: 'Catalyst function URL not configured',
          details: 'Set CATALYST_FUNCTION_URL in your environment to enable quick-actions.',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    const body = await request.json();
    const { action, id, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `QUICK_ACTION_UPDATE_${action?.toUpperCase() || 'PUT'}`,
      resource: '/api/v1/quick-actions',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'quick-actions',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action, id }
    });

    let catalystResponse;
    let responseData;

    switch (action) {
      case 'complete-task':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'completeTask',
            params: { id, ...data }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const completedTask = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: completedTask,
          message: 'Task marked as completed',
          timestamp: new Date().toISOString()
        });

      case 'update-note':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'updateNote',
            params: { id, ...data }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const updatedNote = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: updatedNote,
          message: 'Note updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'reschedule-appointment':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'rescheduleAppointment',
            params: { id, ...data }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const rescheduledAppointment = responseData.data;
        
        return NextResponse.json({
          success: true,
          data: rescheduledAppointment,
          message: 'Appointment rescheduled successfully',
          timestamp: new Date().toISOString()
        });

      case 'update-status':
        catalystResponse = await fetch(`${CATALYST_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Snug-Kisses-CRM/2.0'
          },
          body: JSON.stringify({
            action: 'updateStatus',
            params: { id, ...data }
          })
        });

        if (!catalystResponse.ok) {
          throw new Error(`Catalyst function call failed: ${catalystResponse.status}`);
        }

        responseData = await catalystResponse.json();
        const updatedStatus = responseData.data;

        return NextResponse.json({
          success: true,
          data: updatedStatus,
          message: 'Status updated successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: complete-task, update-note, reschedule-appointment, update-status' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Quick Actions PUT error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update quick action',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
