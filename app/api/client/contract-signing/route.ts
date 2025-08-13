import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-enhanced';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contractType, serviceDetails, startDate, endDate } = body;

    // Initialize Zoho Sign integration
    const signIntegration = new ZohoSignIntegration();
    
    // Create contract document
    const contractData = {
      template_name: contractType === 'postpartum' ? 'Postpartum Care Agreement' : 'General Service Agreement',
      client_name: session.user.name || 'Client',
      client_email: session.user.email || '',
      service_details: serviceDetails,
      start_date: startDate,
      end_date: endDate,
      terms: getContractTerms(contractType)
    };

    // Create and send contract via Zoho Sign
    const contract = await signIntegration.createContract(contractData);
    
    return NextResponse.json({
      success: true,
      contractId: contract.id,
      signUrl: contract.sign_url,
      message: 'Contract sent for signature',
      nextSteps: 'Check your email for the contract link and sign electronically'
    });

  } catch (error: any) {
    console.error('Contract signing error:', error);
    
    return NextResponse.json({
      error: 'Failed to create contract',
      details: error.message
    }, { status: 500 });
  }
}

class ZohoSignIntegration {
  private baseUrl = 'https://sign.zoho.com/api/v1';
  
  async createContract(contractData: any) {
    // This would integrate with Zoho Sign API
    // For now, return mock structure
    return {
      id: `contract_${Date.now()}`,
      sign_url: `https://sign.zoho.com/contract/${Date.now()}`,
      status: 'sent_for_signature'
    };
  }
}

function getContractTerms(contractType: string) {
  const terms = {
    postpartum: [
      '24/7 on-call support during specified period',
      'In-home visits as scheduled',
      'Emergency response within 2 hours',
      'HIPAA-compliant care documentation'
    ],
    general: [
      'Professional care services as outlined',
      'Scheduled appointments and availability',
      'Emergency protocols and response times',
      'Confidentiality and privacy protection'
    ]
  };
  
  return terms[contractType as keyof typeof terms] || terms.general;
}

