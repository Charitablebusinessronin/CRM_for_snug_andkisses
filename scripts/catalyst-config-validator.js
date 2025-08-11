#!/usr/bin/env node

/**
 * Catalyst Configuration Validator
 * Validates all Catalyst configurations and identifies potential issues
 * 
 * Usage:
 *   node scripts/catalyst-config-validator.js
 *   npm run validate-config
 */

const fs = require('fs');
const path = require('path');

class CatalystConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.resolve(__dirname, '..');
  }

  log(level, message, details = {}) {
    const entry = { level, message, details, timestamp: new Date().toISOString() };
    if (level === 'ERROR') {
      this.errors.push(entry);
      console.error(`❌ ${message}`, details);
    } else if (level === 'WARN') {
      this.warnings.push(entry);
      console.warn(`⚠️  ${message}`, details);
    } else {
      console.log(`✅ ${message}`, details);
    }
  }

  validateFileExists(filePath, required = true) {
    const fullPath = path.resolve(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      if (required) {
        this.log('ERROR', `Required file missing: ${filePath}`);
        return false;
      } else {
        this.log('WARN', `Optional file missing: ${filePath}`);
        return false;
      }
    }
    return true;
  }

  validateJson(filePath) {
    if (!this.validateFileExists(filePath)) return null;
    
    try {
      const fullPath = path.resolve(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(content);
      this.log('INFO', `Valid JSON: ${filePath}`);
      return json;
    } catch (error) {
      this.log('ERROR', `Invalid JSON in ${filePath}`, { error: error.message });
      return null;
    }
  }

  validateCatalystJson() {
    const config = this.validateJson('catalyst.json');
    if (!config) return;

    // Validate required fields
    if (!config.project_id) {
      this.log('ERROR', 'catalyst.json missing project_id');
    }
    if (!config.env_id) {
      this.log('ERROR', 'catalyst.json missing env_id');
    }
    
    // Check if functions array exists
    if (config.functions && Array.isArray(config.functions)) {
      this.log('INFO', `Found ${config.functions.length} functions in catalyst.json`);
      
      config.functions.forEach((func, index) => {
        this.validateFunctionConfig(func, index);
      });
    } else if (config.appsail) {
      this.log('WARN', 'Using deprecated appsail configuration instead of functions');
    } else {
      this.log('ERROR', 'No functions or appsail configuration found');
    }

    return config;
  }

  validateFunctionConfig(func, index) {
    const funcName = func.function_name || `function-${index}`;
    
    if (!func.function_name) {
      this.log('ERROR', `Function ${index} missing function_name`);
    }
    if (!func.source) {
      this.log('ERROR', `Function ${funcName} missing source directory`);
    }
    if (!func.entry_file) {
      this.log('ERROR', `Function ${funcName} missing entry_file`);
    }
    
    // Validate source directory exists
    if (func.source) {
      this.validateFileExists(func.source, true);
      
      // Validate entry file exists within source
      if (func.entry_file) {
        const entryPath = path.join(func.source, func.entry_file);
        this.validateFileExists(entryPath, true);
      }
      
      // Check for catalyst-config.json in function directory
      const configPath = path.join(func.source, 'catalyst-config.json');
      if (this.validateFileExists(configPath, false)) {
        this.validateFunctionCatalystConfig(configPath, funcName);
      }
    }

    // Validate environment variables
    if (func.environment_variables) {
      const envCount = Object.keys(func.environment_variables).length;
      this.log('INFO', `Function ${funcName} has ${envCount} environment variables`);
      
      // Check for required HIPAA variables
      if (func.environment_variables.HIPAA_COMPLIANCE_MODE) {
        this.log('INFO', `Function ${funcName} has HIPAA compliance enabled`);
      } else {
        this.log('WARN', `Function ${funcName} missing HIPAA_COMPLIANCE_MODE`);
      }
    }
  }

  validateFunctionCatalystConfig(configPath, funcName) {
    const config = this.validateJson(configPath);
    if (!config) return;

    if (config.deployment) {
      if (!config.deployment.name) {
        this.log('ERROR', `${funcName} catalyst-config.json missing deployment.name`);
      }
      if (!config.deployment.stack) {
        this.log('ERROR', `${funcName} catalyst-config.json missing deployment.stack`);
      }
      if (config.deployment.stack !== 'node20') {
        this.log('WARN', `${funcName} using stack ${config.deployment.stack}, recommended: node20`);
      }
    }

    if (config.execution && !config.execution.main) {
      this.log('ERROR', `${funcName} catalyst-config.json missing execution.main`);
    }
  }

  validateCatalystRC() {
    const config = this.validateJson('.catalystrc');
    if (!config) return;

    if (!config.projects || !Array.isArray(config.projects) || config.projects.length === 0) {
      this.log('ERROR', '.catalystrc missing or empty projects array');
      return;
    }

    const project = config.projects[0];
    if (!project.id) {
      this.log('ERROR', '.catalystrc project missing id');
    }
    if (!project.name) {
      this.log('ERROR', '.catalystrc project missing name');
    }

    this.log('INFO', `Project configured: ${project.name} (${project.id})`);
    return config;
  }

  validateEnvironmentVariables() {
    const requiredEnvVars = [
      'ZOHO_REFRESH_TOKEN',
      'ZOHO_CLIENT_ID',
      'ZOHO_CLIENT_SECRET'
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        this.log('ERROR', `Missing environment variable: ${envVar}`);
      } else {
        this.log('INFO', `Environment variable set: ${envVar}`);
      }
    });
  }

  validateProjectConsistency() {
    const catalystConfig = this.validateJson('catalyst.json');
    const catalystRC = this.validateJson('.catalystrc');

    if (catalystConfig && catalystRC && catalystRC.projects && catalystRC.projects[0]) {
      const project = catalystRC.projects[0];
      
      if (catalystConfig.project_id !== project.id) {
        this.log('ERROR', 'Project ID mismatch between catalyst.json and .catalystrc', {
          'catalyst.json': catalystConfig.project_id,
          '.catalystrc': project.id
        });
      } else {
        this.log('INFO', 'Project IDs match between configuration files');
      }

      if (catalystConfig.project_name !== project.name) {
        this.log('WARN', 'Project name mismatch between catalyst.json and .catalystrc', {
          'catalyst.json': catalystConfig.project_name,
          '.catalystrc': project.name
        });
      }
    }
  }

  validateBusinessFunctions() {
    const businessFunctions = [
      'functions/index.js',
      'functions/auth/auth.js',
      'functions/business-suite/crm-functions.js',
      'functions/business-suite/hr-functions.js',
      'functions/business-suite/finance-functions.js',
      'functions/business-suite/marketing-functions.js',
      'functions/business-suite/support-functions.js'
    ];

    businessFunctions.forEach(funcPath => {
      if (this.validateFileExists(funcPath, false)) {
        this.log('INFO', `Business function exists: ${funcPath}`);
      } else {
        this.log('WARN', `Business function missing: ${funcPath}`);
      }
    });
  }

  async validate() {
    console.log('🔍 Starting Catalyst Configuration Validation...\n');

    // Core configuration files
    this.validateCatalystJson();
    this.validateCatalystRC();
    
    // Environment and consistency checks
    this.validateEnvironmentVariables();
    this.validateProjectConsistency();
    
    // Business function validation
    this.validateBusinessFunctions();
    
    // Additional files
    this.validateFileExists('catalyst-api-deploy.js', false);

    console.log('\n📊 Validation Results:');
    console.log(`✅ Total checks passed: ${this.errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 Critical Errors (must fix):');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (should review):');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }

    if (this.errors.length === 0) {
      console.log('\n🎉 All critical validations passed! Your Catalyst configuration looks good.');
      console.log('\n📋 Next steps:');
      console.log('1. Set missing environment variables if any');
      console.log('2. Deploy functions: catalyst deploy');
      console.log('3. Test endpoints after deployment');
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CatalystConfigValidator();
  validator.validate().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = CatalystConfigValidator;