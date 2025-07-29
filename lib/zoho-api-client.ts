/**
 * Zoho API Client - Real Integration with Zoho CRM, Books, and Campaigns
 * Uses actual Zoho APIs with production credentials
 */

interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ZohoCRMContact {
  id?: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Account_Name?: string;
  Lead_Source?: string;
}

interface ZohoBookInvoice {
  customer_id: string;
  invoice_number?: string;
  date: string;
  due_date: string;
  line_items: Array<{
    item_id?: string;
    name: string;
    rate: number;
    quantity: number;
  }>;
}

interface ZohoCampaign {
  campaign_name: string;
  campaign_type: string;
  from_email: string;
  reply_to: string;
  subject: string;
  content: string;
}

export class ZohoAPIClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  private readonly config = {
    clientId: process.env.ZOHO_CLIENT_ID!,
    clientSecret: process.env.ZOHO_CLIENT_SECRET!,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
    crmApiUrl: process.env.ZOHO_CRM_API_URL!,
    booksApiUrl: process.env.ZOHO_BOOKS_API_URL!,
    campaignsApiUrl: process.env.ZOHO_CAMPAIGNS_API_URL!,
  };

  constructor() {
    // Validate required environment variables
    const requiredVars = ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data: ZohoTokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing Zoho access token:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request to Zoho
   */
  private async makeAPIRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zoho API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  // =====================
  // ZOHO CRM METHODS
  // =====================

  /**
   * Get all contacts from Zoho CRM
   */
  async getCRMContacts(page = 1, perPage = 200): Promise<ZohoCRMContact[]> {
    const url = `${this.config.crmApiUrl}/Contacts?page=${page}&per_page=${perPage}`;
    const response = await this.makeAPIRequest(url);
    return response.data || [];
  }

  /**
   * Create a new contact in Zoho CRM
   */
  async createCRMContact(contact: ZohoCRMContact): Promise<any> {
    const url = `${this.config.crmApiUrl}/Contacts`;
    return await this.makeAPIRequest(url, {
      method: 'POST',
      body: JSON.stringify({ data: [contact] }),
    });
  }

  /**
   * Get all deals from Zoho CRM
   */
  async getCRMDeals(page = 1, perPage = 200): Promise<any[]> {
    const url = `${this.config.crmApiUrl}/Deals?page=${page}&per_page=${perPage}`;
    const response = await this.makeAPIRequest(url);
    return response.data || [];
  }

  /**
   * Create a new deal in Zoho CRM
   */
  async createCRMDeal(deal: any): Promise<any> {
    const url = `${this.config.crmApiUrl}/Deals`;
    return await this.makeAPIRequest(url, {
      method: 'POST',
      body: JSON.stringify({ data: [deal] }),
    });
  }

  /**
   * Get CRM dashboard data
   */
  async getCRMDashboard(): Promise<any> {
    try {
      const [contacts, deals] = await Promise.all([
        this.getCRMContacts(1, 10),
        this.getCRMDeals(1, 10)
      ]);

      return {
        contacts: contacts.length,
        deals: deals.length,
        recent_contacts: contacts.slice(0, 5),
        recent_deals: deals.slice(0, 5),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting CRM dashboard:', error);
      throw error;
    }
  }

  // =====================
  // ZOHO BOOKS METHODS
  // =====================

  /**
   * Get all customers from Zoho Books
   */
  async getBooksCustomers(): Promise<any[]> {
    const url = `${this.config.booksApiUrl}/contacts`;
    const response = await this.makeAPIRequest(url);
    return response.contacts || [];
  }

  /**
   * Get all invoices from Zoho Books
   */
  async getBooksInvoices(): Promise<any[]> {
    const url = `${this.config.booksApiUrl}/invoices`;
    const response = await this.makeAPIRequest(url);
    return response.invoices || [];
  }

  /**
   * Create a new invoice in Zoho Books
   */
  async createBooksInvoice(invoice: ZohoBookInvoice): Promise<any> {
    const url = `${this.config.booksApiUrl}/invoices`;
    return await this.makeAPIRequest(url, {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  /**
   * Get Books dashboard data
   */
  async getBooksDashboard(): Promise<any> {
    try {
      const [customers, invoices] = await Promise.all([
        this.getBooksCustomers(),
        this.getBooksInvoices()
      ]);

      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const pendingInvoices = invoices.filter(inv => inv.status === 'sent');

      return {
        customers: customers.length,
        invoices: invoices.length,
        total_revenue: totalRevenue,
        paid_invoices: paidInvoices.length,
        pending_invoices: pendingInvoices.length,
        recent_invoices: invoices.slice(0, 5),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Books dashboard:', error);
      throw error;
    }
  }

  // =====================
  // ZOHO CAMPAIGNS METHODS
  // =====================

  /**
   * Get all email campaigns
   */
  async getCampaigns(): Promise<any[]> {
    const url = `${this.config.campaignsApiUrl}/campaigns`;
    const response = await this.makeAPIRequest(url);
    return response.campaigns || [];
  }

  /**
   * Create a new email campaign
   */
  async createCampaign(campaign: ZohoCampaign): Promise<any> {
    const url = `${this.config.campaignsApiUrl}/campaigns`;
    return await this.makeAPIRequest(url, {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const url = `${this.config.campaignsApiUrl}/campaigns/${campaignId}/analytics`;
    return await this.makeAPIRequest(url);
  }

  /**
   * Get Campaigns dashboard data
   */
  async getCampaignsDashboard(): Promise<any> {
    try {
      const campaigns = await this.getCampaigns();
      
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
      const totalOpens = campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0);
      const totalClicks = campaigns.reduce((sum, c) => sum + (c.click_count || 0), 0);

      return {
        total_campaigns: campaigns.length,
        active_campaigns: activeCampaigns.length,
        total_sent: totalSent,
        total_opens: totalOpens,
        total_clicks: totalClicks,
        open_rate: totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(2) : 0,
        click_rate: totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(2) : 0,
        recent_campaigns: campaigns.slice(0, 5),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Campaigns dashboard:', error);
      throw error;
    }
  }

  // =====================
  // UNIFIED DASHBOARD
  // =====================

  /**
   * Get unified dashboard data from all Zoho services
   */
  async getUnifiedDashboard(): Promise<any> {
    try {
      const [crmData, booksData, campaignsData] = await Promise.all([
        this.getCRMDashboard().catch(err => ({ error: err.message })),
        this.getBooksDashboard().catch(err => ({ error: err.message })),
        this.getCampaignsDashboard().catch(err => ({ error: err.message }))
      ]);

      return {
        crm: crmData,
        books: booksData,
        campaigns: campaignsData,
        last_sync: new Date().toISOString(),
        sync_status: 'completed'
      };
    } catch (error) {
      console.error('Error getting unified dashboard:', error);
      throw error;
    }
  }

  /**
   * Test all API connections
   */
  async testConnections(): Promise<any> {
    const results = {
      crm: { status: 'unknown', message: '' },
      books: { status: 'unknown', message: '' },
      campaigns: { status: 'unknown', message: '' }
    };

    // Test CRM
    try {
      await this.getCRMContacts(1, 1);
      results.crm = { status: 'connected', message: 'Successfully connected to Zoho CRM' };
    } catch (error) {
      results.crm = { status: 'error', message: `CRM connection failed: ${error}` };
    }

    // Test Books
    try {
      await this.getBooksCustomers();
      results.books = { status: 'connected', message: 'Successfully connected to Zoho Books' };
    } catch (error) {
      results.books = { status: 'error', message: `Books connection failed: ${error}` };
    }

    // Test Campaigns
    try {
      await this.getCampaigns();
      results.campaigns = { status: 'connected', message: 'Successfully connected to Zoho Campaigns' };
    } catch (error) {
      results.campaigns = { status: 'error', message: `Campaigns connection failed: ${error}` };
    }

    return results;
  }
}

// Export singleton instance
export const zohoClient = new ZohoAPIClient();