import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-enhanced';
import { crmLeadManager } from '@/lib/zoho/crm-lead-management';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, urgency, serviceType, preferredContactMethod } = body;

    // Create lead in Zoho CRM for provider contact request
    const leadData = {
      firstName: session.user.name?.split(' ')[0] || 'Client',
      lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      email: session.user.email || '',
      phone: '', // Would need to be added to user profile
      serviceType: serviceType || 'general_inquiry',
      urgency: urgency || 'normal',
      leadSource: 'Client Portal',
      notes: `Provider Contact Request: ${message}\nPreferred Contact: ${preferredContactMethod || 'email'}`,
      stage: 'Provider Contact Requested',
      status: 'New',
      assignedTo: 'np_001' // Assign to Sarah Johnson, NP
    };

    // Create lead in Zoho CRM
    const leadId = await crmLeadManager.createLead(leadData);
    
    return NextResponse.json({
      success: true,
      leadId,
      message: 'Provider contact request submitted successfully',
      estimatedResponseTime: urgency === 'urgent' ? 'Within 2 hours' : 'Within 24 hours',
      nextSteps: 'Your care provider will contact you using your preferred method'
    });

  } catch (error: any) {
    console.error('Contact provider error:', error);
    
    return NextResponse.json({
      error: 'Failed to submit provider contact request',
      details: error.message
    }, { status: 500 });
  }
}
