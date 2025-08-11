/**
 * Team Messages API - Real-time team communication
 * HIPAA-compliant messaging system for healthcare team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/hipaa-audit-edge';

// Mock team messages data - in production this would be a database
let teamMessages: any[] = [
  {
    id: 'tm_001',
    user_id: 'emp_001',
    user_name: 'Dr. Sarah Chen',
    message: 'Ready for new client appointments today 👍',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    channel: 'general',
    type: 'message'
  },
  {
    id: 'tm_002',
    user_id: 'emp_002',
    user_name: 'Nurse Emily Rodriguez',
    message: 'Running 15 minutes late to Johnson family appointment',
    timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    channel: 'general',
    type: 'status_update'
  },
  {
    id: 'tm_003',
    user_id: 'emp_003',
    user_name: 'Lactation Consultant Mike Wilson',
    message: 'Just finished with the Martinez family. Everything went well!',
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    channel: 'general',
    type: 'message'
  },
  {
    id: 'tm_004',
    user_id: 'emp_001',
    user_name: 'Dr. Sarah Chen',
    message: 'Need assistance with overnight shift coverage for tomorrow',
    timestamp: new Date(Date.now() - 60000).toISOString(), // 1 min ago
    channel: 'scheduling',
    type: 'request'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'general';
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Filter messages by channel
    const filteredMessages = teamMessages
      .filter(msg => msg.channel === channel)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Log access for HIPAA compliance
    await logAuditEvent({
      action: 'TEAM_MESSAGES_ACCESS',
      resource: '/api/v1/team-messages',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'team-messages',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: { channel, message_count: filteredMessages.length }
    });

    return NextResponse.json({
      success: true,
      data: filteredMessages,
      channel,
      total: filteredMessages.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team messages GET error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve team messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, channel = 'general', type = 'message' } = body;
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const userName = request.headers.get('x-user-name') || 'Anonymous User';

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create new message
    const newMessage = {
      id: `tm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      user_name: userName,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      channel,
      type
    };

    // Add to messages array (in production, save to database)
    teamMessages.unshift(newMessage);

    // Keep only last 100 messages to prevent memory overflow
    if (teamMessages.length > 100) {
      teamMessages = teamMessages.slice(0, 100);
    }

    // Log message creation for HIPAA compliance
    await logAuditEvent({
      action: 'TEAM_MESSAGE_SENT',
      resource: '/api/v1/team-messages',
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: 'team-messages',
      request_id: crypto.randomUUID(),
      result: 'success',
      data: {
        message_id: newMessage.id,
        channel,
        type,
        message_length: message.length
      }
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Team messages POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET team members status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'get_team_status') {
      const teamMembers = [
        {
          id: 'emp_001',
          name: 'Dr. Sarah Chen',
          role: 'Primary Care Physician',
          status: 'available',
          last_seen: new Date(Date.now() - 60000).toISOString(),
          current_clients: 2,
          avatar: null
        },
        {
          id: 'emp_002',
          name: 'Nurse Emily Rodriguez',
          role: 'Registered Nurse',
          status: 'busy',
          last_seen: new Date(Date.now() - 300000).toISOString(),
          current_clients: 1,
          avatar: null
        },
        {
          id: 'emp_003',
          name: 'Mike Wilson',
          role: 'Lactation Consultant',
          status: 'available',
          last_seen: new Date(Date.now() - 120000).toISOString(),
          current_clients: 0,
          avatar: null
        },
        {
          id: 'emp_004',
          name: 'Jessica Davis',
          role: 'Certified Doula',
          status: 'offline',
          last_seen: new Date(Date.now() - 3600000).toISOString(),
          current_clients: 3,
          avatar: null
        }
      ];

      return NextResponse.json({
        success: true,
        data: teamMembers,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Team status PUT error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get team status'
      },
      { status: 500 }
    );
  }
}