/**
 * HR Functions - Catalyst Serverless
 * Handles human resources management, employee data, and HR processes
 */

const catalyst = require('zcatalyst-sdk-node');

/**
 * Create Employee Function
 */
module.exports.createEmployee = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            employee_id,
            name, 
            email, 
            phone,
            department,
            position,
            hire_date,
            salary,
            manager_id = null,
            address = '',
            emergency_contact = {},
            benefits = {},
            employment_type = 'full_time'
        } = catalystReq.body;
        
        // Validation
        if (!employee_id || !name || !email || !department || !position) {
            return {
                status: 'error',
                message: 'Employee ID, name, email, department, and position are required',
                code: 400
            };
        }

        // Check for duplicate employee ID or email
        const employeeTable = catalystApp.datastore().table('employees');
        const existingEmployees = await employeeTable.getRows({
            criteria: `employee_id='${employee_id}' OR email='${email}'`
        });

        if (existingEmployees.length > 0) {
            return {
                status: 'error',
                message: 'Employee with this ID or email already exists',
                code: 409
            };
        }

        // Verify manager exists if provided
        if (manager_id) {
            const manager = await employeeTable.getRowById(manager_id);
            if (!manager) {
                return {
                    status: 'error',
                    message: 'Manager not found',
                    code: 404
                };
            }
        }

        // Create employee record
        const employeeData = {
            employee_id,
            name,
            email,
            phone: phone || '',
            department,
            position,
            hire_date: hire_date || new Date().toISOString(),
            salary: salary ? parseFloat(salary) : 0,
            manager_id,
            address,
            emergency_contact: JSON.stringify(emergency_contact),
            benefits: JSON.stringify(benefits),
            employment_type,
            status: 'active',
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedEmployee = await employeeTable.insertRow(employeeData);

        // Create employee onboarding checklist
        await createOnboardingChecklist(catalystApp, insertedEmployee.ROWID);

        // Send welcome email
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [email],
            subject: 'Welcome to Snug & Kisses!',
            html_mode: `
                <h2>Welcome to Snug & Kisses, ${name}!</h2>
                <p>We're excited to have you join our team as a ${position} in the ${department} department.</p>
                <p><strong>Your Details:</strong></p>
                <ul>
                    <li>Employee ID: ${employee_id}</li>
                    <li>Start Date: ${new Date(employeeData.hire_date).toLocaleDateString()}</li>
                    <li>Department: ${department}</li>
                    <li>Position: ${position}</li>
                </ul>
                <p>Please check your email for onboarding instructions and required documents.</p>
                <p>If you have any questions, please don't hesitate to reach out to HR.</p>
                <p>Welcome aboard!</p>
                <p>Best regards,<br>The Snug & Kisses HR Team</p>
            `
        });

        // Notify HR and manager
        const hrEmail = process.env.HR_EMAIL || 'hr@example.com';
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [hrEmail],
            subject: `New Employee Added: ${name}`,
            html_mode: `
                <h3>New Employee Added to System</h3>
                <p>A new employee has been added to the HR system:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Employee ID:</strong> ${employee_id}</li>
                    <li><strong>Position:</strong> ${position}</li>
                    <li><strong>Department:</strong> ${department}</li>
                    <li><strong>Start Date:</strong> ${new Date(employeeData.hire_date).toLocaleDateString()}</li>
                </ul>
                <p><a href="${process.env.CATALYST_APP_URL}/hr/employee/${insertedEmployee.ROWID}">View Employee Profile</a></p>
            `
        });

        return {
            status: 'success',
            data: {
                ...insertedEmployee,
                emergency_contact: emergency_contact,
                benefits: benefits
            },
            message: 'Employee created successfully'
        };

    } catch (error) {
        console.error('Error creating employee:', error);
        return {
            status: 'error',
            message: 'Failed to create employee',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get Employees Function
 */
module.exports.getEmployees = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            page = 1, 
            limit = 50, 
            department, 
            status = 'active',
            search 
        } = catalystReq.query;

        const employeeTable = catalystApp.datastore().table('employees');
        let criteria = '';
        const conditions = [];

        // Build search criteria
        if (status) conditions.push(`status='${status}'`);
        if (department) conditions.push(`department='${department}'`);
        
        if (search) {
            conditions.push(`(name LIKE '%${search}%' OR employee_id LIKE '%${search}%' OR email LIKE '%${search}%' OR position LIKE '%${search}%')`);
        }

        if (conditions.length > 0) {
            criteria = conditions.join(' AND ');
        }

        const employees = await employeeTable.getRows({
            criteria: criteria || undefined,
            max_rows: parseInt(limit),
            sort_order: 'asc',
            sort_by: 'name'
        });

        // Parse JSON fields and hide sensitive data
        const processedEmployees = employees.map(emp => ({
            ...emp,
            emergency_contact: emp.emergency_contact ? JSON.parse(emp.emergency_contact) : {},
            benefits: emp.benefits ? JSON.parse(emp.benefits) : {},
            salary: undefined // Hide salary in list view
        }));

        // Get total count for pagination
        const totalCount = await employeeTable.getRows({
            criteria: criteria || undefined
        });

        return {
            status: 'success',
            data: {
                employees: processedEmployees,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount.length,
                    pages: Math.ceil(totalCount.length / limit)
                }
            }
        };

    } catch (error) {
        console.error('Error fetching employees:', error);
        return {
            status: 'error',
            message: 'Failed to fetch employees',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Update Employee Function
 */
module.exports.updateEmployee = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { employeeId } = catalystReq.params;
        const updateData = catalystReq.body;
        
        if (!employeeId) {
            return {
                status: 'error',
                message: 'Employee ID is required',
                code: 400
            };
        }

        const employeeTable = catalystApp.datastore().table('employees');
        const employee = await employeeTable.getRowById(employeeId);
        
        if (!employee) {
            return {
                status: 'error',
                message: 'Employee not found',
                code: 404
            };
        }

        // Prepare update data
        const processedUpdateData = {
            ...updateData,
            modified_time: new Date().toISOString()
        };

        // Handle JSON fields
        if (updateData.emergency_contact) {
            processedUpdateData.emergency_contact = JSON.stringify(updateData.emergency_contact);
        }
        if (updateData.benefits) {
            processedUpdateData.benefits = JSON.stringify(updateData.benefits);
        }

        const updatedEmployee = await employeeTable.updateRow(employeeId, processedUpdateData);

        // Log the update
        const hrLogTable = catalystApp.datastore().table('hr_logs');
        await hrLogTable.insertRow({
            employee_id: employeeId,
            action: 'employee_updated',
            description: `Employee ${employee.name} information was updated`,
            changed_fields: JSON.stringify(Object.keys(updateData)),
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: {
                ...updatedEmployee,
                emergency_contact: updatedEmployee.emergency_contact ? JSON.parse(updatedEmployee.emergency_contact) : {},
                benefits: updatedEmployee.benefits ? JSON.parse(updatedEmployee.benefits) : {}
            },
            message: 'Employee updated successfully'
        };

    } catch (error) {
        console.error('Error updating employee:', error);
        return {
            status: 'error',
            message: 'Failed to update employee',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Time Entry Function
 */
module.exports.createTimeEntry = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            employee_id,
            date,
            clock_in,
            clock_out,
            break_minutes = 0,
            notes = '',
            project_id = null
        } = catalystReq.body;
        
        // Validation
        if (!employee_id || !date || !clock_in) {
            return {
                status: 'error',
                message: 'Employee ID, date, and clock in time are required',
                code: 400
            };
        }

        // Verify employee exists
        const employeeTable = catalystApp.datastore().table('employees');
        const employee = await employeeTable.getRowById(employee_id);
        
        if (!employee) {
            return {
                status: 'error',
                message: 'Employee not found',
                code: 404
            };
        }

        // Calculate hours worked
        let hoursWorked = 0;
        if (clock_out) {
            const clockInTime = new Date(`${date}T${clock_in}`);
            const clockOutTime = new Date(`${date}T${clock_out}`);
            const totalMinutes = (clockOutTime - clockInTime) / (1000 * 60) - break_minutes;
            hoursWorked = Math.max(0, totalMinutes / 60);
        }

        // Create time entry record
        const timeEntryTable = catalystApp.datastore().table('time_entries');
        const timeEntryData = {
            employee_id,
            employee_name: employee.name,
            date,
            clock_in,
            clock_out: clock_out || null,
            break_minutes: parseInt(break_minutes),
            hours_worked: parseFloat(hoursWorked.toFixed(2)),
            notes,
            project_id,
            status: clock_out ? 'complete' : 'in_progress',
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedTimeEntry = await timeEntryTable.insertRow(timeEntryData);

        return {
            status: 'success',
            data: insertedTimeEntry,
            message: 'Time entry created successfully'
        };

    } catch (error) {
        console.error('Error creating time entry:', error);
        return {
            status: 'error',
            message: 'Failed to create time entry',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Create Leave Request Function
 */
module.exports.createLeaveRequest = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { 
            employee_id,
            leave_type,
            start_date,
            end_date,
            reason,
            notes = ''
        } = catalystReq.body;
        
        // Validation
        if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
            return {
                status: 'error',
                message: 'Employee ID, leave type, dates, and reason are required',
                code: 400
            };
        }

        // Verify employee exists
        const employeeTable = catalystApp.datastore().table('employees');
        const employee = await employeeTable.getRowById(employee_id);
        
        if (!employee) {
            return {
                status: 'error',
                message: 'Employee not found',
                code: 404
            };
        }

        // Calculate days requested
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const daysRequested = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Create leave request record
        const leaveRequestTable = catalystApp.datastore().table('leave_requests');
        const leaveRequestData = {
            employee_id,
            employee_name: employee.name,
            employee_email: employee.email,
            leave_type,
            start_date,
            end_date,
            days_requested: daysRequested,
            reason,
            notes,
            status: 'pending',
            created_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const insertedLeaveRequest = await leaveRequestTable.insertRow(leaveRequestData);

        // Send notification to manager and HR
        const mailService = catalystApp.email();
        const recipients = [process.env.HR_EMAIL || 'hr@example.com'];
        
        // Add manager email if exists
        if (employee.manager_id) {
            try {
                const manager = await employeeTable.getRowById(employee.manager_id);
                if (manager && manager.email) {
                    recipients.push(manager.email);
                }
            } catch (err) {
                console.log('Manager not found, continuing...');
            }
        }

        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: recipients,
            subject: `Leave Request: ${employee.name} - ${leave_type}`,
            html_mode: `
                <h3>New Leave Request</h3>
                <p><strong>Employee:</strong> ${employee.name}</p>
                <p><strong>Leave Type:</strong> ${leave_type}</p>
                <p><strong>Dates:</strong> ${new Date(start_date).toLocaleDateString()} to ${new Date(end_date).toLocaleDateString()}</p>
                <p><strong>Days Requested:</strong> ${daysRequested}</p>
                <p><strong>Reason:</strong> ${reason}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                <p><a href="${process.env.CATALYST_APP_URL}/hr/leave-request/${insertedLeaveRequest.ROWID}">Review Request</a></p>
            `
        });

        // Send confirmation to employee
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [employee.email],
            subject: 'Leave Request Submitted',
            html_mode: `
                <h3>Leave Request Submitted</h3>
                <p>Hello ${employee.name},</p>
                <p>Your leave request has been submitted and is pending approval.</p>
                <p><strong>Details:</strong></p>
                <ul>
                    <li>Leave Type: ${leave_type}</li>
                    <li>Dates: ${new Date(start_date).toLocaleDateString()} to ${new Date(end_date).toLocaleDateString()}</li>
                    <li>Days: ${daysRequested}</li>
                </ul>
                <p>You will be notified once your request has been reviewed.</p>
                <p>Best regards,<br>HR Team</p>
            `
        });

        return {
            status: 'success',
            data: insertedLeaveRequest,
            message: 'Leave request created successfully'
        };

    } catch (error) {
        console.error('Error creating leave request:', error);
        return {
            status: 'error',
            message: 'Failed to create leave request',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Approve/Reject Leave Request Function
 */
module.exports.updateLeaveRequestStatus = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { leaveRequestId } = catalystReq.params;
        const { status, approver_notes = '', approver_id } = catalystReq.body;
        
        if (!leaveRequestId || !status || !['approved', 'rejected'].includes(status)) {
            return {
                status: 'error',
                message: 'Leave request ID and valid status (approved/rejected) are required',
                code: 400
            };
        }

        const leaveRequestTable = catalystApp.datastore().table('leave_requests');
        const leaveRequest = await leaveRequestTable.getRowById(leaveRequestId);
        
        if (!leaveRequest) {
            return {
                status: 'error',
                message: 'Leave request not found',
                code: 404
            };
        }

        // Update leave request
        const updateData = {
            status,
            approver_notes,
            approver_id: approver_id || '',
            approved_time: new Date().toISOString(),
            modified_time: new Date().toISOString()
        };

        const updatedLeaveRequest = await leaveRequestTable.updateRow(leaveRequestId, updateData);

        // Send notification to employee
        const mailService = catalystApp.email();
        await mailService.sendMail({
            from_email: process.env.CATALYST_FROM_EMAIL,
            to_email: [leaveRequest.employee_email],
            subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            html_mode: `
                <h3>Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                <p>Hello ${leaveRequest.employee_name},</p>
                <p>Your leave request has been <strong>${status}</strong>.</p>
                <p><strong>Request Details:</strong></p>
                <ul>
                    <li>Leave Type: ${leaveRequest.leave_type}</li>
                    <li>Dates: ${new Date(leaveRequest.start_date).toLocaleDateString()} to ${new Date(leaveRequest.end_date).toLocaleDateString()}</li>
                    <li>Days: ${leaveRequest.days_requested}</li>
                </ul>
                ${approver_notes ? `<p><strong>Approver Notes:</strong> ${approver_notes}</p>` : ''}
                <p>Best regards,<br>HR Team</p>
            `
        });

        // Log the approval/rejection
        const hrLogTable = catalystApp.datastore().table('hr_logs');
        await hrLogTable.insertRow({
            employee_id: leaveRequest.employee_id,
            action: `leave_request_${status}`,
            description: `Leave request ${status} for ${leaveRequest.employee_name}`,
            metadata: JSON.stringify({
                leave_request_id: leaveRequestId,
                leave_type: leaveRequest.leave_type,
                days: leaveRequest.days_requested,
                approver_notes
            }),
            created_time: new Date().toISOString()
        });

        return {
            status: 'success',
            data: updatedLeaveRequest,
            message: `Leave request ${status} successfully`
        };

    } catch (error) {
        console.error('Error updating leave request status:', error);
        return {
            status: 'error',
            message: 'Failed to update leave request status',
            error: error.message,
            code: 500
        };
    }
};

/**
 * Get HR Analytics Function
 */
module.exports.getHRAnalytics = async (catalystReq) => {
    const catalystApp = catalyst.initialize(catalystReq);
    
    try {
        const { period = 'month' } = catalystReq.query;
        
        // Get all employees
        const employeeTable = catalystApp.datastore().table('employees');
        const employees = await employeeTable.getRows();
        
        // Get time entries
        const timeEntryTable = catalystApp.datastore().table('time_entries');
        const timeEntries = await timeEntryTable.getRows();
        
        // Get leave requests
        const leaveRequestTable = catalystApp.datastore().table('leave_requests');
        const leaveRequests = await leaveRequestTable.getRows();

        // Calculate metrics
        const activeEmployees = employees.filter(emp => emp.status === 'active').length;
        const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
        
        // Department breakdown
        const departmentCounts = {};
        employees.forEach(emp => {
            if (emp.status === 'active') {
                departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
            }
        });

        // Average tenure calculation
        const currentDate = new Date();
        const tenures = employees
            .filter(emp => emp.status === 'active' && emp.hire_date)
            .map(emp => {
                const hireDate = new Date(emp.hire_date);
                return (currentDate - hireDate) / (1000 * 60 * 60 * 24 * 365); // years
            });
        
        const averageTenure = tenures.length > 0 ? 
            (tenures.reduce((sum, tenure) => sum + tenure, 0) / tenures.length).toFixed(1) : 0;

        // Leave request analysis
        const pendingLeaveRequests = leaveRequests.filter(req => req.status === 'pending').length;
        const approvedLeaveRequests = leaveRequests.filter(req => req.status === 'approved').length;
        const rejectedLeaveRequests = leaveRequests.filter(req => req.status === 'rejected').length;

        // Time tracking analysis (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthEntries = timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const totalHoursThisMonth = currentMonthEntries.reduce((sum, entry) => sum + entry.hours_worked, 0);
        const avgHoursPerEmployee = activeEmployees > 0 ? 
            (totalHoursThisMonth / activeEmployees).toFixed(1) : 0;

        // Top performers by hours
        const employeeHours = {};
        currentMonthEntries.forEach(entry => {
            employeeHours[entry.employee_id] = (employeeHours[entry.employee_id] || 0) + entry.hours_worked;
        });

        const topPerformers = Object.entries(employeeHours)
            .map(([empId, hours]) => {
                const employee = employees.find(emp => emp.ROWID === empId);
                return {
                    employee_id: empId,
                    name: employee ? employee.name : 'Unknown',
                    hours: parseFloat(hours.toFixed(1))
                };
            })
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5);

        const analytics = {
            overview: {
                total_employees: employees.length,
                active_employees: activeEmployees,
                inactive_employees: inactiveEmployees,
                average_tenure_years: parseFloat(averageTenure)
            },
            departments: departmentCounts,
            leave_requests: {
                pending: pendingLeaveRequests,
                approved: approvedLeaveRequests,
                rejected: rejectedLeaveRequests,
                total: leaveRequests.length,
                approval_rate: leaveRequests.length > 0 ? 
                    ((approvedLeaveRequests / leaveRequests.length) * 100).toFixed(2) : 0
            },
            time_tracking: {
                total_hours_this_month: parseFloat(totalHoursThisMonth.toFixed(1)),
                avg_hours_per_employee: parseFloat(avgHoursPerEmployee),
                entries_this_month: currentMonthEntries.length,
                top_performers: topPerformers
            },
            employment_types: {
                full_time: employees.filter(emp => emp.employment_type === 'full_time' && emp.status === 'active').length,
                part_time: employees.filter(emp => emp.employment_type === 'part_time' && emp.status === 'active').length,
                contract: employees.filter(emp => emp.employment_type === 'contract' && emp.status === 'active').length,
                intern: employees.filter(emp => emp.employment_type === 'intern' && emp.status === 'active').length
            }
        };

        return {
            status: 'success',
            data: analytics
        };

    } catch (error) {
        console.error('Error fetching HR analytics:', error);
        return {
            status: 'error',
            message: 'Failed to fetch HR analytics',
            error: error.message,
            code: 500
        };
    }
};

// Helper function to create onboarding checklist
async function createOnboardingChecklist(catalystApp, employeeId) {
    try {
        const checklistTable = catalystApp.datastore().table('onboarding_checklists');
        
        const checklistItems = [
            { task: 'Complete I-9 form', category: 'documentation', required: true },
            { task: 'Provide tax documents (W-4)', category: 'documentation', required: true },
            { task: 'Review employee handbook', category: 'training', required: true },
            { task: 'Set up direct deposit', category: 'payroll', required: false },
            { task: 'Complete benefits enrollment', category: 'benefits', required: false },
            { task: 'IT equipment setup', category: 'equipment', required: true },
            { task: 'Office tour and introduction', category: 'orientation', required: true },
            { task: 'Department-specific training', category: 'training', required: true }
        ];

        for (const item of checklistItems) {
            await checklistTable.insertRow({
                employee_id: employeeId,
                task: item.task,
                category: item.category,
                required: item.required,
                completed: false,
                created_time: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error creating onboarding checklist:', error);
    }
}