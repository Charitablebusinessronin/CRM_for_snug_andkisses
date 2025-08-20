# 🔑 Zoho Refresh Token Generation Guide

## 🎯 **OBJECTIVE**
Generate a valid Zoho refresh token for production API authentication using the registered healthcare CRM application.

## 📋 **CURRENT CREDENTIALS**
```bash
✅ Client ID: 1000.Y94KBC4Q5DBZTE3CVMAHB0X3JYKJRT
✅ Client Secret: 9a60ae55c93dcc6a633a3cb6ec594b4f83b293ce41
✅ Redirect URI: https://snugcrm-891124823.development.catalystserverless.com/api/auth/callback/zoho
✅ Application: Snug & Kisses Healthcare CRM
```

## 🚀 **STEP-BY-STEP TOKEN GENERATION**

### **Step 1: Authorization URL Construction**
```javascript
const authorizationURL = `https://accounts.zoho.com/oauth/v2/auth?` +
  `response_type=code&` +
  `client_id=1000.Y94KBC4Q5DBZTE3CVMAHB0X3JYKJRT&` +
  `scope=ZohoCRM.modules.ALL,ZohoCampaigns.campaign.ALL,ZohoBookings.basic.ALL,ZohoAnalytics.data.READ&` +
  `redirect_uri=https://snugcrm-891124823.development.catalystserverless.com/api/auth/callback/zoho&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log('Visit this URL:', authorizationURL);
```

### **Step 2: Required Scopes for Healthcare CRM**
```bash
# Core CRM Operations
ZohoCRM.modules.ALL
ZohoCRM.settings.ALL
ZohoCRM.users.READ

# Email Automation
ZohoCampaigns.campaign.ALL
ZohoCampaigns.contact.ALL
ZohoCampaigns.template.ALL

# Booking System
ZohoBookings.basic.READ
ZohoBookings.basic.CREATE
ZohoBookings.basic.UPDATE

# Analytics & Reporting
ZohoAnalytics.data.READ
ZohoAnalytics.metadata.READ

# HIPAA Compliance
ZohoSign.documents.ALL
ZohoVault.secrets.READ
```

### **Step 3: Authorization Code Exchange**
After visiting the authorization URL and granting permissions, exchange the authorization code for tokens:

```javascript
const tokenExchange = async (authorizationCode) => {
  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '1000.Y94KBC4Q5DBZTE3CVMAHB0X3JYKJRT',
      client_secret: '9a60ae55c93dcc6a633a3cb6ec594b4f83b293ce41',
      redirect_uri: 'https://snugcrm-891124823.development.catalystserverless.com/api/auth/callback/zoho',
      code: authorizationCode
    })
  });
  
  const tokens = await response.json();
  console.log('Tokens received:', tokens);
  
  return tokens;
};
```

### **Step 4: Token Response Structure**
```json
{
  "access_token": "1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token": "1000.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "ZohoCRM.modules.ALL ZohoCampaigns.campaign.ALL ..."
}
```

## 🔧 **AUTOMATED TOKEN GENERATION SCRIPT**

### **Node.js Implementation:**
```javascript
// scripts/generate-zoho-token.js
const express = require('express');
const app = express();

const CLIENT_ID = '1000.Y94KBC4Q5DBZTE3CVMAHB0X3JYKJRT';
const CLIENT_SECRET = '9a60ae55c93dcc6a633a3cb6ec594b4f83b293ce41';
const REDIRECT_URI = 'https://snugcrm-891124823.development.catalystserverless.com/api/auth/callback/zoho';

// Step 1: Generate authorization URL
app.get('/auth', (req, res) => {
  const scopes = [
    'ZohoCRM.modules.ALL',
    'ZohoCRM.settings.ALL',
    'ZohoCampaigns.campaign.ALL',
    'ZohoCampaigns.contact.ALL',
    'ZohoBookings.basic.ALL',
    'ZohoAnalytics.data.READ',
    'ZohoSign.documents.ALL'
  ].join(',');
  
  const authURL = `https://accounts.zoho.com/oauth/v2/auth?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.redirect(authURL);
});

// Step 2: Handle callback and exchange code for tokens
app.get('/api/auth/callback/zoho', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not received' });
  }
  
  try {
    const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      return res.status(400).json({ error: tokens.error });
    }
    
    // Store refresh token securely
    console.log('🎉 REFRESH TOKEN GENERATED:', tokens.refresh_token);
    console.log('🔑 ACCESS TOKEN:', tokens.access_token);
    console.log('⏰ EXPIRES IN:', tokens.expires_in, 'seconds');
    
    res.json({
      success: true,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      message: 'Tokens generated successfully! Add the refresh_token to your .env.production file.'
    });
    
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Token generator server running on http://localhost:3000');
  console.log('📝 Visit http://localhost:3000/auth to start the OAuth flow');
});
```

## 🔄 **TOKEN REFRESH IMPLEMENTATION**

### **Automatic Token Refresh:**
```javascript
// lib/zoho-auth.js
export class ZohoAuth {
  constructor() {
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  }
  
  async getAccessToken() {
    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken
        })
      });
      
      const tokens = await response.json();
      
      if (tokens.error) {
        throw new Error(`Token refresh failed: ${tokens.error}`);
      }
      
      return tokens.access_token;
      
    } catch (error) {
      console.error('Access token refresh error:', error);
      throw error;
    }
  }
}
```

## ✅ **COMPLETION CHECKLIST**

### **Token Generation Steps:**
- [ ] Run the authorization URL generator
- [ ] Visit the generated URL and grant permissions
- [ ] Capture the authorization code from callback
- [ ] Exchange code for refresh token
- [ ] Update .env.production with refresh token
- [ ] Test token refresh functionality
- [ ] Verify API access with new tokens

### **Security Considerations:**
- [ ] Store refresh token securely
- [ ] Implement token rotation
- [ ] Monitor token usage
- [ ] Set up token expiration alerts
- [ ] Enable audit logging for token operations

## 🚀 **EXECUTION COMMANDS**

```bash
# Generate tokens using the script
node scripts/generate-zoho-token.js

# Test token functionality
npm run test:zoho-auth

# Verify API access
npm run verify:zoho-api-access
```

**Once the refresh token is generated, update the .env.production file and proceed with production deployment.**