# Non-Essential Files Directory

This directory contains all files and folders that are **NOT required** for the core CRM application to function and should **NOT be uploaded to GitHub** or included in production deployments.

## Directory Structure

```
nonessential/
├── development-docs/     # Development documentation, reports, and notes
├── development-tools/    # Claude tools, database scripts, and utilities
├── build-artifacts/      # Build outputs, compiled assets, and temporary files
├── old-configs/          # Legacy configuration files and directories
├── uploaded-files/       # User uploaded files (should be in separate storage)
├── logs/                # Application logs and debug information
└── temporary-files/      # Temporary files and cache
```

## What's Included

### 📚 Development Documentation (`development-docs/`)
- `docs/` - Complete development documentation tree
- `PRIYA_BRAIN_UPDATE.md` - Development notes and updates
- `SECURITY_SCAN_REPORT.md` - Security scan results
- Progress reports, implementation plans, and guides

### 🛠️ Development Tools (`development-tools/`)
- `claude/` - Claude Code tools and configurations
  - `CLAUDE.md` - Claude instructions
  - `MCP_TOOLS_CONFIG.json` - MCP tools configuration
- `data/` - Development data files
- `init-db.sql/` - Database initialization scripts

### 🏗️ Build Artifacts (`build-artifacts/`)
- `appsail/` - Zoho AppSail build outputs
- `express/` - Express backend build outputs  
- `test-results/` - Playwright test results
- `tsconfig.tsbuildinfo` - TypeScript incremental build info
- `pnpm-lock.yaml` - PNPM lock file (if using npm, not needed)

### 🗂️ Old Configurations (`old-configs/`)
- `Config/` - Legacy configuration directory
- `back end express/` - Old backend Express setup
- Deprecated configuration files

### 📁 Uploaded Files (`uploaded-files/`)
- `uploads/` - User uploaded files (documents, photos, etc.)
- Should be stored in cloud storage in production
- Contains PHI data - handle with HIPAA compliance

### 📊 Logs (`logs/`)
- Application runtime logs
- Debug information
- Error tracking data

## ❌ What NOT to Upload to GitHub

**Never upload these to GitHub:**

1. **User Uploaded Files** - Contains PHI/PII data
2. **Logs** - May contain sensitive information
3. **Build Artifacts** - Generated files, not source code
4. **Development Tools** - Personal development configurations
5. **Old Configurations** - Deprecated/legacy files

## ✅ What IS Essential (Keep in Repository)

### Core Application Files
```
app/                    # Next.js pages and API routes
components/             # React components  
lib/                   # Utility libraries and integrations
functions/             # Zoho Catalyst serverless functions
types/                 # TypeScript type definitions
middleware.ts          # Next.js middleware
```

### Configuration Files
```
.catalystrc            # Zoho Catalyst configuration
catalyst.json          # Catalyst deployment config
catalyst-api-deploy.js # Catalyst deployment script
package.json           # Node.js dependencies
tsconfig.json         # TypeScript configuration
tailwind.config.ts    # Tailwind CSS configuration
next.config.mjs       # Next.js configuration
```

### Docker & Deployment
```
Dockerfile            # Main application container
Dockerfile.appsail    # AppSail deployment
Dockerfile.express    # Express backend container
docker-compose.yml    # Multi-container orchestration
docker-setup.sh       # Docker setup script
```

### Testing & Scripts
```
tests/                # Test files
playwright.config.ts  # E2E testing configuration
scripts/              # Utility scripts
env-vars-template.txt # Environment variables template
```

## 🔒 Security Considerations

### Files with Sensitive Data
- `uploaded-files/` - Contains user PHI data
- `logs/` - May contain API keys or tokens
- `.env` and `.env.local` - Environment variables (already in .gitignore)

### HIPAA Compliance
- User uploaded files should be stored in encrypted cloud storage
- Logs should be sanitized before archiving
- Development documentation may contain sensitive workflow information

## 🚀 Before Production Deployment

1. **Remove nonessential directory entirely:**
   ```bash
   rm -rf nonessential/
   ```

2. **Ensure .gitignore covers:**
   ```
   nonessential/
   logs/
   *.log
   .env*
   node_modules/
   ```

3. **Set up proper cloud storage for uploads:**
   - Move user files to AWS S3, Google Cloud Storage, or similar
   - Configure HIPAA-compliant storage with encryption
   - Update file upload handlers to use cloud storage

4. **Configure proper logging:**
   - Use structured logging service (e.g., CloudWatch, Splunk)
   - Ensure logs don't contain PHI/PII data
   - Set up log retention policies

## 📋 Cleanup Commands

### Remove all non-essential files:
```bash
# Remove the entire nonessential directory
rm -rf nonessential/

# Clean build artifacts that may regenerate
rm -f tsconfig.tsbuildinfo
rm -rf node_modules/.cache
rm -rf .next
```

### Prepare for GitHub upload:
```bash
# Ensure .gitignore is properly configured
echo "nonessential/" >> .gitignore
echo "*.log" >> .gitignore
echo ".env*" >> .gitignore

# Remove sensitive files if they exist
rm -f .env .env.local .env.production

# Verify no sensitive files will be committed
git status
```

## 🔄 Recovery Instructions

If you need to restore any files from the nonessential directory:

1. **Development Documentation:**
   ```bash
   cp -r nonessential/development-docs/docs ./
   ```

2. **Claude Configuration:**
   ```bash
   cp -r nonessential/development-tools/claude ./
   ```

3. **Build Artifacts** (not recommended):
   ```bash
   # Better to rebuild instead of restoring
   npm run build
   ```

## ⚠️ Important Notes

- **Size:** The nonessential directory contains ~95% of non-essential files
- **Safety:** Core application functionality is preserved
- **Compliance:** Sensitive user data is properly separated
- **Development:** Development tools can be restored if needed
- **Production:** Production deployments will be much cleaner and faster

## 📞 Contact

If you're unsure whether a file is essential or not, refer to:
1. This README
2. The main project README.md
3. The types/README.md for type-related files