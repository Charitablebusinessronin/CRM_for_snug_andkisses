import { NextResponse } from 'next/server';
import { z } from 'zod';
import { syncContactAndCreateDeal } from '@/lib/zoho-crm';
import { logApiRequest } from '@/lib/hipaa-audit';

// Define the validation schema using Zod
const contactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  let response;
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

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

    const result = await syncContactAndCreateDeal(validation.data);

    response = NextResponse.json(
      { 
        message: 'Inquiry submitted successfully', 
        data: result 
      }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('API Error: /api/v1/contact', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  
  await logApiRequest(request as any, response);
  return response;
}
