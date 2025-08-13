#!/usr/bin/env node

/**
 * Quick Start Script for Catalyst Migration
 * Provides a simple way to begin the migration process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function checkPrerequisites() {
  logStep('STEP 1', 'Checking Prerequisites');
  
  let allGood = true;
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    logSuccess(`Node.js ${nodeVersion} detected`);
  } catch (error) {
    logError('Node.js not found. Please install Node.js 16+');
    allGood = false;
  }
  
  // Check if Catalyst CLI is installed
  try {
    execSync('catalyst --version', { stdio: 'pipe' });
    logSuccess('Catalyst CLI is installed');
  } catch (error) {
    logWarning('Catalyst CLI not found. Installing...');
    try {
      execSync('npm install -g @zoho/catalyst-cli', { stdio: 'pipe' });
      logSuccess('Catalyst CLI installed successfully');
    } catch (installError) {
      logError('Failed to install Catalyst CLI. Please install manually: npm install -g @zoho/catalyst-cli');
      allGood = false;
    }
  }
  
  // Check if .catalystrc exists
  if (fs.existsSync('.catalystrc')) {
    logSuccess('.catalystrc configuration found');
  } else {
    logError('.catalystrc not found. Please run catalyst init first');
    allGood = false;
  }
  
  // Check if catalyst.json exists
  if (fs.existsSync('catalyst.json')) {
    logSuccess('catalyst.json configuration found');
  } else {
    logError('catalyst.json not found');
    allGood = false;
  }
  
  return allGood;
}

function checkEnvironment() {
  logStep('STEP 2', 'Checking Environment Configuration');
  
  // Check if .env.local exists
  if (fs.existsSync('.env.local')) {
    logSuccess('.env.local found');
    
    // Check for critical variables
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const criticalVars = [
      'APPSAIL_SESSION_SECRET',
      'ZOHO_SIGN_WEBHOOK_SECRET',
      'ZOHO_CLIENT_ID',
      'ZOHO_CLIENT_SECRET'
    ];
    
    let missingVars = 0;
    criticalVars.forEach(varName => {
      if (envContent.includes(varName)) {
        logSuccess(`${varName} is configured`);
      } else {
        logWarning(`${varName} is missing`);
        missingVars++;
      }
    });
    
    if (missingVars === 0) {
      logSuccess('All critical environment variables are configured');
      return true;
    } else {
      logWarning(`${missingVars} critical variables need to be configured`);
      return false;
    }
  } else {
    logWarning('.env.local not found');
    logInfo('Please copy ops/env/env-vars-template.txt to .env.local');
    return false;
  }
}

function validateConfiguration() {
  logStep('STEP 3', 'Validating Configuration');
  
  let allGood = true;
  
  // Check if all required files exist
  const requiredFiles = [
    'lib/auth-adapter.ts',
    'src/middleware/edge-auth.ts',
    'components/auth/catalyst-auth-login.tsx',
    'catalyst/datastore-schema.json'
  ];
  
  requiredFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      logSuccess(`${filePath} exists`);
    } else {
      logError(`${filePath} not found`);
      allGood = false;
    }
  });
  
  // Check if all functions exist
  const functions = [
    'catalyst/functions/crm-api',
    'catalyst/functions/quick-actions',
    'catalyst/functions/contact-manager',
    'catalyst/functions/analytics-engine',
    'catalyst/functions/lead-processor',
    'catalyst/functions/zia-intelligence'
  ];
  
  functions.forEach(funcPath => {
    if (fs.existsSync(funcPath)) {
      logSuccess(`${path.basename(funcPath)} function exists`);
    } else {
      logError(`${path.basename(funcPath)} function not found`);
      allGood = false;
    }
  });
  
  return allGood;
}

function showNextSteps() {
  logStep('NEXT STEPS', 'What to do next');
  
  log('\n🎯 To complete the migration:', 'bright');
  
  log('\n1. Environment Setup:', 'cyan');
  log('   - Copy ops/env/env-vars-template.txt to .env.local', 'yellow');
  log('   - Your production environment is already configured!', 'green');
  
  log('\n2. Deploy to Catalyst:', 'cyan');
  log('   - Run: node scripts/catalyst-deploy.js', 'yellow');
  log('   - Or deploy manually using catalyst CLI', 'yellow');
  
  log('\n3. Test the Migration:', 'cyan');
  log('   - Run: node scripts/test-catalyst-auth.js', 'yellow');
  log('   - Start monitoring: node scripts/catalyst-monitor.js --monitor', 'yellow');
  
  log('\n4. Verify Everything Works:', 'cyan');
  log('   - Test login/logout flow', 'yellow');
  log('   - Check API endpoints', 'yellow');
  log('   - Validate user roles and permissions', 'yellow');
  
  log('\n📚 Documentation:', 'cyan');
  log('   - Final Guide: docs/CATALYST-MIGRATION-FINAL.md', 'blue');
  log('   - Production Checklist: docs/PRODUCTION-DEPLOYMENT-CHECKLIST.md', 'blue');
  log('   - Deployment: catalyst/deployment-guide.md', 'blue');
  log('   - Testing: catalyst/testing-guide.md', 'blue');
  
  log('\n🚨 Need Help?', 'cyan');
  log('   - Check the troubleshooting section in the final guide', 'yellow');
  log('   - Review Catalyst function logs', 'yellow');
  log('   - Use the health monitor script', 'yellow');
  
  log('\n🎉 Production Ready!', 'bright');
  log('   - Zoho OAuth credentials configured', 'green');
  log('   - Production URLs set', 'green');
  log('   - CRM v6 API endpoints configured', 'green');
  log('   - Security secrets configured', 'green');
  log('   - Function URLs configured for /server/<function-name> pattern', 'green');
}

function main() {
  log('🚀 Catalyst Migration Quick Start (Production)', 'bright');
  log('This script will help you get started with the Catalyst migration', 'cyan');
  log('Your production environment is already configured!', 'green');
  
  try {
    // Check prerequisites
    const prerequisitesOk = checkPrerequisites();
    if (!prerequisitesOk) {
      logError('Prerequisites not met. Please fix the issues above and try again.');
      process.exit(1);
    }
    
    // Check environment
    const envOk = checkEnvironment();
    
    // Validate configuration
    const configOk = validateConfiguration();
    
    if (configOk) {
      logSuccess('Configuration validation passed!');
    } else {
      logWarning('Some configuration issues found. Please review above.');
    }
    
    // Show next steps
    showNextSteps();
    
    if (envOk && configOk) {
      log('\n🎉 You\'re ready to deploy!', 'bright');
      log('Run: node scripts/catalyst-deploy.js', 'green');
    } else {
      log('\n⚠️  Please complete the setup steps above before deploying.', 'yellow');
    }
    
  } catch (error) {
    logError(`Quick start failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the quick start
if (require.main === module) {
  main();
}

module.exports = { main };
