@echo off
echo ============================================================================
echo SNUG & KISSES HEALTHCARE CRM - DOCKER STARTUP SCRIPT
echo ============================================================================
echo.

cd /d "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses"

echo Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running. Starting CRM services...
echo.

echo Step 1: Cleaning up any existing containers...
docker compose down

echo.
echo Step 2: Building and starting services...
docker compose up --build -d

echo.
echo Step 3: Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo Step 4: Checking service health...
echo.

echo Checking backend health...
curl -f http://localhost:4728/health
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy
) else (
    echo ❌ Backend health check failed
)

echo.
echo Checking frontend health...
curl -f http://localhost:5369/api/health
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy
) else (
    echo ❌ Frontend health check failed
)

echo.
echo ============================================================================
echo CRM SERVICES STATUS
echo ============================================================================
docker compose ps

echo.
echo ============================================================================
echo ACCESS POINTS
echo ============================================================================
echo Frontend: http://localhost:5369
echo Backend API: http://localhost:4728
echo Backend Health: http://localhost:4728/health
echo Frontend Health: http://localhost:5369/api/health
echo.
echo To view logs: npm run docker:logs
echo To stop services: npm run docker:down
echo ============================================================================

pause