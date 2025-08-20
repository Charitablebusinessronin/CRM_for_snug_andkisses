## TASK BOARD — Snuggs & Kisses CRM

Use this file to track current tasks, backlog items, and discoveries. Keep entries concise and linked to commits/PRs when applicable.

### Active
- Initialize Next.js app scaffold with Tailwind and TypeScript
- Configure Zoho Catalyst Embedded Auth SDK v4 in frontend
- Define Catalyst functions skeletons and deployment scripts (target: 12 core functions)
- Set up environment variables and secrets (local + Replit + Catalyst)
- Create role-based route guards and RBAC model with MFA
- Implement Zia-assisted caregiver matching (baseline)
- Set up monitoring/observability (logging, error tracking, audit trail hooks)

### Backlog
- Zia sentiment analysis and predictive analytics (integrate insights into UI)
- Zia voice support and 24-hour conversation persistence
- Digital contract flow (signing + timestamping)
- Billing and hours tracking integration (Zoho Books)
- Calendar integrations (appointments, interviews) via Zoho Calendar
- Real-time video consultations integration
- OCR processing for document verification
- API rate limiting and DDoS protections
- Session lifecycle hardening and secure storage
- Audit logging dashboards and compliance reports
- PWA optimization and offline strategies
- E2E tests for key user journeys

### Discovered During Work
- Unify color tokens and typography in Tailwind theme
- Establish demo-mode data boundaries separate from prod

### Completed
- Documentation baseline: `README.md`, `PLANNING.md`, this `TASK.md`

### Client Portal Feature Checklist
- Care plan overview and progress tracking — Planned
- Service requests and scheduling — Planned
- Interviews and appointments (Calendar) — Backlog
- Billing summary and payment history (Books) — Backlog
- Zia insights and personalized recommendations — Backlog
- Digital contract signing with timestamps — Backlog
- Real-time video consultations — Backlog
- Secure document upload & OCR verification — Backlog
- Notifications & email automation — Backlog
- Profile & preferences management — Planned
- Support/contact & ticketing — Backlog
- Accessibility, responsiveness, and PWA behaviors — Planned

### Ownership Matrix (Lead → Support)
- App scaffold, auth, RBAC: Troy → Bobo, Allura, James
- Catalyst functions (12 core): Troy → Bobo, James
- Zia baseline matching: Troy → Allura, James
- Client portal planned features: Troy (build) / Allura (design) → James (tests)
- Calendar/Books integrations: Troy → Bobo, James
- Contracts, OCR, Video: Troy → Allura, James
- Observability/monitoring: Bobo → Troy
- CI/CD and environments: Bobo → James
- E2E testing framework and plans: James → Troy
- Documentation and sync review: Von → All

### Sync Review (Owner: Von)
- Ensure this file, `PLANNING.md`, `README.md`, `docs/INTEGRATIONS.md`, and `team-docs/*` are consistent weekly.


