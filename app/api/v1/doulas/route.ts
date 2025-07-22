import { NextResponse } from 'next/server';
import { getDoulas } from '@/lib/zoho-crm';
import { logApiRequest } from '@/lib/hipaa-audit';

export async function GET(request: Request) {
  let response;
  try {
    const doulas = await getDoulas();

    response = NextResponse.json(
      { 
        message: 'Doulas fetched successfully', 
        data: doulas 
      }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('API Error: /api/v1/doulas', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    response = NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
  
  await logApiRequest(request as any, response);
  return response;
}
