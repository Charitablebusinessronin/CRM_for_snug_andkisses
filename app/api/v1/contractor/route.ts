/**
 * Contractor Portal API - Healthcare contractor management
 * Handles schedules, assignments, availability, and contractor-specific data
 */

import { NextRequest, NextResponse } from 'next/server';
// import { zohoClient } from '@/lib/zoho-api-client';
// import { logAuditEvent } from '@/lib/hipaa-audit-edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const contractorId = searchParams.get('contractor_id');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `CONTRACTOR_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/v1/contractor',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'contractor-portal',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    switch (action) {
      case 'schedule':
        if (!contractorId) {
          return NextResponse.json(
            { error: 'contractor_id is required for schedule action' },
            { status: 400 }
          );
        }
        
        const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
        const endDate = searchParams.get('end_date') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const schedule = await zohoClient.getContractorSchedule(contractorId, startDate, endDate);
        
        return NextResponse.json({
          success: true,
          data: schedule,
          contractor_id: contractorId,
          date_range: { start_date: startDate, end_date: endDate },
          timestamp: new Date().toISOString()
        });

      case 'assignments':
        if (!contractorId) {
          return NextResponse.json(
            { error: 'contractor_id is required for assignments action' },
            { status: 400 }
          );
        }
        
        const status = searchParams.get('status') || 'active';
        const assignments = await zohoClient.getContractorAssignments(contractorId, status);
        
        return NextResponse.json({
          success: true,
          data: assignments,
          contractor_id: contractorId,
          status_filter: status,
          timestamp: new Date().toISOString()
        });

      case 'availability':
        if (!contractorId) {
          return NextResponse.json(
            { error: 'contractor_id is required for availability action' },
            { status: 400 }
          );
        }
        
        const availabilityDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const availability = await zohoClient.getContractorAvailability(contractorId, availabilityDate);
        
        return NextResponse.json({
          success: true,
          data: availability,
          contractor_id: contractorId,
          date: availabilityDate,
          timestamp: new Date().toISOString()
        });

      case 'profile':
        if (!contractorId) {
          return NextResponse.json(
            { error: 'contractor_id is required for profile action' },
            { status: 400 }
          );
        }
        
        const profile = await zohoClient.getContractorProfile(contractorId);
        
        return NextResponse.json({
          success: true,
          data: profile,
          contractor_id: contractorId,
          timestamp: new Date().toISOString()
        });

      case 'list':
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '50');
        const activeOnly = searchParams.get('active_only') === 'true';
        
        const contractors = await zohoClient.getContractorList(page, perPage, activeOnly);
        
        return NextResponse.json({
          success: true,
          data: contractors,
          page,
          per_page: perPage,
          active_only: activeOnly,
          timestamp: new Date().toISOString()
        });

      case 'timesheet':
        if (!contractorId) {
          return NextResponse.json(
            { error: 'contractor_id is required for timesheet action' },
            { status: 400 }
          );
        }
        
        const timesheetStart = searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const timesheetEnd = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
        
        const timesheet = await zohoClient.getContractorTimesheet(contractorId, timesheetStart, timesheetEnd);
        
        return NextResponse.json({
          success: true,
          data: timesheet,
          contractor_id: contractorId,
          date_range: { start_date: timesheetStart, end_date: timesheetEnd },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: schedule, assignments, availability, profile, list, timesheet' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Contractor Portal API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'CONTRACTOR_ERROR',
      resource: '/api/v1/contractor',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'contractor-portal',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to process contractor request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `CONTRACTOR_CREATE_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/v1/contractor',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'contractor-portal',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action }
    });

    switch (action) {
      case 'create-contractor':
        const newContractor = await zohoClient.createContractor(data);
        
        return NextResponse.json({
          success: true,
          data: newContractor,
          message: 'Contractor created successfully',
          timestamp: new Date().toISOString()
        });

      case 'create-assignment':
        const newAssignment = await zohoClient.createContractorAssignment(data);
        
        return NextResponse.json({
          success: true,
          data: newAssignment,
          message: 'Assignment created successfully',
          timestamp: new Date().toISOString()
        });

      case 'set-availability':
        const availability = await zohoClient.setContractorAvailability(data);
        
        return NextResponse.json({
          success: true,
          data: availability,
          message: 'Availability updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'submit-timesheet':
        const timesheet = await zohoClient.submitContractorTimesheet(data);
        
        return NextResponse.json({
          success: true,
          data: timesheet,
          message: 'Timesheet submitted successfully',
          timestamp: new Date().toISOString()
        });

      case 'request-time-off':
        const timeOffRequest = await zohoClient.createTimeOffRequest(data);
        
        return NextResponse.json({
          success: true,
          data: timeOffRequest,
          message: 'Time off request submitted successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: create-contractor, create-assignment, set-availability, submit-timesheet, request-time-off' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Contractor Portal POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create contractor record',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `CONTRACTOR_UPDATE_${action?.toUpperCase() || 'PUT'}`,
      resource: '/api/v1/contractor',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'contractor-portal',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action, id }
    });

    switch (action) {
      case 'update-profile':
        const updatedProfile = await zohoClient.updateContractorProfile(id, data);
        
        return NextResponse.json({
          success: true,
          data: updatedProfile,
          message: 'Contractor profile updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'update-assignment':
        const updatedAssignment = await zohoClient.updateContractorAssignment(id, data);
        
        return NextResponse.json({
          success: true,
          data: updatedAssignment,
          message: 'Assignment updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'approve-timesheet':
        const approvedTimesheet = await zohoClient.approveContractorTimesheet(id, data);
        
        return NextResponse.json({
          success: true,
          data: approvedTimesheet,
          message: 'Timesheet approved successfully',
          timestamp: new Date().toISOString()
        });

      case 'update-availability':
        const updatedAvailability = await zohoClient.updateContractorAvailability(id, data);
        
        return NextResponse.json({
          success: true,
          data: updatedAvailability,
          message: 'Availability updated successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: update-profile, update-assignment, approve-timesheet, update-availability' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Contractor Portal PUT error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update contractor record',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
