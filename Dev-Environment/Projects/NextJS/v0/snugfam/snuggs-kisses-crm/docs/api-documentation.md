API Documentation (Initial Skeleton)

Principles

- All endpoints deny by default; require Catalyst-authenticated session
- Validate inputs with strict schemas (no PHI in payloads)
- Normalize errors; avoid sensitive details

Endpoints (planned)

- GET /api/health
- POST /api/crm/leads (non-PHI contact info only)
- GET /api/crm/records/:id (minimum necessary fields; role-gated)



