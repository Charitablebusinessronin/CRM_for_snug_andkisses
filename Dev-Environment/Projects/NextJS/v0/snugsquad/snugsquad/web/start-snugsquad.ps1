# SnugSquad Next.js Application Startup Script
# Run this script to start your development server with proper branding

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      SnugSquad Development Server Startup        " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$ProjectPath = "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\v0\snugsquad\snugsquad\web"
Write-Host "Navigating to: $ProjectPath" -ForegroundColor Green

try {
    Set-Location $ProjectPath
    Write-Host "✅ Successfully navigated to project directory" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Could not navigate to project directory" -ForegroundColor Red
    Write-Host "   Please check if the path exists: $ProjectPath" -ForegroundColor Yellow
    exit 1
}

# Verify package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found in current directory" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Found package.json" -ForegroundColor Green

# Verify key configuration files
$ConfigFiles = @(
    "tailwind.config.ts",
    "next.config.ts", 
    "postcss.config.mjs",
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/page.tsx"
)

Write-Host ""
Write-Host "Verifying configuration files..." -ForegroundColor Yellow
foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
    }
}

# Clear Next.js cache
Write-Host ""
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        Remove-Item -Path ".next" -Recurse -Force
        Write-Host "✅ Cleared .next directory" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Warning: Could not fully clear .next directory" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No .next directory to clear" -ForegroundColor Green
}

# Verify node_modules
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules directory exists" -ForegroundColor Green
    
    # Check for key dependencies
    $KeyDeps = @("next", "react", "tailwindcss", "@tailwindcss/postcss")
    foreach ($dep in $KeyDeps) {
        if (Test-Path "node_modules/$dep") {
            Write-Host "  ✅ $dep installed" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $dep missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  node_modules not found, running npm install..." -ForegroundColor Yellow
    npm install
}

# Start development server
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "Application will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Expected appearance:" -ForegroundColor Cyan
Write-Host "  • SnugSquad heading in plum color (#3B2352)" -ForegroundColor Magenta
Write-Host "  • Lavender background section (#D7C7ED)" -ForegroundColor Magenta
Write-Host "  • Custom fonts: Merriweather (headings), Lato (body)" -ForegroundColor Magenta
Write-Host "  • Proper spacing and typography" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
