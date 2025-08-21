/**
 * Zoho Catalyst Client Library
 * Provides unified access to Catalyst services
 */

// Initialize Catalyst SDK
let catalyst: any = null;

try {
  const catalystSdk = require('zcatalyst-sdk-node');
  catalyst = catalystSdk;
} catch (error) {
  console.warn('Catalyst SDK not available in browser environment');
}

/**
 * Catalyst Cloud Scale Services
 */
export class CatalystCloudScale {
  private static instance: CatalystCloudScale;
  
  static getInstance(): CatalystCloudScale {
    if (!CatalystCloudScale.instance) {
      CatalystCloudScale.instance = new CatalystCloudScale();
    }
    return CatalystCloudScale.instance;
  }

  // Data Store Service
  async getDataStore(tableName: string) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    return catalystApp.datastore().table(tableName);
  }

  // File Store Service
  async getFileStore(folderId: string) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    return catalystApp.filestore().folder(folderId);
  }

  // Cache Service
  async getCache(segmentName: string) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    return catalystApp.cache().segment(segmentName);
  }

  // Search Service
  async getSearch() {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    return catalystApp.search();
  }

  // Mail Service
  async sendMail(mailConfig: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    htmlBody: string;
    textBody?: string;
  }) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    const mail = catalystApp.email();
    
    return mail.sendMail({
      from_email: process.env.CATALYST_FROM_EMAIL,
      to_email: mailConfig.to,
      cc: mailConfig.cc || [],
      bcc: mailConfig.bcc || [],
      subject: mailConfig.subject,
      html_mode: mailConfig.htmlBody,
      content: mailConfig.textBody || mailConfig.htmlBody
    });
  }

  // Push Notifications
  async sendPushNotification(config: {
    title: string;
    body: string;
    data?: any;
    recipients: string[];
  }) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    const push = catalystApp.push();
    
    return push.send({
      message: {
        title: config.title,
        body: config.body,
        data: config.data
      },
      recipients: config.recipients
    });
  }
}

/**
 * Catalyst Serverless Services
 */
export class CatalystServerless {
  private static instance: CatalystServerless;
  
  static getInstance(): CatalystServerless {
    if (!CatalystServerless.instance) {
      CatalystServerless.instance = new CatalystServerless();
    }
    return CatalystServerless.instance;
  }

  // Execute Function
  async executeFunction(functionName: string, data: any) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    const func = catalystApp.function();
    
    return func.execute({
      function_name: functionName,
      arguments: data
    });
  }

  // Circuit Execution
  async executeCircuit(circuitId: string, inputData: any) {
    if (!catalyst) throw new Error('Catalyst SDK not available');
    const catalystApp = catalyst.initialize();
    const circuit = catalystApp.circuit();
    
    return circuit.execute({
      circuit_id: circuitId,
      input: inputData
    });
  }
}

/**
 * Business Logic Interfaces
 */

// CRM Module
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'prospect';
  source?: string;
  created_time?: string;
  modified_time?: string;
}

export interface Deal {
  id?: string;
  name: string;
  customer_id: string;
  amount: number;
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  created_time?: string;
  modified_time?: string;
}

// Support Module
export interface SupportTicket {
  id?: string;
  title: string;
  description: string;
  customer_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_time?: string;
  resolved_time?: string;
}

// HR Module
export interface Employee {
  id?: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  manager_id?: string;
}

// Finance Module
export interface Invoice {
  id?: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_time?: string;
  paid_time?: string;
  line_items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * Unified Business Suite API
 */
export class BusinessSuiteAPI {
  private cloudScale: CatalystCloudScale;
  private serverless: CatalystServerless;

  constructor() {
    this.cloudScale = CatalystCloudScale.getInstance();
    this.serverless = CatalystServerless.getInstance();
  }

  // CRM Operations
  async createCustomer(customer: Customer): Promise<Customer> {
    const table = await this.cloudScale.getDataStore('customers');
    const result = await table.insertRow(customer);
    return result;
  }

  async getCustomers(limit: number = 50): Promise<Customer[]> {
    const table = await this.cloudScale.getDataStore('customers');
    const result = await table.getRows({ max_rows: limit });
    return result;
  }

  async createDeal(deal: Deal): Promise<Deal> {
    const table = await this.cloudScale.getDataStore('deals');
    const result = await table.insertRow(deal);
    return result;
  }

  // Support Operations
  async createSupportTicket(ticket: SupportTicket): Promise<SupportTicket> {
    const table = await this.cloudScale.getDataStore('support_tickets');
    const result = await table.insertRow(ticket);
    
    // Send notification to support team
    await this.cloudScale.sendMail({
      to: [process.env.SUPPORT_EMAIL || 'support@example.com'],
      subject: `New Support Ticket: ${ticket.title}`,
      htmlBody: `
        <h3>New Support Ticket Created</h3>
        <p><strong>Title:</strong> ${ticket.title}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
      `
    });

    return result;
  }

  // HR Operations
  async createEmployee(employee: Employee): Promise<Employee> {
    const table = await this.cloudScale.getDataStore('employees');
    const result = await table.insertRow(employee);
    return result;
  }

  // Finance Operations
  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const table = await this.cloudScale.getDataStore('invoices');
    const result = await table.insertRow(invoice);
    
    // Send invoice email to customer
    const customer = await this.getCustomerById(invoice.customer_id);
    if (customer) {
      await this.cloudScale.sendMail({
        to: [customer.email],
        subject: `Invoice ${invoice.invoice_number}`,
        htmlBody: `
          <h3>Invoice ${invoice.invoice_number}</h3>
          <p>Amount: $${invoice.total_amount}</p>
          <p>Due Date: ${invoice.due_date}</p>
        `
      });
    }

    return result;
  }

  // Utility Methods
  private async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const table = await this.cloudScale.getDataStore('customers');
      const result = await table.getRowById(customerId);
      return result;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  // Analytics & Reporting
  async getDashboardMetrics(): Promise<{
    totalCustomers: number;
    activeDeals: number;
    openTickets: number;
    monthlyRevenue: number;
  }> {
    try {
      const [customers, deals, tickets, invoices] = await Promise.all([
        this.getCustomers(1000),
        this.getDeals(1000),
        this.getSupportTickets(1000),
        this.getInvoices(1000)
      ]);

      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      const monthlyRevenue = invoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.created_time || '');
          return invoiceDate.getMonth() === thisMonth && 
                 invoiceDate.getFullYear() === thisYear &&
                 invoice.status === 'paid';
        })
        .reduce((sum, invoice) => sum + invoice.total_amount, 0);

      return {
        totalCustomers: customers.length,
        activeDeals: deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length,
        openTickets: tickets.filter(ticket => ['open', 'in_progress'].includes(ticket.status)).length,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        totalCustomers: 0,
        activeDeals: 0,
        openTickets: 0,
        monthlyRevenue: 0
      };
    }
  }

  private async getDeals(limit: number = 50): Promise<Deal[]> {
    const table = await this.cloudScale.getDataStore('deals');
    const result = await table.getRows({ max_rows: limit });
    return result;
  }

  private async getSupportTickets(limit: number = 50): Promise<SupportTicket[]> {
    const table = await this.cloudScale.getDataStore('support_tickets');
    const result = await table.getRows({ max_rows: limit });
    return result;
  }

  private async getInvoices(limit: number = 50): Promise<Invoice[]> {
    const table = await this.cloudScale.getDataStore('invoices');
    const result = await table.getRows({ max_rows: limit });
    return result;
  }
}

// Export singleton instance
export const businessSuite = new BusinessSuiteAPI();