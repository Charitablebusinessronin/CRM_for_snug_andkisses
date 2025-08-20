# Catalyst AppSail Deployment Guide: Express.js Backend

**Project:** Snug & Kisses Healthcare CRM  
**Assigned To:** Priya Sharma - Senior Zoho Developer & MCP Specialist  
**Due Date:** August 12, 2025

---

## 1. 📋 Overview

This document provides a step-by-step guide for packaging and deploying the migrated Express.js backend application to **Zoho Catalyst AppSail**. This process will transition our backend from a local WSL environment to a scalable, production-ready dedicated API server.

---

## 2. 🎯 Pre-Deployment Checklist

- [ ] Confirm `Node.js v24.5.0` and `npm v10.8.1` are used in the build environment.
- [ ] Verify all production dependencies in `package.json` are correctly listed.
- [ ] Ensure the `.env.production` file is prepared with all necessary secrets (but **DO NOT** commit it).
- [ ] Run a final `npm install` and `npm test` to ensure all tests pass.
- [ ] Confirm the Express app correctly reads `process.env` variables for production configuration.

---

## 3. 📦 Packaging the Application

Catalyst AppSail requires a `tar.gz` archive of the application's source code. 

**Step 1: Create the Deployment Archive**

From the `back end express` directory, run the following command to create the deployment package:

```bash
# Navigate to the backend directory
cd "c:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses\back end express"

# Create the archive, excluding development and sensitive files
tar --exclude='./.git' --exclude='./node_modules' --exclude='*.md' --exclude='app.tar.gz' --exclude='.env*' -czvf app.tar.gz .
```

This will create `app.tar.gz` in the root of the `back end express` directory. This is the file you will upload to Catalyst AppSail.

---

## 4. ⚙️ Catalyst AppSail Configuration

**Step 2: Deploy to AppSail via Catalyst CLI**

Now that `catalyst.json` is correctly configured, you can deploy the AppSail service directly.

1.  **Deploy the Service:** Run the standard deploy command from the project root.
    ```bash
    catalyst deploy
    ```
2.  **Select the Target:** The CLI will prompt you to select which services to deploy. Choose the `express-backend` (AppSail) service.
3.  **Follow Prompts:** The CLI will then guide you through packaging and uploading the `back end express` directory.

**Step 3: Configure Environment Variables**

In the Catalyst Console, navigate to **AppSail** and select your application. Go to the **Settings > Environment Variables** section and add the following production secrets:

- `NODE_ENV=production`
- `CATALYST_PROJECT_ID` (Provided by Catalyst)
- `CATALYST_PROJECT_SECRET` (Provided by Catalyst)
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `SESSION_SECRET` (Generate a new secure secret for production)
- `DATABASE_URL` (If applicable)

**⚠️ IMPORTANT:** Ensure all secrets are stored securely and never exposed in the codebase.

---

## 5. 📈 Monitoring & Logging

**Step 4: Set Up Monitoring**

1.  **Health Checks:** AppSail automatically monitors the `/health` endpoint. Ensure it is configured to return a `200 OK` status.
2.  **Performance Dashboard:** In the Catalyst Console, use the AppSail monitoring dashboard to track:
    - CPU Utilization
    - Memory Usage
    - Request/Response Latency
    - HTTP Status Codes (2xx, 4xx, 5xx)
3.  **Alerts:** Configure alerts for high CPU/memory usage or an increase in 5xx server errors.

**Step 5: Configure Log Aggregation**

- AppSail automatically captures `console.log` and `console.error` outputs.
- Ensure the Express app uses structured logging (e.g., JSON format) for easier parsing.
- Use the **Logs** section in the Catalyst Console to view and search application logs in real-time.

---

## 6. 🚀 Phased Rollout & Rollback Strategy

**Step 6: Phased Rollout (Traffic Shifting)**

- **Initial Deployment:** Deploy the new version as a separate instance without directing production traffic to it.
- **Canary Release:** Use a load balancer or DNS routing to direct a small percentage of traffic (e.g., 5%) to the new version.
- **Monitor:** Closely monitor performance and error rates for the canary instance.
- **Gradual Increase:** Gradually increase traffic (e.g., 25%, 50%, 100%) while monitoring stability.

**Step 7: Rollback Strategy**

- **Immediate Rollback:** If critical errors are detected, immediately shift 100% of traffic back to the previous stable version.
- **Version Management:** AppSail keeps previous deployment versions. You can quickly redeploy a past stable version from the Catalyst Console.
- **Documentation:** Document the reason for the rollback in the deployment log for post-mortem analysis.

---

## 7. 🛡️ Final Security Verification

- [ ] Verify all production environment secrets are encrypted and stored securely in Catalyst.
- [ ] Confirm that the AppSail instance has appropriate network access controls.
- [ ] Review production logs to ensure no sensitive data (PII/PHI) is being logged, in compliance with HIPAA.
- [ ] Run a final security scan on the production URL.

---

## 8. ✅ Success Criteria Validation

- [ ] **Zero Downtime:** Confirm no user-facing downtime occurred during the traffic shift.
- [ ] **API Functionality:** Test all API endpoints on the production URL.
- [ ] **Performance:** Measure response times to ensure they are <100ms.
- [ ] **Integration:** Verify successful communication with Catalyst DataStore and other services.
- [ ] **Logging:** Confirm that logs are being correctly aggregated in the Catalyst Console.
