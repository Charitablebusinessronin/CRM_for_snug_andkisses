/**
 * CRM Functions - Catalyst Serverless
 * Handles customer relationship management operations
 */

const catalyst = require('zcatalyst-sdk-node');

/**
 * Create Customer Function
 */
module.exports.createCustomer = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { name, email, phone, company, source } = catalystReq.body;
        
        // Validation
        if (!name || !email) {
            return {
                status: 'error',
                message: 'Name and email are required',
                code: 400
            };
        }

        // Check for duplicate email
        const customerTable = catalystApp.datastore().table('customers');
        const existingCustomers = await customerTable.getRows({
            criteria: `email='${email}'`
        });

        if (existingCustomers.length > 0) {
            return {
                status: 'error',
                message: 'Customer with this email already exists',
                code: 409
            };
        }

        // Create customer record
        const customerData = {
            name,
            email,
            phone: phone || '',
            company: company || '',
            source: source || 'manual',
            status: 'prospect',
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedRow = await customerTable.insertRow(customerData);

        // Send welcome email
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [email],
            subject: 'Welcome to Snug & Kisses',
            html_mode: `
                <h2>Welcome ${name}!</h2>
                <p>Thank you for your interest in Snug & Kisses services.</p>
                <p>We'll be in touch soon to discuss how we can help you.</p>
                <br>
                <p>Best regards,<br>The Snug & Kisses Team</p>
            `
        });

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id: insertedRow.ROWID,
            activity_type: 'customer_created',
            description: `Customer ${name} was created`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: insertedRow,
            message: 'Customer created successfully'
        };

    } catch (error) {
        console.error('Error creating customer:', error);
        return {
            status: 'error',
            message: 'Failed to create customer',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Customers Function
 */
module.exports.getCustomers = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { page = 1, limit = 50, status, search } = catalystReq.query;
        const offset = (page - 1) * limit;

        const customerTable = catalystApp.datastore().table('customers');
        let criteria = '';

        // Build search criteria
        if (status) {
            criteria += `status='${status}'`;
        }
        
        if (search) {
            const searchCriteria = `name LIKE '%${search}%' OR email LIKE '%${search}%' OR company LIKE '%${search}%'`;
            criteria = criteria ? `${criteria} AND (${searchCriteria})` : searchCriteria;
        }

        const customers = await customerTable.getRows({
            criteria: criteria || undefined,
            max_rows: parseInt(limit),
            sort_order: 'desc',
            sort_by: 'created_time'
        });

        // Get total count for pagination
        const totalCount = await customerTable.getRows({
            criteria: criteria || undefined
        });

        return {
            status: 'success',
            data: {
                customers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount.length,
                    pages: Math.ceil(totalCount.length / limit)
                }
            }
        };

    } catch (error) {
        console.error('Error fetching customers:', error);
        return {
            status: 'error',
            message: 'Failed to fetch customers',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Update Customer Function
 */
module.exports.updateCustomer = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { customerId } = catalystReq.params;
        const updateData = catalystReq.body;
        
        if (!customerId) {
            return {
                status: 'error',
                message: 'Customer ID is required',
                code: 400
            };
        }

        const customerTable = catalystApp.datastore().table('customers');
        
        // Add modified timestamp
        updateData.modified_time = new Date().toISOString();
        
        const updatedRow = await customerTable.updateRow(customerId, updateData);

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id: customerId,
            activity_type: 'customer_updated',
            description: `Customer information was updated`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: updatedRow,
            message: 'Customer updated successfully'
        };

    } catch (error) {
        console.error('Error updating customer:', error);
        return {
            status: 'error',
            message: 'Failed to update customer',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Deal Function
 */
module.exports.createDeal = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { name, customer_id, amount, stage, probability, expected_close_date } = catalystReq.body;
        
        // Validation
        if (!name || !customer_id || !amount) {
            return {
                status: 'error',
                message: 'Name, customer ID, and amount are required',
                code: 400
            };
        }

        // Verify customer exists
        const customerTable = catalystApp.datastore().table('customers');
        const customer = await customerTable.getRowById(customer_id);
        
        if (!customer) {
            return {
                status: 'error',
                message: 'Customer not found',
                code: 404
            };
        }

        // Create deal record
        const dealTable = catalystApp.datastore().table('deals');
        const dealData = {
            name,
            customer_id,
            amount: parseFloat(amount),
            stage: stage || 'prospect',
            probability: probability || 10,
            expected_close_date: expected_close_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedRow = await dealTable.insertRow(dealData);

        // Update customer status to active if they were a prospect
        if (customer.status === 'prospect') {
            await customerTable.updateRow(customer_id, {
                status: 'active',
                modified_time: new Date().toISOString()
            });
        }

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id,
            deal_id: insertedRow.ROWID,
            activity_type: 'deal_created',
            description: `Deal "${name}" was created for $${amount}`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: insertedRow,
            message: 'Deal created successfully'
        };

    } catch (error) {
        console.error('Error creating deal:', error);
        return {
            status: 'error',
            message: 'Failed to create deal',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Sales Pipeline Function
 */
module.exports.getSalesPipeline = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const dealTable = catalystApp.datastore().table('deals');
        const deals = await dealTable.getRows({
            sort_order: 'desc',
            sort_by: 'created_time'
        });

        // Group deals by stage
        const pipeline = {
            prospect: deals.filter(deal => deal.stage === 'prospect'),
            qualified: deals.filter(deal => deal.stage === 'qualified'),
            proposal: deals.filter(deal => deal.stage === 'proposal'),
            negotiation: deals.filter(deal => deal.stage === 'negotiation'),
            closed_won: deals.filter(deal => deal.stage === 'closed_won'),
            closed_lost: deals.filter(deal => deal.stage === 'closed_lost')
        };

        // Calculate pipeline metrics
        const metrics = {
            total_deals: deals.length,
            active_deals: deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length,
            total_value: deals.reduce((sum, deal) => sum + deal.amount, 0),
            won_value: deals.filter(deal => deal.stage === 'closed_won').reduce((sum, deal) => sum + deal.amount, 0),
            conversion_rate: deals.length > 0 ? 
                (deals.filter(deal => deal.stage === 'closed_won').length / deals.length * 100).toFixed(2) : 0
        };

        return {
            status: 'success',
            data: {
                pipeline,
                metrics
            }
        };

    } catch (error) {
        console.error('Error fetching sales pipeline:', error);
        return {
            status: 'error',
            message: 'Failed to fetch sales pipeline',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Customer Activities Function
 */
module.exports.getCustomerActivities = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { customerId } = catalystReq.params;
        const { limit = 50 } = catalystReq.query;

        if (!customerId) {
            return {
                status: 'error',
                message: 'Customer ID is required',
                code: 400
            };
        }

        const activityTable = catalystApp.datastore().table('activities');
        const activities = await activityTable.getRows({
            criteria: `customer_id='${customerId}'`,
            max_rows: parseInt(limit),
            sort_order: 'desc',
            sort_by: 'created_time'
        });

        return {
            status: 'success',
            data: activities
        };

    } catch (error) {
        console.error('Error fetching customer activities:', error);
        return {
            status: 'error',
            message: 'Failed to fetch customer activities',
            error: error.message,
            code: 500
        };
    }
};