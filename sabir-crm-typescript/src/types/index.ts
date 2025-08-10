import { Request } from 'express';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'client' | 'employee' | 'contractor';
  firstName: string;
  lastName: string;
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'client' | 'employee' | 'contractor';
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// CRM Data Types
export interface Contact {
  id?: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Mobile?: string;
  Account_Name?: string;
  Lead_Source?: string;
  Department?: string;
  Title?: string;
  Description?: string;
  Created_Time?: string;
  Modified_Time?: string;
  Owner?: {
    name?: string;
    id?: string;
  };
}

export interface Lead {
  id?: string;
  First_Name: string;
  Last_Name: string;
  Company: string;
  Email: string;
  Phone?: string;
  Mobile?: string;
  Lead_Source?: string;
  Lead_Status?: 'Not Contacted' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
  Industry?: string;
  Annual_Revenue?: number;
  No_of_Employees?: number;
  Description?: string;
  Created_Time?: string;
  Modified_Time?: string;
  Owner?: {
    name?: string;
    id?: string;
  };
}

export interface Account {
  id?: string;
  Account_Name: string;
  Phone?: string;
  Website?: string;
  Industry?: string;
  Annual_Revenue?: number;
  No_of_Employees?: number;
  Account_Type?: string;
  Description?: string;
  Billing_Street?: string;
  Billing_City?: string;
  Billing_State?: string;
  Billing_Code?: string;
  Billing_Country?: string;
  Created_Time?: string;
  Modified_Time?: string;
}

export interface Deal {
  id?: string;
  Deal_Name: string;
  Account_Name?: string;
  Stage: string;
  Amount: number;
  Probability?: number;
  Expected_Revenue?: number;
  Closing_Date: string;
  Deal_Owner?: {
    name?: string;
    id?: string;
  };
  Lead_Source?: string;
  Next_Step?: string;
  Description?: string;
  Created_Time?: string;
  Modified_Time?: string;
}

export interface Invoice {
  id?: string;
  invoice_number?: string;
  customer_id: string;
  customer_name?: string;
  date?: string;
  due_date?: string;
  status?: string;
  total?: number;
  balance?: number;
  line_items?: Array<{
    item_id?: string;
    name: string;
    description?: string;
    rate: number;
    quantity: number;
    amount?: number;
    tax_id?: string;
  }>;
  notes?: string;
  terms?: string;
  created_time?: string;
  modified_time?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  source?: string;
  owner?: string;
}

// Express Request with User
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Zoho CRM Config
export interface ZohoCRMConfig {
  environment: 'production' | 'sandbox';
  domain: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUrl?: string;
  scope?: string;
}

// Zoho API Response Types
export interface ZohoAPIResponse<T = any> {
  data?: T[];
  info?: {
    count: number;
    page: number;
    per_page: number;
    more_records: boolean;
  };
  message?: string;
  status?: string;
}

export interface ZohoRecord {
  id: string;
  Created_Time: string;
  Created_By: {
    name: string;
    id: string;
  };
  Modified_Time: string;
  Modified_By: {
    name: string;
    id: string;
  };
  Owner: {
    name: string;
    id: string;
  };
  [key: string]: any;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  method?: string;
}

// Audit Types for HIPAA Compliance
export interface AuditEvent {
  action: string;
  resource: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  timestamp: string;
  requestId: string;
  data?: any;
  result?: 'success' | 'failure';
  errorMessage?: string;
}

// Catalyst Types
export interface CatalystConfig {
  projectId: string;
  environment: 'development' | 'production';
  functions: {
    name: string;
    runtime: 'nodejs18' | 'nodejs20';
    memory: number;
    timeout: number;
  }[];
}

// Export all types for easy importing
export type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction
} from 'express';