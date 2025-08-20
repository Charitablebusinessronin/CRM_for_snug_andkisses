## Team: James — QA Engineer

### Role
Quality assurance and testing across unit, integration, E2E, performance, and reliability. Gate releases via CI quality bars.

### Active Assignments
- Define test strategy and coverage targets (unit, integration, E2E)
- Set up Jest (unit/integration) and Cypress (E2E) with CI integration
- Unit tests for 12 core Catalyst function endpoints (happy-path, edge, failure)
- E2E flows for Client planned features:
  - Care plan overview and progress tracking
  - Service requests and scheduling
  - Profile & preferences management
  - Accessibility, responsiveness, PWA basics
- Establish test data/mocks and fixtures; add stable test IDs to UI (coord. with Troy)
- Performance and basic load checks on key endpoints

### Backlog (QA-Focused)
- Calendar appointment flows (Zoho Calendar)
- Billing summary and hours tracking (Zoho Books)
- Digital contract signing (timestamps, audit)
- Real-time video consult UX cases
- Document upload with OCR verification paths
- Notifications/email automation validations
- Security test coordination (rate limiting, session lifecycle)

### Deliverables & Acceptance
- Written test plans and cases stored with the repo
- CI-enforced quality gates (lint, unit, integration, E2E) blocking release on failure
- Coverage thresholds documented and met for core modules
- Defect reports with clear reproduction steps and priority

### Dependencies
- API contracts and test hooks from Troy (`team-docs/troy.md`)
- Designs and interaction specs from Allura (`team-docs/allura.md`)
- CI/CD and environments from Bobo (`team-docs/bobo.md`)
- Reference docs: `docs/INTEGRATIONS.md`


