import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import API routes
const healthRoutes = require('./app/api/health/route');
const authRoutes = require('./app/api/auth');
const v1Routes = require('./app/api/v1');
const catalystRoutes = require('./app/api/catalyst');
const businessSuiteRoutes = require('./app/api/business-suite');
const webhooksRoutes = require('./app/api/webhooks');
const zohoRoutes = require('./app/api/zoho');

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

// API Routes - Map all existing endpoints
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1', v1Routes);
app.use('/api/catalyst', catalystRoutes);
app.use('/api/business-suite', businessSuiteRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/zoho', zohoRoutes);

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