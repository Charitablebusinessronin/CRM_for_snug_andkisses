# 🚀 Catalyst Deployment Guide - Snug & Kisses CRM

**FROM:** Steve Patel - Project Director
**TO:** Sabir Asheed
**RE:** Complete Catalyst Deployment Strategy

---
## 🎯 CATALYST DEPLOYMENT OVERVIEW
Your dual-service architecture is perfectly designed for Catalyst:
- Frontend Service: Next.js with API routes (Port 5369)
- Backend Service: Express API with Zoho integrations (Port 4728)

---
## 📋 PRE-DEPLOYMENT CHECKLIST
### ✅ What You Already Have
- Docker containers built and tested
- Frontend Next.js app with API routes
- Backend Express API with client portal routes
- Environment variables configured
- CORS properly set between services

### 🔧 What We Need to Add
- Catalyst configuration files
- Service definitions
- Environment variable mapping
- Deployment scripts

---
## 🚀 STEP 1: CATALYST PROJECT INITIALIZATION
Install Catalyst CLI and login:
```bash
npm install -g zoho-catalyst-cli
catalyst login
```
Initialize project:
```bash
cd /path/to/CRM_for_snug_andkisses
catalyst init
```

---
## 🏗️ STEP 2: CATALYST PROJECT STRUCTURE
```text
CRM_for_snug_andkisses/
├── catalyst-config.json
├── functions/
│   └── crm_backend/
│       ├── index.js
│       ├── package.json
│       └── catalyst-config.json
├── client/
│   ├── build/
│   └── catalyst-config.json
└── resources/
    ├── datastore/
    └── filestore/
```

---
## ⚙️ STEP 3: BACKEND SERVICE CONFIGURATION
`functions/crm_backend/catalyst-config.json`:
```json
{
  "type": "function",
  "source": "../../sabir-crm-typescript/dist",
  "name": "crm_backend",
  "description": "CRM Backend with Zoho Integrations",
  "runtime": "nodejs18",
  "memory": 512,
  "timeout": 300,
  "environment": {
    "NODE_ENV": "production",
    "PORT": "4728",
    "ZOHO_ENVIRONMENT": "production",
    "HIPAA_AUDIT_LOGGING": "true"
  },
  "triggers": [
    { "type": "http", "path": "/api/*" }
  ]
}
```

`functions/crm_backend/package.json`:
```json
{
  "name": "crm-backend",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "winston": "^3.10.0",
    "express-rate-limit": "^6.8.1"
  }
}
```

---
## 🎨 STEP 4: FRONTEND SERVICE CONFIGURATION
`client/catalyst-config.json` (example):
```json
{
  "type": "web-client",
  "source": "../out",
  "name": "snug_kisses_portal",
  "description": "Client Portal Frontend",
  "build_command": "npm run build && npm run export"
}
```

`next.config.js` adjustments:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
};
module.exports = nextConfig;
```

---
## 🔧 STEP 5: MAIN CATALYST CONFIG
`catalyst-config.json` (root):
```json
{
  "project_name": "snug-kisses-crm",
  "project_id": "your-project-id",
  "domain": "com",
  "environment": "production",
  "services": {
    "functions": [ { "source": "functions/crm_backend", "name": "crm_backend" } ],
    "client": { "source": "client", "name": "snug_kisses_portal" }
  },
  "resources": { "datastore": true, "filestore": true, "authentication": true }
}
```

---
## 🚀 STEP 6: DEPLOYMENT COMMANDS
```bash
# Build frontend
npm run build && npm run export

# Build backend
cd sabir-crm-typescript && npm run build && cd ..

# Deploy
catalyst deploy && catalyst status
```

---
## 🔐 STEP 7: ENVIRONMENT VARIABLES
```bash
catalyst config set ZOHO_CLIENT_ID "..."
catalyst config set ZOHO_CLIENT_SECRET "..."
catalyst config set ZOHO_REFRESH_TOKEN "..."
catalyst config set JWT_PRIVATE_KEY "..."
catalyst config set JWT_PUBLIC_KEY "..."
```

---
## 🌐 STEP 8: CUSTOM DOMAIN & HTTPS
```bash
catalyst domain add your-domain.com
```

---
## 🧪 STEP 9: TESTING DEPLOYMENT
- Backend Health: https://<app>.catalystserverless.com/server/crm_backend/health
- Frontend: https://<app>.catalystserverless.com/app/snug_kisses_portal

---
## 📊 STEP 10: MONITORING & SCALING
```bash
catalyst metrics
catalyst alerts create --service crm_backend --threshold 80
catalyst scale set --service crm_backend --min 1 --max 10
```

---
## ⚡ QUICK DEPLOYMENT SCRIPT
`deploy.sh`:
```bash
#!/bin/bash
npm run build && npm run export
cd sabir-crm-typescript && npm run build && cd ..
catalyst deploy
catalyst info --url
```

---
## 🎯 EXPECTED RESULT
- Frontend URL and Backend API available on Catalyst
- Auto-scaling and HTTPS enabled
- Real-time metrics and logs accessible


