## Snuggs & Kisses CRM — Healthcare Platform

A production-ready healthcare staffing platform for postpartum care. The system connects new families with certified caregivers and centralizes operations via Zoho (CRM, Calendar, Books) with HIPAA-aligned practices through Zoho One.

— Source of truth: see `PLANNING.md` and `TASK.md`.

### Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Zoho Catalyst (serverless functions)
- Auth: Zoho Catalyst Embedded Auth SDK v4
- Data: Zoho CRM (primary system of record)
- AI: Zoho Zia (assistive features, matching, insights)
- Deployment: Replit FaaS + Zoho Catalyst

### Key Features
- Four dashboards: Admin, Client, Employee, Contractor
- AI-powered caregiver matching (Zia)
- Digital contracts and audit trails
- Automated billing and hours tracking
- HIPAA-aligned operations leveraging Zoho One capabilities

### Quickstart
1) Clone the repo and open in Cursor
2) Ensure Node.js (LTS)
3) Create a `.env.local` with the variables below
4) Install and start the app (when the Next.js app scaffolding is present)
   - `npm install`
   - `npm run dev`

Note: Backend functions are deployed on Zoho Catalyst; local stubs/mocks may be added during development.

### Environment Variables (template)
- CATALYST_PROJECT_ID
- CATALYST_ENVIRONMENT_ID
- CATALYST_OAUTH_CLIENT_ID
- CATALYST_OAUTH_CLIENT_SECRET
- HIPAA_ENCRYPTION_KEY
- ZOHO_REGION (e.g., us)

Do not commit secrets. Manage them via Replit Secrets/Zoho Catalyst config.

### Deployment
- Replit: Configure secrets above, enable Always On, and deploy web + Catalyst functions
- Zoho Catalyst: Deploy functions and set environment config per project

### Demo Accounts (staging/testing)
- client@snugandkisses.demo
- employee@snugandkisses.demo
- contractor@snugandkisses.demo
- admin@snugandkisses.demo
Password: SecureDemo2025!

Only use demo credentials in non-production environments.

### Brand Guidelines (essentials)
- Colors: Primary #3B2352, Light #D7C7ED, Gold #D4AF37, White #FFFFFF
- Typography: Merriweather (headings), Lato (body), Dancing Script (quotes), Nunito Sans (buttons/labels)

### Portals
- Admin: `/admin-dashboard`
- Client: `/client-dashboard`
- Employee: `/employee-dashboard`
- Contractor: `/contractor-dashboard`

### Documentation
- Architecture and milestones: `PLANNING.md`
- Active tasks and backlog: `TASK.md`
- Integration references and official docs: `docs/INTEGRATIONS.md`
- Team assignments and responsibilities: `team-docs/`

### References
- Planning brief and context: https://www.notion.so/9aeb6074597748869b8878d1e133d68e?v=527ef5ee1bed4661b644763ad4092bf9&source=copy_link


