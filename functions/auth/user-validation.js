const catalyst = require('zcatalyst-sdk-node');
const config = require('../../catalyst-env-config');

/**
 * Zoho Catalyst Custom User Validation Function
 * Project: snugnotion (30300000000035001)
 * Purpose: HIPAA-compliant user validation for healthcare CRM
 * 
 * Client ID: 1000.YWW9X2SXPRD5O0EEYXPSCGD95OVDOH
 * Integrated with Zoho OAuth for CRM validation
 */
module.exports = async (cronDetails, context) => {
    const catalystApp = catalyst.initialize(context);
    
    try {
        // Parse the request details
        const requestType = cronDetails.request_type;
        const requestDetails = cronDetails.request_details;
        
        if (requestType !== 'add_user') {
            return {
                status: 'failure',
                message: 'Invalid request type. Only add_user is supported.',
                user_status: 'inactive'
            };
        }
        
        const userDetails = requestDetails.user_details;
        const authType = requestDetails.auth_type;
        
        // Extract user information
        const email = userDetails.email_id;
        const firstName = userDetails.first_name;
        const lastName = userDetails.last_name;
        const orgId = userDetails.org_id;
        const roleDetails = userDetails.role_details;
        
        console.log(`🔐 Processing user validation for: ${email}`);
        
        // Validation Rules for Healthcare CRM
        const validationResult = await validateHealthcareUser(userDetails, catalystApp);
        
        if (!validationResult.isValid) {
            // Log failed validation attempt for HIPAA audit
            await logAuditEvent(catalystApp, {
                event_type: 'USER_VALIDATION_FAILED',
                user_email: email,
                reason: validationResult.reason,
                timestamp: new Date().toISOString(),
                ip_address: context.request?.headers?.['x-forwarded-for'] || 'unknown',
                user_agent: context.request?.headers?.['user-agent'] || 'unknown'
            });
            
            return {
                status: 'failure',
                message: validationResult.reason,
                user_status: 'inactive'
            };
        }
        
        // Additional role-based validation
        const roleValidation = await validateUserRole(roleDetails, catalystApp);
        if (!roleValidation.isValid) {
            return {
                status: 'failure',
                message: roleValidation.reason,
                user_status: 'inactive'
            };
        }
        
        // Log successful validation for HIPAA audit
        await logAuditEvent(catalystApp, {
            event_type: 'USER_VALIDATION_SUCCESS',
            user_email: email,
            role_name: roleDetails.role_name,
            role_id: roleDetails.role_id,
            org_id: orgId,
            timestamp: new Date().toISOString(),
            ip_address: context.request?.headers?.['x-forwarded-for'] || 'unknown',
            auth_type: authType
        });
        
        // Set user status based on role and organization
        const userStatus = determineUserStatus(roleDetails, orgId);
        
        console.log(`✅ User validation successful for: ${email} (Status: ${userStatus})`);
        
        return {
            status: 'success',
            message: `User ${firstName} ${lastName} validated successfully`,
            user_status: userStatus,
            custom_fields: {
                validated_at: new Date().toISOString(),
                validation_version: '1.0',
                compliance_check: 'passed'
            }
        };
        
    } catch (error) {
        console.error('❌ User validation error:', error);
        
        // Log error for monitoring
        await logAuditEvent(catalystApp, {
            event_type: 'USER_VALIDATION_ERROR',
            error_message: error.message,
            timestamp: new Date().toISOString(),
            stack_trace: error.stack
        });
        
        return {
            status: 'failure',
            message: 'Internal validation error. Please contact administrator.',
            user_status: 'inactive'
        };
    }
};

/**
 * Validate healthcare-specific user requirements
 */
async function validateHealthcareUser(userDetails, catalystApp) {
    const email = userDetails.email_id;
    const firstName = userDetails.first_name;
    const lastName = userDetails.last_name;
    
    // Email validation
    if (!email || !isValidEmail(email)) {
        return { isValid: false, reason: 'Invalid email format' };
    }
    
    // Healthcare email domain validation using config
    const allowedDomains = config.validation.allowed_domains;
    
    const emailDomain = email.split('@')[1];
    if (!allowedDomains.includes(emailDomain)) {
        return { 
            isValid: false, 
            reason: `Email domain ${emailDomain} not authorized for healthcare access` 
        };
    }
    
    // Name validation
    if (!firstName || firstName.trim().length < 2) {
        return { isValid: false, reason: 'First name must be at least 2 characters' };
    }
    
    if (!lastName || lastName.trim().length < 2) {
        return { isValid: false, reason: 'Last name must be at least 2 characters' };
    }
    
    // Check for existing user in CRM
    try {
        const zcrmSDK = catalystApp.zcrmSDK();
        const functions = catalystApp.functions();
        
        // Search for existing contact with same email
        const searchResult = await zcrmSDK.API.MODULES.get({
            module: 'Contacts',
            params: {
                criteria: `(Email:equals:${email})`
            }
        });
        
        if (searchResult.body && searchResult.body.data && searchResult.body.data.length > 0) {
            console.log(`📋 Existing contact found for: ${email}`);
            // Allow existing contacts to register
        }
        
    } catch (error) {
        console.log('⚠️ Could not check existing contacts:', error.message);
        // Don't fail validation if CRM check fails
    }
    
    return { isValid: true };
}

/**
 * Validate user role permissions using config
 */
async function validateUserRole(roleDetails, catalystApp) {
    const allowedRoles = Object.keys(config.validation.role_mappings);
    
    if (!roleDetails || !roleDetails.role_name) {
        return { 
            isValid: false, 
            reason: 'Role information is required' 
        };
    }
    
    if (!allowedRoles.includes(roleDetails.role_name)) {
        return { 
            isValid: false, 
            reason: `Role ${roleDetails.role_name} is not authorized for this healthcare system` 
        };
    }
    
    return { isValid: true };
}

/**
 * Determine user status based on role configuration
 */
function determineUserStatus(roleDetails, orgId) {
    const roleName = roleDetails.role_name;
    const roleConfig = config.validation.role_mappings[roleName];
    
    if (!roleConfig) {
        console.log(`⚠️ Unknown role: ${roleName}, defaulting to pending_approval`);
        return 'pending_approval';
    }
    
    console.log(`🎭 Role ${roleName} mapped to status: ${roleConfig.status}`);
    return roleConfig.status;
}

/**
 * Log audit events for HIPAA compliance
 */
async function logAuditEvent(catalystApp, eventData) {
    try {
        const datastore = catalystApp.datastore();
        const auditTable = datastore.table('audit_logs');
        
        const auditRecord = {
            event_type: eventData.event_type,
            user_email: eventData.user_email || null,
            timestamp: eventData.timestamp,
            ip_address: eventData.ip_address || null,
            user_agent: eventData.user_agent || null,
            details: JSON.stringify(eventData),
            compliance_logged: true
        };
        
        await auditTable.insertRow(auditRecord);
        console.log(`📋 Audit event logged: ${eventData.event_type}`);
        
    } catch (error) {
        console.error('⚠️ Failed to log audit event:', error);
        // Don't throw error to avoid breaking the main flow
    }
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}