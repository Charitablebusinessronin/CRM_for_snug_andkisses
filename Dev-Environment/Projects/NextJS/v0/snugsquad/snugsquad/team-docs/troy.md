## Team: Troy Davis — Senior Full-Stack Developer

### Role
Lead development and application architecture across frontend (Next.js) and backend (Catalyst functions), aligning with security and compliance requirements.

### Active Assignments
- Initialize Next.js app scaffold with Tailwind and TypeScript
- Configure Zoho Catalyst Embedded Auth SDK v4 in the frontend
- Define Catalyst functions skeletons and deployment scripts (target: 12 core functions)
- Create role-based route guards and RBAC model with MFA
- Implement Zia-assisted caregiver matching (baseline)
- Add instrumentation hooks for monitoring/observability (logging, error tracking, audit trail)
- Client portal foundations:
  - Care plan overview and progress tracking
  - Service requests and scheduling (UI + API handshake)
  - Profile & preferences management
  - Accessibility, responsiveness, and PWA behaviors (frontend)

### Backlog (Developer-Focused)
- Calendar integrations (appointments, interviews) via Zoho Calendar
- Billing summary and hours tracking (Zoho Books integration)
- Real-time video consultations integration
- Digital contract flow (signing + timestamping)
- Secure document upload & OCR verification
- Session lifecycle hardening and secure storage
- API rate limiting and DDoS protections
- Support E2E test harness (implement hooks and IDs; test cases owned by QA)

### Deliverables & Acceptance
- Working auth flow via Catalyst; session persistence and MFA enforcement for protected routes
- Deployed function skeletons callable from the app; 12 core endpoints stubbed with typed contracts
- RBAC middleware and route guards with clear role maps for Admin, Client, Employee, Contractor
- Zia matching service MVP returning ranked candidates with traceable inputs/outputs
- Client portal pages functional for planned items with responsive and accessible UI
- Observability: application logs, error reporting, and audit trail events emitted for key actions

### Dependencies
- Designs and component specs from Allura (`team-docs/allura.md`)
- Environment, CI/CD, and deployment pipelines from Bobo (`team-docs/bobo.md`)
- API references: see `docs/INTEGRATIONS.md`


