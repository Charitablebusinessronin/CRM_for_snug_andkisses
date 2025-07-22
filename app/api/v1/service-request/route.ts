import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCase } from '@/lib/zoho-crm';
import { logApiRequest } from '@/lib/hipaa-audit';

// Define the validation schema using Zod
const serviceRequestSchema = z.object({
  serviceType: z.enum(['postpartum', 'birth', 'sitter', 'both']),
});

// This is a placeholder for getting the logged-in user's contact ID.
// In a real application, this would come from the user's session.
const getContactIdForCurrentUser = async (): Promise<string> => {
  // For now, returning a hardcoded ID for a test contact.
  // Replace this with actual session logic.
  return "HARDCODED_CONTACT_ID"; 
};

export async function POST(request: Request) {
  let response;
  try {
    const body = await request.json();
    const validation = serviceRequestSchema.safeParse(body);

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

    // In a real app, you'd get the contactId from the user's session
    const contactId = await getContactIdForCurrentUser(); 
    if (!contactId) {
        response = NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        await logApiRequest(request as any, response);
        return response;
    }

    const result = await createCase(contactId, validation.data.serviceType);

    response = NextResponse.json(
      { 
        message: 'Service request submitted successfully', 
        data: result 
      }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('API Error: /api/v1/service-request', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  
  await logApiRequest(request as any, response);
  return response;
}