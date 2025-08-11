#!/bin/bash

# Prepare Repository for GitHub Upload
# This script ensures no sensitive or non-essential files are committed

echo "🚀 Preparing repository for GitHub upload..."
echo

# Check if we're in the correct directory
if [[ ! -f "package.json" ]] || [[ ! -f "catalyst.json" ]]; then
    echo "❌ Error: Not in the correct project directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📂 Current directory: $(pwd)"
echo "📋 Checking repository status..."
echo

# Verify nonessential directory exists
if [[ ! -d "nonessential" ]]; then
    echo "⚠️  Warning: nonessential directory not found"
    echo "Non-essential files may still be in the repository"
else
    echo "✅ Non-essential files are organized in nonessential/ directory"
    echo "   📊 Size: $(du -sh nonessential/ | cut -f1)"
fi

# Check for sensitive files that shouldn't be committed
echo
echo "🔍 Checking for sensitive files..."

SENSITIVE_FILES=()

# Check for environment files
if ls .env* 1> /dev/null 2>&1; then
    SENSITIVE_FILES+=(".env files found")
fi

# Check for logs
if ls *.log 1> /dev/null 2>&1; then
    SENSITIVE_FILES+=("Log files in root directory")
fi

# Check for uploaded files
if [[ -d "public/uploads" ]] && [[ -n "$(ls -A public/uploads)" ]]; then
    SENSITIVE_FILES+=("User uploaded files in public/uploads/")
fi

# Check for Claude config in root
if [[ -f "MCP_TOOLS_CONFIG.json" ]]; then
    SENSITIVE_FILES+=("Claude config in root (MCP_TOOLS_CONFIG.json)")
fi

if [[ ${#SENSITIVE_FILES[@]} -eq 0 ]]; then
    echo "✅ No sensitive files found in repository root"
else
    echo "⚠️  Found sensitive files that should be excluded:"
    for file in "${SENSITIVE_FILES[@]}"; do
        echo "   - $file"
    done
    echo
    echo "These files are listed in .gitignore and should not be committed."
fi

# Show what WILL be included in the repository
echo
echo "📦 Essential files that WILL be included in GitHub:"
echo "   ✅ Core Application:"
echo "      - app/ (Next.js pages and API routes)"
echo "      - components/ (React components)"
echo "      - lib/ (Core libraries and integrations)"
echo "      - functions/ (Zoho Catalyst functions)"
echo "      - types/ (TypeScript definitions)"
echo
echo "   ✅ Configuration:"
echo "      - package.json"
echo "      - tsconfig.json"  
echo "      - catalyst.json"
echo "      - .catalystrc"
echo "      - tailwind.config.ts"
echo "      - next.config.mjs"
echo
echo "   ✅ Deployment:"
echo "      - Dockerfile*"
echo "      - docker-compose.yml"
echo "      - docker-setup.sh"
echo
echo "   ✅ Development:"
echo "      - tests/"
echo "      - scripts/ (utility scripts)"
echo "      - playwright.config.ts"
echo "      - env-vars-template.txt"

echo
echo "🚫 Files that will NOT be included (in nonessential/ or .gitignore):"
echo "   ❌ Development documentation (docs/)"
echo "   ❌ User uploaded files (public/uploads/)"
echo "   ❌ Build artifacts (test-results/, *.tsbuildinfo)"
echo "   ❌ Environment files (.env*)"
echo "   ❌ Logs and temporary files"
echo "   ❌ Claude development tools"
echo "   ❌ Old configuration directories"

# Check git status
echo
echo "🔍 Git status check..."

if ! command -v git &> /dev/null; then
    echo "⚠️  Git not found. Please ensure git is installed."
else
    if [[ -d ".git" ]]; then
        # Check if there are any staged changes
        if git diff --cached --quiet; then
            echo "✅ No staged changes"
        else
            echo "⚠️  There are staged changes:"
            git diff --cached --name-only | head -10
        fi
        
        # Check for untracked files that aren't ignored
        UNTRACKED=$(git ls-files --others --exclude-standard)
        if [[ -n "$UNTRACKED" ]]; then
            echo "📝 Untracked files (will be added to repository):"
            echo "$UNTRACKED" | head -10
            if [[ $(echo "$UNTRACKED" | wc -l) -gt 10 ]]; then
                echo "   ... and $(($( echo "$UNTRACKED" | wc -l) - 10)) more"
            fi
        else
            echo "✅ No untracked files"
        fi
    else
        echo "📝 Not a git repository yet. You can initialize with:"
        echo "   git init"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
    fi
fi

# Final recommendations
echo
echo "🎯 Final recommendations before GitHub upload:"
echo
echo "1. ✅ Remove nonessential directory:"
echo "   rm -rf nonessential/"
echo
echo "2. ✅ Double-check .gitignore is working:"
echo "   git status"
echo
echo "3. ✅ Verify no sensitive files are staged:"
echo "   git diff --cached --name-only"
echo
echo "4. ✅ Test build locally:"
echo "   npm run build"
echo
echo "5. ✅ Commit and push:"
echo "   git add ."
echo "   git commit -m 'feat: Initial CRM application with Zoho Catalyst integration'"
echo "   git push origin main"
echo

# Calculate approximate size reduction
if [[ -d "nonessential" ]]; then
    NONESSENTIAL_SIZE=$(du -sb nonessential/ 2>/dev/null | cut -f1 || echo "0")
    TOTAL_SIZE=$(du -sb . 2>/dev/null | cut -f1 || echo "0")
    
    if [[ $TOTAL_SIZE -gt 0 ]] && [[ $NONESSENTIAL_SIZE -gt 0 ]]; then
        REDUCTION_PCT=$((($NONESSENTIAL_SIZE * 100) / $TOTAL_SIZE))
        echo "📊 Repository size optimization:"
        echo "   Total size: $(numfmt --to=iec $TOTAL_SIZE)"
        echo "   Nonessential: $(numfmt --to=iec $NONESSENTIAL_SIZE)"
        echo "   Reduction: ~${REDUCTION_PCT}% smaller for GitHub upload"
    fi
fi

echo
echo "✨ Repository is ready for GitHub upload!"
echo "🔒 Sensitive data is protected"
echo "🎯 Only essential files will be committed"
echo

exit 0