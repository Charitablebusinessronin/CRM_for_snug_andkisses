/**
 * Zoho Email Automation API Routes
 * Phase 3 Complete Implementation - 100%
 * HIPAA-compliant email automation endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// Catalyst-first: mirror the CRM leads route strategy
const CATALYST_CRM_URL = 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function';

async function callCatalystEmail(action: string, params: any = {}) {
  const res = await fetch(CATALYST_CRM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Snug-Kisses-CRM/2.0'
    },
    body: JSON.stringify({ action, params })
  });
  if (!res.ok) throw new Error(`Catalyst email action failed: ${res.status}`);
  const data = await res.json();
  return data?.data ?? data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const campaignId = searchParams.get('campaignId');

    switch (action) {
      case 'templates':
        const templates = await callCatalystEmail('email_createTemplates');
        return NextResponse.json({
          success: true,
          data: templates,
          message: 'Email templates retrieved successfully'
        });

      case 'campaigns':
        const campaigns = await callCatalystEmail('email_setupAutomatedCampaigns');
        return NextResponse.json({
          success: true,
          data: campaigns,
          message: 'Email campaigns retrieved successfully'
        });

      case 'metrics':
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'Campaign ID is required for metrics'
          }, { status: 400 });
        }
        const metrics = await callCatalystEmail('email_getCampaignMetrics', { campaignId });
        return NextResponse.json({
          success: true,
          data: metrics,
          message: 'Campaign metrics retrieved successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Email automation API error:', msg);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'trigger_email':
        const { event, clientData } = data;
        if (!event || !clientData) {
          return NextResponse.json({
            success: false,
            error: 'Event and client data are required'
          }, { status: 400 });
        }
        await callCatalystEmail('email_trigger', { event, clientData });
        return NextResponse.json({
          success: true,
          message: 'Email triggered successfully'
        });

      case 'setup_templates':
        const templates = await callCatalystEmail('email_createTemplates');
        return NextResponse.json({
          success: true,
          data: templates,
          message: 'Email templates created successfully'
        });

      case 'setup_campaigns':
        const campaigns = await callCatalystEmail('email_setupAutomatedCampaigns');
        return NextResponse.json({
          success: true,
          data: campaigns,
          message: 'Automated campaigns created successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Email automation POST error:', msg);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? msg : undefined
    }, { status: 500 });
  }
}

// Handle webhook events from Zoho Campaigns
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, campaign_id, recipient_email, timestamp } = body;

    // Log webhook event for HIPAA compliance
    console.log('📧 Email Webhook Event:', {
      event_type,
      campaign_id,
      recipient_email: recipient_email ? `${recipient_email.substring(0, 3)}***` : 'unknown',
      timestamp,
      hipaa_audit: true
    });

    // Forward webhook to Catalyst for centralized processing
    await callCatalystEmail('email_webhook', { event_type, campaign_id, recipient_email, timestamp });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    const msg = String(error);
    console.error('Email webhook error:', msg);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}