## Team: Bobo — DevOps Engineer

### Role
Own infrastructure, deployment, secrets, CI/CD, and operational security. Ensure compliant, reliable delivery across environments.

### Active Assignments
- Set up environment variables and secrets (local, Replit, Catalyst)
- Create deployment scripts/pipelines for web (Next.js) and Catalyst functions
- Monitoring & observability: logging, error tracking, and audit trail pipelines
- CI/CD workflows (build, test, lint, deploy) with gated approvals
- MFA enforcement policies and secrets rotation runbook

### Backlog (Ops-Focused)
- API rate limiting and DDoS protections; WAF/CDN configuration
- Audit logging dashboards and compliance reports
- PWA optimization: caching strategies and CDN headers
- Load/performance testing and synthetic checks
- Backup/restore and disaster recovery procedures

### Deliverables & Acceptance
- CI configuration and infra scripts checked into repo; reproducible deployments
- Environment/secrets documented for each environment (dev/stage/prod) without exposing secrets
- Monitoring dashboards and alerts for critical functions and web endpoints
- Runbooks for deploy, rollback, incident response, and rotation processes

### Detailed Workflow with Troy and James

🔴 **IMPORTANT:** Your work is the bridge between development and testing.

**Phase 1: Infrastructure Setup**

1.  **Your Task:** As Troy is building the initial application, you need to set up the "CI/CD workflows" and "deployment scripts".
2.  **Your Action:** Collaborate with Troy to understand the application's structure and dependencies.
3.  **DELIVERABLE:** A working CI/CD pipeline that can build, lint, and test Troy's code.
4.  **HANDOFF:** Provide Troy with the instructions on how to use the pipeline.

**Phase 2: Environment Provisioning**

1.  **Your Task:** You are responsible for "environment variables and secrets" and setting up the testing environments.
2.  🔴 **STOP!** James cannot start his E2E testing until you have a stable testing environment ready for him.
3.  **DELIVERABLE:** A fully configured testing environment with all the necessary secrets and database connections.
4.  **HANDOFF:** Notify James that the environment is ready and provide him with the access details.



