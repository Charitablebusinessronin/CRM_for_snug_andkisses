/**
 * Business Modules API - Calendar, Booking, Reports, and Analytics
 * Handles core business functionality for healthcare CRM
 */

import { NextRequest, NextResponse } from 'next/server';
// import { zohoClient } from '@/lib/zoho-api-client';
// import { logAuditEvent } from '@/lib/hipaa-audit-edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `BUSINESS_${module?.toUpperCase()}_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/v1/business',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'business-modules',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    switch (module) {
      case 'calendar':
        return await handleCalendarModule(searchParams, action);
      
      case 'booking':
        return await handleBookingModule(searchParams, action);
      
      case 'reports':
        return await handleReportsModule(searchParams, action);
      
      case 'analytics':
        return await handleAnalyticsModule(searchParams, action);
      
      default:
        return NextResponse.json(
          { error: 'Invalid module. Available modules: calendar, booking, reports, analytics' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Business Modules API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'BUSINESS_ERROR',
      resource: '/api/v1/business',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'business-modules',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to process business module request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleCalendarModule(searchParams: URLSearchParams, action: string | null) {
  switch (action) {
    case 'events':
      const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
      const endDate = searchParams.get('end_date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const events = await zohoClient.getCalendarEvents(startDate, endDate);
      
      return NextResponse.json({
        success: true,
        data: events,
        date_range: { start_date: startDate, end_date: endDate },
        timestamp: new Date().toISOString()
      });

    case 'availability':
      const availDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const providerId = searchParams.get('provider_id');
      const availability = await zohoClient.getProviderAvailability(availDate, providerId);
      
      return NextResponse.json({
        success: true,
        data: availability,
        date: availDate,
        provider_id: providerId,
        timestamp: new Date().toISOString()
      });

    case 'appointments':
      const appointmentDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const status = searchParams.get('status') || 'all';
      const appointments = await zohoClient.getAppointments(appointmentDate, status);
      
      return NextResponse.json({
        success: true,
        data: appointments,
        date: appointmentDate,
        status_filter: status,
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid calendar action. Available actions: events, availability, appointments' },
        { status: 400 }
      );
  }
}

async function handleBookingModule(searchParams: URLSearchParams, action: string | null) {
  switch (action) {
    case 'slots':
      const slotDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const serviceType = searchParams.get('service_type');
      const slots = await zohoClient.getAvailableSlots(slotDate, serviceType);
      
      return NextResponse.json({
        success: true,
        data: slots,
        date: slotDate,
        service_type: serviceType,
        timestamp: new Date().toISOString()
      });

    case 'services':
      const services = await zohoClient.getBookingServices();
      
      return NextResponse.json({
        success: true,
        data: services,
        timestamp: new Date().toISOString()
      });

    case 'bookings':
      const bookingPage = parseInt(searchParams.get('page') || '1');
      const bookingPerPage = parseInt(searchParams.get('per_page') || '20');
      const bookingStatus = searchParams.get('status') || 'all';
      const bookings = await zohoClient.getBookings(bookingPage, bookingPerPage, bookingStatus);
      
      return NextResponse.json({
        success: true,
        data: bookings,
        page: bookingPage,
        per_page: bookingPerPage,
        status_filter: bookingStatus,
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid booking action. Available actions: slots, services, bookings' },
        { status: 400 }
      );
  }
}

async function handleReportsModule(searchParams: URLSearchParams, action: string | null) {
  switch (action) {
    case 'patient-summary':
      const reportStart = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const reportEnd = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
      const patientSummary = await zohoClient.getPatientSummaryReport(reportStart, reportEnd);
      
      return NextResponse.json({
        success: true,
        data: patientSummary,
        date_range: { start_date: reportStart, end_date: reportEnd },
        timestamp: new Date().toISOString()
      });

    case 'revenue':
      const revenueStart = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const revenueEnd = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
      const revenueReport = await zohoClient.getRevenueReport(revenueStart, revenueEnd);
      
      return NextResponse.json({
        success: true,
        data: revenueReport,
        date_range: { start_date: revenueStart, end_date: revenueEnd },
        timestamp: new Date().toISOString()
      });

    case 'contractor-performance':
      const perfStart = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const perfEnd = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
      const contractorId = searchParams.get('contractor_id');
      const performanceReport = await zohoClient.getContractorPerformanceReport(perfStart, perfEnd, contractorId);
      
      return NextResponse.json({
        success: true,
        data: performanceReport,
        date_range: { start_date: perfStart, end_date: perfEnd },
        contractor_id: contractorId,
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid reports action. Available actions: patient-summary, revenue, contractor-performance' },
        { status: 400 }
      );
  }
}

async function handleAnalyticsModule(searchParams: URLSearchParams, action: string | null) {
  switch (action) {
    case 'dashboard':
      const dashboardData = await zohoClient.getAnalyticsDashboard();
      
      return NextResponse.json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });

    case 'trends':
      const trendPeriod = searchParams.get('period') || '30';
      const trendMetric = searchParams.get('metric') || 'appointments';
      const trends = await zohoClient.getTrends(trendPeriod, trendMetric);
      
      return NextResponse.json({
        success: true,
        data: trends,
        period: trendPeriod,
        metric: trendMetric,
        timestamp: new Date().toISOString()
      });

    case 'kpis':
      const kpiPeriod = searchParams.get('period') || '30';
      const kpis = await zohoClient.getKPIs(kpiPeriod);
      
      return NextResponse.json({
        success: true,
        data: kpis,
        period: kpiPeriod,
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid analytics action. Available actions: dashboard, trends, kpis' },
        { status: 400 }
      );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, action, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `BUSINESS_CREATE_${module?.toUpperCase()}_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/v1/business',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'business-modules',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { module, action }
    });

    switch (module) {
      case 'calendar':
        return await handleCalendarCreate(action, data);
      
      case 'booking':
        return await handleBookingCreate(action, data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid module for POST. Available modules: calendar, booking' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Business Modules POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create business module record',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleCalendarCreate(action: string, data: any) {
  switch (action) {
    case 'create-event':
      const newEvent = await zohoClient.createCalendarEvent(data);
      
      return NextResponse.json({
        success: true,
        data: newEvent,
        message: 'Calendar event created successfully',
        timestamp: new Date().toISOString()
      });

    case 'create-appointment':
      const newAppointment = await zohoClient.createAppointment(data);
      
      return NextResponse.json({
        success: true,
        data: newAppointment,
        message: 'Appointment scheduled successfully',
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid calendar action. Available actions: create-event, create-appointment' },
        { status: 400 }
      );
  }
}

async function handleBookingCreate(action: string, data: any) {
  switch (action) {
    case 'create-booking':
      const newBooking = await zohoClient.createBooking(data);
      
      return NextResponse.json({
        success: true,
        data: newBooking,
        message: 'Booking created successfully',
        timestamp: new Date().toISOString()
      });

    case 'create-service':
      const newService = await zohoClient.createBookingService(data);
      
      return NextResponse.json({
        success: true,
        data: newService,
        message: 'Service created successfully',
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid booking action. Available actions: create-booking, create-service' },
        { status: 400 }
      );
  }
}
