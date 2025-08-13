/**
 * Direct Zoho CRM v7 API Client - REST API Approach  
 * BREAKTHROUGH: Eliminates both DataStore AND SDK complexity
 * Now with PROPER Zoho OAuth implementation!
 */

const axios = require('axios');

// Zoho OAuth Client (Node.js compatible version of existing TypeScript auth)
class ZohoAuthClient {
    constructor() {
        this.cachedAccessToken = null;
        this.tokenExpiryEpochMs = 0;
        this.accountsBaseUrl = process.env.ZOHO_ACCOUNTS_BASE_URL || 'https://accounts.zoho.com';
    }

    async getAccessToken() {
        const now = Date.now();
        if (this.cachedAccessToken && now < this.tokenExpiryEpochMs) {
            return this.cachedAccessToken;
        }

        const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        const clientId = process.env.ZOHO_CLIENT_ID;
        const clientSecret = process.env.ZOHO_CLIENT_SECRET;

        if (!refreshToken || !clientId || !clientSecret) {
            throw new Error('Missing Zoho OAuth env vars: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET');
        }

        try {
            const response = await axios.post(`${this.accountsBaseUrl}/oauth/v2/token`, null, {
                params: {
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;
            if (!data.access_token) {
                throw new Error('No access_token in Zoho response');
            }

            // Cache the token
            this.cachedAccessToken = data.access_token;
            const expiresInMs = (data.expires_in || 3600) * 1000; // Convert seconds to ms
            this.tokenExpiryEpochMs = Date.now() + expiresInMs - 60000; // 1 minute buffer

            console.log('✅ Zoho OAuth token refreshed successfully');
            return this.cachedAccessToken;

        } catch (error) {
            console.error('❌ Failed to refresh Zoho access token:', error.message);
            if (error.response) {
                console.error('Response:', error.response.data);
            }
            throw error;
        }
    }
}

// Singleton instance
let zohoAuth = null;

function getZohoAuth() {
    if (!zohoAuth) {
        zohoAuth = new ZohoAuthClient();
    }
    return zohoAuth;
}

class DirectCRMClient {
    constructor() {
        this.baseURL = 'https://www.zohoapis.com/crm/v7';
        this.zohoAuth = getZohoAuth();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Test OAuth connection
            await this.zohoAuth.getAccessToken();
            this.initialized = true;
            console.log("✅ Direct CRM Client with OAuth initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize Direct CRM Client:", error.message);
            throw error;
        }
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        await this.initialize();

        const accessToken = await this.zohoAuth.getAccessToken();
        
        const config = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // Token might be expired, force refresh and retry once
                this.zohoAuth.cachedAccessToken = null; // Force refresh
                const newToken = await this.zohoAuth.getAccessToken();
                config.headers['Authorization'] = `Zoho-oauthtoken ${newToken}`;
                const retryResponse = await axios(config);
                return retryResponse.data;
            }
            
            console.error('❌ CRM API Request failed:', {
                endpoint,
                method,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    // ====================
    // CONTACT OPERATIONS
    // ====================
    
    async getContacts(params = {}) {
        const queryString = Object.keys(params).length > 0 ? 
            '?' + new URLSearchParams(params).toString() : '';
        
        const result = await this.makeRequest(`/Contacts${queryString}`);
        return {
            success: true,
            data: result.data || [],
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    async getContact(contactId) {
        const result = await this.makeRequest(`/Contacts/${contactId}`);
        return {
            success: true,
            data: result.data || {},
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    async createContact(contactData) {
        const result = await this.makeRequest('/Contacts', 'POST', {
            data: [contactData]
        });
        return {
            success: true,
            data: result.data || {},
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // LEAD OPERATIONS
    // ====================
    
    async getLeads(params = {}) {
        const queryString = Object.keys(params).length > 0 ? 
            '?' + new URLSearchParams(params).toString() : '';
        
        const result = await this.makeRequest(`/Leads${queryString}`);
        return {
            success: true,
            data: result.data || [],
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    async createLead(leadData) {
        const result = await this.makeRequest('/Leads', 'POST', {
            data: [leadData]
        });
        return {
            success: true,
            data: result.data || {},
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // DEAL OPERATIONS
    // ====================
    
    async getDeals(params = {}) {
        const queryString = Object.keys(params).length > 0 ? 
            '?' + new URLSearchParams(params).toString() : '';
        
        const result = await this.makeRequest(`/Deals${queryString}`);
        return {
            success: true,
            data: result.data || [],
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // ACCOUNT OPERATIONS
    // ====================
    
    async getAccounts(params = {}) {
        const queryString = Object.keys(params).length > 0 ? 
            '?' + new URLSearchParams(params).toString() : '';
        
        const result = await this.makeRequest(`/Accounts${queryString}`);
        return {
            success: true,
            data: result.data || [],
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // SEARCH OPERATIONS
    // ====================
    
    async searchRecords(module, criteria, params = {}) {
        const searchParams = {
            criteria: criteria,
            ...params
        };
        
        const queryString = new URLSearchParams(searchParams).toString();
        const result = await this.makeRequest(`/${module}/search?${queryString}`);
        
        return {
            success: true,
            data: result.data || [],
            source: 'Direct CRM API v7',
            module: module,
            criteria: criteria,
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // ANALYTICS & REPORTS
    // ====================
    
    async getAnalytics(module, timeRange = 'this_month') {
        // This would integrate with Zoho Analytics API or CRM reports
        return {
            success: true,
            message: `Analytics for ${module} (${timeRange})`,
            data: {
                total_records: 0,
                this_month: 0,
                conversion_rate: 0
            },
            source: 'Direct CRM API v7',
            timestamp: new Date().toISOString()
        };
    }

    // ====================
    // UTILITY METHODS
    // ====================
    
    async healthCheck() {
        try {
            await this.initialize();
            return {
                success: true,
                message: 'Direct CRM connection healthy',
                api_version: 'v7',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: 'CRM connection failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Singleton instance
let directCRMClient = null;

function getDirectCRMClient() {
    if (!directCRMClient) {
        directCRMClient = new DirectCRMClient();
    }
    return directCRMClient;
}

module.exports = {
    DirectCRMClient,
    getDirectCRMClient
};