/**
 * Zoho Campaigns API Integration Endpoint
 * Proxies requests to Catalyst backend
 */

import { NextRequest, NextResponse } from 'next/server';

const CATALYST_CRM_URL = process.env.NEXT_PUBLIC_CATALYST_CRM_URL;

if (!CATALYST_CRM_URL) {
  throw new Error('NEXT_PUBLIC_CATALYST_CRM_URL environment variable is not set');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Forward the request to Catalyst backend
    const response = await fetch(`${CATALYST_CRM_URL}/zoho/campaigns?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0',
        ...Object.fromEntries(request.headers.entries())
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error from Catalyst backend:', error);
      throw new Error(`Failed to fetch from Catalyst: ${response.statusText}`);
    }

    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (error: unknown) {
    console.error('Zoho Campaigns API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Forward the request to Catalyst backend
    const response = await fetch(`${CATALYST_CRM_URL}/zoho/campaigns?${searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Snug-Kisses-CRM/2.0',
        ...Object.fromEntries(request.headers.entries())
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error from Catalyst backend:', error);
      throw new Error(`Failed to process request: ${response.statusText}`);
    }

    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (error: unknown) {
    console.error('Zoho Campaigns API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}