# Snug & Kisses CRM Documentation

Welcome to the Snug & Kisses CRM documentation. This is your central hub for all technical documentation related to the CRM system.

## 📚 Table of Contents

### Getting Started
- [Quick Start Guide](/getting-started)
- [System Requirements](/getting-started/requirements.md)
- [Installation Guide](/getting-started/installation.md)

### Development
- [Development Setup](/development)
- [API Documentation](/api)
- [Testing](/testing)
- [Deployment](/deployment)

### Zoho Integration
- [Zoho API Documentation](/zoho/ZOHO_API_DOCUMENTATION.md)
- [Catalyst Integration](/zoho/CATALYST_INTEGRATION.md)
- [API Setup Guide](/zoho/ZOHO_API_SETUP_GUIDE.md)

### Security
- [Security Policies](/security)
- [Compliance](/security/compliance.md)
- [Audit Logs](/security/audit-logs.md)

### Guides
- [User Guide](/guides/user-guide.md)
- [Admin Guide](/guides/admin-guide.md)
- [Troubleshooting](/troubleshooting)

## 🚀 Quick Links

- [API Reference](/api)
- [Changelog](/CHANGELOG.md)
- [Contributing](/CONTRIBUTING.md)
- [License](/LICENSE)

## 📞 Support

For support, please contact:
- **Email:** support@snugandkisses.com
- **Slack:** #crm-support
- **Office Hours:** Mon-Fri, 9AM-5PM EST

---

## Monorepo Structure (Consolidated)

- `app/` Next.js app (port 5369; health: `/api/health`)
- `express/` Express backend (port 9000; health: `/health`)
- `catalyst/functions/quickactionssnug/` Catalyst functions project
  - Functions source: `catalyst/functions/quickactionssnug/functions`
- `appsail/` Next.js container/deploy artifacts
- `docs/` Project documentation (this)

## Catalyst Configuration

- Single source of truth lives in project root:
  - `.catalystrc`
  - `catalyst.json` → functions `source`: `catalyst/functions/quickactionssnug/functions`
- Root-level legacy configs have been archived to avoid conflicts.

## Deployment Separation

- Next.js and Express are deployed as separate services with distinct ports and envs.
- Ensure CORS and OAuth Redirect URIs reference final domains.
- Use standardized API envelopes via `lib/api-respond.ts` across all Next.js API routes.

## Audit Logging & Compliance

- HIPAA audit events conform to `AuditEvent` schema from `lib/hipaa-audit-edge.ts`.
- Health-check endpoints are excluded from audit logging.

## Required Production Environment Variables

- `NEXTAUTH_SECRET` (strong secret)
- `NEXT_PUBLIC_APP_URL` (public base URL)
- Existing Zoho/Catalyst/ZIA envs remain in AppSail secrets.

---
*Last Updated: August 8, 2025*

