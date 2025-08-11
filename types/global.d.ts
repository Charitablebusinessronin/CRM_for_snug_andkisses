export {}

declare global {
  interface Window {
    socket?: {
      connected?: boolean
      emit?: (event: string, payload?: any) => void
    }
    // Catalyst SDK globals
    catalyst?: {
      app?: any
      initialized?: boolean
    }
    // Configuration validation
    __CONFIG_VALIDATED__?: boolean
    __CATALYST_CONFIG__?: {
      projectId: string
      envId: string
      domain: string
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
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
      
      // Optional environment variables
      NEXT_PUBLIC_ZOHO_CLIENT_ID?: string
      ZOHO_CRM_API_URL?: string
      ZOHO_BOOKS_API_URL?: string
      ZOHO_CAMPAIGNS_API_URL?: string
      ZOHO_BOOKINGS_API_URL?: string
      ZOHO_ANALYTICS_API_URL?: string
      ZOHO_SIGN_API_URL?: string
      
      CATALYST_FUNCTION_URL?: string
      ZIA_FUNCTION_URL?: string
      NOTIFICATIONS_FUNCTION_URL?: string
      ANALYTICS_FUNCTION_URL?: string
      HR_FUNCTIONS_URL?: string
      QUICK_ACTIONS_URL?: string
      JOBS_FUNCTIONS_URL?: string
      SETTINGS_FUNCTIONS_URL?: string
      
      CATALYST_FROM_EMAIL?: string
      HR_EMAIL?: string
      
      HIPAA_COMPLIANCE_MODE?: string
      ENABLE_AUDIT_LOGGING?: string
      ENABLE_DEMO_MODE?: string
      ENABLE_ZIA_INTELLIGENCE?: string
      ENABLE_ANALYTICS?: string
    }
  }
}
