Snuggs & Kisses CRM – Strategic Architecture Plan

Purpose

Define the baseline architecture, constraints, and phased implementation plan for the Snug Fam platform. This file mirrors the Notion Master Plan and is kept in sync.

Constraints

- Node version fixed at 16.20.2
- HIPAA-conscious design: no PHI in Catalyst DataStore or frontend logs; Zoho CRM is the PHI system of record
- Exact dependency pinning (no version ranges)
- TypeScript strict mode; comprehensive tests

High-level architecture

- Frontend: Next.js App Router (compat mode for Node 16), React 18, Tailwind CSS
- Auth: Zoho Catalyst Embedded Auth SDK v4
- Backend: Zoho Catalyst functions acting as API gateway to Zoho CRM
- AI: Zia enhancements with voice/persistence; all prompts and logs must exclude PHI
- Deployment: Replit FaaS (frontend) + Zoho Catalyst (backend)

Data flow

1. Client authenticates via Catalyst Embedded Auth SDK v4
2. Client calls Catalyst function endpoints
3. Catalyst validates auth, validates payloads, accesses Zoho CRM
4. CRM returns data filtered to the minimum necessary; responses exclude PHI when not required

Security & compliance guardrails

- Least-privilege access; role-based gating per route
- Structured, PHI-free logging; correlation IDs only
- Environment secrets via `.env` and platform secret managers; never commit secrets
- Input validation with strict schemas; deny by default on validation failure
- Error messages must be non-sensitive and non-identifying

Phased implementation

Phase 1: Repository & Compliance Foundation
- Scaffold repo and scripts (validation, env verification, deploy skeleton)
- Establish auth and SDK init patterns with retry
- Set Tailwind and base UI primitives

Phase 2: App Shell & Auth
- Create app router structure for admin/client/employee/contractor dashboards
- Implement protected route wrappers and session handling

Phase 3: CRM Integration
- Catalyst functions for minimal CRUD with strict validation (no PHI exposure)
- API utility on frontend with error normalization

Phase 4: Zia Integration
- Add non-PHI assistant features; voice interface stubs

Phase 5: Testing & Hardening
- Unit tests and e2e scaffolding; pre-deploy checks and rollback automation

Risks

- Node 16 vs Next 15/React 19 incompatibility: use compatibility profile (Next 13/React 18) until infra permits upgrade
- SDK initialization race conditions on Replit: implement retry/backoff and environment probing
- API quota/limits from Zoho CRM: implement circuit breakers and caching where safe (no PHI caching)

Decision log

- 2025-08-20: Pin Node 16.20.2; adopt Next 13/React 18 compatibility path; validation script enforces constraints



