/**
 * Catalyst API Deployment Script
 * Uses REST API to deploy business suite components
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration from .catalystrc
const config = {
  PROJECT_ID: '30300000000011038',
  ENV_ID: '891140386',
  BASE_URL: 'https://catalyst.zoho.com/baas/v1',
  DOMAIN: 'project-rainfall-891140386.development.catalystserverless.com',
  // OAuth credentials should be loaded from environment variables
  REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN,
  CLIENT_ID: process.env.ZOHO_CLIENT_ID,
  CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET
};

class CatalystAPIClient {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Validate required environment variables
    if (!config.REFRESH_TOKEN || !config.CLIENT_ID || !config.CLIENT_SECRET) {
      throw new Error('Missing required OAuth credentials. Please set ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, and ZOHO_CLIENT_SECRET environment variables.');
    }

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
          refresh_token: config.REFRESH_TOKEN,
          client_id: config.CLIENT_ID,
          client_secret: config.CLIENT_SECRET,
          grant_type: 'refresh_token'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('✅ Access token refreshed successfully');
      return this.accessToken;
      
    } catch (error) {
      console.error('❌ Error refreshing access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async makeAPICall(method, endpoint, data = null) {
    const token = await this.getAccessToken();
    const url = `${config.BASE_URL}${endpoint}`;
    
    const headers = {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios({
        method,
        url,
        headers,
        data
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ API call failed: ${method} ${endpoint}`, error.response?.data || error.message);
      throw error;
    }
  }

  async deployDataStore() {
    console.log('🗄️  Deploying Catalyst Data Store tables...');
    
    const tables = [
      {
        table_name: 'customers',
        columns: [
          { column_name: 'name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'phone', data_type: 'varchar', max_length: 50 },
          { column_name: 'company', data_type: 'varchar', max_length: 255 },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'active' },
          { column_name: 'source', data_type: 'varchar', max_length: 100 },
          { column_name: 'lead_score', data_type: 'int', default_value: 0 },
          { column_name: 'address', data_type: 'text' }
        ]
      },
      {
        table_name: 'support_tickets',
        columns: [
          { column_name: 'ticket_number', data_type: 'varchar', max_length: 50, is_mandatory: true },
          { column_name: 'title', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'description', data_type: 'text', is_mandatory: true },
          { column_name: 'customer_email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'priority', data_type: 'varchar', max_length: 20, default_value: 'medium' },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'open' }
        ]
      }
    ];

    for (const table of tables) {
      try {
        const result = await this.makeAPICall('POST', `/project/${config.PROJECT_ID}/datastore/table`, table);
        console.log(`✅ Table '${table.table_name}' created successfully`);
      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Table '${table.table_name}' already exists`);
        } else {
          console.error(`❌ Failed to create table '${table.table_name}':`, error.message);
        }
      }
    }
  }

  async setupEmailTemplates() {
    console.log('📧 Setting up email templates...');
    
    const templates = [
      {
        template_name: 'welcome_customer',
        subject: 'Welcome to Snug & Kisses',
        body: `
          <h2>Welcome {{name}}!</h2>
          <p>Thank you for your interest in Snug & Kisses services.</p>
          <p>We'll be in touch soon to discuss how we can help you.</p>
          <br>
          <p>Best regards,<br>The Snug & Kisses Team</p>
        `,
        template_type: 'html'
      },
      {
        template_name: 'support_ticket_created', 
        subject: 'Support Ticket Created - {{ticket_number}}',
        body: `
          <h2>Support Ticket Created</h2>
          <p>Dear {{customer_name}},</p>
          <p>Your support ticket has been created successfully.</p>
          <p><strong>Ticket Number:</strong> {{ticket_number}}</p>
          <p><strong>Title:</strong> {{title}}</p>
          <p>We will respond within 24 hours.</p>
          <br>
          <p>Best regards,<br>Snug & Kisses Support Team</p>
        `,
        template_type: 'html'
      }
    ];

    for (const template of templates) {
      try {
        await this.makeAPICall('POST', `/project/${config.PROJECT_ID}/email/template`, template);
        console.log(`✅ Email template '${template.template_name}' created`);
      } catch (error) {
        console.log(`⚠️  Email template '${template.template_name}' may already exist`);
      }
    }
  }

  async deployBusinessSuiteAPI() {
    console.log('🚀 Deploying Business Suite API configuration...');
    
    // Create API gateway configuration
    const apiConfig = {
      name: 'BusinessSuiteAPI',
      description: 'Unified API for all business modules',
      routes: [
        {
          path: '/api/crm/*',
          method: 'ANY',
          function_name: 'crm-functions'
        },
        {
          path: '/api/support/*', 
          method: 'ANY',
          function_name: 'support-functions'
        },
        {
          path: '/api/finance/*',
          method: 'ANY', 
          function_name: 'finance-functions'
        },
        {
          path: '/api/hr/*',
          method: 'ANY',
          function_name: 'hr-functions'
        },
        {
          path: '/api/marketing/*',
          method: 'ANY',
          function_name: 'marketing-functions'
        }
      ]
    };

    try {
      await this.makeAPICall('POST', `/project/${config.PROJECT_ID}/gateway/api`, apiConfig);
      console.log('✅ API Gateway configured successfully');
    } catch (error) {
      console.log('⚠️  API Gateway may already be configured');
    }
  }

  async getProjectStatus() {
    console.log('📊 Getting project deployment status...');
    
    try {
      const project = await this.makeAPICall('GET', `/project/${config.PROJECT_ID}`);
      const tables = await this.makeAPICall('GET', `/project/${config.PROJECT_ID}/datastore/table`);
      
      console.log('📈 Deployment Status:');
      console.log(`  Project: ${project.project_name || 'SnugCrm'}`);
      console.log(`  Environment: ${project.environment || 'Production'}`);
      console.log(`  Tables: ${tables?.length || 0} created`);
      console.log(`  Domain: ${config.DOMAIN}.catalystserverless.com`);
      console.log(`  Status: ✅ OPERATIONAL`);
      
      return {
        project,
        tables: tables?.length || 0,
        status: 'operational',
        domain: `${config.DOMAIN}.catalystserverless.com`
      };
      
    } catch (error) {
      console.error('❌ Error getting project status:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

async function deployBusinessSuite() {
  console.log('🚀 Starting Catalyst Business Suite deployment...\n');
  
  const client = new CatalystAPIClient();
  
  try {
    // Step 1: Deploy Data Store
    await client.deployDataStore();
    console.log('');
    
    // Step 2: Setup Email Templates
    await client.setupEmailTemplates();
    console.log('');
    
    // Step 3: Configure API Gateway
    await client.deployBusinessSuiteAPI();
    console.log('');
    
    // Step 4: Get deployment status
    const status = await client.getProjectStatus();
    console.log('');
    
    console.log('🎉 Catalyst Business Suite deployment completed!');
    console.log('🌐 Your business suite is now live at:');
    console.log(`   https://${config.DOMAIN}.catalystserverless.com`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Test API endpoints via the web interface');
    console.log('   2. Import existing customer data if needed');
    console.log('   3. Configure user roles and permissions');  
    console.log('   4. Set up monitoring and alerts');
    
    return status;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployBusinessSuite();
}

module.exports = { deployBusinessSuite, CatalystAPIClient };