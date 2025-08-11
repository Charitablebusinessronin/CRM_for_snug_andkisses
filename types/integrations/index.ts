/**
 * Zoho and External Integration Types
 * Comprehensive type definitions for all Zoho services
 */

// Zoho OAuth Types
export interface ZohoOAuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: 'Bearer'
  scope: string
}

export interface ZohoOAuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
  api_domain: string
}

// Zoho CRM Types
export interface ZohoCRMContact {
  id: string
  Full_Name: string
  Email: string
  Phone?: string
  Mobile?: string
  Account_Name?: string
  Lead_Source?: string
  Created_Time: string
  Modified_Time: string
  Owner: {
    id: string
    name: string
    email: string
  }
  [key: string]: any
}

export interface ZohoCRMAccount {
  id: string
  Account_Name: string
  Website?: string
  Phone?: string
  Industry?: string
  Annual_Revenue?: number
  Created_Time: string
  Modified_Time: string
  Owner: {
    id: string
    name: string
    email: string
  }
  [key: string]: any
}

export interface ZohoCRMDeal {
  id: string
  Deal_Name: string
  Amount: number
  Stage: string
  Closing_Date: string
  Account_Name?: string
  Contact_Name?: string
  Probability?: number
  Created_Time: string
  Modified_Time: string
  Owner: {
    id: string
    name: string
    email: string
  }
  [key: string]: any
}

export interface ZohoCRMResponse<T = any> {
  data: T[]
  info: {
    count: number
    page: number
    per_page: number
    more_records: boolean
  }
}

export interface ZohoCRMError {
  code: string
  message: string
  details?: Record<string, any>
}

// Zoho Books Types
export interface ZohoBooksContact {
  contact_id: string
  contact_name: string
  email: string
  phone: string
  company_name?: string
  contact_type: 'customer' | 'vendor'
  status: 'active' | 'inactive'
  created_time: string
}

export interface ZohoBooksInvoice {
  invoice_id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  total: number
  balance: number
  due_date: string
  created_time: string
  line_items: Array<{
    item_id?: string
    name: string
    description?: string
    quantity: number
    rate: number
    amount: number
  }>
}

// Zoho Campaigns Types
export interface ZohoCampaign {
  key: string
  campaign_name: string
  campaign_type: 'regular' | 'autoresponder' | 'split_test'
  status: 'Draft' | 'Scheduled' | 'Sent' | 'InProgress'
  subject: string
  from_email: string
  created_time: string
  sent_time?: string
  recipients_count: number
  bounce_count: number
  open_count: number
  click_count: number
}

export interface ZohoMailingList {
  listkey: string
  listname: string
  list_type: 'public' | 'private'
  signup_form_url?: string
  subscriber_count: number
  created_time: string
}

// Zoho Sign Types
export interface ZohoSignDocument {
  document_id: string
  document_name: string
  status: 'draft' | 'inprogress' | 'completed' | 'declined' | 'expired'
  owner_email: string
  created_time: string
  completed_time?: string
  actions: Array<{
    action_id: string
    action_type: 'sign' | 'approve' | 'decline'
    recipient_email: string
    recipient_name: string
    status: 'pending' | 'completed' | 'declined'
  }>
}

// Zoho Analytics Types
export interface ZohoAnalyticsWorkspace {
  workspace_id: string
  workspace_name: string
  workspace_type: 'personal' | 'shared'
  created_time: string
  owner_email: string
}

export interface ZohoAnalyticsView {
  view_id: string
  view_name: string
  view_type: 'table' | 'chart' | 'pivot' | 'summary'
  workspace_id: string
  created_time: string
}

// Zia AI Types
export interface ZiaOCRResponse {
  status: 'success' | 'error'
  data?: {
    text: string
    confidence: number
    entities: Array<{
      type: string
      value: string
      confidence: number
      position: {
        x: number
        y: number
        width: number
        height: number
      }
    }>
  }
  error?: string
}

export interface ZiaAnalyticsInsight {
  insight_type: 'trend' | 'anomaly' | 'forecast' | 'correlation'
  title: string
  description: string
  confidence: number
  data_points: Array<{
    date: string
    value: number
    predicted?: boolean
  }>
  recommendations?: string[]
}

// Integration Configuration Types
export interface ZohoIntegrationConfig {
  crm: {
    enabled: boolean
    modules: string[]
    sync_frequency: number
    field_mappings: Record<string, string>
  }
  books: {
    enabled: boolean
    auto_invoice: boolean
    payment_terms: number
    tax_settings: Record<string, any>
  }
  campaigns: {
    enabled: boolean
    default_list: string
    auto_subscribe: boolean
    template_preferences: Record<string, string>
  }
  sign: {
    enabled: boolean
    default_templates: string[]
    auto_send: boolean
    reminder_settings: Record<string, any>
  }
  analytics: {
    enabled: boolean
    workspaces: string[]
    auto_reporting: boolean
    dashboard_preferences: Record<string, any>
  }
}

// Webhook Types
export interface ZohoWebhookPayload {
  module: string
  operation: 'insert' | 'update' | 'delete'
  record_id: string
  record_data: Record<string, any>
  timestamp: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface WebhookValidationResult {
  valid: boolean
  signature_match: boolean
  timestamp_valid: boolean
  payload_valid: boolean
  error?: string
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset_time: number
  retry_after?: number
}

export interface APIRequestConfig {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: Record<string, string>
  params?: Record<string, any>
  data?: Record<string, any>
  timeout: number
  max_retries: number
  retry_delay: number
}

// Error Handling Types
export interface IntegrationError {
  service: 'crm' | 'books' | 'campaigns' | 'sign' | 'analytics' | 'zia'
  operation: string
  error_code: string
  error_message: string
  retry_count: number
  timestamp: string
  context?: Record<string, any>
}

export interface IntegrationHealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  last_check: string
  response_time: number
  error_rate: number
  uptime_percentage: number
  issues?: string[]
}