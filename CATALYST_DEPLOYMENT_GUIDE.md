# Zoho Catalyst Business Suite Deployment Guide

## Overview

This guide will help you deploy your Zoho One-like business suite built with Zoho Catalyst. The system includes:

- **CRM & Sales** - Customer relationship management and sales pipeline
- **Marketing Automation** - Email campaigns and lead scoring
- **Customer Support** - Ticketing system with auto-assignment
- **Finance & Accounting** - Invoice management and payment tracking
- **HR Management** - Employee data, time tracking, and leave management
- **Unified Dashboard** - Integrated overview of all business modules

## Prerequisites

1. **Zoho Catalyst Account**: Sign up at [catalyst.zoho.com](https://catalyst.zoho.com)
2. **Node.js**: Version 16 or higher
3. **Catalyst CLI**: Install globally with `npm install -g zcatalyst-cli`

## Step 1: Set Up Catalyst Project

### 1.1 Initialize Catalyst Project

```bash
# Navigate to your project directory
cd "C:\Users\sabir\.windsurf\Winsurf programs\01_EndlessOdyssey\Freelance\Snug and Kisses\CRM_for_snug_andkisses"

# Initialize Catalyst project
catalyst init

# Follow the prompts:
# - Project Name: snug-kisses-business-suite
# - Project Type: Full Stack
# - Framework: React/Next.js
```

### 1.2 Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Catalyst Configuration
CATALYST_PROJECT_ID=your_project_id
CATALYST_FROM_EMAIL=noreply@snugandkisses.com
CATALYST_APP_URL=https://your-app.catalyst.zoho.com

# Business Configuration
HR_EMAIL=hr@snugandkisses.com
SUPPORT_EMAIL=support@snugandkisses.com
FINANCE_EMAIL=finance@snugandkisses.com

# Zoho Integration (for additional APIs)
ZOHO_ONE_CLIENT_ID=your_zoho_client_id
ZOHO_ONE_CLIENT_SECRET=your_zoho_client_secret
ZOHO_ONE_REDIRECT_URI=https://your-app.catalyst.zoho.com/api/auth/callback/zoho
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_CRM_API_URL=https://www.zohoapis.com/crm/v2
ZOHO_BOOKS_API_URL=https://books.zohoapis.com/api/v3
ZOHO_CAMPAIGNS_API_URL=https://campaigns.zohoapis.com/api/v1.1
```

## Step 2: Set Up Catalyst Data Store

### 2.1 Create Required Tables

The system uses the following Catalyst Data Store tables:

```javascript
// Execute in Catalyst Console or CLI
const tables = [
  {
    table_name: "customers",
    columns: [
      { column_name: "name", data_type: "varchar", max_length: 255 },
      { column_name: "email", data_type: "varchar", max_length: 255 },
      { column_name: "phone", data_type: "varchar", max_length: 50 },
      { column_name: "company", data_type: "varchar", max_length: 255 },
      { column_name: "status", data_type: "varchar", max_length: 50 },
      { column_name: "source", data_type: "varchar", max_length: 100 },
      { column_name: "lead_score", data_type: "int", default_value: 0 },
      { column_name: "address", data_type: "text" },
      { column_name: "created_time", data_type: "datetime" },
      { column_name: "modified_time", data_type: "datetime" }
    ]
  },
  {
    table_name: "deals",
    columns: [
      { column_name: "name", data_type: "varchar", max_length: 255 },
      { column_name: "customer_id", data_type: "bigint" },
      { column_name: "amount", data_type: "decimal", precision: 10, scale: 2 },
      { column_name: "stage", data_type: "varchar", max_length: 50 },
      { column_name: "probability", data_type: "int" },
      { column_name: "expected_close_date", data_type: "date" },
      { column_name: "created_time", data_type: "datetime" },
      { column_name: "modified_time", data_type: "datetime" }
    ]
  },
  {
    table_name: "support_tickets",
    columns: [
      { column_name: "ticket_number", data_type: "varchar", max_length: 50 },
      { column_name: "title", data_type: "varchar", max_length: 255 },
      { column_name: "description", data_type: "text" },
      { column_name: "customer_id", data_type: "bigint" },
      { column_name: "customer_name", data_type: "varchar", max_length: 255 },
      { column_name: "customer_email", data_type: "varchar", max_length: 255 },
      { column_name: "priority", data_type: "varchar", max_length: 20 },
      { column_name: "category", data_type: "varchar", max_length: 50 },
      { column_name: "status", data_type: "varchar", max_length: 50 },
      { column_name: "assigned_to", data_type: "bigint" },
      { column_name: "assigned_to_name", data_type: "varchar", max_length: 255 },
      { column_name: "response_due", data_type: "datetime" },
      { column_name: "resolution_due", data_type: "datetime" },
      { column_name: "first_response_time", data_type: "datetime" },
      { column_name: "resolved_time", data_type: "datetime" },
      { column_name: "resolution_notes", data_type: "text" },
      { column_name: "created_time", data_type: "datetime" },
      { column_name: "modified_time", data_type: "datetime" }
    ]
  },
  {
    table_name: "invoices",
    columns: [
      { column_name: "invoice_number", data_type: "varchar", max_length: 50 },
      { column_name: "customer_id", data_type: "bigint" },
      { column_name: "customer_name", data_type: "varchar", max_length: 255 },
      { column_name: "customer_email", data_type: "varchar", max_length: 255 },
      { column_name: "subtotal", data_type: "decimal", precision: 10, scale: 2 },
      { column_name: "tax_rate", data_type: "decimal", precision: 5, scale: 2 },
      { column_name: "tax_amount", data_type: "decimal", precision: 10, scale: 2 },
      { column_name: "total_amount", data_type: "decimal", precision: 10, scale: 2 },
      { column_name: "paid_amount", data_type: "decimal", precision: 10, scale: 2, default_value: 0 },
      { column_name: "status", data_type: "varchar", max_length: 50 },
      { column_name: "due_date", data_type: "date" },
      { column_name: "payment_terms", data_type: "varchar", max_length: 100 },
      { column_name: "notes", data_type: "text" },
      { column_name: "sent_time", data_type: "datetime" },
      { column_name: "paid_time", data_type: "datetime" },
      { column_name: "created_time", data_type: "datetime" },
      { column_name: "modified_time", data_type: "datetime" }
    ]
  },
  {
    table_name: "employees",
    columns: [
      { column_name: "employee_id", data_type: "varchar", max_length: 50 },
      { column_name: "name", data_type: "varchar", max_length: 255 },
      { column_name: "email", data_type: "varchar", max_length: 255 },
      { column_name: "phone", data_type: "varchar", max_length: 50 },
      { column_name: "department", data_type: "varchar", max_length: 100 },
      { column_name: "position", data_type: "varchar", max_length: 100 },
      { column_name: "hire_date", data_type: "date" },
      { column_name: "salary", data_type: "decimal", precision: 10, scale: 2 },
      { column_name: "manager_id", data_type: "bigint" },
      { column_name: "address", data_type: "text" },
      { column_name: "emergency_contact", data_type: "text" },
      { column_name: "benefits", data_type: "text" },
      { column_name: "employment_type", data_type: "varchar", max_length: 50 },
      { column_name: "status", data_type: "varchar", max_length: 50 },
      { column_name: "created_time", data_type: "datetime" },
      { column_name: "modified_time", data_type: "datetime" }
    ]
  }
  // Additional tables: campaigns, activities, payments, expenses, time_entries, leave_requests, etc.
];
```

### 2.2 Create Tables via Catalyst CLI

```bash
# Use the Catalyst CLI to create tables
catalyst datastore create-table --file ./database-schema.json
```

## Step 3: Deploy Serverless Functions

### 3.1 Upload Business Logic Functions

```bash
# Deploy all functions
catalyst function deploy --path ./functions/business-suite/

# Or deploy individual functions:
catalyst function deploy --function crm-functions
catalyst function deploy --function marketing-functions
catalyst function deploy --function support-functions
catalyst function deploy --function finance-functions
catalyst function deploy --function hr-functions
```

### 3.2 Configure Function Triggers

Set up HTTP triggers for each function in the Catalyst console:

- `/api/crm/*` → crm-functions
- `/api/marketing/*` → marketing-functions
- `/api/support/*` → support-functions
- `/api/finance/*` → finance-functions
- `/api/hr/*` → hr-functions

## Step 4: Configure Email Service

### 4.1 Set Up Email Templates

Create email templates in Catalyst Mail service:

1. **Welcome Email** - New customer registration
2. **Invoice Email** - Invoice delivery
3. **Support Ticket** - Ticket creation/updates
4. **Leave Request** - HR notifications
5. **Marketing Campaigns** - Email marketing

### 4.2 Configure SMTP Settings

In Catalyst Console → Mail:
- Configure your domain email settings
- Set up SPF, DKIM records for deliverability
- Configure bounce and unsubscribe handling

## Step 5: Set Up Authentication & Permissions

### 5.1 Configure User Management

```javascript
// Create user roles in Catalyst Authentication
const roles = [
  {
    role_name: "admin",
    permissions: ["all"]
  },
  {
    role_name: "manager",
    permissions: ["crm", "support", "hr", "finance"]
  },
  {
    role_name: "employee",
    permissions: ["crm", "support"]
  },
  {
    role_name: "customer",
    permissions: ["support"]
  }
];
```

### 5.2 Set Up Security Rules

Configure security rules for data access:

```javascript
// Example security rules
const securityRules = {
  customers: {
    read: ["admin", "manager", "employee"],
    write: ["admin", "manager"],
    delete: ["admin"]
  },
  employees: {
    read: ["admin", "manager"],
    write: ["admin"],
    delete: ["admin"]
  },
  support_tickets: {
    read: ["admin", "manager", "employee"],
    write: ["admin", "manager", "employee"],
    delete: ["admin"]
  }
};
```

## Step 6: Deploy Web Client

### 6.1 Build and Deploy Frontend

```bash
# Build the Next.js application
npm run build

# Deploy to Catalyst Web Client Hosting
catalyst client deploy --path ./build
```

### 6.2 Configure Domain Mapping

1. Go to Catalyst Console → Domain Mappings
2. Add your custom domain (e.g., business.snugandkisses.com)
3. Configure SSL certificate
4. Update DNS records as instructed

## Step 7: Configure Integrations

### 7.1 Zoho One Integration (Optional)

If you want to sync with existing Zoho apps:

```bash
# Set up Zoho OAuth
catalyst integration create --type zoho --scopes "ZohoCRM.modules.all,ZohoBooks.fullaccess.all"
```

### 7.2 Payment Gateway Integration

For invoice payments, integrate with payment providers:

```javascript
// Example Stripe integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add to finance-functions.js
module.exports.processPayment = async (catalystReq) => {
  // Payment processing logic
};
```

## Step 8: Testing & Monitoring

### 8.1 Test Core Functionality

```bash
# Test API endpoints
curl -X POST https://your-app.catalyst.zoho.com/api/business-suite?module=crm&action=create-customer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@example.com"}'
```

### 8.2 Set Up Monitoring

1. Enable Catalyst Analytics
2. Configure Application Alerts
3. Set up log monitoring
4. Create performance dashboards

## Step 9: Data Migration (If Applicable)

### 9.1 Import Existing Data

```javascript
// Example data import script
const importCustomers = async () => {
  const csvData = await readCSVFile('./customer-data.csv');
  
  for (const row of csvData) {
    await businessSuite.createCustomer({
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company
    });
  }
};
```

## Step 10: Go Live

### 10.1 Final Checklist

- [ ] All functions deployed and tested
- [ ] Database tables created and populated
- [ ] Email service configured
- [ ] Authentication and roles set up
- [ ] Web client deployed
- [ ] Domain mapping configured
- [ ] SSL certificates active
- [ ] Monitoring and alerts configured
- [ ] User training completed
- [ ] Backup strategy implemented

### 10.2 Launch Steps

1. Switch from development to production environment
2. Update DNS to point to production domain
3. Send launch announcement to users
4. Monitor system performance closely
5. Be ready for immediate support

## Maintenance & Updates

### Regular Tasks

1. **Weekly**: Review system performance and user feedback
2. **Monthly**: Update security patches and dependencies
3. **Quarterly**: Review and optimize database performance
4. **Annually**: Conduct security audit and compliance review

### Scaling Considerations

- Monitor Catalyst resource usage
- Implement caching strategies
- Consider load balancing for high traffic
- Plan for data archiving and cleanup

## Support & Resources

- **Catalyst Documentation**: https://docs.catalyst.zoho.com
- **Catalyst Community**: https://community.catalyst.zoho.com
- **Support**: Open ticket in Catalyst Console
- **Training**: Catalyst University courses

## Troubleshooting

### Common Issues

1. **Function timeouts**: Optimize database queries and add caching
2. **Email delivery issues**: Check SPF/DKIM records and sender reputation
3. **Performance issues**: Implement pagination and data indexing
4. **Integration failures**: Verify API credentials and rate limits

### Debug Mode

Enable debug logging in development:

```javascript
// Add to function code
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', debugData);
}
```

---

**Congratulations!** You now have a fully functional Zoho One-like business suite powered by Zoho Catalyst. Your system includes integrated CRM, Marketing, Support, Finance, and HR modules with a unified dashboard interface.