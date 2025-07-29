/**
 * Marketing Functions - Catalyst Serverless
 * Handles marketing automation and email campaigns
 */

const catalyst = require('zcatalyst-sdk-node');

/**
 * Create Email Campaign Function
 */
module.exports.createCampaign = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            name, 
            subject, 
            htmlContent, 
            textContent, 
            segmentId, 
            scheduledTime 
        } = catalystReq.body;
        
        // Validation
        if (!name || !subject || !htmlContent) {
            return {
                status: 'error',
                message: 'Name, subject, and HTML content are required',
                code: 400
            };
        }

        // Create campaign record
        const campaignTable = catalystApp.datastore().table('campaigns');
        const campaignData = {
            name,
            subject,
            html_content: htmlContent,
            text_content: textContent || '',
            segment_id: segmentId || 'all',
            status: scheduledTime ? 'scheduled' : 'draft',
            scheduled_time: scheduledTime || null,
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString(),
            sent_count: 0,
            opened_count: 0,
            clicked_count: 0
        };

        const insertedRow = await campaignTable.insertRow(campaignData);

        return {
            status: 'success',
            data: insertedRow,
            message: 'Campaign created successfully'
        };

    } catch (error) {
        console.error('Error creating campaign:', error);
        return {
            status: 'error',
            message: 'Failed to create campaign',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Send Campaign Function
 */
module.exports.sendCampaign = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { campaignId } = catalystReq.params;
        
        if (!campaignId) {
            return {
                status: 'error',
                message: 'Campaign ID is required',
                code: 400
            };
        }

        // Get campaign details
        const campaignTable = catalystApp.datastore().table('campaigns');
        const campaign = await campaignTable.getRowById(campaignId);
        
        if (!campaign) {
            return {
                status: 'error',
                message: 'Campaign not found',
                code: 404
            };
        }

        if (campaign.status === 'sent') {
            return {
                status: 'error',
                message: 'Campaign has already been sent',
                code: 400
            };
        }

        // Get recipients based on segment
        const customerTable = catalystApp.datastore().table('customers');
        let recipients;

        if (campaign.segment_id === 'all') {
            recipients = await customerTable.getRows({
                criteria: "status='active' OR status='prospect'"
            });
        } else {
            // Get specific segment
            const segmentTable = catalystApp.datastore().table('customer_segments');
            const segment = await segmentTable.getRowById(campaign.segment_id);
            
            if (segment) {
                recipients = await customerTable.getRows({
                    criteria: segment.criteria
                });
            } else {
                recipients = [];
            }
        }

        if (recipients.length === 0) {
            return {
                status: 'error',
                message: 'No recipients found for this campaign',
                code: 400
            };
        }

        // Send emails
        const mailService = catalystApp.email();
        let sentCount = 0;
        const failedRecipients = [];

        for (const recipient of recipients) {
            try {
                // Personalize content
                const personalizedHtml = campaign.html_content
                    .replace('{{name}}', recipient.name)
                    .replace('{{email}}', recipient.email)
                    .replace('{{company}}', recipient.company || '');

                const personalizedText = campaign.text_content
                    .replace('{{name}}', recipient.name)
                    .replace('{{email}}', recipient.email)
                    .replace('{{company}}', recipient.company || '');

                // Add tracking pixel and links
                const trackingPixel = `<img src="${process.env.CATALYST_APP_URL}/api/campaign/track/open/${campaignId}/${recipient.ROWID}" width="1" height="1" style="display:none;" />`;
                const finalHtml = personalizedHtml + trackingPixel;

                await mailService.sendMail({
                    from_email: process.env.CATALYST_FROM_EMAIL,
                    to_email: [recipient.email],
                    subject: campaign.subject,
                    html_mode: finalHtml,
                    content: personalizedText || finalHtml
                });

                // Log email send
                const campaignLogTable = catalystApp.datastore().table('campaign_logs');
                await campaignLogTable.insertRow({
                    campaign_id: campaignId,
                    customer_id: recipient.ROWID,
                    email: recipient.email,
                    action: 'sent',
                    timestamp: new Date().toISOString()
                });

                sentCount++;
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (emailError) {
                console.error(`Failed to send email to ${recipient.email}:`, emailError);
                failedRecipients.push({
                    email: recipient.email,
                    error: emailError.message
                });
            }
        }

        // Update campaign status
        await campaignTable.updateRow(campaignId, {
            status: 'sent',
            sent_count: sentCount,
            sent_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                campaign_id: campaignId,
                sent_count: sentCount,
                failed_count: failedRecipients.length,
                failed_recipients: failedRecipients
            },
            message: `Campaign sent to ${sentCount} recipients`
        };

    } catch (error) {
        console.error('Error sending campaign:', error);
        return {
            status: 'error',
            message: 'Failed to send campaign',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Track Email Open Function
 */
module.exports.trackEmailOpen = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { campaignId, customerId } = catalystReq.params;
        
        // Log the open event
        const campaignLogTable = catalystApp.datastore().table('campaign_logs');
        await campaignLogTable.insertRow({
            campaign_id: campaignId,
            customer_id: customerId,
            action: 'opened',
            timestamp: new Date().toISOString(),
            user_agent: catalystReq.headers['user-agent'] || '',
            ip_address: catalystReq.ip || ''
        });

        // Update campaign open count
        const campaignTable = catalystApp.datastore().table('campaigns');
        const campaign = await campaignTable.getRowById(campaignId);
        
        if (campaign) {
            await campaignTable.updateRow(campaignId, {
                opened_count: (campaign.opened_count || 0) + 1,
                modified_time: new Date().toISOString()
            });
        }

        // Return 1x1 transparent pixel
        return {
            status: 'success',
            headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
        };

    } catch (error) {
        console.error('Error tracking email open:', error);
        return {
            status: 'error',
            message: 'Failed to track email open',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Track Email Click Function
 */
module.exports.trackEmailClick = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { campaignId, customerId, url } = catalystReq.params;
        const decodedUrl = decodeURIComponent(url);
        
        // Log the click event
        const campaignLogTable = catalystApp.datastore().table('campaign_logs');
        await campaignLogTable.insertRow({
            campaign_id: campaignId,
            customer_id: customerId,
            action: 'clicked',
            clicked_url: decodedUrl,
            timestamp: new Date().toISOString(),
            user_agent: catalystReq.headers['user-agent'] || '',
            ip_address: catalystReq.ip || ''
        });

        // Update campaign click count
        const campaignTable = catalystApp.datastore().table('campaigns');
        const campaign = await campaignTable.getRowById(campaignId);
        
        if (campaign) {
            await campaignTable.updateRow(campaignId, {
                clicked_count: (campaign.clicked_count || 0) + 1,
                modified_time: new Date().toISOString()
            });
        }

        // Redirect to the original URL
        return {
            status: 'redirect',
            headers: {
                'Location': decodedUrl
            },
            code: 302
        };

    } catch (error) {
        console.error('Error tracking email click:', error);
        return {
            status: 'error',
            message: 'Failed to track email click',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Customer Segment Function
 */
module.exports.createSegment = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { name, description, criteria } = catalystReq.body;
        
        // Validation
        if (!name || !criteria) {
            return {
                status: 'error',
                message: 'Name and criteria are required',
                code: 400
            };
        }

        // Test the criteria to make sure it's valid
        const customerTable = catalystApp.datastore().table('customers');
        try {
            await customerTable.getRows({ criteria, max_rows: 1 });
        } catch (criteriaError) {
            return {
                status: 'error',
                message: 'Invalid criteria format',
                error: criteriaError.message,
                code: 400
            };
        }

        // Create segment record
        const segmentTable = catalystApp.datastore().table('customer_segments');
        const segmentData = {
            name,
            description: description || '',
            criteria,
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedRow = await segmentTable.insertRow(segmentData);

        return {
            status: 'success',
            data: insertedRow,
            message: 'Segment created successfully'
        };

    } catch (error) {
        console.error('Error creating segment:', error);
        return {
            status: 'error',
            message: 'Failed to create segment',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Campaign Analytics Function
 */
module.exports.getCampaignAnalytics = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { campaignId } = catalystReq.params;
        
        if (!campaignId) {
            return {
                status: 'error',
                message: 'Campaign ID is required',
                code: 400
            };
        }

        // Get campaign details
        const campaignTable = catalystApp.datastore().table('campaigns');
        const campaign = await campaignTable.getRowById(campaignId);
        
        if (!campaign) {
            return {
                status: 'error',
                message: 'Campaign not found',
                code: 404
            };
        }

        // Get detailed logs
        const campaignLogTable = catalystApp.datastore().table('campaign_logs');
        const logs = await campaignLogTable.getRows({
            criteria: `campaign_id='${campaignId}'`,
            sort_order: 'desc',
            sort_by: 'timestamp'
        });

        // Calculate metrics
        const sentLogs = logs.filter(log => log.action === 'sent');
        const openedLogs = logs.filter(log => log.action === 'opened');
        const clickedLogs = logs.filter(log => log.action === 'clicked');
        
        const uniqueOpens = [...new Set(openedLogs.map(log => log.customer_id))].length;
        const uniqueClicks = [...new Set(clickedLogs.map(log => log.customer_id))].length;

        const analytics = {
            campaign: {
                id: campaign.ROWID,
                name: campaign.name,
                subject: campaign.subject,
                status: campaign.status,
                sent_time: campaign.sent_time
            },
            metrics: {
                sent_count: sentLogs.length,
                delivered_count: sentLogs.length, // Assuming all sent emails were delivered
                opened_count: openedLogs.length,
                unique_opens: uniqueOpens,
                clicked_count: clickedLogs.length,
                unique_clicks: uniqueClicks,
                open_rate: sentLogs.length > 0 ? ((uniqueOpens / sentLogs.length) * 100).toFixed(2) : 0,
                click_rate: sentLogs.length > 0 ? ((uniqueClicks / sentLogs.length) * 100).toFixed(2) : 0,
                click_to_open_rate: uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(2) : 0
            },
            timeline: logs.map(log => ({
                action: log.action,
                timestamp: log.timestamp,
                email: log.email,
                clicked_url: log.clicked_url || null
            }))
        };

        return {
            status: 'success',
            data: analytics
        };

    } catch (error) {
        console.error('Error fetching campaign analytics:', error);
        return {
            status: 'error',
            message: 'Failed to fetch campaign analytics',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Lead Scoring Function
 */
module.exports.updateLeadScore = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { customerId, action, value = 1 } = catalystReq.body;
        
        if (!customerId || !action) {
            return {
                status: 'error',
                message: 'Customer ID and action are required',
                code: 400
            };
        }

        // Get current customer data
        const customerTable = catalystApp.datastore().table('customers');
        const customer = await customerTable.getRowById(customerId);
        
        if (!customer) {
            return {
                status: 'error',
                message: 'Customer not found',
                code: 404
            };
        }

        // Calculate score change based on action
        let scoreChange = 0;
        switch (action) {
            case 'email_opened':
                scoreChange = 5;
                break;
            case 'email_clicked':
                scoreChange = 10;
                break;
            case 'website_visit':
                scoreChange = 3;
                break;
            case 'form_submitted':
                scoreChange = 15;
                break;
            case 'demo_requested':
                scoreChange = 25;
                break;
            case 'deal_created':
                scoreChange = 50;
                break;
            default:
                scoreChange = parseInt(value);
        }

        const currentScore = customer.lead_score || 0;
        const newScore = Math.max(0, currentScore + scoreChange);

        // Update customer with new score
        await customerTable.updateRow(customerId, {
            lead_score: newScore,
            modified_time: new Date().toISOString()
        });

        // Log the scoring activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id: customerId,
            activity_type: 'lead_scored',
            description: `Lead score updated: ${action} (+${scoreChange} points)`,
            metadata: JSON.stringify({
                action,
                score_change: scoreChange,
                old_score: currentScore,
                new_score: newScore
            }),
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                customer_id: customerId,
                old_score: currentScore,
                new_score: newScore,
                score_change: scoreChange,
                action
            },
            message: 'Lead score updated successfully'
        };

    } catch (error) {
        console.error('Error updating lead score:', error);
        return {
            status: 'error',
            message: 'Failed to update lead score',
            error: error.message,
            code: 500
        };
    }
};