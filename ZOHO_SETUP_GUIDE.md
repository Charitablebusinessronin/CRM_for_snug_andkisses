# Zoho API Console Setup Guide for Snugs and Kisses CRM

## Step 1: Choose Client Type
✅ Select **"Server-based Applications"** from the Zoho API Console

## Step 2: Application Details
When creating the server-based application, use these settings:

### Basic Information
- **Application Name**: `Snugs and Kisses CRM`
- **Description**: `Customer relationship management system for childcare services`
- **Application Type**: `Web-based`

### OAuth Configuration
- **Authorized Redirect URIs**:
  - Development: `http://localhost:3000/api/auth/callback`
  - Production: `https://your-domain.com/api/auth/callback`
  
### Required Scopes
Select the following scopes for Zoho One integration:

#### Zoho CRM
- `ZohoCRM.modules.ALL` - Full access to CRM modules
- `ZohoCRM.users.READ` - Read user information
- `ZohoCRM.org.READ` - Read organization details

#### Zoho Books
- `ZohoBooks.fullaccess.all` - Full access to Books API
- `ZohoBooks.contacts.CREATE` - Create contacts
- `ZohoBooks.invoices.CREATE` - Create invoices

#### Zoho Campaigns
- `ZohoCampaigns.campaign.ALL` - Campaign management
- `ZohoCampaigns.contact.ALL` - Contact list management

## Step 3: Collect Credentials
After creation, you'll receive:

\`\`\`env
# Add these to your .env.local file
ZOHO_CLIENT_ID=1000.XXXXXXXXXXXXXXXXX
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_REDIRECT_URI=https://your-domain.com/api/auth/callback
\`\`\`

## Step 4: Generate Refresh Token
1. Use the authorization URL to get an authorization code
2. Exchange the code for a refresh token
3. Add the refresh token to environment variables:

\`\`\`env
ZOHO_REFRESH_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

## Step 5: Test Connection
Use the Zoho API Console's test feature to verify:
- CRM API access
- Books API access  
- User authentication

## Important Notes
- Keep credentials secure and never commit to version control
- Use different credentials for development and production
- Set up proper domain verification for production
- Enable IP restrictions if needed for additional security

## Troubleshooting
- Ensure redirect URIs exactly match your application URLs
- Verify all required scopes are selected
- Check that your Zoho One subscription includes the required services
- Test API calls using Postman or similar tools first
