const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const catalyst = require('zcatalyst-sdk-node');
require('dotenv').config();

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for Next.js frontend (env-driven allowlist)
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or explicit allowlist
    if (!origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-request-id']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for AI-intensive ZIA endpoints
const ziaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // tighter per-minute limit
  message: {
    error: 'Too many requests to AI endpoints, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/zia/', ziaLimiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
    }
  }
});

// Additional rate limit specifically for health checks to avoid abuse
const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: 'Too many health checks, throttled.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/health', healthLimiter);

// Health check endpoint (minimal info, no-store)
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'healthy',
    service: 'Snug & Kisses CRM Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Snug & Kisses CRM Backend API',
    version: '1.0.0',
    framework: 'Express.js',
    node_version: process.version,
    endpoints: {
      health: '/health',
      crm: '/api/crm/*',
      zia: '/api/zia/*',
      quickActions: '/api/quick-actions/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Catalyst initialization utility
function initializeCatalyst(req) {
  try {
    // Check if running in Catalyst environment
    if (process.env.CATALYST_PROJECT_ID && process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
      return catalyst.initialize(req);
    } else {
      console.warn('Catalyst environment not detected - using mock mode');
      return null;
    }
  } catch (error) {
    console.error('Catalyst initialization error:', error);
    return null;
  }
}

// Audit logging utility
async function logAuditEvent(req, eventData) {
  try {
    const zcatalyst = initializeCatalyst(req);
    if (zcatalyst) {
      const datastore = zcatalyst.datastore();
      const auditTable = datastore.table('AuditLog');
      
      await auditTable.insertRecord({
        ...eventData,
        userId: req.headers['x-user-id'] || 'anonymous',
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] || require('uuid').v4(),
        timestamp: new Date().toISOString(),
        component: 'EXPRESS_BACKEND'
      });
    } else {
      // Log to console in development mode
      console.log('AUDIT LOG (DEV MODE):', {
        ...eventData,
        userId: req.headers['x-user-id'] || 'anonymous',
        timestamp: new Date().toISOString(),
        component: 'EXPRESS_BACKEND'
      });
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}

// ===== CRM ENDPOINTS =====

// Get all contacts
app.get('/api/crm/contacts', async (req, res) => {
  try {
    const zcatalyst = initializeCatalyst(req);
    const { page = 1, limit = 50, search } = req.query;
    
    let contacts = [];
    
    if (zcatalyst) {
      // Production mode with Catalyst
      const datastore = zcatalyst.datastore();
      const contactsTable = datastore.table('Contacts');
      const offset = (page - 1) * limit;
      
      let query = `SELECT * FROM Contacts`;
      if (search) {
        query += ` WHERE first_name LIKE '%${search}%' OR last_name LIKE '%${search}%' OR email LIKE '%${search}%'`;
      }
      query += ` ORDER BY created_time DESC LIMIT ${limit} OFFSET ${offset}`;
      
      contacts = await datastore.executeZCQLQuery(query);
    } else {
      // Development mode with mock data
      const mockContacts = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-123-4567',
          company: 'Healthcare Solutions Inc',
          created_time: new Date().toISOString()
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@medical.com',
          phone: '+1-555-987-6543',
          company: 'Medical Center Group',
          created_time: new Date().toISOString()
        },
        {
          id: '3',
          first_name: 'Dr. Michael',
          last_name: 'Johnson',
          email: 'dr.johnson@clinic.org',
          phone: '+1-555-456-7890',
          company: 'Johnson Family Clinic',
          created_time: new Date().toISOString()
        }
      ];
      
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        contacts = mockContacts.filter(contact => 
          contact.first_name.toLowerCase().includes(searchLower) ||
          contact.last_name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower)
        );
      } else {
        contacts = mockContacts;
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      contacts = contacts.slice(startIndex, startIndex + parseInt(limit));
    }
    
    await logAuditEvent(req, {
      action: 'GET_CONTACTS',
      details: { page, limit, search, count: contacts.length, mode: zcatalyst ? 'catalyst' : 'mock' }
    });
    
    res.status(200).json({
      success: true,
      data: contacts,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
      mode: zcatalyst ? 'catalyst' : 'development',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get contacts error:', error);
    await logAuditEvent(req, {
      action: 'GET_CONTACTS_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create new contact
app.post('/api/crm/contacts', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }
    
    const contactData = {
      ...req.body,
      created_time: new Date().toISOString(),
      modified_time: new Date().toISOString()
    };

    let newContact;

    // Try Catalyst integration first
    try {
      if (process.env.CATALYST_PROJECT_ID && process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
        const zcatalyst = catalyst.initialize(req);
        const datastore = zcatalyst.datastore();
        const contactsTable = datastore.table('Contacts');
        newContact = await contactsTable.insertRecord(contactData);
      } else {
        // Fallback to mock response for development
        newContact = {
          id: Date.now().toString(),
          ...contactData,
          ROWID: Date.now().toString()
        };
      }
    } catch (error) {
      console.log('Catalyst unavailable, using mock response:', error.message);
      // Fallback to mock response
      newContact = {
        id: Date.now().toString(),
        ...contactData,
        ROWID: Date.now().toString()
      };
    }
    
    await logAuditEvent(req, {
      action: 'CREATE_CONTACT',
      contactId: newContact.id,
      details: { email: contactData.email, name: `${contactData.first_name} ${contactData.last_name}` }
    });
    
    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Create contact error:', error);
    await logAuditEvent(req, {
      action: 'CREATE_CONTACT_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create contact',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ZIA AI ENDPOINTS =====

// Zia OCR - Extract business card
app.post('/api/zia/ocr/business-card', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }
    
    const zcatalyst = catalyst.initialize(req);
    const zia = zcatalyst.zia();
    
    // Convert buffer to stream for Zia OCR
    const { Readable } = require('stream');
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);
    
    const ocrResult = await zia.extractOpticalCharacters(fileStream, {
      modelType: 'OCR',
      language: 'eng'
    });
    
    const extractedText = ocrResult.predictions?.[0]?.text || '';
    const contactData = parseBusinessCardText(extractedText);
    const confidence = ocrResult.predictions?.[0]?.confidence || 0;
    
    await logAuditEvent(req, {
      action: 'ZIA_OCR_BUSINESS_CARD',
      details: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        confidence,
        extractedFieldsCount: Object.keys(contactData).length
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        extractedText,
        contactData,
        confidence,
        fileName: req.file.originalname
      },
      message: 'Business card processed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Zia OCR error:', error);
    await logAuditEvent(req, {
      action: 'ZIA_OCR_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'OCR processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create lead from OCR data
app.post('/api/zia/ocr/create-lead', [
  body('contactData').isObject().withMessage('Contact data is required'),
  body('confidence').isNumeric().withMessage('Confidence score is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }
    
    const { contactData, sourceFile, confidence } = req.body;
    
    const zcatalyst = catalyst.initialize(req);
    const datastore = zcatalyst.datastore();
    const leadsTable = datastore.table('Leads');
    
    // Prepare lead data
    const leadData = {
      first_name: contactData.firstName || contactData.name?.split(' ')[0] || '',
      last_name: contactData.lastName || contactData.name?.split(' ').slice(1).join(' ') || '',
      company: contactData.company || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      lead_source: 'Business Card OCR',
      lead_status: 'New',
      description: `Lead created from OCR extraction. Confidence: ${confidence}%`,
      ocr_confidence: confidence,
      ocr_source_file: sourceFile || 'unknown',
      created_time: new Date().toISOString(),
      modified_time: new Date().toISOString()
    };
    
    // Check for duplicates
    const existingLeads = await datastore.executeZCQLQuery(
      `SELECT * FROM Leads WHERE email = '${leadData.email}' OR phone = '${leadData.phone}' LIMIT 1`
    );
    
    let result;
    let action;
    
    if (existingLeads.length > 0) {
      // Update existing lead
      const existingLead = existingLeads[0];
      const updatedData = {
        ...leadData,
        id: existingLead.id,
        lead_status: 'Updated via OCR'
      };
      
      result = await leadsTable.updateRecord(updatedData);
      action = 'updated';
    } else {
      // Create new lead
      result = await leadsTable.insertRecord(leadData);
      action = 'created';
    }
    
    await logAuditEvent(req, {
      action: 'LEAD_FROM_OCR',
      leadId: result.id,
      details: { action, confidence, sourceFile }
    });
    
    res.status(action === 'created' ? 201 : 200).json({
      success: true,
      data: result,
      action,
      message: `Lead ${action} successfully from OCR data`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Create lead from OCR error:', error);
    await logAuditEvent(req, {
      action: 'LEAD_FROM_OCR_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create lead from OCR data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== QUICK ACTIONS ENDPOINTS =====

// Get recent notes
app.get('/api/quick-actions/recent-notes', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const zcatalyst = catalyst.initialize(req);
    const datastore = zcatalyst.datastore();
    
    const notes = await datastore.executeZCQLQuery(
      `SELECT * FROM Notes ORDER BY created_time DESC LIMIT ${limit}`
    );
    
    await logAuditEvent(req, {
      action: 'GET_RECENT_NOTES',
      details: { limit, count: notes.length }
    });
    
    res.status(200).json({
      success: true,
      data: notes,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get recent notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent notes',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== FINANCE ENDPOINTS ====================

// Get invoices
app.get('/api/finance/invoices', async (req, res) => {
  try {
    const { page = 1, limit = 50, status = '' } = req.query;
    
    let invoices = [];
    
    // Try Catalyst integration first
    try {
      if (process.env.CATALYST_PROJECT_ID && process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
        const zcatalyst = catalyst.initialize(req);
        const datastore = zcatalyst.datastore();
        const invoicesTable = datastore.table('Invoices');
        
        let query = `SELECT * FROM Invoices ORDER BY created_time DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
        if (status) {
          query = `SELECT * FROM Invoices WHERE status = '${status}' ORDER BY created_time DESC LIMIT ${limit}`;
        }
        
        const results = await datastore.executeZCQLQuery(query);
        invoices = results;
      } else {
        // Fallback to mock invoice data for development
        invoices = [
          {
            id: '1',
            invoiceNumber: 'INV-001',
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            customerCompany: 'Healthcare Solutions Inc',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: 500.00,
            tax: 40.00,
            total: 540.00,
            status: 'sent',
            items: [
              { description: 'Postpartum Care Session', quantity: 2, rate: 250.00, amount: 500.00 }
            ],
            created_time: new Date().toISOString()
          },
          {
            id: '2',
            invoiceNumber: 'INV-002',
            customerName: 'Jane Smith',
            customerEmail: 'jane.smith@medical.com',
            customerCompany: 'Medical Center Group',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: 750.00,
            tax: 60.00,
            total: 810.00,
            status: 'paid',
            items: [
              { description: 'Lactation Consultation', quantity: 3, rate: 250.00, amount: 750.00 }
            ],
            created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        // Apply status filter
        if (status) {
          invoices = invoices.filter(inv => inv.status === status);
        }
      }
    } catch (error) {
      console.log('Catalyst unavailable, using mock invoice data:', error.message);
      // Fallback to mock data (same as above)
      invoices = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          customerCompany: 'Healthcare Solutions Inc',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: 500.00,
          tax: 40.00,
          total: 540.00,
          status: 'sent',
          items: [
            { description: 'Postpartum Care Session', quantity: 2, rate: 250.00, amount: 500.00 }
          ],
          created_time: new Date().toISOString()
        }
      ];
    }
    
    await logAuditEvent(req, {
      action: 'GET_INVOICES',
      details: { page, limit, status, count: invoices.length }
    });
    
    res.status(200).json({
      success: true,
      data: invoices,
      total: invoices.length,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get invoices error:', error);
    await logAuditEvent(req, {
      action: 'GET_INVOICES_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create invoice
app.post('/api/finance/invoices', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('items').isArray().withMessage('Items array is required'),
  body('total').isNumeric().withMessage('Total amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }
    
    const invoiceData = {
      ...req.body,
      created_time: new Date().toISOString(),
      modified_time: new Date().toISOString()
    };
    
    let newInvoice;
    
    // Try Catalyst integration first
    try {
      if (process.env.CATALYST_PROJECT_ID && process.env.X_ZOHO_CATALYST_LISTEN_PORT) {
        const zcatalyst = catalyst.initialize(req);
        const datastore = zcatalyst.datastore();
        const invoicesTable = datastore.table('Invoices');
        newInvoice = await invoicesTable.insertRecord(invoiceData);
      } else {
        // Fallback to mock response for development
        newInvoice = {
          id: Date.now().toString(),
          ...invoiceData,
          ROWID: Date.now().toString()
        };
      }
    } catch (error) {
      console.log('Catalyst unavailable, using mock response:', error.message);
      // Fallback to mock response
      newInvoice = {
        id: Date.now().toString(),
        ...invoiceData,
        ROWID: Date.now().toString()
      };
    }
    
    await logAuditEvent(req, {
      action: 'CREATE_INVOICE',
      invoiceId: newInvoice.id,
      details: { 
        invoiceNumber: invoiceData.invoiceNumber,
        customer: invoiceData.customerName,
        total: invoiceData.total
      }
    });
    
    res.status(201).json({
      success: true,
      data: newInvoice,
      message: 'Invoice created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Create invoice error:', error);
    await logAuditEvent(req, {
      action: 'CREATE_INVOICE_ERROR',
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  const isProd = process.env.NODE_ENV === 'production';
  const genericMessage = isProd ? 'An error occurred' : (error && error.message) || 'Unknown error';
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: genericMessage,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Versioned alias for ZIA endpoints to maintain compatibility
app.use('/api/v1/zia', (req, res) => {
  const target = req.originalUrl.replace('/api/v1/zia', '/api/zia');
  // Preserve method/body for POST by using 307 Temporary Redirect
  return res.redirect(307, target);
});

// Business card text parsing utility
function parseBusinessCardText(text) {
  const contactData = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Email extraction
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    contactData.email = emailMatch[0];
  }
  
  // Phone extraction
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    contactData.phone = phoneMatch[0];
  }
  
  // Website extraction
  const websiteRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
  const websiteMatch = text.match(websiteRegex);
  if (websiteMatch) {
    contactData.website = websiteMatch[0];
  }
  
  // Name extraction (first proper case line)
  const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/;
  for (const line of lines) {
    if (nameRegex.test(line) && !contactData.name) {
      contactData.name = line;
      const nameParts = line.split(' ');
      contactData.firstName = nameParts[0];
      contactData.lastName = nameParts.slice(1).join(' ');
      break;
    }
  }
  
  // Company extraction
  const businessKeywords = ['LLC', 'Inc', 'Corp', 'Company', 'Ltd', 'Group'];
  for (const line of lines) {
    if (businessKeywords.some(keyword => line.includes(keyword)) && !contactData.company) {
      contactData.company = line;
      break;
    }
  }
  
  return contactData;
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Snug & Kisses CRM Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
