/**
 * Environment Configuration Types
 * Prevents configuration mismatches and ensures type safety
 */

// Environment variable validation
export interface RequiredEnvVars {
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test'
  
  // Zoho OAuth (Server-side only)
  ZOHO_CLIENT_ID: string
  ZOHO_CLIENT_SECRET: string
  ZOHO_REFRESH_TOKEN: string
  
  // Auth URLs
  NEXTAUTH_URL: string
  REDIRECT_URI: string
  
  // Catalyst Configuration
  CATALYST_APP_URL: string
  CATALYST_PROJECT_ID: string
  CATALYST_ENV_ID: string
}

export interface OptionalEnvVars {
  // Public Zoho config
  NEXT_PUBLIC_ZOHO_CLIENT_ID?: string
  
  // Zoho API endpoints
  ZOHO_CRM_API_URL?: string
  ZOHO_BOOKS_API_URL?: string
  ZOHO_CAMPAIGNS_API_URL?: string
  ZOHO_BOOKINGS_API_URL?: string
  ZOHO_ANALYTICS_API_URL?: string
  ZOHO_SIGN_API_URL?: string
  
  // Catalyst Function URLs
  CATALYST_FUNCTION_URL?: string
  ZIA_FUNCTION_URL?: string
  NOTIFICATIONS_FUNCTION_URL?: string
  ANALYTICS_FUNCTION_URL?: string
  
  // Business functions
  HR_FUNCTIONS_URL?: string
  QUICK_ACTIONS_URL?: string
  JOBS_FUNCTIONS_URL?: string
  SETTINGS_FUNCTIONS_URL?: string
  
  // Email configuration
  CATALYST_FROM_EMAIL?: string
  HR_EMAIL?: string
  
  // HIPAA and security
  HIPAA_COMPLIANCE_MODE?: string
  ENABLE_AUDIT_LOGGING?: string
  
  // Feature flags
  ENABLE_DEMO_MODE?: string
  ENABLE_ZIA_INTELLIGENCE?: string
  ENABLE_ANALYTICS?: string
}

export type EnvVars = RequiredEnvVars & OptionalEnvVars

export interface EnvironmentValidationResult {
  valid: boolean
  missing: string[]
  invalid: Array<{
    key: string
    value: string
    reason: string
  }>
  warnings: string[]
}

export interface CatalystURLConfig {
  base: string
  functions: {
    quickActions: string
    ziaIntelligence: string
    notifications: string
    analytics: string
    hrFunctions: string
    jobsFunctions: string
    settingsFunctions: string
  }
}

export interface ZohoAPIConfig {
  crm: string
  books: string
  campaigns: string
  bookings: string
  analytics: string
  sign: string
}

export interface ApplicationConfig {
  env: 'development' | 'production' | 'test'
  app: {
    url: string
    name: string
    version: string
  }
  auth: {
    nextAuthUrl: string
    redirectUri: string
    sessionDuration: number
  }
  catalyst: {
    projectId: string
    envId: string
    domain: string
    urls: CatalystURLConfig
  }
  zoho: {
    clientId: string
    apis: ZohoAPIConfig
    oauth: {
      clientSecret: string
      refreshToken: string
    }
  }
  features: {
    demoMode: boolean
    ziaIntelligence: boolean
    analytics: boolean
    hipaaCompliance: boolean
    auditLogging: boolean
  }
  email: {
    fromEmail: string
    hrEmail: string
  }
}

// Configuration validation schemas
export const ENV_VAR_PATTERNS = {
  ZOHO_CLIENT_ID: /^1000\.[A-Z0-9]+$/,
  ZOHO_REFRESH_TOKEN: /^1000\.[a-z0-9]+\.[a-z0-9_]+$/,
  CATALYST_PROJECT_ID: /^[0-9]+$/,
  CATALYST_ENV_ID: /^[0-9]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  BOOLEAN_STRING: /^(true|false)$/i
} as const

export const DEFAULT_CONFIG: Partial<ApplicationConfig> = {
  app: {
    name: 'Snug & Kisses CRM',
    version: '1.0.0'
  },
  auth: {
    sessionDuration: 15 * 60 * 1000 // 15 minutes
  },
  zoho: {
    apis: {
      crm: 'https://www.zohoapis.com/crm/v6',
      books: 'https://books.zoho.com/api/v3',
      campaigns: 'https://campaigns.zoho.com/api/v1.1',
      bookings: 'https://bookings.zoho.com/api/v1',
      analytics: 'https://analyticsapi.zoho.com/api',
      sign: 'https://sign.zoho.com/api/v1'
    }
  },
  features: {
    demoMode: false,
    ziaIntelligence: true,
    analytics: true,
    hipaaCompliance: true,
    auditLogging: true
  }
} as const

// Environment-specific overrides
export const DEVELOPMENT_OVERRIDES: Partial<ApplicationConfig> = {
  features: {
    demoMode: true,
    hipaaCompliance: false,
    auditLogging: false
  }
} as const

export const PRODUCTION_OVERRIDES: Partial<ApplicationConfig> = {
  features: {
    demoMode: false,
    hipaaCompliance: true,
    auditLogging: true
  }
} as const