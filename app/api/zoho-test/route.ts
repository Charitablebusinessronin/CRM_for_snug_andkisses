import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const config = {
      clientId: process.env.ZOHO_ONE_CLIENT_ID,
      clientSecret: process.env.ZOHO_ONE_CLIENT_SECRET ? '✅ Set (hidden for security)' : '❌ Missing',
      redirectUri: process.env.ZOHO_ONE_REDIRECT_URI,
      accessType: process.env.ZOHO_ONE_ACCESS_TYPE,
      accountsUrl: process.env.ZOHO_ACCOUNTS_URL,
      crmApiUrl: process.env.ZOHO_CRM_API_URL,
      booksApiUrl: process.env.ZOHO_BOOKS_API_URL,
      campaignsApiUrl: process.env.ZOHO_CAMPAIGNS_API_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    // Check if all required variables are set
    const missingVars = Object.entries({
      ZOHO_ONE_CLIENT_ID: process.env.ZOHO_ONE_CLIENT_ID,
      ZOHO_ONE_CLIENT_SECRET: process.env.ZOHO_ONE_CLIENT_SECRET,
      ZOHO_ONE_REDIRECT_URI: process.env.ZOHO_ONE_REDIRECT_URI,
      ZOHO_CRM_API_URL: process.env.ZOHO_CRM_API_URL,
    }).filter(([_, value]) => !value).map(([key]) => key);

    const status = missingVars.length === 0 ? 200 : 500;
    const message = missingVars.length === 0 
      ? '✅ All required environment variables are set!' 
      : `❌ Missing required environment variables: ${missingVars.join(', ')}`;

    return NextResponse.json({
      success: missingVars.length === 0,
      message,
      config,
      timestamp: new Date().toISOString(),
    }, { status });

  } catch (error) {
    console.error('Zoho Test Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing Zoho configuration',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
