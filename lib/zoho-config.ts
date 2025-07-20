export const ZOHO_CONFIG = {
  CLIENT_ID: process.env.ZOHO_ONE_CLIENT_ID!,
  CLIENT_SECRET: process.env.ZOHO_ONE_CLIENT_SECRET!,
  REDIRECT_URI: process.env.ZOHO_ONE_REDIRECT_URI!,
  ACCESS_TYPE: process.env.ZOHO_ONE_ACCESS_TYPE || "offline",

  // API Endpoints
  ACCOUNTS_URL: process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com",
  CRM_API_URL: process.env.ZOHO_CRM_API_URL || "https://www.zohoapis.com/crm/v2",
  BOOKS_API_URL: process.env.ZOHO_BOOKS_API_URL || "https://books.zohoapis.com/api/v3",
  CAMPAIGNS_API_URL: process.env.ZOHO_CAMPAIGNS_API_URL || "https://campaigns.zoho.com/api/v1.1",

  // OAuth Scopes
  SCOPES: [
    "ZohoCRM.modules.ALL",
    "ZohoCRM.settings.ALL",
    "ZohoBooks.fullaccess.all",
    "ZohoCampaigns.campaign.ALL",
    "ZohoCampaigns.contact.ALL",
  ].join(","),

  // Token storage keys
  ACCESS_TOKEN_KEY: "zoho_access_token",
  REFRESH_TOKEN_KEY: "zoho_refresh_token",
  EXPIRES_AT_KEY: "zoho_token_expires_at",
}

export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: ZOHO_CONFIG.CLIENT_ID,
    scope: ZOHO_CONFIG.SCOPES,
    redirect_uri: ZOHO_CONFIG.REDIRECT_URI,
    access_type: ZOHO_CONFIG.ACCESS_TYPE,
    prompt: "consent",
  })

  return `${ZOHO_CONFIG.ACCOUNTS_URL}/oauth/v2/auth?${params.toString()}`
}
