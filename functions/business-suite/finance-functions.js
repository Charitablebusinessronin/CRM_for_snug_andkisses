/**
 * Finance Functions - Catalyst Serverless
 * Handles invoicing, payments, and financial management
 */

const catalyst = require('zcatalyst-sdk-node');

/**
 * Create Invoice Function
 */
module.exports.createInvoice = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            customer_id, 
            line_items, 
            due_date,
            notes = '',
            tax_rate = 8.5,
            payment_terms = 'Net 30'
        } = catalystReq.body;
        
        // Validation
        if (!customer_id || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
            return {
                status: 'error',
                message: 'Customer ID and line items are required',
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

        // Calculate totals
        const subtotal = line_items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price);
        }, 0);
        
        const taxAmount = (subtotal * tax_rate) / 100;
        const totalAmount = subtotal + taxAmount;

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(catalystApp);
        
        // Set due date if not provided
        const invoiceDueDate = due_date || 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Create invoice record
        const invoiceTable = catalystApp.datastore().table('invoices');
        const invoiceData = {
            invoice_number: invoiceNumber,
            customer_id,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_address: customer.address || '',
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax_rate: parseFloat(tax_rate),
            tax_amount: parseFloat(taxAmount.toFixed(2)),
            total_amount: parseFloat(totalAmount.toFixed(2)),
            status: 'draft',
            due_date: invoiceDueDate,
            payment_terms,
            notes,
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedInvoice = await invoiceTable.insertRow(invoiceData);

        // Create line items
        const lineItemTable = catalystApp.datastore().table('invoice_line_items');
        const insertedLineItems = [];

        for (const item of line_items) {
            const lineItemData = {
                invoice_id: insertedInvoice.ROWID,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                total: parseFloat((item.quantity * item.unit_price).toFixed(2)),
                created_time: new Date().toISOString()
            };

            const insertedItem = await lineItemTable.insertRow(lineItemData);
            insertedLineItems.push(insertedItem);
        }

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id,
            invoice_id: insertedInvoice.ROWID,
            activity_type: 'invoice_created',
            description: `Invoice ${invoiceNumber} created for $${totalAmount.toFixed(2)}`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                ...insertedInvoice,
                line_items: insertedLineItems
            },
            message: 'Invoice created successfully'
        };

    } catch (error) {
        console.error('Error creating invoice:', error);
        return {
            status: 'error',
            message: 'Failed to create invoice',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Send Invoice Function
 */
module.exports.sendInvoice = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { invoiceId } = catalystReq.params;
        const { email_message = '' } = catalystReq.body;
        
        if (!invoiceId) {
            return {
                status: 'error',
                message: 'Invoice ID is required',
                code: 400
            };
        }

        // Get invoice details
        const invoiceTable = catalystApp.datastore().table('invoices');
        const invoice = await invoiceTable.getRowById(invoiceId);
        
        if (!invoice) {
            return {
                status: 'error',
                message: 'Invoice not found',
                code: 404
            };
        }

        // Get line items
        const lineItemTable = catalystApp.datastore().table('invoice_line_items');
        const lineItems = await lineItemTable.getRows({
            criteria: `invoice_id='${invoiceId}'`
        });

        // Generate PDF invoice (simplified - would use a PDF generation service)
        const invoiceHtml = generateInvoiceHTML(invoice, lineItems);

        // Send invoice email
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [invoice.customer_email],
            subject: `Invoice ${invoice.invoice_number} from Snug & Kisses`,
            html_mode: `
                <h3>Invoice ${invoice.invoice_number}</h3>
                <p>Dear ${invoice.customer_name},</p>
                ${email_message ? `<p>${email_message.replace(/\n/g, '<br>')}</p>` : ''}
                <p>Please find your invoice attached below. Payment is due by ${new Date(invoice.due_date).toLocaleDateString()}.</p>
                <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
                    ${invoiceHtml}
                </div>
                <p>You can pay online at: <a href="${process.env.CATALYST_APP_URL}/invoice/${invoiceId}/pay">Pay Invoice</a></p>
                <p>Thank you for your business!</p>
                <p>Best regards,<br>Snug & Kisses Team</p>
            `
        });

        // Update invoice status
        await invoiceTable.updateRow(invoiceId, {
            status: 'sent',
            sent_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        });

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id: invoice.customer_id,
            invoice_id: invoiceId,
            activity_type: 'invoice_sent',
            description: `Invoice ${invoice.invoice_number} was sent to customer`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            message: 'Invoice sent successfully'
        };

    } catch (error) {
        console.error('Error sending invoice:', error);
        return {
            status: 'error',
            message: 'Failed to send invoice',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Record Payment Function
 */
module.exports.recordPayment = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { invoiceId } = catalystReq.params;
        const { 
            amount, 
            payment_method = 'bank_transfer',
            payment_reference = '',
            payment_date,
            notes = ''
        } = catalystReq.body;
        
        if (!invoiceId || !amount) {
            return {
                status: 'error',
                message: 'Invoice ID and amount are required',
                code: 400
            };
        }

        // Get invoice details
        const invoiceTable = catalystApp.datastore().table('invoices');
        const invoice = await invoiceTable.getRowById(invoiceId);
        
        if (!invoice) {
            return {
                status: 'error',
                message: 'Invoice not found',
                code: 404
            };
        }

        const paymentAmount = parseFloat(amount);
        const currentPaid = invoice.paid_amount || 0;
        const newPaidAmount = currentPaid + paymentAmount;

        // Create payment record
        const paymentTable = catalystApp.datastore().table('payments');
        const paymentData = {
            invoice_id: invoiceId,
            invoice_number: invoice.invoice_number,
            customer_id: invoice.customer_id,
            amount: paymentAmount,
            payment_method,
            payment_reference,
            payment_date: payment_date || new Date().toISOString(),
            notes,
            created_time: new Date().toISOString()
        };

        const insertedPayment = await paymentTable.insertRow(paymentData);

        // Update invoice payment status
        const invoiceUpdateData = {
            paid_amount: parseFloat(newPaidAmount.toFixed(2)),
            modified_time: new Date().toISOString()
        };

        // Determine invoice status based on payment
        if (newPaidAmount >= invoice.total_amount) {
            invoiceUpdateData.status = 'paid';
            invoiceUpdateData.paid_time = new Date().toISOString();
        } else if (newPaidAmount > 0) {
            invoiceUpdateData.status = 'partially_paid';
        }

        await invoiceTable.updateRow(invoiceId, invoiceUpdateData);

        // Send payment confirmation email
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [invoice.customer_email],
            subject: `Payment Received - Invoice ${invoice.invoice_number}`,
            html_mode: `
                <h3>Payment Received</h3>
                <p>Dear ${invoice.customer_name},</p>
                <p>We've received your payment for invoice ${invoice.invoice_number}.</p>
                <ul>
                    <li><strong>Payment Amount:</strong> $${paymentAmount.toFixed(2)}</li>
                    <li><strong>Payment Method:</strong> ${payment_method}</li>
                    <li><strong>Payment Date:</strong> ${new Date(paymentData.payment_date).toLocaleDateString()}</li>
                    ${payment_reference ? `<li><strong>Reference:</strong> ${payment_reference}</li>` : ''}
                </ul>
                <p><strong>Invoice Status:</strong> ${invoiceUpdateData.status}</p>
                ${newPaidAmount < invoice.total_amount ? 
                    `<p><strong>Remaining Balance:</strong> $${(invoice.total_amount - newPaidAmount).toFixed(2)}</p>` : 
                    '<p>This invoice is now fully paid. Thank you!</p>'
                }
                <p>Best regards,<br>Snug & Kisses Team</p>
            `
        });

        // Log activity
        const activityTable = catalystApp.datastore().table('activities');
        await activityTable.insertRow({
            customer_id: invoice.customer_id,
            invoice_id: invoiceId,
            payment_id: insertedPayment.ROWID,
            activity_type: 'payment_received',
            description: `Payment of $${paymentAmount.toFixed(2)} received for invoice ${invoice.invoice_number}`,
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                payment: insertedPayment,
                invoice_status: invoiceUpdateData.status,
                total_paid: newPaidAmount,
                remaining_balance: invoice.total_amount - newPaidAmount
            },
            message: 'Payment recorded successfully'
        };

    } catch (error) {
        console.error('Error recording payment:', error);
        return {
            status: 'error',
            message: 'Failed to record payment',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Financial Summary Function
 */
module.exports.getFinancialSummary = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { period = 'month' } = catalystReq.query;
        
        // Calculate date range
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default: // month
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const startDateStr = startDate.toISOString();
        const endDateStr = now.toISOString();

        // Get invoices for the period
        const invoiceTable = catalystApp.datastore().table('invoices');
        const allInvoices = await invoiceTable.getRows();
        const periodInvoices = allInvoices.filter(invoice => 
            invoice.created_time >= startDateStr && invoice.created_time <= endDateStr
        );

        // Get payments for the period
        const paymentTable = catalystApp.datastore().table('payments');
        const allPayments = await paymentTable.getRows();
        const periodPayments = allPayments.filter(payment => 
            payment.payment_date >= startDateStr && payment.payment_date <= endDateStr
        );

        // Calculate metrics
        const totalInvoiced = periodInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        const totalPaid = periodPayments.reduce((sum, pay) => sum + pay.amount, 0);
        const outstandingAmount = allInvoices
            .filter(inv => ['sent', 'partially_paid', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)), 0);

        // Invoice status breakdown
        const statusBreakdown = {
            draft: allInvoices.filter(inv => inv.status === 'draft').length,
            sent: allInvoices.filter(inv => inv.status === 'sent').length,
            partially_paid: allInvoices.filter(inv => inv.status === 'partially_paid').length,
            paid: allInvoices.filter(inv => inv.status === 'paid').length,
            overdue: allInvoices.filter(inv => inv.status === 'overdue').length
        };

        // Top customers by revenue
        const customerRevenue = {};
        periodInvoices.forEach(invoice => {
            if (!customerRevenue[invoice.customer_id]) {
                customerRevenue[invoice.customer_id] = {
                    customer_name: invoice.customer_name,
                    total: 0,
                    count: 0
                };
            }
            customerRevenue[invoice.customer_id].total += invoice.total_amount;
            customerRevenue[invoice.customer_id].count += 1;
        });

        const topCustomers = Object.entries(customerRevenue)
            .map(([id, data]) => ({ customer_id: id, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Monthly trend (last 12 months)
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const monthInvoices = allInvoices.filter(inv => 
                inv.created_time >= monthStart.toISOString() && 
                inv.created_time <= monthEnd.toISOString()
            );
            
            const monthPayments = allPayments.filter(pay => 
                pay.payment_date >= monthStart.toISOString() && 
                pay.payment_date <= monthEnd.toISOString()
            );

            monthlyTrend.push({
                month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
                invoiced: monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
                received: monthPayments.reduce((sum, pay) => sum + pay.amount, 0),
                invoice_count: monthInvoices.length
            });
        }

        const summary = {
            period_summary: {
                period,
                start_date: startDateStr,
                end_date: endDateStr,
                total_invoiced: parseFloat(totalInvoiced.toFixed(2)),
                total_received: parseFloat(totalPaid.toFixed(2)),
                invoice_count: periodInvoices.length,
                payment_count: periodPayments.length
            },
            current_status: {
                outstanding_amount: parseFloat(outstandingAmount.toFixed(2)),
                invoice_status: statusBreakdown,
                collection_rate: totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(2) : 0
            },
            insights: {
                top_customers: topCustomers,
                monthly_trend: monthlyTrend,
                avg_invoice_value: periodInvoices.length > 0 ? 
                    parseFloat((totalInvoiced / periodInvoices.length).toFixed(2)) : 0,
                avg_payment_time: await calculateAveragePaymentTime(catalystApp)
            }
        };

        return {
            status: 'success',
            data: summary
        };

    } catch (error) {
        console.error('Error fetching financial summary:', error);
        return {
            status: 'error',
            message: 'Failed to fetch financial summary',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Generate Expense Report Function
 */
module.exports.createExpense = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            description, 
            amount, 
            category,
            expense_date,
            receipt_url = '',
            employee_id,
            notes = ''
        } = catalystReq.body;
        
        // Validation
        if (!description || !amount || !category) {
            return {
                status: 'error',
                message: 'Description, amount, and category are required',
                code: 400
            };
        }

        // Create expense record
        const expenseTable = catalystApp.datastore().table('expenses');
        const expenseData = {
            description,
            amount: parseFloat(amount),
            category,
            expense_date: expense_date || new Date().toISOString(),
            receipt_url,
            employee_id: employee_id || '',
            notes,
            status: 'pending',
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedExpense = await expenseTable.insertRow(expenseData);

        // If employee_id provided, get employee details
        let employeeName = '';
        if (employee_id) {
            try {
                const employeeTable = catalystApp.datastore().table('employees');
                const employee = await employeeTable.getRowById(employee_id);
                employeeName = employee ? employee.name : '';
            } catch (err) {
                console.log('Employee not found, continuing...');
            }
        }

        // Send approval notification to finance team
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [process.env.FINANCE_EMAIL || 'finance@example.com'],
            subject: `New Expense Report: ${description}`,
            html_mode: `
                <h3>New Expense Report Submitted</h3>
                <ul>
                    <li><strong>Description:</strong> ${description}</li>
                    <li><strong>Amount:</strong> $${amount}</li>
                    <li><strong>Category:</strong> ${category}</li>
                    <li><strong>Date:</strong> ${new Date(expenseData.expense_date).toLocaleDateString()}</li>
                    ${employeeName ? `<li><strong>Employee:</strong> ${employeeName}</li>` : ''}
                    ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
                </ul>
                <p><a href="${process.env.CATALYST_APP_URL}/finance/expense/${insertedExpense.ROWID}">Review Expense</a></p>
            `
        });

        return {
            status: 'success',
            data: insertedExpense,
            message: 'Expense created successfully'
        };

    } catch (error) {
        console.error('Error creating expense:', error);
        return {
            status: 'error',
            message: 'Failed to create expense',
            error: error.message,
            code: 500
        };
    }
};

// Helper functions
async function generateInvoiceNumber(catalystApp) {
    try {
        const invoiceTable = catalystApp.datastore().table('invoices');
        const recentInvoices = await invoiceTable.getRows({
            max_rows: 1,
            sort_order: 'desc',
            sort_by: 'created_time'
        });

        const currentYear = new Date().getFullYear();
        let nextNumber = 1;

        if (recentInvoices.length > 0) {
            const lastInvoice = recentInvoices[0];
            const lastNumber = lastInvoice.invoice_number;
            
            // Extract number from format like "SNK-2024-0001"
            const match = lastNumber.match(/SNK-(\d{4})-(\d{4})$/);
            if (match && match[1] === currentYear.toString()) {
                nextNumber = parseInt(match[2]) + 1;
            }
        }

        return `SNK-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        return `SNK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
}

function generateInvoiceHTML(invoice, lineItems) {
    const itemsHTML = lineItems.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #3B2352;">Invoice ${invoice.invoice_number}</h2>
            <div style="margin-bottom: 20px;">
                <p><strong>Bill To:</strong><br>
                ${invoice.customer_name}<br>
                ${invoice.customer_email}<br>
                ${invoice.customer_address}</p>
                
                <p><strong>Invoice Date:</strong> ${new Date(invoice.created_time).toLocaleDateString()}<br>
                <strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}<br>
                <strong>Payment Terms:</strong> ${invoice.payment_terms}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Rate</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div style="text-align: right; margin-bottom: 20px;">
                <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
                <p><strong>Tax (${invoice.tax_rate}%): $${invoice.tax_amount.toFixed(2)}</strong></p>
                <p style="font-size: 18px; color: #3B2352;"><strong>Total: $${invoice.total_amount.toFixed(2)}</strong></p>
            </div>
            
            ${invoice.notes ? `<div style="margin-top: 20px;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
        </div>
    `;
}

async function calculateAveragePaymentTime(catalystApp) {
    try {
        const invoiceTable = catalystApp.datastore().table('invoices');
        const paidInvoices = await invoiceTable.getRows({
            criteria: "status='paid' AND paid_time IS NOT NULL",
            max_rows: 100
        });

        if (paidInvoices.length === 0) return 0;

        const totalDays = paidInvoices.reduce((sum, invoice) => {
            const created = new Date(invoice.created_time);
            const paid = new Date(invoice.paid_time);
            const days = (paid - created) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);

        return parseFloat((totalDays / paidInvoices.length).toFixed(1));
    } catch (error) {
        console.error('Error calculating average payment time:', error);
        return 0;
    }
}