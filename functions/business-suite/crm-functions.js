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
 * Create Task Function
 */
module.exports.createTask = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);

    try {
        const { subject, due_date, status, priority, description, related_to_id, related_to_type } = catalystReq.body;

        // Validation
        if (!subject || !due_date) {
            return {
                status: 'error',
                message: 'Subject and due date are required for a task',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope for CRM operations
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const taskData = {
            subject: subject,
            due_date: due_date,
            status: status || 'Not Started',
            priority: priority || 'Normal',
            description: description || '',
            related_to_id: related_to_id || null,
            related_to_type: related_to_type || null,
            created_time: new Date().toISOString(),
            created_by: 'crm_functions'
        };

        // Store task in Catalyst DataStore with native Zoho integration
        const taskResult = await dataStore.insertRows('zoho_tasks', [taskData]);
        const catalystTaskId = taskResult[0].ROWID;

        // Log activity in Catalyst
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'task_created',
            description: `Task '${subject}' created via Catalyst integration (ID: ${catalystTaskId})`,
            created_time: new Date().toISOString(),
            related_to_id: related_to_id,
            related_to_type: related_to_type
        });

        return {
            status: 'success',
            data: { catalystTaskId, taskResult: taskResult[0] },
            message: 'Task created successfully via Catalyst native integration'
        };

    } catch (error) {
        console.error('Error creating task:', error);
        return {
            status: 'error',
            message: 'Failed to create task',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Appointment Function
 */
module.exports.createAppointment = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);

    try {
        const { subject, start_datetime, end_datetime, location, description, related_to_id, related_to_type } = catalystReq.body;

        // Validation
        if (!subject || !start_datetime || !end_datetime) {
            return {
                status: 'error',
                message: 'Subject, start and end datetime are required for an appointment',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope for CRM operations
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const eventData = {
            subject: subject,
            start_datetime: start_datetime,
            end_datetime: end_datetime,
            location: location || '',
            description: description || '',
            related_to_id: related_to_id || null,
            related_to_type: related_to_type || null,
            created_time: new Date().toISOString(),
            created_by: 'crm_functions'
        };

        // Store event in Catalyst DataStore with native Zoho integration
        const eventResult = await dataStore.insertRows('zoho_events', [eventData]);
        const catalystEventId = eventResult[0].ROWID;

        // Log activity in Catalyst
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'appointment_created',
            description: `Appointment '${subject}' created via Catalyst integration (ID: ${catalystEventId})`,
            created_time: new Date().toISOString(),
            related_to_id: related_to_id,
            related_to_type: related_to_type
        });

        return {
            status: 'success',
            data: { catalystEventId, eventResult: eventResult[0] },
            message: 'Appointment created successfully via Catalyst native integration'
        };

    } catch (error) {
        console.error('Error creating appointment:', error);
        return {
            status: 'error',
            message: 'Failed to create appointment',
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

/**
 * Get Quick Stats Function
 */
module.exports.getQuickStats = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        // Get quick statistics using ZCQL for performance
        const customersCount = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM customers');
        const dealsCount = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM deals');
        const tasksCount = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM zoho_tasks WHERE status != "Completed"');
        const appointmentsToday = await adminApp.zcql().executeZCQLQuery(`SELECT COUNT(*) as total FROM zoho_events WHERE DATE(start_datetime) = DATE('${new Date().toISOString().split('T')[0]}')`);
        
        const stats = {
            customers: customersCount[0]?.total || 0,
            deals: dealsCount[0]?.total || 0,
            pending_tasks: tasksCount[0]?.total || 0,
            appointments_today: appointmentsToday[0]?.total || 0,
            generated_at: new Date().toISOString()
        };

        return {
            status: 'success',
            data: stats
        };

    } catch (error) {
        console.error('Error getting quick stats:', error);
        return {
            status: 'error',
            message: 'Failed to get quick stats',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Recent Activities Function
 */
module.exports.getRecentActivities = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { limit = 15 } = catalystReq.query || catalystReq.body?.params || {};
        
        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        
        // Get recent activities using ZCQL
        const activities = await adminApp.zcql().executeZCQLQuery(`
            SELECT activity_type, description, created_time, customer_id, deal_id 
            FROM activities 
            ORDER BY created_time DESC 
            LIMIT ${parseInt(limit)}
        `);

        return {
            status: 'success',
            data: activities
        };

    } catch (error) {
        console.error('Error getting recent activities:', error);
        return {
            status: 'error',
            message: 'Failed to get recent activities',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Quick Note Function
 */
module.exports.createQuickNote = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const noteData = catalystReq.body?.params || catalystReq.body;
        const { title, content, related_to_id, related_to_type } = noteData;
        
        // Validation
        if (!title || !content) {
            return {
                status: 'error',
                message: 'Title and content are required for a note',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const quickNoteData = {
            note_title: title,
            note_content: content,
            related_to_id: related_to_id || null,
            related_to_type: related_to_type || null,
            created_time: new Date().toISOString(),
            created_by: 'quick_actions'
        };

        // Store note in Catalyst DataStore
        const noteResult = await dataStore.insertRows('zoho_notes', [quickNoteData]);
        
        return {
            status: 'success',
            data: noteResult[0],
            message: 'Note created successfully'
        };

    } catch (error) {
        console.error('Error creating quick note:', error);
        return {
            status: 'error',
            message: 'Failed to create note',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Quick Task Function (Enhanced version of existing createTask)
 */
module.exports.createQuickTask = async (catalystReq) => {
    // Use the existing createTask function but adapt for quick actions
    return await module.exports.createTask(catalystReq);
};

/**
 * Create Quick Appointment Function (Enhanced version of existing createAppointment)
 */
module.exports.createQuickAppointment = async (catalystReq) => {
    // Use the existing createAppointment function but adapt for quick actions
    return await module.exports.createAppointment(catalystReq);
};

/**
 * Create Quick Contact Function
 */
module.exports.createQuickContact = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const contactData = catalystReq.body?.params || catalystReq.body;
        const { name, email, phone, company } = contactData;
        
        // Validation
        if (!name || !email) {
            return {
                status: 'error',
                message: 'Name and email are required for a contact',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const quickContactData = {
            name: name,
            email: email,
            phone: phone || '',
            company: company || '',
            contact_type: 'quick_contact',
            status: 'active',
            created_time: new Date().toISOString(),
            created_by: 'quick_actions'
        };

        // Store contact in Catalyst DataStore
        const contactResult = await dataStore.insertRows('zoho_contacts', [quickContactData]);
        
        return {
            status: 'success',
            data: contactResult[0],
            message: 'Contact created successfully'
        };

    } catch (error) {
        console.error('Error creating quick contact:', error);
        return {
            status: 'error',
            message: 'Failed to create contact',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Quick Lead Function
 */
module.exports.createQuickLead = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const leadData = catalystReq.body?.params || catalystReq.body;
        const { first_name, last_name, email, phone, company } = leadData;
        
        // Validation
        if (!first_name || !last_name || !email) {
            return {
                status: 'error',
                message: 'First name, last name, and email are required for a lead',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const quickLeadData = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone || '',
            company: company || 'Individual',
            lead_source: 'Quick Actions',
            lead_status: 'New',
            created_time: new Date().toISOString(),
            created_by: 'quick_actions'
        };

        // Store lead in Catalyst DataStore
        const leadResult = await dataStore.insertRows('zoho_leads', [quickLeadData]);
        
        return {
            status: 'success',
            data: leadResult[0],
            message: 'Lead created successfully'
        };

    } catch (error) {
        console.error('Error creating quick lead:', error);
        return {
            status: 'error',
            message: 'Failed to create lead',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Complete Task Function
 */
module.exports.completeTask = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { id, completion_notes } = catalystReq.body?.params || catalystReq.body;
        
        if (!id) {
            return {
                status: 'error',
                message: 'Task ID is required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const updateData = {
            ROWID: id,
            status: 'Completed',
            completion_notes: completion_notes || '',
            completed_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        // Update task in Catalyst DataStore
        const taskResult = await dataStore.updateRows('zoho_tasks', [updateData]);
        
        return {
            status: 'success',
            data: taskResult[0],
            message: 'Task marked as completed'
        };

    } catch (error) {
        console.error('Error completing task:', error);
        return {
            status: 'error',
            message: 'Failed to complete task',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Update Note Function
 */
module.exports.updateNote = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const params = catalystReq.body?.params || catalystReq.body;
        const { id, note_title, note_content } = params;
        
        if (!id) {
            return {
                status: 'error',
                message: 'Note ID is required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const updateData = {
            ROWID: id,
            note_title: note_title,
            note_content: note_content,
            modified_time: new Date().toISOString()
        };

        // Update note in Catalyst DataStore
        const noteResult = await dataStore.updateRows('zoho_notes', [updateData]);
        
        return {
            status: 'success',
            data: noteResult[0],
            message: 'Note updated successfully'
        };

    } catch (error) {
        console.error('Error updating note:', error);
        return {
            status: 'error',
            message: 'Failed to update note',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Reschedule Appointment Function
 */
module.exports.rescheduleAppointment = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const params = catalystReq.body?.params || catalystReq.body;
        const { id, start_datetime, end_datetime, reschedule_reason } = params;
        
        if (!id || !start_datetime || !end_datetime) {
            return {
                status: 'error',
                message: 'Appointment ID, start datetime, and end datetime are required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        const updateData = {
            ROWID: id,
            start_datetime: start_datetime,
            end_datetime: end_datetime,
            reschedule_reason: reschedule_reason || '',
            rescheduled_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        // Update appointment in Catalyst DataStore
        const appointmentResult = await dataStore.updateRows('zoho_events', [updateData]);
        
        return {
            status: 'success',
            data: appointmentResult[0],
            message: 'Appointment rescheduled successfully'
        };

    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        return {
            status: 'error',
            message: 'Failed to reschedule appointment',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Leads Function
 */
module.exports.getLeads = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { page = 1, limit = 50 } = catalystReq.query || catalystReq.body?.params || {};
        
        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        
        // Get leads using ZCQL with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const leads = await adminApp.zcql().executeZCQLQuery(`
            SELECT first_name, last_name, email, phone, company, lead_source, lead_status, 
                   created_time, modified_time, ROWID 
            FROM zoho_leads 
            ORDER BY created_time DESC 
            LIMIT ${parseInt(limit)} 
            OFFSET ${offset}
        `);
        
        // Get total count for pagination
        const totalCountResult = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM zoho_leads');
        const total = totalCountResult[0]?.total || 0;

        return {
            status: 'success',
            data: leads,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        };

    } catch (error) {
        console.error('Error getting leads:', error);
        return {
            status: 'error',
            message: 'Failed to get leads',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Lead Function
 */
module.exports.createLead = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const leadData = catalystReq.body?.params || catalystReq.body;
        const { first_name, last_name, email, phone, company, lead_source } = leadData;
        
        // Validation
        if (!first_name || !last_name || !email) {
            return {
                status: 'error',
                message: 'First name, last name, and email are required for a lead',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        // Check for duplicate email
        const existingLeads = await adminApp.zcql().executeZCQLQuery(`
            SELECT ROWID FROM zoho_leads WHERE email = '${email}'
        `);
        
        if (existingLeads.length > 0) {
            return {
                status: 'error',
                message: 'Lead with this email already exists',
                code: 409
            };
        }
        
        const leadRecord = {
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone || '',
            company: company || 'Individual',
            lead_source: lead_source || 'CRM API',
            lead_status: 'New',
            created_time: new Date().toISOString(),
            created_by: 'crm_api'
        };

        // Store lead in Catalyst DataStore
        const leadResult = await dataStore.insertRows('zoho_leads', [leadRecord]);
        
        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'lead_created',
            description: `Lead "${first_name} ${last_name}" was created via CRM API`,
            created_time: new Date().toISOString(),
            related_to_id: leadResult[0].ROWID,
            related_to_type: 'lead'
        });
        
        return {
            status: 'success',
            data: leadResult[0],
            message: 'Lead created successfully'
        };

    } catch (error) {
        console.error('Error creating lead:', error);
        return {
            status: 'error',
            message: 'Failed to create lead',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Accounts Function
 */
module.exports.getAccounts = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { page = 1, limit = 50 } = catalystReq.query || catalystReq.body?.params || {};
        
        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        
        // Get accounts using ZCQL with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const accounts = await adminApp.zcql().executeZCQLQuery(`
            SELECT account_name, account_type, industry, phone, email, billing_address, 
                   website, annual_revenue, employees, created_time, modified_time, ROWID 
            FROM zoho_accounts 
            ORDER BY created_time DESC 
            LIMIT ${parseInt(limit)} 
            OFFSET ${offset}
        `);
        
        // Get total count for pagination
        const totalCountResult = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM zoho_accounts');
        const total = totalCountResult[0]?.total || 0;

        return {
            status: 'success',
            data: accounts,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        };

    } catch (error) {
        console.error('Error getting accounts:', error);
        return {
            status: 'error',
            message: 'Failed to get accounts',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Account Function
 */
module.exports.createAccount = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const accountData = catalystReq.body?.params || catalystReq.body;
        const { account_name, account_type, industry, phone, email, website } = accountData;
        
        // Validation
        if (!account_name) {
            return {
                status: 'error',
                message: 'Account name is required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();
        
        // Check for duplicate account name
        const existingAccounts = await adminApp.zcql().executeZCQLQuery(`
            SELECT ROWID FROM zoho_accounts WHERE account_name = '${account_name}'
        `);
        
        if (existingAccounts.length > 0) {
            return {
                status: 'error',
                message: 'Account with this name already exists',
                code: 409
            };
        }
        
        const accountRecord = {
            account_name: account_name,
            account_type: account_type || 'Customer',
            industry: industry || '',
            phone: phone || '',
            email: email || '',
            website: website || '',
            billing_address: accountData.billing_address || '',
            annual_revenue: accountData.annual_revenue || 0,
            employees: accountData.employees || 0,
            created_time: new Date().toISOString(),
            created_by: 'crm_api'
        };

        // Store account in Catalyst DataStore
        const accountResult = await dataStore.insertRows('zoho_accounts', [accountRecord]);
        
        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'account_created',
            description: `Account "${account_name}" was created via CRM API`,
            created_time: new Date().toISOString(),
            related_to_id: accountResult[0].ROWID,
            related_to_type: 'account'
        });
        
        return {
            status: 'success',
            data: accountResult[0],
            message: 'Account created successfully'
        };

    } catch (error) {
        console.error('Error creating account:', error);
        return {
            status: 'error',
            message: 'Failed to create account',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Deals Function
 */
module.exports.getDeals = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { page = 1, limit = 50 } = catalystReq.query || catalystReq.body?.params || {};
        
        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        
        // Get deals using ZCQL with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const deals = await adminApp.zcql().executeZCQLQuery(`
            SELECT name, customer_id, amount, stage, probability, expected_close_date, 
                   created_time, modified_time, ROWID 
            FROM deals 
            ORDER BY created_time DESC 
            LIMIT ${parseInt(limit)} 
            OFFSET ${offset}
        `);
        
        // Get total count for pagination
        const totalCountResult = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM deals');
        const total = totalCountResult[0]?.total || 0;

        return {
            status: 'success',
            data: deals,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        };

    } catch (error) {
        console.error('Error getting deals:', error);
        return {
            status: 'error',
            message: 'Failed to get deals',
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
        const { page = 1, limit = 50 } = catalystReq.query || catalystReq.body?.params || {};

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });

        // Get customers using ZCQL with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const customers = await adminApp.zcql().executeZCQLQuery(`
            SELECT name, email, phone, company, contact_type, status, 
                   created_time, modified_time, ROWID 
            FROM zoho_contacts 
            ORDER BY created_time DESC 
            LIMIT ${parseInt(limit)} 
            OFFSET ${offset}
        `);

        // Get total count for pagination
        const totalCountResult = await adminApp.zcql().executeZCQLQuery('SELECT COUNT(*) as total FROM zoho_contacts');
        const total = totalCountResult[0]?.total || 0;

        return {
            status: 'success',
            data: customers,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        };

    } catch (error) {
        console.error('Error getting customers:', error);
        return {
            status: 'error',
            message: 'Failed to get customers',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Customer Function
 */
module.exports.createCustomer = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const customerData = catalystReq.body?.params || catalystReq.body;
        const { name, email, phone, company } = customerData;

        // Validation
        if (!name || !email) {
            return {
                status: 'error',
                message: 'Name and email are required for a customer',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();

        // Check for duplicate email
        const existingCustomers = await adminApp.zcql().executeZCQLQuery(`
            SELECT ROWID FROM zoho_contacts WHERE email = '${email}'
        `);

        if (existingCustomers.length > 0) {
            return {
                status: 'error',
                message: 'Customer with this email already exists',
                code: 409
            };
        }

        const customerRecord = {
            name: name,
            email: email,
            phone: phone || '',
            company: company || '',
            contact_type: 'customer',
            status: 'active',
            created_time: new Date().toISOString(),
            created_by: 'crm_api'
        };

        // Store customer in Catalyst DataStore
        const customerResult = await dataStore.insertRows('zoho_contacts', [customerRecord]);

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'customer_created',
            description: `Customer "${name}" was created via CRM API`,
            created_time: new Date().toISOString(),
            related_to_id: customerResult[0].ROWID,
            related_to_type: 'customer'
        });

        return {
            status: 'success',
            data: customerResult[0],
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