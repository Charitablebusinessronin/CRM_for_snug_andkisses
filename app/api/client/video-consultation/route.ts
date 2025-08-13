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
    const { serviceType, urgency, notes } = body;

    // Initialize Zoho Bookings integration
    const bookingsIntegration = new ZohoBookingsIntegration();
    
    // Create telehealth appointment data
    const appointmentData = {
      service_id: 'telehealth_consult', // Use the telehealth service
      client_id: session.user.id,
      staff_id: 'np_001', // Default to Sarah Johnson, NP
      appointment_date: new Date().toISOString().split('T')[0], // Today
      start_time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      end_time: '', // Will be calculated based on service duration
      status: 'scheduled' as const,
      booking_source: 'online' as const,
      notes: notes || `Urgency: ${urgency || 'normal'}`
    };

    // Book telehealth appointment through Zoho
    const appointment = await bookingsIntegration.bookAppointment(appointmentData);
    
    // Generate video room URL: Option A - reuse Bookings appointment URL
    const roomUrl = `https://bookings.zoho.com/appointment/${appointment.id}`;
    
    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      roomUrl,
      message: 'Video consultation scheduled successfully',
      joinInstructions: 'Click the link above to join your video consultation'
    });

  } catch (error: any) {
    console.error('Video consultation error:', error);
    
    return NextResponse.json({
      error: 'Failed to schedule video consultation',
      details: error.message
    }, { status: 500 });
  }
}
