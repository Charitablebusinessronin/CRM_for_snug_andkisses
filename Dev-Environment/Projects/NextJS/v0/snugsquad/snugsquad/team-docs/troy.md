## Team: Troy Davis — Senior Full-Stack Developer

### Role
Lead development and application architecture across frontend (Next.js) and backend (Catalyst functions), aligning with security and compliance requirements.

### 🚨 **CRITICAL ISSUE: Application Failing - CSS Not Loading** 🔴
**Status**: ❌ **CRITICAL FAILURE** - Application showing white page, CSS completely broken
**Server**: localhost:3000 (Docker environment)
**Current Issue**: ❌ **CSS NOT LOADING** - White page, no styling, application unusable
**Priority**: 🔴 **CRITICAL** - Application is completely broken and unusable

#### Current Failure State:
1. ❌ **Application Running** - Container is up on port 3000
2. ❌ **CSS Completely Broken** - No styles loading, white page only
3. ❌ **Application Unusable** - Users see blank white page
4. ❌ **Critical Failure** - This is a complete application failure

#### What's Actually Happening:
- **Container Status**: ✅ Running on port 3000
- **Application Response**: ❌ White page with no content
- **CSS Loading**: ❌ Completely failed - no styles whatsoever
- **User Experience**: ❌ Blank white page - application unusable
- **Build Status**: ❌ Something is fundamentally broken in the build/deployment

#### Root Cause Analysis Needed:
- CSS build process may be failing
- Tailwind compilation issues
- Asset pipeline problems
- Build configuration errors
- Docker volume mounting issues

#### Immediate Action Required:
1. 🔴 **Investigate CSS build process** - Check if Tailwind is compiling
2. 🔴 **Verify asset pipeline** - Ensure CSS files are being generated
3. 🔴 **Check Docker build logs** - Look for CSS compilation errors
4. 🔴 **Test local build** - Verify CSS works outside Docker
5. 🔴 **Emergency fix required** - Application is completely broken

### Active Assignments
- [x] ✅ Initialize Next.js app scaffold with Tailwind and TypeScript
- [x] ✅ Configure Zoho Catalyst Embedded Auth SDK v4 in the frontend
- [x] ✅ Define Catalyst functions skeletons and deployment scripts (target: 12 core functions)
- [x] ✅ Create role-based route guards and RBAC model with MFA
- [🚨] **CRITICAL: CSS Build Failure** - Application showing white page, immediate debugging required
- [x] ✅ Add instrumentation hooks for monitoring/observability (logging, error tracking, audit trail)
- [x] ✅ Client portal foundations:
  - [x] ✅ Care plan overview and progress tracking
  - [x] ✅ Service requests and scheduling (UI + API handshake)
  - [x] ✅ Profile & preferences management
  - [x] ✅ Accessibility, responsiveness, and PWA behaviors (frontend)

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
- [x] ✅ Working auth flow via Catalyst; session persistence and MFA enforcement for protected routes
- [x] ✅ Deployed function skeletons callable from the app; 12 core endpoints stubbed with typed contracts
- [x] ✅ RBAC middleware and route guards with clear role maps for Admin, Client, Employee, Contractor
- [🚨] **CRITICAL: CSS Build Failure** - Must fix CSS loading before proceeding
- Zia matching service MVP returning ranked candidates with traceable inputs/outputs
- [x] ✅ Client portal pages functional for planned items with responsive and accessible UI
- [x] ✅ Observability: application logs, error reporting, and audit trail events emitted for key actions

### Current Status
- ❌ **CRITICAL FAILURE**: Application showing white page, CSS completely broken
- ❌ **CSS Not Loading**: No styles whatsoever, application unusable
- ❌ **Build Process Failed**: Something fundamental is wrong with CSS compilation
- ❌ **Application Unusable**: Users see blank white page only

### Build Status
- ❌ **CSS Build Failure**: Tailwind/CSS compilation completely broken
- ❌ **Application Unusable**: White page with no content
- ❌ **Critical Issue**: Application is fundamentally broken
- ❌ **Emergency Fix Required**: Cannot proceed until CSS loads

### Technical Analysis Required
**Problem**: Application showing white page, CSS completely failed to load
**Evidence**: 
- Container running on port 3000 ✅
- Application responding with white page ❌
- CSS files not loading ❌
- No styling whatsoever ❌

**Immediate Investigation Needed**: 
- CSS build process status
- Tailwind compilation logs
- Asset pipeline configuration
- Docker build process for CSS

### Immediate Action Items
1. 🔴 Investigate CSS build process and Tailwind compilation
2. 🔴 Check Docker build logs for CSS errors
3. 🔴 Verify asset pipeline configuration
4. 🔴 Test local build outside Docker
5. 🔴 Emergency fix for CSS loading failure

### Dependencies & Workflow

As the **Builder**, you are responsible for constructing the application.

*   **You depend on:**
    *   **Allura (the Architect)** for the designs and UI specifications.
    *   **Bobo (the Inspector)** for the deployment and testing infrastructure.
*   **Who depends on you:**
    *   **James (the Final Check)** needs you to finish building features so he can test them.
    *   **Bobo (the Inspector)** needs your initial application code to set up the infrastructure.

See `orderofoperations.md` for a simple guide to our team's workflow.

### Detailed Workflow with Allura (the Architect)

🔴 **IMPORTANT:** Follow these steps to ensure a smooth workflow with Allura.

**Phase 1: The Foundation**

1.  **Your Task:** While you are working on the "Initialize Next.js app scaffold with Tailwind and TypeScript", you need the design tokens from Allura.
2.  🔴 **STOP!** You cannot complete the Tailwind setup without her "Unify color tokens and typography in Tailwind theme" deliverable.
3.  **Your Action:** Once Allura provides the theme settings, integrate them into the `tailwind.config.js` file.
4.  **HANDOFF:** Notify Allura when the theme is integrated so she can start designing components with the confidence that they will match the live site.

**Phase 2: The Blueprints**

1.  **Your Task:** You are assigned to the "Client portal foundations".
2.  🔴 **STOP!** You cannot start this task until Allura provides the "Wireframes and high-fidelity designs" for the client portal.
3.  **Your Action:** Once you receive the designs, review them carefully for technical feasibility.
4.  **HANDOFF:** Provide feedback to Allura. If there are any issues, explain them clearly so she can revise the designs.

**Phase 3: Ongoing Collaboration**

*   **Your Role:** As you are building the UI, you may have questions about the design. Ask Allura for clarification instead of making assumptions.
*   **Backlog Items:** Before you start working on any new UI feature from the "Backlog", confirm with Allura that she has completed the designs for it.

### Detailed Workflow with Bobo and James

**Working with Bobo (the Inspector):**

*   **Your Role:** You need to provide Bobo with your application code and any specific instructions he needs to set up the deployment pipelines.
*   **Dependency:** You depend on Bobo to have the CI/CD pipeline and testing environments ready so you can deploy your code and have it tested.

**Working with James (the Final Check):**

*   **Your Role:** You need to notify James when a feature is ready for testing.
*   **Dependency:** You depend on James to test your code and provide you with bug reports so you can fix any issues.


