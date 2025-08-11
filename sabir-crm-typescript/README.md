# 🚀 Sabir's TypeScript CRM API

**A production-ready CRM API built with TypeScript + Express.js + Zoho CRM SDK v7.0 + Catalyst**

Built following Steven Patel's detailed specifications for **100% TypeScript implementation** with **zero JavaScript dependencies**.

## ✅ Key Features

- **100% TypeScript Implementation** - No plain JavaScript files
- **Express.js with Full Type Safety** - All routes, middleware, and responses typed
- **Port 4728** - Sabir's preferred development port
- **Zoho CRM SDK v7.0** - Official SDK with TypeScript support
- **Catalyst Native Deployment** - Functions deploy directly to Catalyst
- **HIPAA Compliant** - Audit logging and security features
- **Production Ready** - Comprehensive error handling and monitoring

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **CRM Integration**: Zoho CRM SDK v7.0
- **Authentication**: JWT with role-based access control
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate limiting
- **Deployment**: Zoho Catalyst Functions

### Project Structure
```
src/
├── index.ts                 # Main Express application
├── types/
│   └── index.ts            # TypeScript interfaces and types
├── middleware/
│   ├── auth.ts             # Authentication middleware
│   └── errorHandler.ts     # Error handling middleware
├── routes/
│   ├── auth.ts             # Authentication routes
│   ├── contacts.ts         # Contact management routes
│   └── leads.ts            # Lead management routes
├── utils/
│   └── logger.ts           # Winston logger configuration
└── test-server.ts          # Comprehensive API testing
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Zoho Developer Account
- Zoho CRM credentials

### Installation

1. **Install dependencies**
   ```bash
   cd sabir-crm-typescript
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Zoho credentials
   ```

3. **Build TypeScript**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be running at: **http://localhost:4728**

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Testing
npm run test         # Run Jest tests
npm run test:server  # Run comprehensive API endpoint tests

# Code Quality
npm run lint         # ESLint code analysis
npm run type-check   # TypeScript type checking

# Deployment
npm run deploy       # Build and deploy to Catalyst
```

## 🔌 API Endpoints

### Health & Documentation
- `GET /health` - Health check endpoint
- `GET /api` - API documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token validity

### Contacts
- `GET /api/contacts` - List contacts with pagination
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get single contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts/search/:query` - Search contacts

### Leads
- `GET /api/leads` - List leads with pagination
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert lead to contact
- `GET /api/leads/search/:query` - Search leads
- `GET /api/leads/stats/overview` - Lead statistics

### Zoho Integration (NEW)
- `GET /api/zoho/health` - Zoho services health check
- `POST /api/zoho/sync` - Trigger data synchronization
- `GET /api/zoho/crm/:module` - Get CRM records by module
- `POST /api/zoho/crm/records` - Create CRM record
- `PUT /api/zoho/crm/records` - Update CRM record
- `DELETE /api/zoho/crm/:module/:recordId` - Delete CRM record
- `GET /api/zoho/books/organizations` - Get Books organizations
- `POST /api/zoho/books/invoices` - Create Books invoice
- `GET /api/zoho/analytics/workspaces` - Get Analytics workspaces
- `GET /api/zoho/modules` - List available CRM modules
- `POST /api/zoho/test-connection` - Test Zoho API connectivity

## 🔐 Authentication

The API uses JWT-based authentication with role-based access control:

### Roles
- **admin** - Full access to all resources
- **employee** - Read/write access to CRM data
- **contractor** - Limited access to assigned data
- **user** - Basic read access
- **client** - Access to own data only

### Usage
```bash
# Register new user
curl -X POST http://localhost:4728/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe","role":"user"}'

# Login
curl -X POST http://localhost:4728/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4728/api/contacts
```

## 🧪 Testing

### Comprehensive API Testing
```bash
npm run test:server
```

This runs a comprehensive test suite including:
- ✅ Health check validation
- ✅ Authentication flow testing
- ✅ Protected endpoint access
- ✅ CRUD operations validation
- ✅ Error handling verification
- ✅ Performance testing
- ✅ Memory usage monitoring

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:4728/health

# Test contact creation (requires auth token)
curl -X POST http://localhost:4728/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"First_Name":"Test","Last_Name":"User","Email":"test@example.com"}'
```

## 🚀 Deployment

### Catalyst Deployment
```bash
npm run deploy
```

This will:
1. Build TypeScript to JavaScript
2. Deploy functions to Zoho Catalyst
3. Configure environment variables
4. Set up health checks and monitoring

### Environment Configuration
Required environment variables:
```env
# Server
PORT=4728
NODE_ENV=production

# Zoho CRM
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_ENVIRONMENT=production

# JWT
JWT_PRIVATE_KEY=your_private_key
JWT_PUBLIC_KEY=your_public_key
JWT_REFRESH_SECRET=your_refresh_secret
```

## 📊 Success Criteria ✅

### Day 1 Checklist
- ✅ TypeScript project initialized with proper tsconfig.json
- ✅ Express.js server running on port 4728 with TypeScript
- ✅ All routes properly typed with interfaces
- ✅ Authentication middleware implemented with TypeScript
- ✅ Zoho CRM SDK integrated with TypeScript types
- ✅ Health endpoint responding with TypeScript response types
- ✅ Zero JavaScript files - 100% TypeScript implementation

### Day 2 Checklist
- ✅ Catalyst configuration completed
- ✅ Build script successfully compiling TypeScript to JavaScript
- ✅ Environment variables properly configured
- ✅ Contact CRUD operations fully functional
- ✅ Error handling with typed responses
- ✅ Ready for Catalyst deployment

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing protection
- **Rate Limiting** - DDoS protection
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Zod schema validation
- **Error Handling** - Secure error responses
- **Audit Logging** - Request/response tracking

## 📈 Monitoring

- **Health Checks** - `/health` endpoint
- **Memory Monitoring** - Process memory usage
- **Performance Metrics** - Request timing
- **Error Tracking** - Comprehensive error logging
- **Uptime Monitoring** - Server availability

## 🎯 Performance

- **Port 4728** - Optimized for Sabir's infrastructure
- **TypeScript Compilation** - Build-time optimizations
- **Express.js** - High-performance web framework
- **Connection Pooling** - Efficient resource usage
- **Caching Support** - Redis integration ready

---

**Built by:** Development Team  
**For:** Sabir Asheed  
**Supervised by:** Steve Patel, Zoho Solutions Director  
**Date:** August 9, 2025  
**Status:** Production Ready ✅