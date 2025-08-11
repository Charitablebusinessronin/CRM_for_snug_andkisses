import { logger } from '../utils/logger';

// Lightweight placeholder to avoid hard dependency errors before SDKs are installed
export type Contact = { id?: string; Email?: string; [key: string]: any };
export type Lead = { id?: string; Email?: string; [key: string]: any };
export type Invoice = { id?: string; [key: string]: any };

class ZohoUnifiedService {
  private initialized = false;
  // Lazy fields to avoid import errors until packages are installed
  private crmSDK: any | null = null;
  private booksSDK: any | null = null;
  private catalystApp: any | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      // Dynamically import after deps are installed
      const env = await import('../config/env-config');

      try {
        const { ZOHOCRMSDK } = await import('@zohocrm/nodejs-sdk-7.0');
        this.crmSDK = new (ZOHOCRMSDK as any)({
          environment: env.envConfig.ZOHO_ENVIRONMENT,
          domain: env.envConfig.ZOHO_DOMAIN,
          clientId: env.envConfig.ZOHO_CRM_CLIENT_ID,
          clientSecret: env.envConfig.ZOHO_CRM_CLIENT_SECRET,
          refreshToken: env.envConfig.ZOHO_CRM_REFRESH_TOKEN
        });
      } catch (e) {
        logger.warn('Zoho CRM SDK not installed yet; CRM features disabled');
      }

      try {
        if (env.envConfig.ZOHO_BOOKS_ORG_ID) {
          const { ZohoBooksSDK } = await import('@zoho/zohobooks-nodejs-sdk');
          this.booksSDK = new (ZohoBooksSDK as any)({
            clientId: env.envConfig.ZOHO_BOOKS_CLIENT_ID,
            clientSecret: env.envConfig.ZOHO_BOOKS_CLIENT_SECRET,
            refreshToken: env.envConfig.ZOHO_BOOKS_REFRESH_TOKEN,
            organizationId: env.envConfig.ZOHO_BOOKS_ORG_ID
          });
        }
      } catch (e) {
        logger.warn('Zoho Books SDK not installed yet; Books features disabled');
      }

      try {
        if (env.envConfig.CATALYST_PROJECT_ID) {
          const catalyst = (await import('zcatalyst-sdk-node')).default;
          this.catalystApp = catalyst.initialize();
        }
      } catch (e) {
        logger.warn('Catalyst SDK not ready yet; Catalyst features disabled');
      }

      this.initialized = true;
      logger.info('ZohoUnifiedService initialized');
    } catch (error) {
      logger.error({ error }, 'Failed initializing ZohoUnifiedService');
      throw error;
    }
  }

  async getContacts(page = 1, perPage = 50): Promise<Contact[]> {
    if (!this.initialized) await this.initialize();
    if (!this.crmSDK) return [];
    try {
      const response = await this.crmSDK.record.getRecords({ moduleAPIName: 'Contacts', page, perPage });
      return (response as any)?.data || [];
    } catch (error) {
      logger.error({ error }, 'Error fetching contacts');
      throw error;
    }
  }

  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    if (!this.initialized) await this.initialize();
    if (!this.crmSDK) throw new Error('CRM SDK not available');
    try {
      const response = await this.crmSDK.record.createRecords({
        moduleAPIName: 'Contacts',
        body: { data: [contactData] }
      });
      return (response as any)?.data?.[0];
    } catch (error) {
      logger.error({ error }, 'Error creating contact');
      throw error;
    }
  }

  async getHealthStatus(): Promise<{ crm: boolean; books: boolean; catalyst: boolean }> {
    return { crm: !!this.crmSDK, books: !!this.booksSDK, catalyst: !!this.catalystApp };
  }
}

export const zohoService = new ZohoUnifiedService();
