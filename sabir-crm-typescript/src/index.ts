// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './routes/auth';
import { contactRoutes } from './routes/contacts';
import { leadRoutes } from './routes/leads';
import { zohoRoutes } from './routes/zoho';
import { avatarRoutes } from './routes/avatars';
import { analyticsRoutes } from './routes/analytics';
import { quickActionsRoutes } from './routes/quickActions';
import clientPortalRoutes from './routes/clientPortal';
import { errorHandler } from './middleware/errorHandler';
import { zohoSDK } from './services/ZohoUnifiedSDK';
import { logger } from './utils/logger';
import { hipaaAuditMiddleware } from './middleware/hipaaAudit.middleware';

// Express app with TypeScript
const app = express();
const PORT = Number(process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 4729); // TypeScript CRM on dedicated port

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:4729',
  'http://localhost:5369',
  'http://frontend:3000' // docker compose service name for frontend
];
const envFrontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = envFrontendUrl ? [...defaultOrigins, envFrontendUrl] : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl) or if in list
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// HIPAA audit logging (conditional)
if (String(process.env.HIPAA_AUDIT_LOGGING).toLowerCase() === 'true') {
  app.use(hipaaAuditMiddleware);
  logger.info('HIPAA audit logging enabled');
}

// Routes with TypeScript
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/zoho', zohoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quick-actions', quickActionsRoutes);
app.use('/api/placeholder/avatar', avatarRoutes);
// Client Portal routes
app.use('/api/client', clientPortalRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'Sabir\'s TypeScript CRM API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    zohoEnvironment: process.env.ZOHO_ENVIRONMENT || 'sandbox'
  };
  
  logger.info('Health check requested', { healthData });
  res.json(healthData);
});

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sabir\'s TypeScript CRM API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      },
      contacts: {
        list: 'GET /api/contacts',
        create: 'POST /api/contacts',
        get: 'GET /api/contacts/:id',
        update: 'PUT /api/contacts/:id',
        delete: 'DELETE /api/contacts/:id'
      },
      leads: {
        list: 'GET /api/leads',
        create: 'POST /api/leads',
        get: 'GET /api/leads/:id',
        update: 'PUT /api/leads/:id',
        delete: 'DELETE /api/leads/:id'
      }
    }
  });
});

// Root endpoint - API welcome page
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Sabir\'s TypeScript CRM API',
    version: '1.0.0',
    author: 'Sabir Asheed',
    description: 'Healthcare CRM with HIPAA compliance and Zoho integration',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      documentation: '/api',
      health: '/health',
      auth: '/api/auth/*',
      contacts: '/api/contacts/*',
      leads: '/api/leads/*',
      zoho: '/api/zoho/*',
      analytics: '/api/analytics/*',
      quickActions: '/api/quick-actions/*',
      clientPortal: '/api/client/*'
    },
    features: [
      'HIPAA Compliance',
      'Zoho Integration',
      'TypeScript Backend',
      'Express.js API',
      'JWT Authentication',
      'Rate Limiting',
      'CORS Support',
      'Audit Logging'
    ]
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 Sabir's TypeScript CRM API running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API docs: http://localhost:${PORT}/api`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔐 Zoho Environment: ${process.env.ZOHO_ENVIRONMENT || 'sandbox'}`);
  
  // Initialize Zoho SDK on startup
  try {
    await zohoSDK.initialize();
    logger.info('🔗 Zoho SDK initialized successfully');
  } catch (error) {
    logger.warn('⚠️ Zoho SDK initialization failed - API will work with manual initialization', error);
  }
});

export default app;