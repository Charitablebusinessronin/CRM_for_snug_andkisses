/**
 * Environment configuration with validation.
 * This file contains the configuration for the application, including Zoho credentials, API URLs, and other settings.
 * It also provides a function to validate that all required environment variables are set.
 */
export const ENV_CONFIG = {
  // Zoho Configuration
  ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID || process.env.ZOHO_ONE_CLIENT_ID || process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET || process.env.ZOHO_ONE_CLIENT_SECRET || process.env.NEXT_PUBLIC_ZOHO_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN || process.env.NEXT_PUBLIC_ZOHO_REFRESH_TOKEN,
  ZOHO_USER_EMAIL: process.env.ZOHO_USER_EMAIL,

  // API URLs
  ZOHO_ACCOUNTS_URL: process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com",
  ZOHO_CRM_API_URL: process.env.ZOHO_CRM_API_URL || process.env.NEXT_PUBLIC_ZOHO_CRM_API_URL || "https://www.zohoapis.com/crm/v6",
  ZOHO_BOOKS_API_URL: process.env.ZOHO_BOOKS_API_URL || process.env.NEXT_PUBLIC_ZOHO_BOOKS_API_URL || "https://books.zoho.com/api/v3",

  // App Configuration
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api",
  NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:8000",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8001",

  // Security
  JWT_SECRET: process.env.JWT_SECRET,

  // Features
  HIPAA_CLOUD_BACKUP: process.env.HIPAA_CLOUD_BACKUP === "true",
  SEND_CONFIRMATION_EMAILS: process.env.SEND_CONFIRMATION_EMAILS === "true",
}

/**
 * Validates that all required environment variables are set.
 * @returns {{valid: boolean, missing: string[]}} - An object indicating whether the environment is valid and a list of any missing variables.
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ["ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN", "JWT_SECRET"]

  const missing = required.filter((key) => !ENV_CONFIG[key as keyof typeof ENV_CONFIG])

  return {
    valid: missing.length === 0,
    missing,
  }
}
