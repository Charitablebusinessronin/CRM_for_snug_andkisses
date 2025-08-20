# Zoho Environment Configuration Setup

## Required Environment Variables

Create a `.env.local` file in the project root with these variables:

```bash
# Zoho API Configuration
ZOHO_CLIENT_ID=1000_YVAEMC4OSNZTE3CXVW4HBAJJVKJRT
ZOHO_CLIENT_SECRET=9a60ae55e934cc6ae31b3cb6ec594b4f83b293ce41
ZOHO_REDIRECT_URI=https://snugandkisses.com/api/auth/callback/zoho

# Zoho API URLs
ZOHO_CRM_API_URL=https://www.zohoapis.com/crm/v2
ZOHO_BOOKS_API_URL=https://books.zoho.com/api/v3
ZOHO_CAMPAIGNS_API_URL=https://campaigns.zoho.com/api/v1.1

# Zoho Refresh Token (Generate using the script below)
ZOHO_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_HERE

# Database Configuration
DATABASE_URL=your_database_url_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# HIPAA Compliance
ENCRYPTION_KEY=your_encryption_key_here
AUDIT_LOG_LEVEL=detailed
```

## Generating Zoho Refresh Token

1. Visit: https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoBooks.fullaccess.all,ZohoCampaigns.campaign.ALL&client_id=1000_YVAEMC4OSNZTE3CXVW4HBAJJVKJRT&response_type=code&access_type=offline&redirect_uri=https://snugandkisses.com/api/auth/callback/zoho

2. Authorize the application and copy the authorization code

3. Run the token generation script (see below)

## Token Generation Script

```bash
curl -X POST https://accounts.zoho.com/oauth/v2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=1000_YVAEMC4OSNZTE3CXVW4HBAJJVKJRT&client_secret=9a60ae55e934cc6ae31b3cb6ec594b4f83b293ce41&redirect_uri=https://snugandkisses.com/api/auth/callback/zoho&code=YOUR_AUTHORIZATION_CODE"
```

Replace `YOUR_AUTHORIZATION_CODE` with the code from step 2.

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific configurations for production
- Rotate tokens regularly for security
- Ensure HIPAA compliance for all PHI data
