import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-enhanced';
import ZohoBookingsIntegration from '@/lib/zoho/bookings-integration';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceType, preferredDate, preferredTime, notes } = body;

    // Initialize Zoho Bookings integration
    const bookingsIntegration = new ZohoBookingsIntegration();
    
    // Create appointment data
    const appointmentData = {
      service_id: serviceType || 'initial_consultation',
      client_id: session.user.id,
      staff_id: 'np_001', // Default to Sarah Johnson, NP
      appointment_date: preferredDate,
      start_time: preferredTime,
      end_time: '', // Will be calculated based on service duration
      status: 'scheduled' as const,
      booking_source: 'online' as const,
      notes: notes || ''
    };

    // Optionally suggest available times for the selected day/service
    const suggestedTimes = await bookingsIntegration.getAvailableSlots(
      appointmentData.service_id,
      appointmentData.appointment_date,
      appointmentData.staff_id
    ).catch(() => []);

    // Book appointment through Zoho
    const appointment = await bookingsIntegration.bookAppointment(appointmentData);
    
    // Get the booking URL from Zoho Bookings
    const bookingUrl = `https://bookings.zoho.com/appointment/${appointment.id}`;
    
    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      bookingUrl,
      suggestedTimes,
      message: 'Appointment scheduled successfully'
    });

  } catch (error: any) {
    console.error('Schedule appointment error:', error);
    
    return NextResponse.json({
      error: 'Failed to schedule appointment',
      details: error.message
    }, { status: 500 });
  }
}
