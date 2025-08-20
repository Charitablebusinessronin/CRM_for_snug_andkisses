# Snuggs & Kisses CRM - Next.js Frontend

This is a [Next.js](https://nextjs.org) project for the Snuggs & Kisses CRM system, featuring Zoho Catalyst Embedded Auth SDK v4 integration.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Zoho Catalyst project with Embedded Authentication enabled
- Environment variables configured (see `.env.example`)

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Fill in your Zoho Catalyst credentials:
```bash
# Zoho Catalyst Embedded Auth SDK v4 Configuration
NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_DOMAIN=your-project.catalyst.zoho.com
NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_APP_ID=your-app-id
NEXT_PUBLIC_CATALYST_EMBEDDED_AUTH_REDIRECT_URI=http://localhost:3000/signin/callback
NEXT_PUBLIC_ZOHO_REGION=US

# Development bypass (remove in production)
NEXT_PUBLIC_DEV_BYPASS_AUTH=0
```

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Authentication & Authorization
- **Zoho Catalyst Embedded Auth SDK v4** integration
- **Multi-Factor Authentication (MFA)** support
- **Role-Based Access Control (RBAC)** with middleware enforcement
- **Session management** with secure HTTP-only cookies

### User Roles
- **Admin**: Full system access
- **Client**: Care plan management, service requests
- **Employee**: Internal operations
- **Contractor**: Service delivery

### Observability
- **Structured logging** with configurable levels
- **Audit trails** for user actions and system events
- **Error tracking** with context preservation
- **Performance monitoring** hooks

## Architecture

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (dev stubs)
│   ├── admin-dashboard/   # Admin portal
│   ├── client-dashboard/  # Client portal
│   ├── employee-dashboard/# Employee portal
│   └── contractor-dashboard/ # Contractor portal
├── lib/                   # Shared utilities
│   ├── auth/             # Authentication client
│   ├── rbac/             # Role-based access control
│   └── observability/    # Logging and monitoring
└── services/             # API service layer
    └── api/              # HTTP client and contracts
```

### Security Features
- **Route protection** via middleware
- **MFA enforcement** for protected routes
- **Secure cookie handling** (HTTP-only, path-restricted)
- **Environment variable validation**

## Development Notes

### Current Status
- ✅ Next.js scaffold with TypeScript + Tailwind
- ✅ Embedded Auth SDK v4 integration (dev-ready)
- ✅ RBAC + MFA enforcement
- ✅ Observability hooks and audit trails
- 🔄 Zoho Catalyst function integration (in progress)
- 🔄 CI/CD pipeline setup (Bobo)

### Next Steps
1. **Deploy to testing environment** when CI/CD is ready
2. **QA testing** by James (pause deploys after test deployment)
3. **Production deployment** after QA approval

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Zoho Catalyst Documentation](https://docs.catalyst.zoho.com) - Embedded Authentication setup
- [Team Documentation](./team-docs/) - project workflow and responsibilities

## Deploy on Replit

This project is configured for deployment on Replit with Zoho Catalyst backend integration.

### Replit Deployment Steps

1. **Import Project**: Fork/import this repository into Replit
2. **Configure Secrets**: Add environment variables from `.env.replit` to Replit Secrets
3. **Install Dependencies**: Run `cd web && npm install`
4. **Deploy Functions**: Use Zoho Catalyst CLI to deploy backend functions
5. **Start Application**: Click "Run" or use `npm run dev`

### Production Configuration

- Uses Replit's built-in HTTPS and domain
- Integrates with Zoho Catalyst for serverless functions
- HIPAA-compliant data handling through Zoho One BAA

Check out our [deployment documentation](../docs/DEPLOYMENT_STRATEGY.md) for detailed setup instructions.
