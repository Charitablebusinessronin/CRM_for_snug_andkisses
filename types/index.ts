/**
 * Central type exports for Snug & Kisses CRM
 * Organized to prevent configuration conflicts and ensure type consistency
 */

// Auth types
export * from './auth'

// Configuration types  
export * from './config'
export * from './config/validator'

// Catalyst types
export * from './catalyst'

// Integration types
export * from './integrations'

// API types
export * from './api'

// Global augmentations
import './global'

// Re-export commonly used types with namespaces to prevent conflicts
export type { 
  CatalystConfig as ZohoCatalystConfig,
  CatalystDeploymentConfig as ZohoCatalystDeploymentConfig,
  CatalystFunction as ZohoCatalystFunction 
} from './catalyst'

export type {
  ApplicationConfig as AppConfig,
  RequiredEnvVars as RequiredEnvironmentVariables,
  OptionalEnvVars as OptionalEnvironmentVariables
} from './config'

export type {
  ZohoCRMContact,
  ZohoCRMAccount,
  ZohoCRMDeal,
  ZohoOAuthTokens
} from './integrations'

export type {
  APIResponse,
  PaginatedResponse,
  ServiceRequest,
  ContractorProfile,
  ClientProfile
} from './api'