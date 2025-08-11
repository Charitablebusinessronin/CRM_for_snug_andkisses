/**
 * Zoho Refresh Token Generator
 * Run this script to generate a refresh token for Zoho API access
 */

const readline = require('readline');
const https = require('https');
const querystring = require('querystring');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ZOHO_CONFIG = {
  clientId: '1000_YVAEMC4OSNZTE3CXVW4HBAJJVKJRT',
  clientSecret: '9a60ae55e934cc6ae31b3cb6ec594b4f83b293ce41',
  redirectUri: 'https://snugandkisses.com/api/auth/callback/zoho'
};

console.log('🔐 Zoho Refresh Token Generator');
console.log('================================\n');

console.log('Step 1: Visit this URL to authorize the application:');
console.log(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL,ZohoBooks.fullaccess.all,ZohoCampaigns.campaign.ALL&client_id=${ZOHO_CONFIG.clientId}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(ZOHO_CONFIG.redirectUri)}\n`);

rl.question('Step 2: Enter the authorization code from the callback URL: ', (authCode) => {
  if (!authCode) {
    console.error('❌ Authorization code is required');
    rl.close();
    return;
  }

  console.log('\n⏳ Generating refresh token...');

  const postData = querystring.stringify({
    grant_type: 'authorization_code',
    client_id: ZOHO_CONFIG.clientId,
    client_secret: ZOHO_CONFIG.clientSecret,
    redirect_uri: ZOHO_CONFIG.redirectUri,
    code: authCode
  });

  const options = {
    hostname: 'accounts.zoho.com',
    path: '/oauth/v2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.access_token && response.refresh_token) {
          console.log('\n✅ Success! Tokens generated:');
          console.log('================================');
          console.log(`Access Token: ${response.access_token}`);
          console.log(`Refresh Token: ${response.refresh_token}`);
          console.log(`Expires In: ${response.expires_in} seconds`);
          console.log('\n📝 Add this to your .env.local file:');
          console.log(`ZOHO_REFRESH_TOKEN=${response.refresh_token}`);
          console.log('\n🔒 Keep these tokens secure and never commit them to version control!');
        } else {
          console.error('❌ Error generating tokens:', response);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.error('Raw response:', data);
      }

      rl.close();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
    rl.close();
  });

  req.write(postData);
  req.end();
});
