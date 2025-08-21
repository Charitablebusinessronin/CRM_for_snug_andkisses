# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Development:**
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Docker Development (Recommended):**
```bash
docker-setup.bat     # Windows - Start Docker environment
docker-setup.sh      # Linux/Mac - Start Docker environment
docker-compose up -d # Start all services
docker-compose down  # Stop all services
```

**Application Access:**
- Main App: http://localhost:5369
- Admin Dashboard: http://localhost:5369/admin/dashboard
- Health Check: http://localhost:5369/api/health

**Test Commands:**
```bash
npm run test                    # Run all tests (unit + integration)
npm run test:unit              # Jest unit tests
npm run test:integration       # Jest integration tests
npm run test:e2e               # Playwright E2E tests
```

## Architecture Overview

### High-Level System Design
This is a **HIPAA-compliant healthcare CRM system** built with Next.js 15.2.4, designed for postpartum care services management with integrated Zoho One ecosystem.

**Core Architecture:**
- **Frontend:** Next.js 15.2.4 with App Router, React 19, TypeScript
- **Backend:** API routes with Edge Runtime for optimal performance
- **Database:** Zoho CRM integration (primary), PostgreSQL (Docker dev), Redis (sessions)
- **Authentication:** NextAuth with role-based access (admin, employee, contractor, client)
- **Deployment:** Docker containerization, Vercel production ready

### Key Directories Structure
```
app/                    # Next.js App Router
├── api/               # API routes (auth, v1, webhooks, zoho)
├── (auth)/            # Authentication pages (login, forgot-password)
├── admin/             # Admin dashboard
├── contractor/        # Contractor portal
├── employee/          # Employee portal
└── integrations/      # Zoho integration pages

components/            # React components
├── auth/             # Authentication components
├── admin/            # Admin-specific components
├── integrations/     # Zoho sync components
└── ui/               # shadcn/ui components

lib/                   # Core utilities
├── auth.ts           # NextAuth configuration
├── zoho-config.ts    # Zoho API configuration
├── hipaa-audit.ts    # HIPAA compliance logging
└── utils.ts          # General utilities

functions/            # Zoho Catalyst serverless functions
├── auth/             # Authentication functions
├── business-suite/   # CRM, Finance, HR, Marketing
├── clients/          # Client management
└── contractors/      # Contractor management
```

### Role-Based Access System
The system implements a 4-tier role hierarchy:
- **Admin:** Full system access, user management, compliance reporting
- **Employee:** Client management, scheduling, shift notes, service requests
- **Contractor:** Job board access, availability, earnings tracking
- **Client:** Personal dashboard, service history, profile management

### HIPAA Compliance Architecture
- All data access is logged via `lib/hipaa-audit.ts`
- Edge Runtime compatible audit logging for performance
- Secure session management with JWT tokens
- Password hashing with bcryptjs
- Environment-based secret management

### Zoho Integration Pattern
The system integrates with Zoho One ecosystem:
- **CRM:** Contact and lead management
- **Books:** Financial operations
- **Campaigns:** Marketing automation
- **Catalyst:** Serverless backend functions

Integration endpoints follow the pattern: `/api/zoho/{service}` and `/api/webhooks/zoho-{service}`

## Development Patterns

### Component Architecture
- Use shadcn/ui components from `components/ui/`
- Role-specific components in dedicated folders (`components/admin/`, `components/auth/`)
- Reusable business logic in `lib/` utilities

### API Route Structure
```
/api/
├── auth/              # Authentication (login, refresh, forgot-password)
├── v1/                # Versioned API endpoints
│   ├── admin/         # Admin operations
│   ├── employee/      # Employee operations
│   └── contact/       # Contact management
├── webhooks/          # External service webhooks
└── zoho/              # Direct Zoho API integration
```

### Environment Configuration
Required environment variables are defined in:
- Zoho integration: `ZOHO_ONE_CLIENT_ID`, `ZOHO_ONE_CLIENT_SECRET`
- NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Database: `DATABASE_URL` (Docker: PostgreSQL)

### Docker Development Setup
The project uses multi-service Docker composition:
- **Web App:** Next.js on port 5369
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Health Monitoring:** Built-in health checks

## Key Technical Decisions

### Next.js Configuration
- ESLint and TypeScript errors ignored during builds (`next.config.mjs:4-8`)
- Images unoptimized for Docker compatibility
- Edge Runtime used for API routes for optimal performance

### Authentication Flow
- NextAuth with Credentials provider
- JWT session strategy for stateless authentication
- Role information stored in JWT tokens
- Custom signin page at `/auth/signin`

### Zoho Integration Strategy
- Configuration centralized in `lib/zoho-config.ts`
- Typed interfaces for Zoho objects (ZohoContact, ZohoDeal)
- Webhook-based real-time synchronization
- API endpoints structured by Zoho service

### HIPAA Compliance Implementation
- Comprehensive audit logging for all data access
- Secure session management with rotation
- Password security with bcrypt hashing
- Environment-based secret management
- Full audit trail for compliance reporting

## Testing Strategy

Tests are organized by type:
- **Unit tests:** `tests/unit/` - Component and utility testing
- **Integration tests:** `tests/integration/` - API endpoint testing
- **E2E tests:** `tests/e2e/` - Full user workflow testing with Playwright

## Development Notes

- The project prioritizes HIPAA compliance - all data handling must maintain audit trails
- Docker is the recommended development environment (port 5369, never 3000)
- Zoho integration is central to the architecture - check `lib/zoho-config.ts` for API patterns
- Role-based routing is handled in middleware and component-level access controls
- Health monitoring is built-in via `/api/health` endpoint