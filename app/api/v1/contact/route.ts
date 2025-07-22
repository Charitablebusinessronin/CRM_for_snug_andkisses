import { NextResponse } from 'next/server';
import { syncContactAndCreateDeal } from '@/lib/zoho-crm';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation - more robust validation will be added later
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const result = await syncContactAndCreateDeal(body);

    return NextResponse.json({ message: 'Inquiry submitted successfully', data: result }, { status: 200 });

  } catch (error) {
    console.error('API Error: /api/v1/contact', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
