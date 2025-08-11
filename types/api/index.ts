/**
 * API Response and Request Types
 * Standardized API interfaces for consistency
 */

// Standard API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  request_id?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    has_more: boolean
  }
}

export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
}

// Request Types
export interface APIRequest<T = any> {
  data?: T
  params?: Record<string, string>
  headers?: Record<string, string>
  user?: {
    id: string
    role: string
    email: string
  }
}

export interface BulkOperation<T> {
  action: 'create' | 'update' | 'delete'
  records: T[]
  options?: {
    batch_size?: number
    parallel?: boolean
    continue_on_error?: boolean
  }
}

// HIPAA Audit Types
export interface HIPAAAuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address: string
  user_agent: string
  timestamp: string
  request_data?: Record<string, any>
  response_data?: Record<string, any>
  status: 'success' | 'failure' | 'error'
  error_message?: string
  phi_accessed?: boolean
  compliance_flags?: string[]
}

// Business Logic Types
export interface ServiceRequest {
  id: string
  client_id: string
  service_type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  description: string
  scheduled_date?: string
  assigned_contractor_id?: string
  location: {
    address: string
    city: string
    state: string
    zip_code: string
  }
  estimated_duration: number
  created_at: string
  updated_at: string
  notes?: Array<{
    id: string
    content: string
    author_id: string
    author_name: string
    created_at: string
  }>
}

export interface ContractorProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specializations: string[]
  experience_years: number
  hourly_rate: number
  availability: Array<{
    day_of_week: number
    start_time: string
    end_time: string
    available: boolean
  }>
  certifications: Array<{
    name: string
    issuer: string
    issue_date: string
    expiry_date?: string
    verified: boolean
  }>
  background_check: {
    completed: boolean
    completion_date?: string
    status: 'pending' | 'approved' | 'rejected'
  }
  insurance: {
    provider: string
    policy_number: string
    coverage_amount: number
    expiry_date: string
  }
  rating: {
    average: number
    count: number
    reviews: Array<{
      client_id: string
      rating: number
      comment?: string
      date: string
    }>
  }
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ClientProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
    unit?: string
  }
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
  medical_info?: {
    conditions: string[]
    medications: string[]
    allergies: string[]
    special_instructions?: string
  }
  service_history: Array<{
    service_id: string
    date: string
    contractor_id: string
    rating?: number
    notes?: string
  }>
  payment_info: {
    preferred_method: 'card' | 'bank' | 'check' | 'cash'
    billing_address?: {
      street: string
      city: string
      state: string
      zip_code: string
    }
  }
  preferences: {
    communication_method: 'email' | 'phone' | 'text'
    appointment_reminders: boolean
    newsletter_subscription: boolean
    preferred_times: Array<{
      day_of_week: number
      time_slots: string[]
    }>
  }
  created_at: string
  updated_at: string
  is_active: boolean
}

// Workflow Types
export interface WorkflowStep {
  id: string
  name: string
  type: 'manual' | 'automated' | 'approval' | 'notification'
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }>
  actions: Array<{
    type: 'email' | 'sms' | 'webhook' | 'update_record' | 'create_task'
    config: Record<string, any>
  }>
  next_steps?: string[]
  timeout?: number
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  trigger_data: Record<string, any>
  current_step: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  started_at: string
  completed_at?: string
  error_message?: string
  step_history: Array<{
    step_id: string
    started_at: string
    completed_at?: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    output?: Record<string, any>
    error?: string
  }>
}

// File Upload Types
export interface FileUpload {
  id: string
  original_name: string
  stored_name: string
  mime_type: string
  size: number
  category: 'document' | 'image' | 'profile_photo' | 'certificate'
  uploaded_by: string
  uploaded_at: string
  metadata?: Record<string, any>
  virus_scan_result?: 'clean' | 'infected' | 'pending'
  encryption_status?: 'encrypted' | 'not_encrypted'
}

// Analytics Types
export interface DashboardMetrics {
  active_clients: number
  active_contractors: number
  pending_requests: number
  completed_services: number
  total_revenue: number
  average_rating: number
  growth_rate: {
    clients: number
    contractors: number
    revenue: number
  }
  time_period: {
    start: string
    end: string
  }
}

export interface ReportRequest {
  type: 'client_summary' | 'contractor_performance' | 'revenue_analysis' | 'service_trends'
  date_range: {
    start: string
    end: string
  }
  filters?: Record<string, any>
  format: 'json' | 'csv' | 'pdf'
  delivery_method: 'download' | 'email'
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  categories: {
    service_requests: boolean
    payment_reminders: boolean
    schedule_changes: boolean
    system_updates: boolean
    marketing: boolean
  }
}