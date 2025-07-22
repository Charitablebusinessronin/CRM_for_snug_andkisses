import { NextResponse } from 'next/server';
import { getContactDetails } from '@/lib/zoho-crm';
import { logApiRequest } from '@/lib/hipaa-audit';

// This is a placeholder for getting the logged-in user's contact ID.
// In a real application, this would come from the user's session.
const getContactIdForCurrentUser = async (): Promise<string> => {
  // For now, returning a hardcoded ID for a test contact.
  // Replace this with actual session logic.
  return "HARDCODED_CONTACT_ID"; 
};

export async function GET(request: Request) {
  let response;
  try {
    const contactId = await getContactIdForCurrentUser();
    if (!contactId) {
        response = NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
        await logApiRequest(request as any, response);
        return response;
    }

    const contactDetails = await getContactDetails(contactId);

    response = NextResponse.json(
      { 
        message: 'Client dashboard data fetched successfully', 
        data: contactDetails
      }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('API Error: /api/v1/client-dashboard', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  
  await logApiRequest(request as any, response);
  return response;
}
