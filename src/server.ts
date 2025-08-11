import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { envConfig } from './config/env-config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { contactRoutes } from './routes/contacts';
import { leadRoutes } from './routes/leads';
import { zohoRoutes } from './routes/zoho';

const app = express();
const PORT = envConfig.PORT || 4728;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? envConfig.ALLOWED_ORIGINS?.split(',')
    : ['http://localhost:3000', 'http://localhost:4728'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/zoho', zohoRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Sabir's TypeScript CRM API is running",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-typescript',
    uptime: process.uptime()
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Sabir CRM TypeScript API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'POST /api/auth/login - User authentication',
      'GET /api/contacts - List contacts',
      'POST /api/contacts - Create contact',
      'GET /api/leads - List leads',
      'POST /api/leads - Create lead',
      'GET /api/zoho/sync - Sync status'
    ]
  });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Sabir's TypeScript CRM API started`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    logger.info(`📋 API info: http://localhost:${PORT}/api`);
    logger.info(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
