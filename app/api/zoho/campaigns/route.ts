/**
 * Zoho Campaigns API Integration Endpoint
 * Connects directly to Zoho Campaigns APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { zohoClient } from '@/lib/zoho-api-client';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `ZOHO_CAMPAIGNS_${action?.toUpperCase() || 'GET'}`,
      resource: '/api/zoho/campaigns',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-campaigns',
      request_id: crypto.randomUUID(),
      result: 'success'
    });

    switch (action) {
      case 'list':
        const campaigns = await zohoClient.getCampaigns();
        
        return NextResponse.json({
          success: true,
          data: campaigns,
          count: campaigns.length,
          timestamp: new Date().toISOString()
        });

      case 'analytics':
        const campaignId = searchParams.get('campaign_id');
        if (!campaignId) {
          return NextResponse.json(
            { error: 'campaign_id is required for analytics' },
            { status: 400 }
          );
        }
        
        const analytics = await zohoClient.getCampaignAnalytics(campaignId);
        
        return NextResponse.json({
          success: true,
          data: analytics,
          campaign_id: campaignId,
          timestamp: new Date().toISOString()
        });

      case 'dashboard':
        const dashboard = await zohoClient.getCampaignsDashboard();
        
        return NextResponse.json({
          success: true,
          data: dashboard,
          timestamp: new Date().toISOString()
        });

      case 'test-connection':
        const testResult = await zohoClient.testConnections();
        
        return NextResponse.json({
          success: true,
          connection_status: testResult.campaigns,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: list, analytics, dashboard, test-connection' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho Campaigns API error:', error);
    
    // Log error for HIPAA compliance
    await logAuditEvent({
      action: 'ZOHO_CAMPAIGNS_ERROR',
      resource: '/api/zoho/campaigns',
      user_id: 'system',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-campaigns',
      request_id: crypto.randomUUID(),
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        error: 'Failed to connect to Zoho Campaigns',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Log API access for HIPAA compliance
    await logAuditEvent({
      action: `ZOHO_CAMPAIGNS_CREATE_${action?.toUpperCase() || 'POST'}`,
      resource: '/api/zoho/campaigns',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'zoho-campaigns',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { action }
    });

    switch (action) {
      case 'create-campaign':
        const newCampaign = await zohoClient.createCampaign(data);
        
        return NextResponse.json({
          success: true,
          data: newCampaign,
          message: 'Campaign created successfully in Zoho Campaigns',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: create-campaign' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Zoho Campaigns POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create campaign in Zoho Campaigns',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}