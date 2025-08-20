Snuggs & Kisses CRM – Healthcare Platform ("Snug Fam")

Overview

Snuggs & Kisses CRM is a HIPAA-conscious healthcare staffing platform connecting families with postpartum caregivers. This repository contains the web app scaffold and operational guardrails (validation scripts, environment templates, and compliance notes) to enable a safe, reliable build-out.

Architecture (high level)

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Zoho Catalyst serverless functions (primary) and Zoho CRM for data (no PHI in Catalyst DataStore)
- Auth: Zoho Catalyst Embedded Auth SDK v4
- AI: Enhanced Zia (voice, persistence, custom training)
- Deployment: Replit FaaS + Zoho Catalyst
- Node: 16.20.2 (fixed)

Important compatibility note

The target stack specifies Next.js 15 + React 19, which generally require Node >= 18. This repository pins Node to 16.20.2 to align with project requirements and Replit constraints. Until Node constraints change, this scaffold uses a compatibility profile (Next 13.x, React 18.2) that runs on Node 16. A dedicated validation script will surface a clear error if incompatible versions are introduced.

Source of truth (Notion)

- Web Development Team Hub: https://www.notion.so/2531d9be65b380839aa6da13f3c11b82
- Master Plan: https://www.notion.so/fb576eb4953b415586153784239da2b7
- README (Notion): https://www.notion.so/6a35031af57f461b981daabc7c2b994c
- Team Tasks: 
  - Von: https://www.notion.so/0aa70570b75e4a06881ee7cf994fff51
  - Troy: https://www.notion.so/a474e703617744678c14e3ce0659f3b3
  - Allura: https://www.notion.so/b971b5fd064243788083567c69e1b016
  - James: https://www.notion.so/d76313782ef04fee8087f95de2af9783
- Technical Issue Prevention Plan: https://www.notion.so/ac0f3c7bc63c43de986e27c1d7359735
- Team Databases:
  - Team Members: https://www.notion.so/5bbb3e2a60e240ea86d98b0e1776617a
  - Projects: https://www.notion.so/86f050ddb24e4cfdbb6cf586cffced0b
  - Memory Systems: https://www.notion.so/9b512dc63f9c4ae5861de7d581b7bcfc
  - Tasks: https://www.notion.so/3431a37e1dc44eec8e626b1bfa0e12ff
  - Knowledge Base: https://www.notion.so/6b2f3c9405f14eb6aca64a398c5f28ef

Documentation control

- Notion is the single source of truth. Local markdown mirrors Notion and must remain in sync.
- Do not modify local markdown content except to add completion checkmarks (✅) on tasks.
- All changes require Notion approval first.

HIPAA compliance framework (initial guardrails)

- No PHI in Catalyst DataStore or frontend logs. PHI must remain in Zoho CRM with appropriate controls.
- Environment handling: no secrets committed; use `.env` (see `.env.example`).
- Access control: all app routes and API calls should verify authenticated session from Catalyst Embedded Auth SDK v4 before accessing any data.
- Logging: use structured logs without PHI; redact user identifiers except hashed or tokenized forms where necessary.
- Data flow: frontend → Catalyst FaaS → Zoho CRM. Validate request payloads with strict schemas before any outbound call.

Getting started

1) Prereqs
- Node: 16.20.2 (install via NVM). See `.nvmrc`.
- Replit: uses `replit.nix` and `.replit` to pin environment.

2) Install
- First, validate environment and dependency compatibility:
```bash
npm run validate:deps
```
- Install dependencies:
```bash
npm ci
```

3) Development
```bash
npm run dev
```

4) Pre-deploy checks
```bash
npm run verify:env
npm run validate:deps
```

5) Deploy (stub)
Deployment targets Replit FaaS and Zoho Catalyst. See `docs/deployment-guide.md` for the phased rollout and rollback strategy.

Scripts

- `npm run validate:deps`: Ensures Node and framework versions are compatible and surfaces actionable guidance.
- `npm run verify:env`: Validates required environment variables without reading any PHI.
- `npm run compile:deps`: Guidance/automation to resolve installation issues (Replit-friendly fallbacks).
- `npm run deploy`: Pre-deployment validations and placeholders for Catalyst + Replit flows.

Team workflow (summary)

- Memory systems: Each team member logs daily progress and decisions in Notion.
- Tasks: Prefixed with member identifier (e.g., VON-001). Only the assignee can check tasks done (✅).
- Reviews: Daily status updates; bi-weekly formal reviews.

License & security

- Internal project. Handle all data under HIPAA-conscious practices. Never commit secrets or PHI.



