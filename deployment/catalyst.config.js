/**
 * Zoho Catalyst Configuration for Production Deployment
 * Project ID: 30300000000035001
 * Project Name: snugnotion
 */

const path = require('path')

module.exports = {
  // Project Configuration
  projectId: '30300000000035001',
  projectName: 'snugnotion',
  domain: 'snugkisses.com',
  
  // Environment Configuration
  environment: 'production',
  region: 'us-east-1',
  
  // Function Configuration
  functions: {
    'auth': {
      path: './functions/auth/catalyst-auth.js',
      runtime: 'nodejs18',
      memory: 512,
      timeout: 30,
      environment: {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        MFA_SECRET: process.env.MFA_SECRET,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
      },
      triggers: [
        {
          type: 'http',
          path: '/auth',
          methods: ['POST', 'PUT', 'DELETE']
        }
      ]
    },
    
    'client-data': {
      path: './functions/client-data/catalyst-client.js',
      runtime: 'nodejs18',
      memory: 1024,
      timeout: 45,
      environment: {
        ZOHO_CRM_API_KEY: process.env.ZOHO_CRM_API_KEY,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        HIPAA_AUDIT_ENDPOINT: process.env.HIPAA_AUDIT_ENDPOINT
      },
      triggers: [
        {
          type: 'http',
          path: '/client-data',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      ]
    },
    
    'employee-management': {
      path: './functions/employee/catalyst-employee.js',
      runtime: 'nodejs18',
      memory: 512,
      timeout: 30,
      environment: {
        ZOHO_CRM_API_KEY: process.env.ZOHO_CRM_API_KEY,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
      },
      triggers: [
        {
          type: 'http',
          path: '/employee',
          methods: ['GET', 'POST', 'PUT']
        }
      ]
    },
    
    'hipaa-audit': {
      path: './functions/hipaa/catalyst-audit.js',
      runtime: 'nodejs18',
      memory: 256,
      timeout: 15,
      environment: {
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        AUDIT_RETENTION_YEARS: '7'
      },
      triggers: [
        {
          type: 'http',
          path: '/audit',
          methods: ['POST', 'GET']
        },
        {
          type: 'cron',
          expression: '0 2 * * *',
          description: 'Daily audit log maintenance'
        }
      ]
    },
    
    'emergency-alerts': {
      path: './functions/emergency/catalyst-emergency.js',
      runtime: 'nodejs18',
      memory: 512,
      timeout: 60,
      environment: {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
      },
      triggers: [
        {
          type: 'http',
          path: '/emergency',
          methods: ['POST', 'GET', 'PUT']
        }
      ]
    }
  },
  
  // DataStore Configuration
  datastore: {
    tables: [
      {
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'bigint', primary: true, autoIncrement: true },
          { name: 'event_type', type: 'varchar', length: 100, required: true },
          { name: 'user_email', type: 'varchar', length: 255 },
          { name: 'timestamp', type: 'datetime', required: true },
          { name: 'details', type: 'text' },
          { name: 'client_info', type: 'text' },
          { name: 'severity', type: 'varchar', length: 20, default: 'LOW' },
          { name: 'retention_date', type: 'datetime', required: true }
        ],
        indexes: [
          { columns: ['event_type'] },
          { columns: ['user_email'] },
          { columns: ['timestamp'] },
          { columns: ['retention_date'] }
        ]
      },
      
      {
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'bigint', primary: true, autoIncrement: true },
          { name: 'user_id', type: 'varchar', length: 50, required: true },
          { name: 'refresh_token', type: 'text', required: true },
          { name: 'created_at', type: 'datetime', required: true },
          { name: 'expires_at', type: 'datetime', required: true }
        ],
        indexes: [
          { columns: ['user_id'] },
          { columns: ['expires_at'] }
        ]
      },
      
      {
        name: 'session_store',
        columns: [
          { name: 'id', type: 'bigint', primary: true, autoIncrement: true },
          { name: 'session_id', type: 'varchar', length: 128, required: true, unique: true },
          { name: 'user_id', type: 'varchar', length: 50, required: true },
          { name: 'data', type: 'text' },
          { name: 'created_at', type: 'datetime', required: true },
          { name: 'expires_at', type: 'datetime', required: true }
        ],
        indexes: [
          { columns: ['session_id'] },
          { columns: ['user_id'] },
          { columns: ['expires_at'] }
        ]
      },
      
      {
        name: 'compliance_reports',
        columns: [
          { name: 'id', type: 'bigint', primary: true, autoIncrement: true },
          { name: 'report_id', type: 'varchar', length: 100, required: true, unique: true },
          { name: 'generated_at', type: 'datetime', required: true },
          { name: 'period_start', type: 'datetime', required: true },
          { name: 'period_end', type: 'datetime', required: true },
          { name: 'total_events', type: 'int', required: true },
          { name: 'compliance_score', type: 'decimal', precision: 5, scale: 2 },
          { name: 'violations_count', type: 'int', default: 0 },
          { name: 'report_data', type: 'text' }
        ],
        indexes: [
          { columns: ['report_id'] },
          { columns: ['generated_at'] },
          { columns: ['period_start', 'period_end'] }
        ]
      }
    ]
  },
  
  // File Store Configuration
  filestore: {
    folders: [
      {
        name: 'hipaa-backups',
        public: false,
        encryption: true
      },
      {
        name: 'compliance-reports',
        public: false,
        encryption: true
      },
      {
        name: 'client-documents',
        public: false,
        encryption: true
      }
    ]
  },
  
  // Cache Configuration
  cache: {
    memory: 512,
    ttl: 3600, // 1 hour default TTL
    segments: [
      {
        name: 'user-sessions',
        ttl: 1800 // 30 minutes
      },
      {
        name: 'client-data',
        ttl: 300 // 5 minutes
      },
      {
        name: 'auth-tokens',
        ttl: 900 // 15 minutes
      }
    ]
  },
  
  // API Gateway Configuration
  gateway: {
    cors: {
      origin: ['https://snugkisses.com', 'https://www.snugkisses.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    },
    rateLimit: {
      windowMs: 900000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    security: {
      helmet: true,
      csrf: true,
      xss: true
    }
  },
  
  // Monitoring Configuration
  monitoring: {
    enabled: true,
    metrics: [
      'function_invocations',
      'function_errors',
      'function_duration',
      'datastore_operations',
      'cache_hit_rate',
      'authentication_events',
      'hipaa_audit_events'
    ],
    alerts: [
      {
        name: 'high_error_rate',
        condition: 'error_rate > 5%',
        notification: ['admin@snugkisses.com']
      },
      {
        name: 'hipaa_violation_detected',
        condition: 'hipaa_violations > 0',
        notification: ['admin@snugkisses.com', 'compliance@snugkisses.com'],
        priority: 'critical'
      },
      {
        name: 'authentication_failures',
        condition: 'auth_failures > 10 in 5 minutes',
        notification: ['security@snugkisses.com']
      }
    ]
  },
  
  // Deployment Configuration
  deployment: {
    strategy: 'blue-green',
    healthCheck: {
      path: '/health',
      interval: 30,
      timeout: 5,
      healthyThreshold: 2,
      unhealthyThreshold: 3
    },
    rollback: {
      enabled: true,
      automaticOnFailure: true
    }
  },
  
  // Logging Configuration
  logging: {
    level: 'info',
    format: 'json',
    destinations: [
      {
        type: 'datastore',
        table: 'application_logs'
      },
      {
        type: 'external',
        endpoint: process.env.LOG_ENDPOINT,
        authentication: {
          type: 'bearer',
          token: process.env.LOG_API_TOKEN
        }
      }
    ],
    retention: {
      days: 30,
      archiveAfterDays: 7
    }
  },
  
  // Security Configuration
  security: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: {
        enabled: true,
        intervalDays: 90
      }
    },
    authentication: {
      sessionTimeout: 3600, // 1 hour
      mfaRequired: ['admin', 'employee'],
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    audit: {
      enabled: true,
      retentionYears: 7,
      immutable: true,
      encryption: true
    }
  },
  
  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      strategies: {
        'user-data': 'cache-first',
        'static-content': 'cache-first',
        'dynamic-content': 'network-first'
      }
    },
    optimization: {
      compression: true,
      minification: true,
      bundling: true
    }
  },
  
  // Backup Configuration
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: {
      daily: 30,
      weekly: 12,
      monthly: 12,
      yearly: 7
    },
    encryption: true,
    verification: true
  }
}