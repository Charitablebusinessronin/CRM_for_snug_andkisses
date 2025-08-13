
#!/usr/bin/env node

/**
 * Catalyst Deployment Configuration Validator
 * Validates all configuration files before deployment
 */

const fs = require('fs');
const path = require('path');

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  validateFile(filePath, description) {
    if (!fs.existsSync(filePath)) {
      this.addError(`Missing required file: ${filePath} (${description})`);
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (filePath.endsWith('.json')) {
        return JSON.parse(content);
      }
      return content;
    } catch (error) {
      this.addError(`Invalid JSON in ${filePath}: ${error.message}`);
      return null;
    }
  }

  validateCatalystConfig() {
    this.log('Validating catalyst.json configuration...', 'info');
    
    const config = this.validateFile('catalyst.json', 'Catalyst project configuration');
    if (!config) return;

    // Validate project structure
    if (!config.project) {
      this.addError('Missing project configuration in catalyst.json');
    } else {
      if (!config.project.name) this.addError('Missing project name');
      if (!config.project.version) this.addWarning('Missing project version');
    }

    // Validate services
    if (!config.services) {
      this.addError('Missing services configuration');
    } else {
      // Validate AppSail configuration
      if (config.services.appsail) {
        const appsail = config.services.appsail;
        if (!appsail.service_name) this.addError('Missing AppSail service name');
        if (!appsail.port || appsail.port !== 5000) this.addWarning('AppSail should use port 5000');
        if (!appsail.source) this.addError('Missing AppSail source configuration');
      }

      // Validate DataStore tables
      if (config.services.datastore && config.services.datastore.tables) {
        const tables = config.services.datastore.tables;
        const requiredTables = ['customers', 'users', 'audit_logs'];
        
        for (const table of requiredTables) {
          if (!tables.find(t => t.name === table)) {
            this.addError(`Missing required table: ${table}`);
          }
        }
      }

      // Validate Functions
      if (config.services.functions) {
        for (const func of config.services.functions) {
          if (!func.name) this.addError('Function missing name');
          if (!func.source) this.addError(`Function ${func.name} missing source path`);
          if (!func.entry_point) this.addError(`Function ${func.name} missing entry point`);
          
          // Check if function source exists
          if (func.source && !fs.existsSync(func.source)) {
            this.addError(`Function source path does not exist: ${func.source}`);
          }
        }
      }
    }

    this.log('Catalyst configuration validation completed', 'success');
  }

  validateDatabaseSchema() {
    this.log('Validating database schema...', 'info');
    
    const schema = this.validateFile('database-schema.json', 'Database schema definition');
    if (!schema || !schema.tables) return;

    const requiredTables = [
      'customers', 'deals', 'support_tickets', 'invoices', 
      'employees', 'users', 'audit_logs'
    ];

    for (const tableName of requiredTables) {
      const table = schema.tables.find(t => t.table_name === tableName);
      if (!table) {
        this.addError(`Missing required table in schema: ${tableName}`);
        continue;
      }

      // Validate table structure
      if (!table.columns || !Array.isArray(table.columns)) {
        this.addError(`Table ${tableName} missing columns definition`);
        continue;
      }

      // Check for required columns based on table type
      if (tableName === 'customers') {
        const requiredColumns = ['name', 'email'];
        for (const col of requiredColumns) {
          if (!table.columns.find(c => c.column_name === col)) {
            this.addError(`Table ${tableName} missing required column: ${col}`);
          }
        }
      }

      if (tableName === 'users') {
        const requiredColumns = ['email', 'password', 'role'];
        for (const col of requiredColumns) {
          if (!table.columns.find(c => c.column_name === col)) {
            this.addError(`Table ${tableName} missing required column: ${col}`);
          }
        }
      }
    }

    this.log('Database schema validation completed', 'success');
  }

  validateAppConfig() {
    this.log('Validating app configuration...', 'info');
    
    const appConfig = this.validateFile(
      'catalyst-deployment-package/app-config.json', 
      'AppSail deployment configuration'
    );
    if (!appConfig) return;

    // Validate main entry point
    if (!appConfig.main) {
      this.addError('Missing main entry point in app-config.json');
    } else if (!appConfig.main.includes('dist/server.js')) {
      this.addWarning('Main entry point should reference built server (dist/server.js)');
    }

    // Validate scripts
    if (!appConfig.scripts) {
      this.addError('Missing scripts in app-config.json');
    } else {
      if (!appConfig.scripts.start) this.addError('Missing start script');
      if (!appConfig.scripts.build) this.addWarning('Missing build script');
    }

    // Validate dependencies
    const requiredDeps = ['express', 'cors', 'helmet'];
    if (appConfig.dependencies) {
      for (const dep of requiredDeps) {
        if (!appConfig.dependencies[dep]) {
          this.addWarning(`Missing recommended dependency: ${dep}`);
        }
      }
    }

    this.log('App configuration validation completed', 'success');
  }

  validateEnvironmentConfig() {
    this.log('Validating environment configuration...', 'info');
    
    // Check for .env.local
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      
      const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ];

      for (const envVar of requiredEnvVars) {
        if (!envContent.includes(envVar)) {
          this.addWarning(`Missing environment variable: ${envVar}`);
        }
      }
    } else {
      this.addWarning('No .env.local file found - ensure environment variables are set in Catalyst');
    }

    this.log('Environment configuration validation completed', 'success');
  }

  validateFunctionFiles() {
    this.log('Validating function files...', 'info');
    
    const functionPaths = [
      'functions/index.js',
      'functions/auth/auth.js',
      'functions/business-suite/crm-functions.js'
    ];

    for (const funcPath of functionPaths) {
      if (fs.existsSync(funcPath)) {
        const content = fs.readFileSync(funcPath, 'utf8');
        
        // Basic syntax validation for JavaScript files
        if (funcPath.endsWith('.js')) {
          if (!content.includes('module.exports') && !content.includes('export')) {
            this.addWarning(`Function ${funcPath} may be missing proper exports`);
          }
        }
        
        this.log(`Function file validated: ${funcPath}`, 'success');
      } else {
        this.addError(`Function file not found: ${funcPath}`);
      }
    }

    this.log('Function files validation completed', 'success');
  }

  validateBuildOutput() {
    this.log('Validating build output...', 'info');
    
    // Check if TypeScript has been compiled
    if (fs.existsSync('src/server.ts')) {
      if (!fs.existsSync('dist/server.js')) {
        this.addError('TypeScript not compiled - run npm run build first');
      } else {
        this.log('TypeScript compilation verified', 'success');
      }
    }

    // Check Next.js build
    if (fs.existsSync('next.config.mjs')) {
      if (!fs.existsSync('.next')) {
        this.addWarning('Next.js not built - run npm run build to optimize');
      }
    }

    this.log('Build output validation completed', 'success');
  }

  generateValidationReport() {
    console.log('\n📋 DEPLOYMENT VALIDATION REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All validations passed! Ready for deployment.');
    } else {
      if (this.errors.length > 0) {
        console.log('\n❌ CRITICAL ERRORS (Must fix before deployment):');
        this.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS (Recommended to fix):');
        this.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
    }

    console.log('\n🚀 Deployment Readiness:');
    if (this.errors.length === 0) {
      console.log('   ✅ Ready for deployment');
    } else {
      console.log('   ❌ Fix errors before deploying');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return this.errors.length === 0;
  }

  async validate() {
    console.log('🔍 Starting deployment configuration validation...\n');

    this.validateCatalystConfig();
    this.validateDatabaseSchema();
    this.validateAppConfig();
    this.validateEnvironmentConfig();
    this.validateFunctionFiles();
    this.validateBuildOutput();

    const isValid = this.generateValidationReport();
    
    if (isValid) {
      console.log('\n🎉 Validation completed successfully! Proceed with deployment.');
      process.exit(0);
    } else {
      console.log('\n💥 Validation failed! Fix errors before deployment.');
      process.exit(1);
    }
  }
}

// Execute validation
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.validate();
}

module.exports = DeploymentValidator;
