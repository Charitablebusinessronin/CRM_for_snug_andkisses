#!/usr/bin/env node

/**
 * Webhook Secret Generator for Snug & Kisses Healthcare CRM
 * Generates cryptographically secure webhook secrets for Zoho integrations
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Webhook Secret Generator for Healthcare CRM');
console.log('='.repeat(50));

/**
 * Generate a cryptographically secure random secret
 * @param {number} length - Length in bytes (default: 64 bytes = 128 hex characters)
 * @returns {string} Hex-encoded random secret
 */
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate all required webhook secrets
 */
function generateWebhookSecrets() {
  const secrets = {
    ZOHO_CRM_WEBHOOK_SECRET: generateSecureSecret(),
    ZOHO_CAMPAIGNS_WEBHOOK_SECRET: generateSecureSecret(),
    ZOHO_BOOKINGS_WEBHOOK_SECRET: generateSecureSecret(),
    ZOHO_FLOW_WEBHOOK_SECRET: generateSecureSecret()
  };

  return secrets;
}

/**
 * Display secrets in a secure format
 */
function displaySecrets(secrets) {
  console.log('✅ Generated Secure Webhook Secrets:');
  console.log('-'.repeat(50));
  
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('-'.repeat(50));
  console.log('📋 Copy these values to your .env.production file');
  console.log('⚠️  Each secret is 128 characters of cryptographically secure randomness');
}

/**
 * Save secrets to a temporary file
 */
function saveSecretsToFile(secrets) {
  const envContent = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const tempFile = path.join(__dirname, '..', '.env.webhook-secrets');
  
  try {
    fs.writeFileSync(tempFile, `# Generated Webhook Secrets - ${new Date().toISOString()}\n${envContent}\n`);
    console.log(`💾 Secrets saved to: ${tempFile}`);
    console.log('🗑️  Delete this file after copying secrets to production environment');
  } catch (error) {
    console.error('❌ Failed to save secrets to file:', error.message);
  }
}

/**
 * Validate existing secrets in environment file
 */
function validateExistingSecrets() {
  const envFile = path.join(__dirname, '..', '.env.production');
  
  if (!fs.existsSync(envFile)) {
    console.log('⚠️  .env.production file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasPlaceholders = envContent.includes('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  
  if (hasPlaceholders) {
    console.log('🚨 SECURITY ISSUE: Found placeholder webhook secrets in .env.production');
    console.log('   Replace "xxxxxxx..." with real generated secrets before deployment');
    return false;
  }
  
  console.log('✅ No placeholder secrets found in .env.production');
  return true;
}

/**
 * Main execution
 */
function main() {
  try {
    // Check existing environment
    console.log('🔍 Checking existing environment configuration...');
    const isValid = validateExistingSecrets();
    
    if (!isValid) {
      console.log('\n🔧 Generating new secure webhook secrets...');
    } else {
      console.log('\n🔄 Generating fresh webhook secrets...');
    }
    
    // Generate new secrets
    const secrets = generateWebhookSecrets();
    
    // Display results
    console.log('');
    displaySecrets(secrets);
    
    // Save to temporary file
    console.log('');
    saveSecretsToFile(secrets);
    
    // Security reminders
    console.log('\n🛡️  SECURITY REMINDERS:');
    console.log('   • Use different secrets for dev/staging/production');
    console.log('   • Never commit secrets to version control');
    console.log('   • Rotate secrets periodically');
    console.log('   • Monitor webhook endpoints for security violations');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Copy the generated secrets to your .env.production file');
    console.log('   2. Configure these secrets in your Zoho webhook settings');
    console.log('   3. Test webhook signature verification');
    console.log('   4. Delete the temporary .env.webhook-secrets file');
    
  } catch (error) {
    console.error('❌ Error generating webhook secrets:', error.message);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureSecret,
  generateWebhookSecrets,
  validateExistingSecrets
};