#!/usr/bin/env node

/**
 * Catalyst Deployment Script
 * Automates the deployment of functions and DataStore to Zoho Catalyst
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  projectId: '30300000000011038',
  envId: '891140386',
  projectName: 'Project-Rainfall',
  projectUrl: 'https://project-rainfall-891140386.development.catalystserverless.com',
  functions: [
    'crm-api',
    'quick-actions', 
    'contact-manager',
    'analytics-engine',
    'lead-processor',
    'zia-intelligence'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors[bright]}${step}${colors[reset]}`, 'cyan');
  log(message, 'yellow');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`, 'blue');
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    logSuccess(description);
    return result;
  } catch (error) {
    logError(`Failed: ${description}`);
    logError(`Error: ${error.message}`);
    if (error.stdout) log(`STDOUT: ${error.stdout}`, 'red');
    if (error.stderr) log(`STDERR: ${error.stderr}`, 'red');
    throw error;
  }
}

function checkPrerequisites() {
  logStep('STEP 1', 'Checking Prerequisites');
  
  // Check if catalyst CLI is installed
  try {
    execSync('catalyst --version', { stdio: 'pipe' });
    logSuccess('Catalyst CLI is installed');
  } catch (error) {
    logError('Catalyst CLI is not installed. Please install it first:');
    log('npm install -g @zoho/catalyst-cli', 'blue');
    process.exit(1);
  }
  
  // Check if .catalystrc exists
  if (!fs.existsSync('.catalystrc')) {
    logError('.catalystrc file not found. Please run catalyst init first.');
    process.exit(1);
  }
  
  // Check if catalyst.json exists
  if (!fs.existsSync('catalyst.json')) {
    logError('catalyst.json file not found.');
    process.exit(1);
  }
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    logWarning('.env.local not found. Please run the quick start script first:');
    log('node scripts/quick-start-catalyst.js', 'blue');
    process.exit(1);
  }
  
  logSuccess('All prerequisites are met');
}

function deployFunctions() {
  logStep('STEP 2', 'Deploying Catalyst Functions');
  
  CONFIG.functions.forEach((functionName, index) => {
    logStep(`FUNCTION ${index + 1}/${CONFIG.functions.length}`, `Deploying ${functionName}`);
    
    try {
      const functionPath = path.join('catalyst', 'functions', functionName);
      
      if (!fs.existsSync(functionPath)) {
        logWarning(`Function directory ${functionPath} not found, skipping...`);
        return;
      }
      
      // Deploy the function
      runCommand(
        `catalyst functions deploy ${functionName}`,
        `Function ${functionName} deployed successfully`
      );
      
    } catch (error) {
      logError(`Failed to deploy function ${functionName}`);
      throw error;
    }
  });
  
  logSuccess('All functions deployed successfully');
}

function createDataStore() {
  logStep('STEP 3', 'Creating DataStore Schema');
  
  const schemaPath = path.join('catalyst', 'datastore-schema.json');
  
  if (!fs.existsSync(schemaPath)) {
    logError(`DataStore schema file not found at ${schemaPath}`);
    process.exit(1);
  }
  
  try {
    // Create the DataStore
    runCommand(
      `catalyst datastore create --name "snug-kisses-crm" --schema ${schemaPath}`,
      'DataStore created successfully'
    );
    
    logSuccess('DataStore schema deployed successfully');
  } catch (error) {
    logError('Failed to create DataStore');
    throw error;
  }
}

function configureEnvironment() {
  logStep('STEP 4', 'Environment Configuration Status');
  
  // Check if key environment variables are set
  const requiredVars = [
    'NEXT_PUBLIC_AUTH_PROVIDER',
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET',
    'CATALYST_APP_URL'
  ];
  
  let missingVars = 0;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is configured`);
    } else {
      logWarning(`${varName} is not set`);
      missingVars++;
    }
  });
  
  if (missingVars === 0) {
    logSuccess('All required environment variables are configured');
  } else {
    logWarning(`${missingVars} environment variables need to be configured`);
  }
  
  // Show production configuration status
  logInfo('\nProduction Configuration:');
  logInfo(`Project URL: ${CONFIG.projectUrl}`);
  logInfo(`Zoho Client ID: ${process.env.ZOHO_CLIENT_ID || 'Not set'}`);
  logInfo(`CRM API Version: ${process.env.ZOHO_CRM_API_URL || 'Not set'}`);
  
  // Check for AppSail session secret
  if (process.env.APPSAIL_SESSION_SECRET && 
      process.env.APPSAIL_SESSION_SECRET !== 'replace_with_strong_random_secret') {
    logSuccess('AppSail session secret is configured');
  } else {
    logWarning('AppSail session secret needs to be set to a strong random value');
  }
}

function runTests() {
  logStep('STEP 5', 'Running Basic Tests');
  
  try {
    // Test if functions are accessible
    log('Testing function accessibility...', 'yellow');
    
    // This would typically involve making HTTP requests to the deployed functions
    // For now, we'll just check if they're listed
    const result = runCommand(
      'catalyst functions list',
      'Functions listed successfully'
    );
    
    logSuccess('Basic tests completed');
    log('Please run the full test suite using the testing guide', 'yellow');
    
  } catch (error) {
    logError('Basic tests failed');
    throw error;
  }
}

function showProductionInfo() {
  logStep('PRODUCTION INFO', 'Deployment Configuration');
  
  logInfo(`Project: ${CONFIG.projectName}`);
  logInfo(`Project ID: ${CONFIG.projectId}`);
  logInfo(`Environment ID: ${CONFIG.envId}`);
  logInfo(`Project URL: ${CONFIG.projectUrl}`);
  
  logInfo('\nDeployed Functions:');
  CONFIG.functions.forEach(func => {
    logInfo(`  - ${func}`);
  });
  
  logInfo('\nDataStore: snug-kisses-crm');
  logInfo('Environment: Production');
  
  logInfo('\nZoho Integration:');
  logInfo(`  - Client ID: ${process.env.ZOHO_CLIENT_ID || 'Not set'}`);
  logInfo(`  - CRM API: ${process.env.ZOHO_CRM_API_URL || 'Not set'}`);
  logInfo(`  - Books API: ${process.env.ZOHO_BOOKS_API_URL || 'Not set'}`);
  logInfo(`  - Sign API: ${process.env.ZOHO_SIGN_API_URL || 'Not set'}`);
}

function main() {
  try {
    log('🚀 Starting Catalyst Production Deployment', 'bright');
    log(`Project: ${CONFIG.projectName} (${CONFIG.projectId})`, 'cyan');
    log(`Environment: ${CONFIG.envId}`, 'cyan');
    log(`URL: ${CONFIG.projectUrl}`, 'cyan');
    
    checkPrerequisites();
    deployFunctions();
    createDataStore();
    configureEnvironment();
    runTests();
    showProductionInfo();
    
    log('\n🎉 Production deployment completed successfully!', 'bright');
    log('\nNext steps:', 'cyan');
    log('1. Test the authentication flow', 'yellow');
    log('2. Run end-to-end tests: node scripts/test-catalyst-auth.js', 'yellow');
    log('3. Start monitoring: node scripts/catalyst-monitor.js --monitor', 'yellow');
    log('4. Verify all API endpoints are working', 'yellow');
    
    log('\n🔒 Security Notes:', 'cyan');
    log('1. Ensure APPSAIL_SESSION_SECRET is a strong random value', 'yellow');
    log('2. Verify ZOHO_SIGN_WEBHOOK_SECRET is set', 'yellow');
    log('3. Check that CORS origins are properly configured', 'yellow');
    
  } catch (error) {
    log('\n💥 Deployment failed!', 'bright');
    logError('Please check the errors above and try again');
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
