#!/usr/bin/env node

/**
 * Test Catalyst Authentication and Core Components
 * Comprehensive testing for the Catalyst migration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

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
  log(`\n${colors.bright}${step}${colors.reset}`, 'cyan');
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

function checkEnvironmentVariables() {
  logStep('STEP 1', 'Checking Environment Variables');
  
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_AUTH_PROVIDER',
    'APPSAIL_SESSION_SECRET',
    'FRONTEND_URL',
    'ZOHO_CLIENT_ID',
    'ZOHO_CLIENT_SECRET',
    'ZOHO_REFRESH_TOKEN',
    'ZOHO_CRM_API_URL'
  ];
  
  let missingVars = 0;
  const results = {};
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      logSuccess(`${varName}: ${value.substring(0, 20)}...`);
      results[varName] = 'SET';
    } else {
      logError(`${varName}: NOT SET`);
      results[varName] = 'MISSING';
      missingVars++;
    }
  });
  
  if (missingVars === 0) {
    logSuccess('All required environment variables are configured');
    return true;
  } else {
    logWarning(`${missingVars} environment variables are missing`);
    return false;
  }
}

function checkCatalystCLI() {
  logStep('STEP 2', 'Checking Catalyst CLI');
  
  try {
    const version = execSync('catalyst --version', { encoding: 'utf8' }).trim();
    logSuccess(`Catalyst CLI: ${version}`);
    
    // Check if we can list projects
    try {
      const projects = execSync('catalyst project list', { encoding: 'utf8' }).trim();
      logSuccess('Catalyst CLI can access projects');
      return true;
    } catch (error) {
      logWarning('Catalyst CLI installed but may not be authenticated');
      return false;
    }
  } catch (error) {
    logError('Catalyst CLI not found or not working');
    logInfo('Install with: npm install -g @zoho/catalyst-cli');
    return false;
  }
}

function checkProjectConfiguration() {
  logStep('STEP 3', 'Checking Project Configuration');
  
  let allGood = true;
  
  // Check .catalystrc
  if (fs.existsSync('.catalystrc')) {
    try {
      const config = JSON.parse(fs.readFileSync('.catalystrc', 'utf8'));
      logSuccess(`Project: ${config.project_name || 'Unknown'}`);
      logSuccess(`Project ID: ${config.project_id || 'Unknown'}`);
      logSuccess(`Environment: ${config.environment || 'Unknown'}`);
    } catch (error) {
      logError('.catalystrc exists but is not valid JSON');
      allGood = false;
    }
  } else {
    logError('.catalystrc not found');
    allGood = false;
  }
  
  // Check catalyst.json
  if (fs.existsSync('catalyst.json')) {
    try {
      const config = JSON.parse(fs.readFileSync('catalyst.json', 'utf8'));
      logSuccess(`Functions defined: ${config.functions ? config.functions.length : 0}`);
    } catch (error) {
      logError('catalyst.json exists but is not valid JSON');
      allGood = false;
    }
  } else {
    logError('catalyst.json not found');
    allGood = false;
  }
  
  return allGood;
}

function checkFunctionDeployment() {
  logStep('STEP 4', 'Checking Function Deployment Status');
  
  const functions = [
    'crm-api',
    'quick-actions',
    'contact-manager',
    'analytics-engine',
    'lead-processor',
    'zia-intelligence'
  ];
  
  let deployedCount = 0;
  
  functions.forEach(funcName => {
    try {
      // Try to get function status
      const status = execSync(`catalyst functions status ${funcName}`, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      }).trim();
      
      if (status.includes('ACTIVE') || status.includes('RUNNING')) {
        logSuccess(`${funcName}: DEPLOYED AND ACTIVE`);
        deployedCount++;
      } else {
        logWarning(`${funcName}: ${status}`);
      }
    } catch (error) {
      logError(`${funcName}: NOT DEPLOYED or not accessible`);
    }
  });
  
  if (deployedCount === 0) {
    logWarning('No functions appear to be deployed');
    return false;
  } else {
    logSuccess(`${deployedCount} out of ${functions.length} functions are deployed`);
    return true;
  }
}

function checkDataStore() {
  logStep('STEP 5', 'Checking DataStore Status');
  
  try {
    const datastores = execSync('catalyst datastore list', { encoding: 'utf8' }).trim();
    
    if (datastores.includes('snug-kisses-crm')) {
      logSuccess('DataStore "snug-kisses-crm" exists');
      return true;
    } else {
      logWarning('DataStore "snug-kisses-crm" not found');
      logInfo('Available DataStores:');
      logInfo(datastores);
      return false;
    }
  } catch (error) {
    logError('Could not check DataStore status');
    return false;
  }
}

function checkFileStructure() {
  logStep('STEP 6', 'Checking Required Files');
  
  const requiredFiles = [
    'lib/auth-adapter.ts',
    'src/middleware/edge-auth.ts',
    'components/auth/catalyst-auth-login.tsx',
    'catalyst/datastore-schema.json'
  ];
  
  let allGood = true;
  
  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      logSuccess(`${filePath}: EXISTS`);
    } else {
      logError(`${filePath}: MISSING`);
      allGood = false;
    }
  });
  
  return allGood;
}

function generateReport() {
  logStep('REPORT', 'Generating Test Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    authProvider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'unknown',
    catalystProject: process.env.CATALYST_PROJECT_ID || 'unknown',
    zohoClientId: process.env.ZOHO_CLIENT_ID ? 'SET' : 'MISSING',
    appSailSecret: process.env.APPSAIL_SESSION_SECRET ? 'SET' : 'MISSING'
  };
  
  // Save report to file
  const reportPath = 'test-results/catalyst-test-report.json';
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Test report saved to: ${reportPath}`);
  
  return report;
}

function showNextSteps() {
  logStep('NEXT STEPS', 'What to do next');
  
  log('\n🎯 Based on the test results:', 'bright');
  
  log('\n1. If Environment Variables are missing:', 'cyan');
  log('   - Copy ops/env/env-vars-template.txt to .env.local', 'yellow');
  log('   - Verify all required variables are set', 'yellow');
  
  log('\n2. If Functions are not deployed:', 'cyan');
  log('   - Run: node scripts/catalyst-deploy.js', 'yellow');
  log('   - Check Catalyst console for deployment status', 'yellow');
  
  log('\n3. If DataStore is missing:', 'cyan');
  log('   - Create DataStore: catalyst datastore create --name "snug-kisses-crm"', 'yellow');
  log('   - Or run the deployment script which will create it', 'yellow');
  
  log('\n4. Manual Verification:', 'cyan');
  log('   - Check Catalyst console: https://catalyst.zoho.com', 'yellow');
  log('   - Verify project: Project-Rainfall', 'yellow');
  log('   - Check function deployment status', 'yellow');
}

function main() {
  log('🧪 Catalyst Migration Test Suite', 'bright');
  log('Comprehensive testing for deployment validation', 'cyan');
  
  try {
    // Run all checks
    const envOk = checkEnvironmentVariables();
    const cliOk = checkCatalystCLI();
    const configOk = checkProjectConfiguration();
    const functionsOk = checkFunctionDeployment();
    const datastoreOk = checkDataStore();
    const filesOk = checkFileStructure();
    
    // Generate report
    const report = generateReport();
    
    // Show summary
    logStep('SUMMARY', 'Test Results Summary');
    
    if (envOk) logSuccess('Environment Variables: CONFIGURED');
    else logError('Environment Variables: ISSUES FOUND');
    
    if (cliOk) logSuccess('Catalyst CLI: WORKING');
    else logError('Catalyst CLI: ISSUES FOUND');
    
    if (configOk) logSuccess('Project Configuration: VALID');
    else logError('Project Configuration: ISSUES FOUND');
    
    if (functionsOk) logSuccess('Function Deployment: ACTIVE');
    else logWarning('Function Deployment: NEEDS ATTENTION');
    
    if (datastoreOk) logSuccess('DataStore: EXISTS');
    else logWarning('DataStore: NEEDS CREATION');
    
    if (filesOk) logSuccess('File Structure: COMPLETE');
    else logError('File Structure: ISSUES FOUND');
    
    // Show next steps
    showNextSteps();
    
    // Final recommendation
    if (envOk && cliOk && configOk && filesOk) {
      if (functionsOk && datastoreOk) {
        log('\n🎉 DEPLOYMENT SUCCESSFUL!', 'bright');
        log('All components are deployed and working', 'green');
      } else {
        log('\n⚠️  PARTIAL DEPLOYMENT', 'yellow');
        log('Core infrastructure ready, but some components need deployment', 'yellow');
        log('Run: node scripts/catalyst-deploy.js', 'green');
      }
    } else {
      log('\n🚨 DEPLOYMENT BLOCKED', 'red');
      log('Fix the issues above before proceeding', 'red');
    }
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = { main };

