const catalyst = require('zcatalyst-sdk-node');

/**
 * Update Lead Function
 */
module.exports.updateLead = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const params = catalystReq.body?.params || catalystReq.body;
        const { lead_id, interview_scheduled, status, stage } = params;

        if (!lead_id) {
            return {
                status: 'error',
                message: 'Lead ID is required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();

        const updateData = {
            ROWID: lead_id,
            modified_time: new Date().toISOString()
        };

        // Add interview scheduled data if provided
        if (interview_scheduled) {
            updateData.interview_scheduled_date = interview_scheduled.scheduledDate;
            updateData.meeting_id = interview_scheduled.meetingId;
            updateData.meeting_url = interview_scheduled.meetingUrl;
            updateData.lead_status = 'Interview Scheduled';
        }

        // Add status/stage updates if provided
        if (status) updateData.lead_status = status;
        if (stage) updateData.lead_stage = stage;

        // Update lead in Catalyst DataStore
        const leadResult = await dataStore.updateRows('zoho_leads', [updateData]);

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'lead_updated',
            description: `Lead was updated with new status/interview information`,
            created_time: new Date().toISOString(),
            related_to_id: lead_id,
            related_to_type: 'lead'
        });

        return {
            status: 'success',
            data: leadResult[0],
            message: 'Lead updated successfully'
        };

    } catch (error) {
        console.error('Error updating lead:', error);
        return {
            status: 'error',
            message: 'Failed to update lead',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Convert Lead to Contact Function
 */
module.exports.convertLeadToContact = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const params = catalystReq.body?.params || catalystReq.body;
        const { lead_id, interview_completed } = params;

        if (!lead_id) {
            return {
                status: 'error',
                message: 'Lead ID is required',
                code: 400
            };
        }

        // Use Catalyst native integration with admin scope
        const adminApp = catalyst.initialize(catalystReq, { scope: 'admin' });
        const dataStore = adminApp.cloudscale.dataStore.getComponentInstance();

        // Get the lead data first
        const leadData = await adminApp.zcql().executeZCQLQuery(`
            SELECT first_name, last_name, email, phone, company, lead_source 
            FROM zoho_leads 
            WHERE ROWID = '${lead_id}'
        `);

        if (leadData.length === 0) {
            return {
                status: 'error',
                message: 'Lead not found',
                code: 404
            };
        }

        const lead = leadData[0];

        // Create contact record
        const contactRecord = {
            name: `${lead.first_name} ${lead.last_name}`,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            contact_type: 'converted_lead',
            status: 'active',
            lead_source: lead.lead_source,
            created_time: new Date().toISOString(),
            created_by: 'lead_conversion'
        };

        // Insert contact
        const contactResult = await dataStore.insertRows('zoho_contacts', [contactRecord]);
        const contactId = contactResult[0].ROWID;

        // Create deal record if interview completed successfully
        let dealId = null;
        if (interview_completed && interview_completed.serviceInterest) {
            const dealRecord = {
                name: `${lead.first_name} ${lead.last_name} - ${interview_completed.serviceInterest}`,
                customer_id: contactId,
                amount: 0, // To be updated later
                stage: 'Qualification',
                probability: 25,
                expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                description: interview_completed.interviewNotes,
                next_steps: interview_completed.nextSteps,
                created_time: new Date().toISOString(),
                created_by: 'lead_conversion'
            };

            const dealResult = await dataStore.insertRows('deals', [dealRecord]);
            dealId = dealResult[0].ROWID;
        }

        // Update lead status to converted
        await dataStore.updateRows('zoho_leads', [{
            ROWID: lead_id,
            lead_status: 'Converted',
            converted_contact_id: contactId,
            converted_deal_id: dealId,
            conversion_date: new Date().toISOString(),
            modified_time: new Date().toISOString()
        }]);

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            activity_type: 'lead_converted',
            description: `Lead "${lead.first_name} ${lead.last_name}" was converted to contact and deal`,
            created_time: new Date().toISOString(),
            related_to_id: contactId,
            related_to_type: 'contact'
        });

        return {
            status: 'success',
            contactId: contactId,
            dealId: dealId,
            message: 'Lead converted successfully'
        };

    } catch (error) {
        console.error('Error converting lead to contact:', error);
        return {
            status: 'error',
            message: 'Failed to convert lead to contact',
            error: error.message,
            code: 500
        };
    }
};
