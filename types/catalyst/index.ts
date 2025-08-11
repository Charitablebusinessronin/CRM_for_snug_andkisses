/**
 * Zoho Catalyst Configuration Types
 * Ensures type safety and prevents configuration mismatches
 */

export interface CatalystProject {
  id: string
  name: string
  domain: {
    id: string
    name: string
  }
  timezone: string
  env: CatalystEnvironment[]
}

export interface CatalystEnvironment {
  idx: number
  id: string
  name: string
  type: number
  env_status: 'Active' | 'Inactive'
  project_details: {
    project_name: string
    id: string
    project_type: 'Live' | 'Test'
  }
  is_default: boolean
  action_required: boolean
}

export interface CatalystConfig {
  defaults: {
    project: number
    env: number
  }
  actives: {
    project: number
    env: number
  }
  projects: CatalystProject[]
}

export interface CatalystFunction {
  function_name: string
  source: string
  entry_file: string
  stack: 'node20' | 'node18' | 'node16'
  timeout: number
  memory: number
  environment_variables: Record<string, string>
}

export interface CatalystDeploymentConfig {
  project_id: string
  project_name: string
  env_id: string
  env_name: string
  functions: CatalystFunction[]
}

export interface CatalystFunctionConfig {
  deployment: {
    name: string
    stack: 'node20' | 'node18' | 'node16'
    type: 'advancedio' | 'basicio'
    timeout: number
    memory: number
    env_variables: Record<string, string>
  }
  execution: {
    main: string
  }
}

export interface CatalystAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface CatalystFunctionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface CatalystFunctionRequest {
  action: string
  params?: Record<string, any>
}

export interface CatalystValidationError {
  path: string
  message: string
  value?: any
  expected?: any
}

export interface CatalystValidationResult {
  valid: boolean
  errors: CatalystValidationError[]
  warnings: CatalystValidationError[]
}

// Catalyst SDK types
export interface CatalystSDK {
  initialize: (req?: any) => CatalystApp
}

export interface CatalystApp {
  datastore: () => CatalystDataStore
  email: () => CatalystEmail
  authentication: () => CatalystAuth
  cache: () => CatalystCache
  functions: () => CatalystFunctions
}

export interface CatalystDataStore {
  table: (tableName: string) => CatalystTable
}

export interface CatalystTable {
  insertRow: (data: Record<string, any>) => Promise<any>
  updateRow: (data: Record<string, any>) => Promise<any>
  deleteRow: (rowId: string) => Promise<any>
  getRow: (rowId: string) => Promise<any>
  getAllRows: () => Promise<any[]>
}

export interface CatalystEmail {
  sendMail: (options: CatalystEmailOptions) => Promise<any>
}

export interface CatalystEmailOptions {
  from: string
  to: string | string[]
  subject: string
  content: string
  html_mode: boolean
}

export interface CatalystAuth {
  getUser: () => Promise<any>
  isUserAuthenticated: () => Promise<boolean>
}

export interface CatalystCache {
  put: (key: string, value: any, ttl?: number) => Promise<any>
  get: (key: string) => Promise<any>
  delete: (key: string) => Promise<any>
}

export interface CatalystFunctions {
  execute: (functionName: string, data: any) => Promise<any>
}

// Environment-specific configurations
export const CATALYST_ENVIRONMENTS = {
  DEVELOPMENT: {
    project_id: '30300000000011038',
    env_id: '891140386',
    domain: 'project-rainfall-891140386.development.catalystserverless.com'
  },
  PRODUCTION: {
    project_id: '30300000000011038', 
    env_id: '10102671177',
    domain: 'project-rainfall-production.catalystserverless.com'
  }
} as const

export type CatalystEnvironmentType = keyof typeof CATALYST_ENVIRONMENTS
export type CatalystEnvironmentConfig = typeof CATALYST_ENVIRONMENTS[CatalystEnvironmentType]