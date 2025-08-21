/**
 * Main Catalyst Function Entry Point
 * Routes requests to appropriate business functions
 */

const auth = require('./auth/auth');
const crmFunctions = require('./business-suite/crm-functions');
const hrFunctions = require('./business-suite/hr-functions');
const financeFunctions = require('./business-suite/finance-functions');
const marketingFunctions = require('./business-suite/marketing-functions');
const supportFunctions = require('./business-suite/support-functions');

module.exports = async (catalystReq, catalystRes) => {
    console.log('🚀 Snug & Kisses CRM Function called');
    
    try {
        const { path, method, body, query } = catalystReq;
        
        // Route based on path
        if (path.startsWith('/auth')) {
            return await auth(catalystReq, catalystRes);
        }
        
        if (path.startsWith('/crm')) {
            // Route to specific CRM functions
            if (path.includes('/customers')) {
                if (method === 'GET') {
                    return await crmFunctions.getCustomers(catalystReq);
                } else if (method === 'POST') {
                    return await crmFunctions.createCustomer(catalystReq);
                }
            }
            
            if (path.includes('/deals')) {
                if (method === 'GET') {
                    return await crmFunctions.getSalesPipeline(catalystReq);
                } else if (method === 'POST') {
                    return await crmFunctions.createDeal(catalystReq);
                }
            }
        }
        
        // Default response for testing
        return {
            status: 'success',
            message: '🎉 Snug & Kisses CRM - Sprint 3 Deployed Successfully!',
            data: {
                project: 'Snug & Kisses CRM',
                version: '1.0.0',
                sprint: 3,
                deployment_status: 'active',
                available_endpoints: [
                    '/auth - Authentication services',
                    '/crm/customers - Customer management',
                    '/crm/deals - Sales pipeline',
                    '/hr - Human resources',
                    '/finance - Financial management',
                    '/marketing - Marketing campaigns',
                    '/support - Customer support'
                ],
                database_tables: [
                    'customers',
                    'deals',
                    'support_tickets',
                    'invoices',
                    'employees',
                    'campaigns',
                    'users',
                    'audit_logs',
                    'client_assignments',
                    'shift_notes'
                ]
            }
        };
        
    } catch (error) {
        console.error('Function error:', error);
        return {
            status: 'error',
            message: 'Internal server error',
            error: error.message
        };
    }
};