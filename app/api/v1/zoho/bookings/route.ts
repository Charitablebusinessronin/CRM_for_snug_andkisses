/**
 * Zoho Bookings Integration API Routes (Catalyst-native proxy)
 * Healthcare appointment booking system with CRM integration
 */

import { NextRequest } from 'next/server';
import respond from '@/lib/api-respond'

// Catalyst-first: proxy all bookings actions to Catalyst function endpoint
const CATALYST_CRM_URL = 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function';

async function callCatalystBookings(action: string, params: any = {}) {
  const res = await fetch(CATALYST_CRM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Snug-Kisses-CRM/2.0'
    },
    body: JSON.stringify({ action, params })
  });
  if (!res.ok) throw new Error(`Catalyst bookings action failed: ${res.status}`);
  const data = await res.json();
  return data?.data ?? data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'services':
        const services = await callCatalystBookings('bookings_setupServices');
        return respond.ok({
          data: services,
          message: 'Booking services retrieved successfully'
        });

      case 'staff':
        const staff = await callCatalystBookings('bookings_setupStaff');
        return respond.ok({
          data: staff,
          message: 'Staff availability retrieved successfully'
        });

      case 'availability':
        if (!serviceId || !date) {
          return respond.badRequest('Service ID and date are required for availability check', 'missing_params')
        }

        const availableSlots = await callCatalystBookings('bookings_getAvailableSlots', { serviceId, date, staffId });
        return respond.ok({
          data: availableSlots,
          message: 'Available time slots retrieved successfully'
        });

      case 'analytics':
        if (!startDate || !endDate) {
          return respond.badRequest('Start date and end date are required for analytics', 'missing_params')
        }

        const analytics = await callCatalystBookings('bookings_getAnalytics', { startDate, endDate });
        return respond.ok({
          data: analytics,
          message: 'Booking analytics retrieved successfully'
        });

      default:
        return respond.badRequest('Invalid action parameter', 'invalid_action')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Bookings API error:', msg);
    return respond.serverError('Internal server error', 'bookings_get_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'book_appointment':
        const {
          service_id,
          client_id,
          staff_id,
          appointment_date,
          start_time,
          end_time,
          booking_source = 'online',
          notes = ''
        } = data;

        if (!service_id || !client_id || !appointment_date || !start_time) {
          return respond.badRequest('Service ID, client ID, appointment date, and start time are required', 'missing_params')
        }

        const appointmentData = {
          service_id,
          client_id,
          staff_id,
          appointment_date,
          start_time,
          end_time,
          booking_source,
          notes,
          status: 'scheduled',
          reminder_sent: false,
          follow_up_required: false
        };

        const appointment = await callCatalystBookings('bookings_bookAppointment', appointmentData);
        return respond.created({
          data: appointment,
          message: 'Appointment booked successfully'
        });

      case 'setup_services':
        const services = await callCatalystBookings('bookings_setupServices');
        return respond.ok({
          data: services,
          message: 'Booking services setup completed'
        });

      case 'setup_staff':
        const staff = await callCatalystBookings('bookings_setupStaff');
        return respond.ok({
          data: staff,
          message: 'Staff availability setup completed'
        });

      default:
        return respond.badRequest('Invalid action parameter', 'invalid_action')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Bookings POST error:', msg);
    return respond.serverError('Internal server error', 'bookings_post_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, appointmentId, ...data } = body;

    if (!appointmentId) {
      return respond.badRequest('Appointment ID is required', 'missing_params')
    }

    switch (action) {
      case 'cancel':
        const { reason = 'Client requested cancellation' } = data;
        await callCatalystBookings('bookings_cancelAppointment', { appointmentId, reason });
        return respond.ok({ message: 'Appointment cancelled successfully' })

      case 'reschedule':
        const { newDate, newTime } = data;
        if (!newDate || !newTime) {
          return respond.badRequest('New date and time are required for rescheduling', 'missing_params')
        }

        await callCatalystBookings('bookings_rescheduleAppointment', { appointmentId, newDate, newTime });
        return respond.ok({ message: 'Appointment rescheduled successfully' })

      default:
        return respond.badRequest('Invalid action parameter', 'invalid_action')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Bookings PUT error:', msg);
    return respond.serverError('Internal server error', 'bookings_put_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    })
  }
}

// Handle webhook events from Zoho Bookings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      event_type, 
      appointment_id, 
      client_email, 
      staff_id, 
      service_id, 
      appointment_date,
      timestamp 
    } = body;

    // Log webhook event for HIPAA compliance
    console.log('📅 Booking Webhook Event:', {
      event_type,
      appointment_id,
      client_email: client_email ? `${client_email.substring(0, 3)}***` : 'unknown',
      staff_id,
      service_id,
      appointment_date,
      timestamp,
      hipaa_audit: true
    });

    // Process webhook based on event type
    switch (event_type) {
      case 'appointment_booked':
        // Trigger welcome email sequence
        // Update CRM lead status
        // Schedule reminder notifications
        break;
      
      case 'appointment_confirmed':
        // Send confirmation email
        // Update appointment status in CRM
        break;
      
      case 'appointment_cancelled':
        // Send cancellation notification
        // Update CRM status
        // Trigger follow-up sequence
        break;
      
      case 'appointment_completed':
        // Trigger follow-up email
        // Update client status in CRM
        // Schedule satisfaction survey
        break;
      
      case 'appointment_no_show':
        // Update appointment status
        // Trigger re-engagement sequence
        break;
      
      default:
        console.log('Unknown booking webhook event:', event_type);
    }
    return respond.ok({ message: 'Booking webhook processed successfully' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Booking webhook error:', msg);
    return respond.serverError('Webhook processing failed', 'bookings_webhook_failed', {
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    })
  }
}