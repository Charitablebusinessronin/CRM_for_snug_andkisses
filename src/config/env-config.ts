import dotenv from 'dotenv';

dotenv.config();

interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  ALLOWED_ORIGINS?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ZOHO_CRM_CLIENT_ID: string;
  ZOHO_CRM_CLIENT_SECRET: string;
  ZOHO_CRM_REFRESH_TOKEN: string;
  ZOHO_ENVIRONMENT: 'production' | 'sandbox';
  ZOHO_DOMAIN: string;
  ZOHO_BOOKS_CLIENT_ID: string;
  ZOHO_BOOKS_CLIENT_SECRET: string;
  ZOHO_BOOKS_REFRESH_TOKEN: string;
  ZOHO_BOOKS_ORG_ID: string;
  CATALYST_PROJECT_ID: string;
  CATALYST_FROM_EMAIL: string;
}

const requiredEnvVars = [
  'ZOHO_CRM_CLIENT_ID',
  'ZOHO_CRM_CLIENT_SECRET',
  'ZOHO_CRM_REFRESH_TOKEN',
  'JWT_SECRET'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const envConfig: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '4728', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ZOHO_CRM_CLIENT_ID: process.env.ZOHO_CRM_CLIENT_ID!,
  ZOHO_CRM_CLIENT_SECRET: process.env.ZOHO_CRM_CLIENT_SECRET!,
  ZOHO_CRM_REFRESH_TOKEN: process.env.ZOHO_CRM_REFRESH_TOKEN!,
  ZOHO_ENVIRONMENT: (process.env.ZOHO_ENVIRONMENT as 'production' | 'sandbox') || 'sandbox',
  ZOHO_DOMAIN: process.env.ZOHO_DOMAIN || 'com',
  ZOHO_BOOKS_CLIENT_ID: process.env.ZOHO_BOOKS_CLIENT_ID || process.env.ZOHO_CRM_CLIENT_ID!,
  ZOHO_BOOKS_CLIENT_SECRET: process.env.ZOHO_BOOKS_CLIENT_SECRET || process.env.ZOHO_CRM_CLIENT_SECRET!,
  ZOHO_BOOKS_REFRESH_TOKEN: process.env.ZOHO_BOOKS_REFRESH_TOKEN || process.env.ZOHO_CRM_REFRESH_TOKEN!,
  ZOHO_BOOKS_ORG_ID: process.env.ZOHO_BOOKS_ORG_ID || '',
  CATALYST_PROJECT_ID: process.env.CATALYST_PROJECT_ID || '',
  CATALYST_FROM_EMAIL: process.env.CATALYST_FROM_EMAIL || 'noreply@yourdomain.com'
};
