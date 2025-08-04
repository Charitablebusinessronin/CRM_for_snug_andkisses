/**
 * Catalyst Database Deployment Script
 * Creates all required tables for the business suite
 */

const catalyst = require('zcatalyst-sdk-node');

async function deployDatabase() {
  try {
    console.log('🚀 Starting Catalyst database deployment...');
    
    const catalystApp = catalyst.initialize();
    const datastore = catalystApp.datastore();
    
    // Database schema definition
    const tables = [
      {
        table_name: 'customers',
        columns: [
          { column_name: 'name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'phone', data_type: 'varchar', max_length: 50 },
          { column_name: 'company', data_type: 'varchar', max_length: 255 },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'active' },
          { column_name: 'source', data_type: 'varchar', max_length: 100 },
          { column_name: 'lead_score', data_type: 'int', default_value: 0 },
          { column_name: 'address', data_type: 'text' }
        ]
      },
      {
        table_name: 'deals',
        columns: [
          { column_name: 'name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'customer_id', data_type: 'bigint', is_mandatory: true },
          { column_name: 'amount', data_type: 'decimal', precision: 10, scale: 2 },
          { column_name: 'stage', data_type: 'varchar', max_length: 50, default_value: 'prospecting' },
          { column_name: 'probability', data_type: 'int', default_value: 10 },
          { column_name: 'expected_close_date', data_type: 'date' }
        ]
      },
      {
        table_name: 'support_tickets',
        columns: [
          { column_name: 'ticket_number', data_type: 'varchar', max_length: 50, is_mandatory: true },
          { column_name: 'title', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'description', data_type: 'text', is_mandatory: true },
          { column_name: 'customer_id', data_type: 'bigint' },
          { column_name: 'customer_name', data_type: 'varchar', max_length: 255 },
          { column_name: 'customer_email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'priority', data_type: 'varchar', max_length: 20, default_value: 'medium' },
          { column_name: 'category', data_type: 'varchar', max_length: 50, default_value: 'general' },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'open' },
          { column_name: 'assigned_to', data_type: 'bigint' },
          { column_name: 'assigned_to_name', data_type: 'varchar', max_length: 255 },
          { column_name: 'resolution_notes', data_type: 'text' }
        ]
      },
      {
        table_name: 'invoices',
        columns: [
          { column_name: 'invoice_number', data_type: 'varchar', max_length: 50, is_mandatory: true },
          { column_name: 'customer_id', data_type: 'bigint', is_mandatory: true },
          { column_name: 'customer_name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'customer_email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'subtotal', data_type: 'decimal', precision: 10, scale: 2, default_value: 0 },
          { column_name: 'tax_rate', data_type: 'decimal', precision: 5, scale: 2, default_value: 0 },
          { column_name: 'tax_amount', data_type: 'decimal', precision: 10, scale: 2, default_value: 0 },
          { column_name: 'total_amount', data_type: 'decimal', precision: 10, scale: 2, is_mandatory: true },
          { column_name: 'paid_amount', data_type: 'decimal', precision: 10, scale: 2, default_value: 0 },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'draft' },
          { column_name: 'due_date', data_type: 'date' },
          { column_name: 'payment_terms', data_type: 'varchar', max_length: 100, default_value: 'Net 30' },
          { column_name: 'notes', data_type: 'text' }
        ]
      },
      {
        table_name: 'employees',
        columns: [
          { column_name: 'employee_id', data_type: 'varchar', max_length: 50, is_mandatory: true },
          { column_name: 'name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'email', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'phone', data_type: 'varchar', max_length: 50 },
          { column_name: 'department', data_type: 'varchar', max_length: 100 },
          { column_name: 'position', data_type: 'varchar', max_length: 100 },
          { column_name: 'hire_date', data_type: 'date' },
          { column_name: 'salary', data_type: 'decimal', precision: 10, scale: 2 },
          { column_name: 'manager_id', data_type: 'bigint' },
          { column_name: 'employment_type', data_type: 'varchar', max_length: 50, default_value: 'full_time' },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'active' }
        ]
      },
      {
        table_name: 'campaigns',
        columns: [
          { column_name: 'name', data_type: 'varchar', max_length: 255, is_mandatory: true },
          { column_name: 'type', data_type: 'varchar', max_length: 50, default_value: 'email' },
          { column_name: 'status', data_type: 'varchar', max_length: 50, default_value: 'draft' },
          { column_name: 'subject', data_type: 'varchar', max_length: 255 },
          { column_name: 'content', data_type: 'text' },
          { column_name: 'target_audience', data_type: 'text' },
          { column_name: 'sent_count', data_type: 'int', default_value: 0 },
          { column_name: 'open_count', data_type: 'int', default_value: 0 },
          { column_name: 'click_count', data_type: 'int', default_value: 0 }
        ]
      }
    ];

    // Create each table
    for (const tableSchema of tables) {
      try {
        console.log(`📊 Creating table: ${tableSchema.table_name}`);
        
        const table = await datastore.table().create(tableSchema);
        console.log(`✅ Table '${tableSchema.table_name}' created successfully. ID: ${table.id}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table '${tableSchema.table_name}' already exists, skipping...`);
        } else {
          console.error(`❌ Error creating table '${tableSchema.table_name}':`, error.message);
        }
      }
    }

    console.log('🎉 Database deployment completed successfully!');
    
    // Create some sample data
    await createSampleData(datastore);
    
  } catch (error) {
    console.error('❌ Database deployment failed:', error);
    process.exit(1);
  }
}

async function createSampleData(datastore) {
  console.log('\n📝 Creating sample data...');
  
  try {
    // Sample customers
    const customerTable = datastore.table('customers');
    const sampleCustomers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        status: 'active',
        source: 'website',
        lead_score: 85,
        address: '123 Main St, Anytown, ST 12345'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0456',
        company: 'Tech Solutions Inc',
        status: 'active',
        source: 'referral',
        lead_score: 92,
        address: '456 Oak Ave, Business City, ST 67890'
      }
    ];

    for (const customer of sampleCustomers) {
      await customerTable.insertRow(customer);
      console.log(`✅ Sample customer created: ${customer.name}`);
    }

    // Sample support ticket
    const ticketTable = datastore.table('support_tickets');
    await ticketTable.insertRow({
      ticket_number: 'TKT-001',
      title: 'Welcome to Snugs & Kisses CRM',
      description: 'This is a sample support ticket to demonstrate the system functionality.',
      customer_name: 'John Doe', 
      customer_email: 'john.doe@example.com',
      priority: 'low',
      category: 'general',
      status: 'resolved',
      resolution_notes: 'System setup completed successfully.'
    });
    console.log('✅ Sample support ticket created');

    // Sample employee
    const employeeTable = datastore.table('employees');
    await employeeTable.insertRow({
      employee_id: 'EMP001',
      name: 'Admin User',
      email: 'admin@snugandkisses.com',
      department: 'Administration',
      position: 'System Administrator',
      employment_type: 'full_time',
      status: 'active'
    });
    console.log('✅ Sample employee created');

    console.log('🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('⚠️  Sample data creation failed (this is non-critical):', error.message);
  }
}

// Run the deployment
if (require.main === module) {
  deployDatabase();
}

module.exports = { deployDatabase };