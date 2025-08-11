const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const catalyst = require('zcatalyst-sdk-node');
const { HIPAAAuditLogger } = require('./utils/hipaa-audit-logger');

const app = express();
const PORT = process.env.PORT || 9000;

// Security headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  })
);

app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Initialize Catalyst SDK (best-effort)
try {
  catalyst.initialize({
    projectId: process.env.CATALYST_PROJECT_ID,
    projectKey: process.env.CATALYST_PROJECT_KEY,
    projectDomain: process.env.CATALYST_PROJECT_DOMAIN,
    environment: process.env.CATALYST_ENVIRONMENT || 'development',
  });
  console.log('✅ Catalyst SDK initialized successfully');
} catch (error) {
  console.error('❌ Catalyst SDK initialization failed:', error?.message || error);
}

// Routes
app.use('/api', require('./routes/api'));
app.use('/avatar', require('./routes/avatar'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Snug & Kisses CRM Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Node.js version: ${process.version}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
