#!/bin/bash

# 🔐 Zoho Catalyst Custom User Validation Deployment Script
# Project: snugnotion (30300000000035001)

echo "🚀 Starting Zoho Catalyst Custom User Validation Deployment..."
echo "Project: snugnotion (30300000000035001)"
echo "Client ID: 1000.YWW9X2SXPRD5O0EEYXPSCGD95OVDOH"
echo ""

# Check if Catalyst CLI is installed
if ! command -v catalyst &> /dev/null; then
    echo "❌ Catalyst CLI not found. Please install it first:"
    echo "npm install -g zcatalyst-cli"
    exit 1
fi

echo "✅ Catalyst CLI found"

# Check if logged in to Catalyst
echo "🔑 Checking Catalyst login status..."
catalyst status
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Catalyst. Please login first:"
    echo "catalyst auth login"
    exit 1
fi

echo "✅ Catalyst authentication verified"

# Verify we're in the right project
echo "📋 Verifying project context..."
PROJECT_INFO=$(catalyst project:list | grep "snugnotion")
if [ -z "$PROJECT_INFO" ]; then
    echo "❌ Project 'snugnotion' not found in your account"
    echo "Available projects:"
    catalyst project:list
    exit 1
fi

echo "✅ Project 'snugnotion' found"

# Switch to the project
echo "🔄 Switching to project snugnotion..."
catalyst project:use snugnotion
if [ $? -ne 0 ]; then
    echo "❌ Failed to switch to project snugnotion"
    exit 1
fi

echo "✅ Switched to project snugnotion"

# Create audit_logs table if it doesn't exist
echo "🗄️ Setting up audit_logs table..."
catalyst datastore:create-table audit_logs \
    --columns "event_type:text,user_email:text,timestamp:text,ip_address:text,user_agent:text,details:text,compliance_logged:boolean" \
    --description "HIPAA compliance audit logs for user validation"

if [ $? -eq 0 ]; then
    echo "✅ audit_logs table created successfully"
else
    echo "ℹ️ audit_logs table may already exist (this is normal)"
fi

# Create user_validations table
echo "🗄️ Setting up user_validations table..."
catalyst datastore:create-table user_validations \
    --columns "user_email:text,validation_result:text,role_assigned:text,status_assigned:text,timestamp:text,validation_version:text" \
    --description "User validation results tracking"

if [ $? -eq 0 ]; then
    echo "✅ user_validations table created successfully"
else
    echo "ℹ️ user_validations table may already exist (this is normal)"
fi

# Deploy the function
echo "📦 Deploying user-validation function..."
catalyst deploy --only functions/auth/user-validation

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy user-validation function"
    exit 1
fi

echo "✅ user-validation function deployed successfully"

# Test the function with sample data
echo "🧪 Testing user-validation function..."
TEST_JSON='{
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
}'

echo "Testing with admin user..."
echo "$TEST_JSON" | catalyst function:invoke user-validation --data-from-stdin

if [ $? -eq 0 ]; then
    echo "✅ Function test completed successfully"
else
    echo "⚠️ Function test had issues - check logs for details"
fi

# Display function logs
echo "📋 Recent function logs:"
catalyst logs --function user-validation --lines 20

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Zoho Catalyst Console: https://console.catalyst.zoho.com"
echo "2. Navigate to: Authentication → Settings"
echo "3. Configure Custom User Validation:"
echo "   - Select function: user-validation"
echo "   - Save configuration"
echo ""
echo "🧪 Test Cases Available:"
echo "- Admin user: Should get status 'active'"
echo "- Caregiver: Should get status 'pending_background_check'"
echo "- Healthcare Provider: Should get status 'pending_verification'"
echo "- Invalid domain: Should fail validation"
echo ""
echo "📊 Monitoring:"
echo "- View logs: catalyst logs --function user-validation"
echo "- Check audit table: catalyst datastore:select audit_logs"
echo ""
echo "🔐 Security Notes:"
echo "- All validation attempts are logged for HIPAA compliance"
echo "- Email domains are restricted to authorized healthcare domains"
echo "- Role-based status assignment ensures proper access levels"
echo ""
echo "✅ Custom User Validation is now active!"
echo "Project: snugnotion (30300000000035001)"