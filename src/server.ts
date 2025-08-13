import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import API routes - Note: These will be handled by Next.js API routes in production
// This server acts as a backup/development server for API testing

const app = express();

// Middleware Setup
// Enable CORS for all origins
app.use(cors());

// Security middleware
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// API Routes - Unified backend endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'Unified backend server is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Catalyst integration endpoints
app.use('/api/catalyst', (req, res) => {
  res.json({ 
    message: 'Catalyst integration active',
    functions: ['crm-api', 'analytics-engine', 'contact-manager', 'lead-processor', 'quick-actions'],
    status: 'operational'
  });
});

// Business suite proxy endpoints
app.use('/api/business-suite', (req, res) => {
  res.json({ 
    message: 'Business suite API active',
    modules: ['crm', 'finance', 'hr', 'marketing', 'support'],
    status: 'operational'
  });
});

// Zoho integration endpoints
app.use('/api/zoho', (req, res) => {
  res.json({ 
    message: 'Zoho integration active',
    services: ['crm', 'books', 'campaigns'],
    status: 'operational'
  });
});

// Webhook endpoints
app.use('/api/webhooks', (req, res) => {
  res.json({ 
    message: 'Webhook endpoints active',
    endpoints: ['/zoho-crm', '/zoho-books', '/zoho-campaigns', '/zoho-catalyst'],
    status: 'operational'
  });
});

// Auth endpoints
app.use('/api/auth', (req, res) => {
  res.json({ 
    message: 'Authentication service active',
    methods: ['nextauth', 'zoho-oauth'],
    status: 'operational'
  });
});

// V1 API endpoints
app.use('/api/v1', (req, res) => {
  res.json({ 
    message: 'V1 API active',
    endpoints: ['/admin', '/contact', '/employee', '/shift-notes', '/test', '/zoho'],
    status: 'operational'
  });
});

// Fallback API route for testing
app.use('/api', (req, res) => {
  res.json({ 
    message: 'Snug & Kisses CRM API is running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/v1',
      '/api/catalyst',
      '/api/business-suite',
      '/api/webhooks',
      '/api/zoho'
    ]
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Accessible at http://0.0.0.0:${PORT}`);
});