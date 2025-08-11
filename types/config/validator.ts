/**
 * Configuration Validation Utilities
 * Prevents configuration conflicts and ensures type safety
 */

import { 
  RequiredEnvVars, 
  OptionalEnvVars, 
  EnvironmentValidationResult, 
  ENV_VAR_PATTERNS, 
  ApplicationConfig 
} from './index'
import { 
  CatalystConfig, 
  CatalystDeploymentConfig, 
  CatalystValidationResult,
  CATALYST_ENVIRONMENTS
} from '../catalyst'

export class ConfigValidator {
  private errors: string[] = []
  private warnings: string[] = []

  validateEnvironmentVariables(): EnvironmentValidationResult {
    const missing: string[] = []
    const invalid: Array<{ key: string; value: string; reason: string }> = []
    const warnings: string[] = []

    // Check required environment variables
    const requiredVars: (keyof RequiredEnvVars)[] = [
      'NODE_ENV',
      'ZOHO_CLIENT_ID',
      'ZOHO_CLIENT_SECRET', 
      'ZOHO_REFRESH_TOKEN',
      'NEXTAUTH_URL',
      'REDIRECT_URI',
      'CATALYST_APP_URL',
      'CATALYST_PROJECT_ID',
      'CATALYST_ENV_ID'
    ]

    for (const varName of requiredVars) {
      const value = process.env[varName]
      
      if (!value) {
        missing.push(varName)
        continue
      }

      // Validate format based on patterns
      const pattern = ENV_VAR_PATTERNS[varName as keyof typeof ENV_VAR_PATTERNS]
      if (pattern && !pattern.test(value)) {
        invalid.push({
          key: varName,
          value: value.substring(0, 10) + '...',
          reason: `Does not match expected pattern`
        })
      }
    }

    // Check NODE_ENV specifically
    const nodeEnv = process.env.NODE_ENV
    if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
      invalid.push({
        key: 'NODE_ENV',
        value: nodeEnv,
        reason: 'Must be development, production, or test'
      })
    }

    // Validate URL format
    const urlVars = ['NEXTAUTH_URL', 'REDIRECT_URI', 'CATALYST_APP_URL']
    for (const urlVar of urlVars) {
      const value = process.env[urlVar]
      if (value && !ENV_VAR_PATTERNS.URL.test(value)) {
        invalid.push({
          key: urlVar,
          value,
          reason: 'Must be a valid URL starting with http:// or https://'
        })
      }
    }

    // Check for development-specific warnings
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NEXTAUTH_URL?.includes('localhost')) {
        warnings.push('Using localhost URL in development - ensure this matches your setup')
      }
    }

    // Check for production-specific issues
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.NEXTAUTH_URL?.startsWith('https://')) {
        invalid.push({
          key: 'NEXTAUTH_URL',
          value: process.env.NEXTAUTH_URL || '',
          reason: 'Must use HTTPS in production'
        })
      }
    }

    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
      warnings
    }
  }

  validateCatalystConfiguration(
    catalystConfig: CatalystConfig,
    deploymentConfig: CatalystDeploymentConfig
  ): CatalystValidationResult {
    const errors: Array<{ path: string; message: string; value?: any; expected?: any }> = []
    const warnings: Array<{ path: string; message: string; value?: any; expected?: any }> = []

    // Check project ID consistency
    const rcProject = catalystConfig.projects[0]
    if (rcProject.id !== deploymentConfig.project_id) {
      errors.push({
        path: 'project_id',
        message: 'Project ID mismatch between .catalystrc and catalyst.json',
        value: { rc: rcProject.id, deployment: deploymentConfig.project_id },
        expected: 'Matching project IDs'
      })
    }

    // Check environment ID consistency
    const activeEnv = rcProject.env.find(e => e.id === deploymentConfig.env_id)
    if (!activeEnv) {
      errors.push({
        path: 'env_id',
        message: 'Environment ID not found in .catalystrc',
        value: deploymentConfig.env_id,
        expected: `One of: ${rcProject.env.map(e => e.id).join(', ')}`
      })
    }

    // Validate functions configuration
    if (!deploymentConfig.functions || deploymentConfig.functions.length === 0) {
      warnings.push({
        path: 'functions',
        message: 'No functions configured in catalyst.json',
        expected: 'At least one function configured'
      })
    }

    deploymentConfig.functions?.forEach((func, index) => {
      // Check required function fields
      if (!func.function_name) {
        errors.push({
          path: `functions[${index}].function_name`,
          message: 'Function name is required',
          value: func.function_name
        })
      }

      if (!func.source) {
        errors.push({
          path: `functions[${index}].source`,
          message: 'Function source directory is required',
          value: func.source
        })
      }

      if (!func.entry_file) {
        errors.push({
          path: `functions[${index}].entry_file`,
          message: 'Function entry file is required',
          value: func.entry_file
        })
      }

      // Check Node.js stack version
      if (func.stack && func.stack !== 'node20') {
        warnings.push({
          path: `functions[${index}].stack`,
          message: 'Recommended to use node20 for latest features',
          value: func.stack,
          expected: 'node20'
        })
      }

      // Check HIPAA compliance configuration
      if (!func.environment_variables?.HIPAA_COMPLIANCE_MODE) {
        warnings.push({
          path: `functions[${index}].environment_variables.HIPAA_COMPLIANCE_MODE`,
          message: 'HIPAA compliance mode not configured',
          expected: 'true'
        })
      }

      // Check audit logging
      if (!func.environment_variables?.ENABLE_AUDIT_LOGGING) {
        warnings.push({
          path: `functions[${index}].environment_variables.ENABLE_AUDIT_LOGGING`,
          message: 'Audit logging not enabled',
          expected: 'true'
        })
      }

      // Check memory and timeout settings
      if (func.memory && func.memory < 256) {
        warnings.push({
          path: `functions[${index}].memory`,
          message: 'Low memory allocation may cause performance issues',
          value: func.memory,
          expected: '512 or higher'
        })
      }

      if (func.timeout && func.timeout > 900) {
        warnings.push({
          path: `functions[${index}].timeout`,
          message: 'Very high timeout may indicate inefficient function',
          value: func.timeout,
          expected: '300 or lower'
        })
      }
    })

    // Validate environment-specific settings
    const envType = deploymentConfig.env_name.toLowerCase()
    const expectedConfig = CATALYST_ENVIRONMENTS[
      envType.includes('prod') ? 'PRODUCTION' : 'DEVELOPMENT'
    ]

    if (expectedConfig && deploymentConfig.project_id !== expectedConfig.project_id) {
      warnings.push({
        path: 'environment_config',
        message: `Project ID doesn't match expected configuration for ${envType}`,
        value: deploymentConfig.project_id,
        expected: expectedConfig.project_id
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateApplicationConfig(config: Partial<ApplicationConfig>): boolean {
    this.errors = []
    this.warnings = []

    // Required fields validation
    if (!config.env) {
      this.errors.push('Environment is required')
    } else if (!['development', 'production', 'test'].includes(config.env)) {
      this.errors.push('Environment must be development, production, or test')
    }

    if (!config.catalyst?.projectId) {
      this.errors.push('Catalyst project ID is required')
    }

    if (!config.catalyst?.envId) {
      this.errors.push('Catalyst environment ID is required')
    }

    if (!config.zoho?.clientId) {
      this.errors.push('Zoho client ID is required')
    }

    // Validate URLs
    if (config.app?.url && !ENV_VAR_PATTERNS.URL.test(config.app.url)) {
      this.errors.push('App URL must be a valid URL')
    }

    if (config.auth?.nextAuthUrl && !ENV_VAR_PATTERNS.URL.test(config.auth.nextAuthUrl)) {
      this.errors.push('NextAuth URL must be a valid URL')
    }

    // Environment-specific validations
    if (config.env === 'production') {
      if (config.features?.demoMode) {
        this.warnings.push('Demo mode is enabled in production')
      }

      if (!config.features?.hipaaCompliance) {
        this.errors.push('HIPAA compliance must be enabled in production')
      }

      if (!config.features?.auditLogging) {
        this.errors.push('Audit logging must be enabled in production')
      }

      // Check HTTPS
      if (config.app?.url && !config.app.url.startsWith('https://')) {
        this.errors.push('App URL must use HTTPS in production')
      }

      if (config.auth?.nextAuthUrl && !config.auth.nextAuthUrl.startsWith('https://')) {
        this.errors.push('NextAuth URL must use HTTPS in production')
      }
    }

    // Email validation
    if (config.email?.fromEmail && !ENV_VAR_PATTERNS.EMAIL.test(config.email.fromEmail)) {
      this.errors.push('From email must be a valid email address')
    }

    if (config.email?.hrEmail && !ENV_VAR_PATTERNS.EMAIL.test(config.email.hrEmail)) {
      this.errors.push('HR email must be a valid email address')
    }

    return this.errors.length === 0
  }

  getValidationErrors(): string[] {
    return [...this.errors]
  }

  getValidationWarnings(): string[] {
    return [...this.warnings]
  }

  reset(): void {
    this.errors = []
    this.warnings = []
  }
}

// Utility functions
export function loadEnvironmentConfig(): Partial<ApplicationConfig> {
  return {
    env: process.env.NODE_ENV as 'development' | 'production' | 'test',
    app: {
      url: process.env.NEXTAUTH_URL || '',
      name: 'Snug & Kisses CRM',
      version: '1.0.0'
    },
    auth: {
      nextAuthUrl: process.env.NEXTAUTH_URL || '',
      redirectUri: process.env.REDIRECT_URI || '',
      sessionDuration: 15 * 60 * 1000
    },
    catalyst: {
      projectId: process.env.CATALYST_PROJECT_ID || '',
      envId: process.env.CATALYST_ENV_ID || '',
      domain: process.env.CATALYST_APP_URL || '',
      urls: {
        base: process.env.CATALYST_APP_URL || '',
        functions: {
          quickActions: process.env.CATALYST_FUNCTION_URL || '',
          ziaIntelligence: process.env.ZIA_FUNCTION_URL || '',
          notifications: process.env.NOTIFICATIONS_FUNCTION_URL || '',
          analytics: process.env.ANALYTICS_FUNCTION_URL || '',
          hrFunctions: process.env.HR_FUNCTIONS_URL || '',
          jobsFunctions: process.env.JOBS_FUNCTIONS_URL || '',
          settingsFunctions: process.env.SETTINGS_FUNCTIONS_URL || ''
        }
      }
    },
    zoho: {
      clientId: process.env.ZOHO_CLIENT_ID || '',
      apis: {
        crm: process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v6',
        books: process.env.ZOHO_BOOKS_API_URL || 'https://books.zoho.com/api/v3',
        campaigns: process.env.ZOHO_CAMPAIGNS_API_URL || 'https://campaigns.zoho.com/api/v1.1',
        bookings: process.env.ZOHO_BOOKINGS_API_URL || 'https://bookings.zoho.com/api/v1',
        analytics: process.env.ZOHO_ANALYTICS_API_URL || 'https://analyticsapi.zoho.com/api',
        sign: process.env.ZOHO_SIGN_API_URL || 'https://sign.zoho.com/api/v1'
      },
      oauth: {
        clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
        refreshToken: process.env.ZOHO_REFRESH_TOKEN || ''
      }
    },
    features: {
      demoMode: process.env.ENABLE_DEMO_MODE === 'true',
      ziaIntelligence: process.env.ENABLE_ZIA_INTELLIGENCE !== 'false',
      analytics: process.env.ENABLE_ANALYTICS !== 'false',
      hipaaCompliance: process.env.HIPAA_COMPLIANCE_MODE === 'true',
      auditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true'
    },
    email: {
      fromEmail: process.env.CATALYST_FROM_EMAIL || '',
      hrEmail: process.env.HR_EMAIL || ''
    }
  }
}

export function validateCurrentConfiguration(): {
  env: EnvironmentValidationResult
  application: { valid: boolean; errors: string[]; warnings: string[] }
} {
  const validator = new ConfigValidator()
  
  const envResult = validator.validateEnvironmentVariables()
  const appConfig = loadEnvironmentConfig()
  
  validator.reset()
  const appValid = validator.validateApplicationConfig(appConfig)
  
  return {
    env: envResult,
    application: {
      valid: appValid,
      errors: validator.getValidationErrors(),
      warnings: validator.getValidationWarnings()
    }
  }
}