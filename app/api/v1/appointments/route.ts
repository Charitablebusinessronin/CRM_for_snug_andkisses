import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAppointments, createAppointment } from '@/lib/zoho-crm';
import { logApiRequest } from '@/lib/hipaa-audit';

const appointmentSchema = z.object({
  subject: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  contactId: z.string(),
});

export async function GET(request: Request) {
  let response;
  try {
    const appointments = await getAppointments();
    response = NextResponse.json({ message: 'Appointments fetched successfully', data: appointments }, { status: 200 });
  } catch (error: unknown) {
    console.error('API Error: /api/v1/appointments (GET)', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  await logApiRequest(request as any, response);
  return response;
}

export async function POST(request: Request) {
  let response;
  try {
    const body = await request.json();
    const validation = appointmentSchema.safeParse(body);

    if (!validation.success) {
      response = NextResponse.json(
        { 
          message: 'Invalid input', 
          errors: validation.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      );
      await logApiRequest(request as any, response);
      return response;
    }

    const result = await createAppointment(validation.data);

    response = NextResponse.json(
      { 
        message: 'Appointment created successfully', 
        data: result 
      }, 
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('API Error: /api/v1/appointments (POST)', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  
  await logApiRequest(request as any, response);
  return response;
}