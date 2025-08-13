# Zoho Catalyst Functions Deployment Guide

## Overview
This guide covers deploying the Snug & Kisses CRM functions to Zoho Catalyst, including setup, configuration, and monitoring.

## Prerequisites
- Zoho Catalyst account with Project-Rainfall project access
- Catalyst CLI installed and configured
- Node.js and Python environments for local testing
- Access to Zoho DataStore

## Project Configuration

### 1. Catalyst Project Setup
The project is already configured in `.catalystrc`:
- **Project ID**: 30300000000011038
- **Project Name**: Project-Rainfall
- **Environment**: Development (ID: 891140386)

### 2. Function Configuration
Functions are defined in `catalyst.json`:
- `crm-api`: Main CRM operations (Node.js)
- `quick-actions`: Rapid CRM actions (Python)
- `contact-manager`: Contact management (Python)
- `analytics-engine`: Business intelligence (Python)
- `lead-processor`: Lead processing (Python)
- `zia-intelligence`: ZIA features (Python)
- `contract-management`: Contract handling (Node.js)

## Function Deployment

### 1. Deploy All Functions
```bash
# Navigate to project directory
cd catalyst

# Deploy all functions
catalyst functions deploy

# Deploy specific function
catalyst functions deploy crm-api
catalyst functions deploy quick-actions
catalyst functions deploy contact-manager
catalyst functions deploy analytics-engine
catalyst functions deploy lead-processor
catalyst functions deploy zia-intelligence
catalyst functions deploy contract-management
```

### 2. Verify Deployment
```bash
# List deployed functions
catalyst functions list

# Check function status
catalyst functions status crm-api
```

### 3. Test Functions
Each function includes a test section. Test locally before deployment:

```bash
# Test CRM API function
cd functions/crm-api
node index.js

# Test Python functions
cd functions/quick-actions
python main.py
```

## DataStore Setup

### 1. Create DataStore
```bash
# Create DataStore with schema
catalyst datastore create --name "snug-kisses-crm" --schema datastore-schema.json
```

### 2. Verify Schema
```bash
# List DataStore tables
catalyst datastore tables list --name "snug-kisses-crm"

# Check table structure
catalyst datastore tables describe --name "snug-kisses-crm" --table "clients"
```

### 3. Initialize Sample Data
```bash
# Import sample data (if available)
catalyst datastore import --name "snug-kisses-crm" --file sample-data.json
```

## Environment Configuration

### 1. Set Environment Variables
```bash
# Set function environment variables
catalyst functions env set crm-api --key "DATABASE_URL" --value "your_datastore_url"
catalyst functions env set crm-api --key "ZOHO_CLIENT_ID" --value "your_client_id"
catalyst functions env set crm-api --key "ZOHO_CLIENT_SECRET" --value "your_client_secret"

# Repeat for all functions
```

### 2. Required Environment Variables
Each function requires these environment variables:

**Common Variables:**
- `DATABASE_URL`: DataStore connection string
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

**Zoho Integration:**
- `ZOHO_CLIENT_ID`: Zoho application client ID
- `ZOHO_CLIENT_SECRET`: Zoho application client secret
- `ZOHO_REFRESH_TOKEN`: OAuth refresh token
- `ZOHO_OAUTH_TOKEN`: Current OAuth access token

**HIPAA Compliance:**
- `HIPAA_COMPLIANCE_MODE`: Enable HIPAA features
- `ENABLE_AUDIT_LOGGING`: Enable audit logging
- `AUDIT_LOG_LEVEL`: Audit log detail level

## Testing and Validation

### 1. Function Health Checks
Each function exposes a `/health` endpoint:

```bash
# Test CRM API health
curl https://project-rainfall-891140386.development.catalystserverless.com/crm-api/health

# Test other functions
curl https://project-rainfall-891140386.development.catalystserverless.com/quick-actions/health
```

### 2. Integration Testing
Test function integration with the main application:

```bash
# Test CRM API integration
curl -X POST https://project-rainfall-891140386.development.catalystserverless.com/crm-api/server/project_rainfall_function \
  -H "Content-Type: application/json" \
  -d '{"action": "createClient", "params": {"name": "Test Client", "email": "test@example.com"}}'
```

### 3. DataStore Testing
Verify DataStore operations:

```bash
# Test client creation
curl -X POST https://project-rainfall-891140386.development.catalystserverless.com/crm-api/server/project_rainfall_function \
  -H "Content-Type: application/json" \
  -d '{"action": "createClient", "params": {"name": "Test Client", "email": "test@example.com", "serviceType": "birth"}}'
```

## Monitoring and Logs

### 1. View Function Logs
```bash
# View real-time logs
catalyst functions logs crm-api --follow

# View recent logs
catalyst functions logs crm-api --lines 100
```

### 2. Monitor Performance
```bash
# Check function metrics
catalyst functions metrics crm-api

# Monitor DataStore usage
catalyst datastore metrics --name "snug-kisses-crm"
```

### 3. Set Up Alerts
Configure alerts for:
- Function errors
- High response times
- DataStore quota usage
- Authentication failures

## Security and Compliance

### 1. HIPAA Compliance
- All functions include HIPAA-compliant audit logging
- Sensitive data is masked in logs
- Access control is role-based
- Audit trail is maintained for 7 years

### 2. Data Encryption
- Data encrypted at rest in DataStore
- HTTPS for all function endpoints
- Secure environment variable storage

### 3. Access Control
- Role-based access control (RBAC)
- User authentication required for all operations
- Audit logging for all data access

## Troubleshooting

### 1. Common Issues

**Function Deployment Fails:**
```bash
# Check function configuration
catalyst functions describe crm-api

# Verify dependencies
npm install  # for Node.js functions
pip install -r requirements.txt  # for Python functions
```

**DataStore Connection Issues:**
```bash
# Verify DataStore exists
catalyst datastore list

# Check connection string
catalyst datastore describe --name "snug-kisses-crm"
```

**Environment Variable Issues:**
```bash
# List function environment variables
catalyst functions env list crm-api

# Set missing variables
catalyst functions env set crm-api --key "MISSING_VAR" --value "value"
```

### 2. Debug Mode
Enable debug logging:

```bash
# Set debug environment variable
catalyst functions env set crm-api --key "LOG_LEVEL" --value "debug"

# Redeploy function
catalyst functions deploy crm-api
```

## Production Deployment

### 1. Production Environment
```bash
# Switch to production environment
catalyst env use production

# Deploy to production
catalyst functions deploy --env production
```

### 2. Production Configuration
- Set `NODE_ENV=production`
- Configure production DataStore
- Set up production OAuth credentials
- Enable production monitoring

### 3. Backup and Recovery
- Regular DataStore backups
- Function configuration backups
- Environment variable backups
- Disaster recovery plan

## Maintenance

### 1. Regular Updates
- Monitor function performance
- Update dependencies
- Review and rotate credentials
- Monitor DataStore usage

### 2. Scaling
- Monitor function usage
- Scale DataStore as needed
- Optimize function performance
- Load balancing considerations

## Support and Resources

### 1. Documentation
- [Zoho Catalyst Documentation](https://docs.zoho.com/catalyst/)
- [DataStore API Reference](https://docs.zoho.com/catalyst/datastore/)
- [Functions API Reference](https://docs.zoho.com/catalyst/functions/)

### 2. Community
- Zoho Catalyst Community
- Developer Forums
- Support Tickets

### 3. Monitoring Tools
- Catalyst Dashboard
- Function Metrics
- DataStore Analytics
- Custom Monitoring

## Next Steps

After successful deployment:

1. **Integration Testing**: Test all functions with the main application
2. **Performance Testing**: Load test functions and DataStore
3. **Security Audit**: Verify HIPAA compliance and security measures
4. **User Training**: Train team on new Catalyst-based system
5. **Go-Live**: Switch production traffic to Catalyst functions
6. **Monitoring**: Set up comprehensive monitoring and alerting

## Conclusion

This deployment guide provides a comprehensive approach to deploying the Snug & Kisses CRM to Zoho Catalyst. Follow the steps carefully and test thoroughly before going live. The system is designed to be scalable, secure, and HIPAA-compliant.
