// Environment configuration with validation
export const ENV_CONFIG = {
  // Zoho Configuration
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID || process.env.ZOHO_ONE_CLIENT_ID,
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || process.env.ZOHO_ONE_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN,
  ZOHO_USER_EMAIL: process.env.ZOHO_USER_EMAIL,

  // API URLs
  ZOHO_ACCOUNTS_URL: process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com",
  ZOHO_CRM_API_URL: process.env.ZOHO_CRM_API_URL || "https://www.zohoapis.com/crm/v2",
  ZOHO_BOOKS_API_URL: process.env.ZOHO_BOOKS_API_URL || "https://books.zohoapis.com/api/v3",

  // App Configuration
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api",
  NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:8000",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8001",

  // Security
  JWT_SECRET: process.env.JWT_SECRET,

  // Features
  HIPAA_CLOUD_BACKUP: process.env.HIPAA_CLOUD_BACKUP === "true",
  SEND_CONFIRMATION_EMAILS: process.env.SEND_CONFIRMATION_EMAILS === "true",
}

// Validation function
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ["ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN", "JWT_SECRET"]

  const missing = required.filter((key) => !ENV_CONFIG[key as keyof typeof ENV_CONFIG])

  return {
    valid: missing.length === 0,
    missing,
  }
}
