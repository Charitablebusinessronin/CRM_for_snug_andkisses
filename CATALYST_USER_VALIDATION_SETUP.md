# 🔐 Zoho Catalyst Custom User Validation Setup

## Project Configuration
- **Project Name**: snugnotion
- **Project ID**: 30300000000035001
- **Function Name**: user-validation
- **Function Type**: Basic I/O Function

---

## 📋 Setup Instructions

### Step 1: Deploy the Function

```bash
# Navigate to your Catalyst project directory
cd /path/to/your/catalyst/project

# Deploy the user validation function
catalyst deploy --only functions
```

### Step 2: Configure Custom User Validation

1. **Login to Zoho Catalyst Console**
   - Go to https://console.catalyst.zoho.com
   - Select project: **snugnotion** (30300000000035001)

2. **Navigate to Authentication Settings**
   - Go to Authentication → Settings
   - Find "Custom User Validation" section
   - Click "Configure Custom User Validation"

3. **Select Validation Function**
   - **Validation I/O func**: Select `user-validation`
   - Click "Save Configuration"

### Step 3: Test the Validation

Use the test configurations provided in `catalyst-user-validation-config.json`:

#### Test Case 1: Admin User (Should Pass)
```json
{
  "request_type": "add_user",
  "request_details": {
    "user_details": {
      "email_id": "admin@snugandkisses.com",
      "first_name": "Healthcare",
      "last_name": "Administrator",
      "org_id": "1026298298",
      "role_details": {
        "role_name": "App Administrator",
        "role_id": "2000000004073"
      }
    },
    "auth_type": "web"
  }
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User Healthcare Administrator validated successfully",
  "user_status": "active",
  "custom_fields": {
    "validated_at": "2025-08-21T...",
    "validation_version": "1.0",
    "compliance_check": "passed"
  }
}
```

#### Test Case 2: Caregiver (Needs Background Check)
```json
{
  "request_type": "add_user",
  "request_details": {
    "user_details": {
      "email_id": "caregiver@snugandkisses.com",
      "first_name": "Maria",
      "last_name": "Rodriguez",
      "org_id": "1026298298",
      "role_details": {
        "role_name": "Caregiver",
        "role_id": "2000000004074"
      }
    },
    "auth_type": "web"
  }
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User Maria Rodriguez validated successfully",
  "user_status": "pending_background_check"
}
```

#### Test Case 3: Invalid Domain (Should Fail)
```json
{
  "request_type": "add_user",
  "request_details": {
    "user_details": {
      "email_id": "test@unauthorized-domain.com",
      "first_name": "Test",
      "last_name": "User",
      "org_id": "1026298298",
      "role_details": {
        "role_name": "Client",
        "role_id": "2000000004075"
      }
    },
    "auth_type": "web"
  }
}
```

**Expected Response:**
```json
{
  "status": "failure",
  "message": "Email domain unauthorized-domain.com not authorized for healthcare access",
  "user_status": "inactive"
}
```

---

## 🏥 Healthcare-Specific Features

### 1. **Role-Based User Status**
- **Admin Roles** → `active` (immediate access)
- **Healthcare Providers** → `pending_verification` (requires license verification)
- **Caregivers** → `pending_background_check` (requires background screening)
- **Clients/Family** → `active` (immediate access with limited permissions)

### 2. **HIPAA Compliance Logging**
All validation attempts are logged to the `audit_logs` table:
- User email and validation result
- IP address and timestamp
- Role assignment details
- Failed validation reasons

### 3. **Email Domain Validation**
Currently allowed domains:
- `snugandkisses.com` (production)
- `snugnotion.com` (development)
- `gmail.com` (development only - remove in production)
- `outlook.com` (development only - remove in production)

### 4. **Integration with Zoho CRM**
The function checks for existing contacts in Zoho CRM to prevent duplicate registrations while allowing existing clients to access the system.

---

## 🔧 Customization Options

### Adding New Roles
Edit the `allowedRoles` array in the validation function:
```javascript
const allowedRoles = [
    'App Administrator',
    'Healthcare Admin',
    'Care Coordinator',
    'Caregiver',
    'Client',
    'Family Member',
    'Healthcare Provider',
    'System Administrator',
    'YOUR_NEW_ROLE_HERE'  // Add new roles here
];
```

### Modifying Email Domains
Update the `allowedDomains` array:
```javascript
const allowedDomains = [
    'snugandkisses.com',
    'snugnotion.com',
    'your-domain.com'  // Add your domains here
];
```

### Custom Validation Rules
Add additional validation logic in the `validateHealthcareUser` function:
```javascript
// Example: Check for required certifications
if (roleDetails.role_name === 'Healthcare Provider' && !userDetails.license_number) {
    return { 
        isValid: false, 
        reason: 'Healthcare license number is required for providers' 
    };
}
```

---

## 📊 Monitoring and Logs

### View Function Logs
```bash
# View real-time logs
catalyst logs --function user-validation --tail

# View historical logs
catalyst logs --function user-validation --start "2025-08-21" --end "2025-08-22"
```

### Audit Trail Query
Access audit logs through Catalyst console or API:
```javascript
// Get validation attempts for the last 24 hours
const auditTable = catalystApp.datastore().table('audit_logs');
const results = await auditTable.getAllRows({
    criteria: `timestamp > '${new Date(Date.now() - 86400000).toISOString()}'`
});
```

---

## 🚨 Security Considerations

1. **Remove Development Domains**: Remove `gmail.com` and `outlook.com` from production
2. **Monitor Failed Attempts**: Set up alerts for repeated validation failures
3. **Regular Audit Reviews**: Review audit logs monthly for compliance
4. **Role Permissions**: Ensure role mappings align with your security requirements
5. **Background Checks**: Implement external background check integration for caregivers

---

## 🆘 Troubleshooting

### Common Issues

1. **Function Not Found**
   - Ensure the function is deployed: `catalyst deploy --only functions`
   - Check function name matches exactly: `user-validation`

2. **Validation Always Fails**
   - Check allowed domains in the validation function
   - Verify role names match exactly (case-sensitive)

3. **Audit Logs Not Saving**
   - Ensure `audit_logs` table exists in your datastore
   - Check table permissions and column names

4. **CRM Integration Errors**
   - Verify Zoho CRM API permissions
   - Check if the Contacts module is accessible

### Getting Help

- **Catalyst Documentation**: https://catalyst.zoho.com/help/
- **Function Logs**: Use `catalyst logs --function user-validation`
- **Support**: Contact through Catalyst Console support section

---

## ✅ Deployment Checklist

- [ ] Function deployed successfully
- [ ] Custom User Validation configured in console
- [ ] Test cases pass (admin, caregiver, client)
- [ ] Invalid domain test fails as expected
- [ ] Audit logs are being created
- [ ] Production domains configured
- [ ] Development domains removed
- [ ] Monitoring and alerting set up
- [ ] Documentation shared with team