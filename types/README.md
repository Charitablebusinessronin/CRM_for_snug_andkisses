# Types Directory

This directory contains comprehensive TypeScript type definitions for the Snug & Kisses CRM system, organized to prevent configuration conflicts and ensure type safety across the application.

## Directory Structure

```
types/
├── api/           # API request/response types
├── catalyst/      # Zoho Catalyst configuration types  
├── config/        # Environment and application configuration types
├── integrations/  # Zoho service integration types
├── auth.ts        # Authentication and authorization types
├── global.d.ts    # Global type augmentations
├── index.ts       # Central type exports
└── README.md      # This documentation
```

## Key Features

### 🔒 Configuration Conflict Prevention
- Centralized environment variable typing
- Validation utilities to catch mismatched configurations
- Clear separation between required and optional variables

### 🏗️ Catalyst Integration Safety
- Complete Zoho Catalyst SDK type definitions
- Function configuration validation
- Environment-specific configuration management

### 🔍 Runtime Validation
- Type-safe environment variable access
- Configuration validation utilities
- HIPAA compliance checking

## Usage Examples

### Basic Import
```typescript
import { 
  APIResponse, 
  ZohoCRMContact, 
  CatalystFunction,
  ConfigValidator 
} from '../types'
```

### Environment Configuration Validation
```typescript
import { ConfigValidator, validateCurrentConfiguration } from '../types/config/validator'

const validator = new ConfigValidator()
const result = validator.validateEnvironmentVariables()

if (!result.valid) {
  console.error('Configuration errors:', result.missing, result.invalid)
}
```

### Catalyst Configuration
```typescript
import { CatalystDeploymentConfig, CATALYST_ENVIRONMENTS } from '../types/catalyst'

const config: CatalystDeploymentConfig = {
  project_id: CATALYST_ENVIRONMENTS.DEVELOPMENT.project_id,
  project_name: 'Project-Rainfall',
  env_id: CATALYST_ENVIRONMENTS.DEVELOPMENT.env_id,
  env_name: 'Development',
  functions: [
    {
      function_name: 'analytics-engine',
      source: 'catalyst/functions/analytics-engine',
      entry_file: 'index.js',
      stack: 'node20',
      timeout: 300,
      memory: 512,
      environment_variables: {
        NODE_ENV: 'production',
        HIPAA_COMPLIANCE_MODE: 'true',
        ENABLE_AUDIT_LOGGING: 'true'
      }
    }
  ]
}
```

### API Response Typing
```typescript
import { APIResponse, ZohoCRMContact } from '../types'

async function getContact(id: string): Promise<APIResponse<ZohoCRMContact>> {
  const response = await fetch(`/api/crm/contacts/${id}`)
  return response.json()
}
```

## Configuration Validation

### Environment Variables
The system validates all environment variables at runtime:

**Required Variables:**
- `NODE_ENV` - Application environment 
- `ZOHO_CLIENT_ID` - Zoho OAuth client ID
- `ZOHO_CLIENT_SECRET` - Zoho OAuth client secret
- `ZOHO_REFRESH_TOKEN` - Zoho OAuth refresh token
- `NEXTAUTH_URL` - NextAuth.js base URL
- `REDIRECT_URI` - OAuth redirect URI
- `CATALYST_APP_URL` - Catalyst application base URL
- `CATALYST_PROJECT_ID` - Catalyst project ID
- `CATALYST_ENV_ID` - Catalyst environment ID

**Validation Features:**
- Pattern matching (e.g., Zoho client IDs must start with "1000.")
- URL format validation
- HTTPS enforcement in production
- HIPAA compliance checking

### Catalyst Configuration Validation
Validates consistency between:
- `.catalystrc` project configuration
- `catalyst.json` deployment configuration  
- Environment variable settings
- Function configurations

### Usage
```bash
# Run full configuration validation
npm run validate-config

# Or use the validation script directly
node scripts/catalyst-config-validator.js
```

## Type Safety Benefits

### 1. Configuration Conflicts Prevention
- Catches project ID mismatches between files
- Validates environment-specific settings
- Ensures required environment variables are set

### 2. Zoho Integration Safety
- Type-safe API request/response handling
- OAuth token management typing
- Service-specific type definitions

### 3. HIPAA Compliance
- Audit logging type definitions
- PHI data handling types
- Compliance flag validation

### 4. Runtime Validation
- Environment variable validation at startup
- Configuration consistency checking
- Type-safe configuration loading

## Adding New Types

### 1. Create Module-Specific Types
```typescript
// types/new-module/index.ts
export interface NewModuleConfig {
  // Define your types here
}
```

### 2. Update Central Exports
```typescript
// types/index.ts
export * from './new-module'
```

### 3. Add Validation (if needed)
```typescript
// types/config/validator.ts
validateNewModule(config: NewModuleConfig): boolean {
  // Add validation logic
}
```

### 4. Update Global Types (if needed)
```typescript
// types/global.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEW_MODULE_CONFIG?: string
    }
  }
}
```

## Best Practices

### 1. Use Namespaced Exports
```typescript
// Prevent naming conflicts
export type { 
  CatalystConfig as ZohoCatalystConfig 
} from './catalyst'
```

### 2. Validate at Runtime
```typescript
import { validateCurrentConfiguration } from '../types/config/validator'

const validation = validateCurrentConfiguration()
if (!validation.env.valid) {
  throw new Error('Invalid environment configuration')
}
```

### 3. Use Strict Types
```typescript
// Instead of 'string', use literal types
type Environment = 'development' | 'production' | 'test'
```

### 4. Document Configuration Dependencies
```typescript
interface CatalystFunction {
  function_name: string
  source: string // Must match directory in catalyst/functions/
  entry_file: string // Must exist in source directory
  // ... other fields
}
```

## Migration Guide

### From Old Configuration
If you have existing configuration files, use the validator to identify issues:

```typescript
import { ConfigValidator } from '../types/config/validator'

const validator = new ConfigValidator()
const result = validator.validateEnvironmentVariables()

// Fix any errors in result.missing or result.invalid
```

### Updating Environment Files
Use the updated `env-vars-template.txt` as a reference for required variables and their formats.

## Troubleshooting

### Common Issues

1. **Project ID Mismatch**
   - Check `.catalystrc` and `catalyst.json` have the same project ID
   - Verify environment variables match configuration files

2. **Environment Variable Patterns**
   - Zoho client IDs must start with "1000."
   - URLs must include protocol (http:// or https://)
   - Boolean strings must be "true" or "false"

3. **Function Configuration**
   - Source directory must exist
   - Entry file must exist in source directory
   - catalyst-config.json must be valid JSON

### Getting Help
1. Run the validation script: `node scripts/catalyst-config-validator.js`
2. Check the console for specific error messages
3. Review this README for configuration requirements
4. Ensure all required environment variables are set