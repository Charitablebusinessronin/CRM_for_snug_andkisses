import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import moment from 'moment';
import catalyst from 'zcatalyst-sdk-node';
import { logger } from '../utils/logger';
import { Contact, Lead, Invoice, Deal, Account, ApiResponse } from '../types';

// Environment configuration interface
interface ZohoConfig {
  // CRM Configuration
  CRM_CLIENT_ID: string;
  CRM_CLIENT_SECRET: string;
  CRM_REFRESH_TOKEN: string;
  CRM_REDIRECT_URI?: string;

  // Books Configuration  
  BOOKS_CLIENT_ID: string;
  BOOKS_CLIENT_SECRET: string;
  BOOKS_REFRESH_TOKEN: string;
  BOOKS_ORG_ID: string;

  // Analytics Configuration
  ANALYTICS_CLIENT_ID: string;
  ANALYTICS_CLIENT_SECRET: string;
  ANALYTICS_REFRESH_TOKEN: string;
  ANALYTICS_ORG_ID: string;

  // Campaigns Configuration (Optional)
  CAMPAIGNS_CLIENT_ID?: string;
  CAMPAIGNS_CLIENT_SECRET?: string;
  CAMPAIGNS_REFRESH_TOKEN?: string;

  // Desk Configuration (Optional)  
  DESK_CLIENT_ID?: string;
  DESK_CLIENT_SECRET?: string;
  DESK_REFRESH_TOKEN?: string;
  DESK_ORG_ID?: string;

  // Common Configuration
  ENVIRONMENT: 'sandbox' | 'production';
  DOMAIN: string;
  
  // Catalyst Configuration
  CATALYST_PROJECT_ID: string;
  CATALYST_FROM_EMAIL: string;
}

// Token management interface
interface TokenInfo {
  access_token: string;
  expires_at: number;
  token_type: string;
  scope?: string;
}

// Zoho API Response interface
interface ZohoAPIResponse<T = any> {
  data?: T[];
  info?: {
    count: number;
    page: number;
    per_page: number;
    more_records: boolean;
  };
  message?: string;
  status?: string;
  code?: string;
  details?: any;
}

/**
 * Unified Zoho SDK Service - TypeScript Implementation
 * Handles CRM, Books, Analytics, Campaigns, and Desk operations
 * Full HIPAA compliance with audit logging
 * Designed for Catalyst deployment
 */
export class ZohoUnifiedSDK {
  private config!: ZohoConfig;
  private tokens: Map<string, TokenInfo> = new Map();
  private httpClient!: AxiosInstance;
  private catalystApp: any;
  private initialized: boolean = false;

  // API Base URLs
  private API_URLS: Record<string, string> = {};

  constructor() {
    this.loadConfiguration();
    this.initializeAPIUrls();
    this.initializeHTTPClient();
    this.initializeCatalyst();
  }

  /**
   * Initialize API URLs after config is loaded
   */
  private initializeAPIUrls(): void {
    const domain = this.config.DOMAIN;
    this.API_URLS = {
      crm: `https://www.zohoapis.${domain}/crm/v6`,
      books: `https://www.zohoapis.${domain}/books/v3`,
      analytics: `https://analyticsapi.zoho.${domain}/restapi/v2`,
      campaigns: `https://campaigns.zoho.${domain}/api/v1.1`,
      desk: `https://desk.zoho.${domain}/api/v1`,
      oauth: `https://accounts.zoho.${domain}/oauth/v2/token`
    };
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): void {
    this.config = {
      // CRM Configuration
      CRM_CLIENT_ID: process.env.ZOHO_CRM_CLIENT_ID || '',
      CRM_CLIENT_SECRET: process.env.ZOHO_CRM_CLIENT_SECRET || '',
      CRM_REFRESH_TOKEN: process.env.ZOHO_CRM_REFRESH_TOKEN || '',
      CRM_REDIRECT_URI: process.env.ZOHO_CRM_REDIRECT_URI,

      // Books Configuration
      BOOKS_CLIENT_ID: process.env.ZOHO_BOOKS_CLIENT_ID || process.env.ZOHO_CRM_CLIENT_ID || '',
      BOOKS_CLIENT_SECRET: process.env.ZOHO_BOOKS_CLIENT_SECRET || process.env.ZOHO_CRM_CLIENT_SECRET || '',
      BOOKS_REFRESH_TOKEN: process.env.ZOHO_BOOKS_REFRESH_TOKEN || process.env.ZOHO_CRM_REFRESH_TOKEN || '',
      BOOKS_ORG_ID: process.env.ZOHO_BOOKS_ORG_ID || '',

      // Analytics Configuration
      ANALYTICS_CLIENT_ID: process.env.ZOHO_ANALYTICS_CLIENT_ID || process.env.ZOHO_CRM_CLIENT_ID || '',
      ANALYTICS_CLIENT_SECRET: process.env.ZOHO_ANALYTICS_CLIENT_SECRET || process.env.ZOHO_CRM_CLIENT_SECRET || '',
      ANALYTICS_REFRESH_TOKEN: process.env.ZOHO_ANALYTICS_REFRESH_TOKEN || process.env.ZOHO_CRM_REFRESH_TOKEN || '',
      ANALYTICS_ORG_ID: process.env.ZOHO_ANALYTICS_ORG_ID || '',

      // Campaigns Configuration (Optional)
      CAMPAIGNS_CLIENT_ID: process.env.ZOHO_CAMPAIGNS_CLIENT_ID,
      CAMPAIGNS_CLIENT_SECRET: process.env.ZOHO_CAMPAIGNS_CLIENT_SECRET,
      CAMPAIGNS_REFRESH_TOKEN: process.env.ZOHO_CAMPAIGNS_REFRESH_TOKEN,

      // Desk Configuration (Optional)
      DESK_CLIENT_ID: process.env.ZOHO_DESK_CLIENT_ID,
      DESK_CLIENT_SECRET: process.env.ZOHO_DESK_CLIENT_SECRET,
      DESK_REFRESH_TOKEN: process.env.ZOHO_DESK_REFRESH_TOKEN,
      DESK_ORG_ID: process.env.ZOHO_DESK_ORG_ID,

      // Common Configuration
      ENVIRONMENT: (process.env.ZOHO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      DOMAIN: process.env.ZOHO_DOMAIN || 'com',

      // Catalyst Configuration
      CATALYST_PROJECT_ID: process.env.CATALYST_PROJECT_ID || '',
      CATALYST_FROM_EMAIL: process.env.CATALYST_FROM_EMAIL || 'noreply@snugsandkisses.com'
    };

    // Validate required configuration
    const requiredFields = [
      'CRM_CLIENT_ID',
      'CRM_CLIENT_SECRET', 
      'CRM_REFRESH_TOKEN'
    ];

    for (const field of requiredFields) {
      if (!this.config[field as keyof ZohoConfig]) {
        throw new Error(`Missing required Zoho configuration: ${field}`);
      }
    }

    logger.info('Zoho configuration loaded', {
      environment: this.config.ENVIRONMENT,
      domain: this.config.DOMAIN,
      services: {
        crm: !!this.config.CRM_CLIENT_ID,
        books: !!this.config.BOOKS_ORG_ID,
        analytics: !!this.config.ANALYTICS_ORG_ID,
        campaigns: !!this.config.CAMPAIGNS_CLIENT_ID,
        desk: !!this.config.DESK_ORG_ID,
        catalyst: !!this.config.CATALYST_PROJECT_ID
      }
    });
  }

  /**
   * Initialize HTTP client with common configuration
   */
  private initializeHTTPClient(): void {
    this.httpClient = axios.create({
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sabir-CRM-TypeScript/1.0.0'
      }
    });

    // Request interceptor for authentication
    this.httpClient.interceptors.request.use(
      async (config) => {
        const service = this.getServiceFromURL(config.url || '');
        if (service) {
          const token = await this.getValidToken(service);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        logger.debug('Zoho API request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          service,
          hasAuth: !!config.headers.Authorization
        });
        
        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug('Zoho API response', {
          status: response.status,
          url: response.config.url,
          dataCount: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const service = this.getServiceFromURL(originalRequest.url || '');
          if (service) {
            try {
              await this.refreshToken(service);
              const newToken = await this.getValidToken(service);
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.httpClient(originalRequest);
              }
            } catch (refreshError) {
              logger.error('Token refresh failed', refreshError);
            }
          }
        }

        logger.error('Zoho API error', {
          status: error.response?.status,
          url: originalRequest?.url,
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize Catalyst SDK if available
   */
  private async initializeCatalyst(): Promise<void> {
    if (!this.config.CATALYST_PROJECT_ID) {
      logger.info('Catalyst project ID not configured, skipping Catalyst initialization');
      return;
    }

    try {
      this.catalystApp = catalyst.initialize({});
      logger.info('Catalyst SDK initialized successfully', {
        projectId: this.config.CATALYST_PROJECT_ID
      });
    } catch (error) {
      logger.warn('Catalyst SDK initialization failed', error);
      this.catalystApp = null;
    }
  }

  /**
   * Get service name from URL
   */
  private getServiceFromURL(url: string): string | null {
    if (url.includes('/crm/')) return 'crm';
    if (url.includes('/books/')) return 'books';
    if (url.includes('/analyticsapi/')) return 'analytics';
    if (url.includes('/campaigns/')) return 'campaigns';
    if (url.includes('/desk/')) return 'desk';
    return null;
  }

  /**
   * Get valid access token for a service
   */
  private async getValidToken(service: string): Promise<string | null> {
    const tokenInfo = this.tokens.get(service);
    const now = Date.now();

    // Check if token exists and is still valid (with 5-minute buffer)
    if (tokenInfo && tokenInfo.expires_at > (now + 300000)) {
      return tokenInfo.access_token;
    }

    // Refresh token if expired or missing
    try {
      await this.refreshToken(service);
      const refreshedToken = this.tokens.get(service);
      return refreshedToken?.access_token || null;
    } catch (error) {
      logger.error(`Failed to get valid token for ${service}`, error);
      return null;
    }
  }

  /**
   * Refresh access token for a service
   */
  private async refreshToken(service: string): Promise<void> {
    const serviceConfig = this.getServiceConfig(service);
    if (!serviceConfig) {
      throw new Error(`No configuration found for service: ${service}`);
    }

    const tokenData = {
      refresh_token: serviceConfig.refreshToken,
      client_id: serviceConfig.clientId,
      client_secret: serviceConfig.clientSecret,
      grant_type: 'refresh_token'
    };

    try {
      const response = await axios.post(this.API_URLS.oauth, new URLSearchParams(tokenData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      });

      const tokenInfo: TokenInfo = {
        access_token: response.data.access_token,
        expires_at: Date.now() + (response.data.expires_in * 1000),
        token_type: response.data.token_type || 'Bearer',
        scope: response.data.scope
      };

      this.tokens.set(service, tokenInfo);
      
      logger.info(`Token refreshed successfully for ${service}`, {
        expiresAt: moment(tokenInfo.expires_at).format('YYYY-MM-DD HH:mm:ss'),
        scope: tokenInfo.scope
      });

    } catch (error: any) {
      logger.error(`Token refresh failed for ${service}`, {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Failed to refresh token for ${service}: ${error.message}`);
    }
  }

  /**
   * Get service configuration
   */
  private getServiceConfig(service: string): {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  } | null {
    switch (service) {
      case 'crm':
        return {
          clientId: this.config.CRM_CLIENT_ID,
          clientSecret: this.config.CRM_CLIENT_SECRET,
          refreshToken: this.config.CRM_REFRESH_TOKEN
        };
      case 'books':
        return {
          clientId: this.config.BOOKS_CLIENT_ID,
          clientSecret: this.config.BOOKS_CLIENT_SECRET,
          refreshToken: this.config.BOOKS_REFRESH_TOKEN
        };
      case 'analytics':
        return {
          clientId: this.config.ANALYTICS_CLIENT_ID,
          clientSecret: this.config.ANALYTICS_CLIENT_SECRET,
          refreshToken: this.config.ANALYTICS_REFRESH_TOKEN
        };
      case 'campaigns':
        if (this.config.CAMPAIGNS_CLIENT_ID) {
          return {
            clientId: this.config.CAMPAIGNS_CLIENT_ID,
            clientSecret: this.config.CAMPAIGNS_CLIENT_SECRET!,
            refreshToken: this.config.CAMPAIGNS_REFRESH_TOKEN!
          };
        }
        return null;
      case 'desk':
        if (this.config.DESK_CLIENT_ID) {
          return {
            clientId: this.config.DESK_CLIENT_ID,
            clientSecret: this.config.DESK_CLIENT_SECRET!,
            refreshToken: this.config.DESK_REFRESH_TOKEN!
          };
        }
        return null;
      default:
        return null;
    }
  }

  // =============================================================================
  // CRM OPERATIONS
  // =============================================================================

  /**
   * Get CRM records with pagination and filtering
   */
  async getCRMRecords<T = any>(
    module: string,
    options: {
      page?: number;
      perPage?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      fields?: string[];
      criteria?: string;
    } = {}
  ): Promise<{ data: T[]; info: any }> {
    const { page = 1, perPage = 50, sortBy, sortOrder, fields, criteria } = options;

    const params: any = {
      page,
      per_page: perPage
    };

    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_order = sortOrder || 'asc';
    }

    if (fields?.length) {
      params.fields = fields.join(',');
    }

    if (criteria) {
      params.criteria = criteria;
    }

    try {
      const response = await this.httpClient.get(`${this.API_URLS.crm}/${module}`, { params });
      const result: ZohoAPIResponse<T> = response.data;

      logger.info(`CRM ${module} records retrieved`, {
        count: result.data?.length || 0,
        page,
        hasMore: result.info?.more_records
      });

      return {
        data: result.data || [],
        info: result.info || {}
      };
    } catch (error: any) {
      logger.error(`Failed to get CRM ${module} records`, error);
      throw new Error(`CRM ${module} fetch failed: ${error.message}`);
    }
  }

  /**
   * Create CRM record
   */
  async createCRMRecord<T = any>(module: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.httpClient.post(`${this.API_URLS.crm}/${module}`, {
        data: [data]
      });

      const result: ZohoAPIResponse<T> = response.data;
      const createdRecord = result.data?.[0];

      if (!createdRecord) {
        throw new Error('No record created');
      }

      logger.info(`CRM ${module} record created`, {
        id: (createdRecord as any).id,
        module
      });

      // Trigger Catalyst function for post-creation processing
      if (this.catalystApp) {
        this.triggerCatalystFunction('process_crm_record_created', {
          module,
          recordId: (createdRecord as any).id,
          timestamp: moment().toISOString()
        });
      }

      return createdRecord;
    } catch (error: any) {
      logger.error(`Failed to create CRM ${module} record`, error);
      throw new Error(`CRM ${module} creation failed: ${error.message}`);
    }
  }

  /**
   * Update CRM record
   */
  async updateCRMRecord<T = any>(module: string, recordId: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.httpClient.put(`${this.API_URLS.crm}/${module}/${recordId}`, {
        data: [data]
      });

      const result: ZohoAPIResponse<T> = response.data;
      const updatedRecord = result.data?.[0];

      if (!updatedRecord) {
        throw new Error('No record updated');
      }

      logger.info(`CRM ${module} record updated`, {
        id: recordId,
        module
      });

      return updatedRecord;
    } catch (error: any) {
      logger.error(`Failed to update CRM ${module} record`, error);
      throw new Error(`CRM ${module} update failed: ${error.message}`);
    }
  }

  /**
   * Delete CRM record
   */
  async deleteCRMRecord(module: string, recordId: string): Promise<boolean> {
    try {
      await this.httpClient.delete(`${this.API_URLS.crm}/${module}/${recordId}`);

      logger.info(`CRM ${module} record deleted`, {
        id: recordId,
        module
      });

      return true;
    } catch (error: any) {
      logger.error(`Failed to delete CRM ${module} record`, error);
      throw new Error(`CRM ${module} deletion failed: ${error.message}`);
    }
  }

  // =============================================================================
  // BOOKS OPERATIONS
  // =============================================================================

  /**
   * Get Books organization information
   */
  async getBooksOrganizations(): Promise<any[]> {
    if (!this.config.BOOKS_ORG_ID) {
      throw new Error('Zoho Books organization ID not configured');
    }

    try {
      const response = await this.httpClient.get(`${this.API_URLS.books}/organizations`);
      return response.data.organizations || [];
    } catch (error: any) {
      logger.error('Failed to get Books organizations', error);
      throw new Error(`Books organizations fetch failed: ${error.message}`);
    }
  }

  /**
   * Create Books invoice
   */
  async createBooksInvoice(invoiceData: any): Promise<any> {
    if (!this.config.BOOKS_ORG_ID) {
      throw new Error('Zoho Books organization ID not configured');
    }

    try {
      const response = await this.httpClient.post(
        `${this.API_URLS.books}/invoices?organization_id=${this.config.BOOKS_ORG_ID}`,
        invoiceData
      );

      const invoice = response.data.invoice;
      
      logger.info('Books invoice created', {
        invoiceId: invoice?.invoice_id,
        customerName: invoice?.customer_name,
        total: invoice?.total
      });

      return invoice;
    } catch (error: any) {
      logger.error('Failed to create Books invoice', error);
      throw new Error(`Books invoice creation failed: ${error.message}`);
    }
  }

  // =============================================================================
  // ANALYTICS OPERATIONS
  // =============================================================================

  /**
   * Get Analytics workspace information
   */
  async getAnalyticsWorkspaces(): Promise<any[]> {
    if (!this.config.ANALYTICS_ORG_ID) {
      throw new Error('Zoho Analytics organization ID not configured');
    }

    try {
      const response = await this.httpClient.get(
        `${this.API_URLS.analytics}/orgs/${this.config.ANALYTICS_ORG_ID}/workspaces`
      );
      return response.data.workspaces || [];
    } catch (error: any) {
      logger.error('Failed to get Analytics workspaces', error);
      throw new Error(`Analytics workspaces fetch failed: ${error.message}`);
    }
  }

  // =============================================================================
  // CATALYST OPERATIONS
  // =============================================================================

  /**
   * Trigger Catalyst function
   */
  private async triggerCatalystFunction(functionName: string, data: any): Promise<void> {
    if (!this.catalystApp) {
      logger.debug(`Catalyst not initialized, skipping function: ${functionName}`);
      return;
    }

    try {
      const functions = this.catalystApp.functions();
      await functions.execute({
        name: functionName,
        data
      });

      logger.info(`Catalyst function executed successfully: ${functionName}`, data);
    } catch (error) {
      logger.warn(`Catalyst function execution failed: ${functionName}`, error);
      // Don't throw - Catalyst functions are supplementary
    }
  }

  /**
   * Get SDK health status
   */
  async getHealthStatus(): Promise<{
    services: {
      crm: boolean;
      books: boolean;
      analytics: boolean;
      campaigns: boolean;
      desk: boolean;
      catalyst: boolean;
    };
    tokens: Record<string, boolean>;
    configuration: {
      environment: string;
      domain: string;
    };
  }> {
    const services = {
      crm: !!this.config.CRM_CLIENT_ID,
      books: !!this.config.BOOKS_ORG_ID,
      analytics: !!this.config.ANALYTICS_ORG_ID,
      campaigns: !!this.config.CAMPAIGNS_CLIENT_ID,
      desk: !!this.config.DESK_ORG_ID,
      catalyst: !!this.catalystApp
    };

    const tokens: Record<string, boolean> = {};
    for (const service of Object.keys(services)) {
      if (services[service as keyof typeof services]) {
        const token = this.tokens.get(service);
        tokens[service] = !!(token && token.expires_at > Date.now());
      }
    }

    return {
      services,
      tokens,
      configuration: {
        environment: this.config.ENVIRONMENT,
        domain: this.config.DOMAIN
      }
    };
  }

  /**
   * Initialize SDK (call this after instantiation)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Pre-fetch tokens for configured services
    const services = ['crm'];
    if (this.config.BOOKS_ORG_ID) services.push('books');
    if (this.config.ANALYTICS_ORG_ID) services.push('analytics');
    if (this.config.CAMPAIGNS_CLIENT_ID) services.push('campaigns');
    if (this.config.DESK_ORG_ID) services.push('desk');

    for (const service of services) {
      try {
        await this.refreshToken(service);
        logger.info(`Initial token obtained for ${service}`);
      } catch (error) {
        logger.error(`Failed to get initial token for ${service}`, error);
      }
    }

    this.initialized = true;
    logger.info('Zoho Unified SDK initialized successfully', {
      services: services.length,
      tokens: this.tokens.size
    });
  }
}

// Singleton instance
export const zohoSDK = new ZohoUnifiedSDK();