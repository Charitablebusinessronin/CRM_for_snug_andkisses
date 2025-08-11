# ============================================================================
# SNUG & KISSES CRM - POWERSHELL DEPLOYMENT SCRIPT
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🚀 SNUG & KISSES CRM - DEPLOYMENT & HEALTH CHECK" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
$projectPath = "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses"
Set-Location $projectPath
Write-Host "📁 Working in: $projectPath" -ForegroundColor Blue

# Check Docker status
Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean up existing containers
Write-Host ""
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker compose down 2>$null
Write-Host "✅ Cleanup completed" -ForegroundColor Green

# Build and start services
Write-Host ""
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes for the first build..." -ForegroundColor Cyan
$buildOutput = docker compose up --build -d 2>&1
Write-Host $buildOutput

# Wait for services to start
Write-Host ""
Write-Host "⏳ Waiting 60 seconds for services to fully start..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Check service status
Write-Host ""
Write-Host "🔍 Current service status:" -ForegroundColor Yellow
docker compose ps

# Health check function
function Test-ServiceHealth {
    param($url, $serviceName)
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $serviceName IS HEALTHY! 🎉" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $serviceName health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    return $false
}

Write-Host ""
Write-Host "🏥 HEALTH CHECK RESULTS:" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# Backend health check
Write-Host ""
Write-Host "📊 Backend Health Check:" -ForegroundColor Blue
$backendHealthy = Test-ServiceHealth "http://localhost:4728/health" "BACKEND"

if (-not $backendHealthy) {
    Write-Host "Checking backend logs..." -ForegroundColor Yellow
    docker compose logs backend --tail=20
}

# Frontend health check  
Write-Host ""
Write-Host "🌐 Frontend Health Check:" -ForegroundColor Blue
$frontendHealthy = Test-ServiceHealth "http://localhost:5369/api/health" "FRONTEND"

if (-not $frontendHealthy) {
    Write-Host "Checking frontend logs..." -ForegroundColor Yellow
    docker compose logs frontend --tail=20
}

# Final status
Write-Host ""
Write-Host "📋 Final Service Status:" -ForegroundColor Yellow
docker compose ps

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🎯 ACCESS POINTS" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🌐 Frontend Application: http://localhost:5369" -ForegroundColor Blue
Write-Host "🔌 Backend API: http://localhost:4728" -ForegroundColor Blue  
Write-Host "🏥 Backend Health: http://localhost:4728/health" -ForegroundColor Blue
Write-Host "🏥 Frontend Health: http://localhost:5369/api/health" -ForegroundColor Blue
Write-Host ""
Write-Host "📊 To view real-time logs: docker compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 To stop services: docker compose down" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan

# Final health assessment
if ($backendHealthy -and $frontendHealthy) {
    Write-Host ""
    Write-Host "🎉 SUCCESS! Both services are up and running with good health!" -ForegroundColor Green
    Write-Host "👨‍⚕️ YOUR CRM HAS GOOD DOCTOR HEALTH! 🏥✅" -ForegroundColor Green -BackgroundColor DarkBlue
    Write-Host ""
} elseif ($backendHealthy) {
    Write-Host ""
    Write-Host "⚠️ Backend is healthy but frontend needs attention" -ForegroundColor Yellow
} elseif ($frontendHealthy) {
    Write-Host ""
    Write-Host "⚠️ Frontend is healthy but backend needs attention" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Both services need attention. Check the logs above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue"