/**
 * Zoho Catalyst Environment Configuration
 * Project: snugnotion (30300000000035001)
 * 
 * IMPORTANT: This file contains sensitive credentials
 * Ensure it's added to .gitignore and never committed to version control
 */

module.exports = {
  // Zoho OAuth Configuration
  zoho: {
    client_id: "1000.YWW9X2SXPRD5O0EEYXPSCGD95OVDOH",
    client_secret: "9a60ae55c93dcc6a633a3cb6ec594b4f83b293ce41",
    
    // API Endpoints
    api_endpoints: {
      crm: "https://www.zohoapis.com/crm/v8",
      books: "https://books.zoho.com/api/v3",
      campaigns: "https://campaigns.zoho.com/api/v1.1",
      auth: "https://accounts.zoho.com/oauth/v2"
    },
    
    // Scopes for healthcare CRM
    scopes: [
      "ZohoCRM.modules.ALL",
      "ZohoCRM.users.ALL", 
      "ZohoCRM.org.ALL",
      "ZohoBooks.contacts.ALL",
      "ZohoCampaigns.contact.ALL",
      "profile.userphoto.READ"
    ]
  },
  
  // Catalyst Project Configuration
  catalyst: {
    project_id: "30300000000035001",
    project_name: "snugnotion",
    environment: process.env.NODE_ENV || "development",
    
    // Function Configuration
    functions: {
      user_validation: "user-validation",
      crm_sync: "crm-sync",
      hipaa_audit: "hipaa-audit"
    }
  },
  
  // Healthcare Compliance Settings
  hipaa: {
    audit_enabled: true,
    data_retention_days: 2557, // 7 years as required by HIPAA
    encryption_required: true,
    phi_logging_enabled: false // Never log PHI in plain text
  },
  
  // User Validation Configuration
  validation: {
    // Allowed email domains (customize for production)
    allowed_domains: [
      "snugandkisses.com",
      "snugnotion.com",
      // Remove in production:
      "gmail.com",
      "outlook.com"
    ],
    
    // Healthcare role mappings
    role_mappings: {
      "App Administrator": {
        status: "active",
        permissions: ["admin", "crm", "hipaa", "audit"],
        requires_verification: false
      },
      "Healthcare Admin": {
        status: "active", 
        permissions: ["admin", "crm", "hipaa"],
        requires_verification: false
      },
      "System Administrator": {
        status: "active",
        permissions: ["system", "admin", "audit"],
        requires_verification: false
      },
      "Healthcare Provider": {
        status: "pending_verification",
        permissions: ["crm", "patient_care"],
        requires_verification: true,
        verification_requirements: ["medical_license", "malpractice_insurance"]
      },
      "Care Coordinator": {
        status: "pending_verification", 
        permissions: ["crm", "scheduling", "patient_care"],
        requires_verification: true,
        verification_requirements: ["healthcare_certification"]
      },
      "Caregiver": {
        status: "pending_background_check",
        permissions: ["basic_crm", "shift_notes"],
        requires_verification: true,
        verification_requirements: ["background_check", "references", "drug_test"]
      },
      "Client": {
        status: "active",
        permissions: ["self_service", "appointments"],
        requires_verification: false
      },
      "Family Member": {
        status: "active",
        permissions: ["family_portal", "limited_access"],
        requires_verification: false
      }
    },
    
    // Validation rules
    rules: {
      min_name_length: 2,
      max_name_length: 50,
      password_min_length: 12, // Healthcare requires strong passwords
      require_mfa: true, // Multi-factor authentication required
      session_timeout: 1800 // 30 minutes in seconds
    }
  },
  
  // Database Configuration for Audit Logs
  database: {
    tables: {
      audit_logs: {
        name: "audit_logs",
        columns: [
          "event_type",
          "user_email", 
          "timestamp",
          "ip_address",
          "user_agent",
          "details",
          "compliance_logged"
        ]
      },
      user_validations: {
        name: "user_validations",
        columns: [
          "user_email",
          "validation_result",
          "role_assigned", 
          "status_assigned",
          "timestamp",
          "validation_version"
        ]
      }
    }
  }
};

// Environment variable fallbacks
if (process.env.ZOHO_CLIENT_ID) {
  module.exports.zoho.client_id = process.env.ZOHO_CLIENT_ID;
}

if (process.env.ZOHO_CLIENT_SECRET) {
  module.exports.zoho.client_secret = process.env.ZOHO_CLIENT_SECRET;
}

// Security validation
if (!module.exports.zoho.client_id || !module.exports.zoho.client_secret) {
  console.warn('⚠️ Zoho credentials missing. User validation may fail.');
}

console.log('🔧 Catalyst configuration loaded for project:', module.exports.catalyst.project_name);