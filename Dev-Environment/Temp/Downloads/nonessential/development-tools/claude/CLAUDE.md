# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server with Turbo
npm run dev

# Build the application
npm run build

# Production start
npm run start

# Linting
npm run lint

# Type checking
npm run type-check

# Clean build artifacts
npm run clean

# Bundle analysis
npm run build:analyze
```

### Testing
```bash
# End-to-end tests with Playwright
npm run test:e2e

# E2E tests in Docker environment
npm run test:e2e:docker
```

### Docker Development (Recommended)
The project is configured for Docker development on port 5369:
```bash
# Windows
docker-setup.bat

# Linux/Mac
chmod +x docker-setup.sh && ./docker-setup.sh
```

Access points:
- Main App: http://localhost:5369
- Admin Dashboard: http://localhost:5369/admin/dashboard
- Health Check: http://localhost:5369/api/health

## Architecture Overview

### Project Structure
This is a Next.js 15 application using App Router with the following key architecture:

- **Frontend**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Hybrid approach using both Zoho Catalyst serverless functions and direct API integration
- **Database**: Zoho CRM, Books, Campaigns via API integration
- **Authentication**: Custom JWT-based system with role-based access control
- **UI Components**: shadcn/ui with Radix primitives for accessibility

### Core Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components using shadcn/ui patterns
- `lib/` - Utility functions, API clients, and shared logic
- `functions/` - Zoho Catalyst serverless functions for backend operations
- `public/` - Static assets

### Key Integration Patterns

#### Zoho Integration Architecture
The system uses a hybrid approach for Zoho integration:

1. **Direct API Integration** (`lib/zoho-crm-enhanced.ts`):
   - Rate-limited requests with exponential backoff
   - Comprehensive error handling and retry logic
   - HIPAA audit logging for all operations
   - Token refresh management with 1-minute buffer

2. **Catalyst Serverless Functions** (`functions/`):
   - Native Zoho ecosystem integration
   - Business-specific logic in modular functions
   - Healthcare CRM operations, HR, finance, marketing modules

#### HIPAA Compliance Framework
- All API operations are logged via `lib/hipaa-audit-edge.ts`
- Middleware enforces strict CORS and security headers
- Edge-compatible audit logging for Vercel deployment
- PHI encryption utilities available in `lib/phi-encryption.ts`

#### Authentication & Security
- Custom JWT middleware in `lib/auth-middleware.ts`
- Role-based access control throughout the application
- Strict CSP headers and HIPAA-compliant security policies
- Rate limiting and DDoS protection via middleware

### Environment Configuration
The system uses a centralized configuration pattern:
- Environment validation in `lib/env-config.ts`
- Supports multiple Zoho credential sources
- Development vs. production URL switching
- Feature toggles for HIPAA compliance features

### API Design Patterns
API routes follow RESTful conventions:
- `/api/v1/` prefix for versioned endpoints
- Consistent error handling and response formatting
- Request/response logging for audit compliance
- Type-safe request/response interfaces

### Component Patterns
- Uses shadcn/ui component patterns consistently
- Form validation with React Hook Form + Zod
- Responsive design with Tailwind CSS
- Accessibility-first approach with Radix primitives

## Development Workflow

### Working with Zoho Integration
1. Always use the `zohoCRM` singleton from `lib/zoho-crm-enhanced.ts`
2. New Zoho operations should include HIPAA audit logging
3. Test rate limiting behavior during development
4. Use Catalyst functions for complex business logic

### Adding New Features
1. Follow the existing component patterns in `components/`
2. Use TypeScript interfaces for all data structures
3. Implement proper error boundaries and loading states
4. Add audit logging for any PHI data operations

### Security Considerations
- Never commit API keys or tokens to the repository
- All sensitive operations must include audit logging
- Use the PHI encryption utilities for healthcare data
- Follow CORS restrictions in middleware configuration

### Testing
- E2E tests are configured with Playwright
- Test Docker environment matches production setup
- Health check endpoints available for monitoring

## Key Files to Understand

- `middleware.ts` - Security, CORS, and audit logging
- `lib/zoho-crm-enhanced.ts` - Primary Zoho API client with rate limiting
- `lib/env-config.ts` - Environment validation and configuration
- `lib/hipaa-audit.ts` - HIPAA compliance audit logging
- `functions/` - Zoho Catalyst serverless backend functions

## Node.js Requirements
- Node.js >= 20.0.0
- npm >= 10.0.0