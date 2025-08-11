@echo off
echo ============================================================================
echo 🚀 SNUG & KISSES CRM - DEPLOYMENT & HEALTH CHECK
echo ============================================================================
echo.

cd /d "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses"

echo 🔍 Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo 🧹 Cleaning up existing containers...
docker compose down
echo ✅ Cleanup completed

echo.
echo 🔨 Building and starting services...
echo This may take a few minutes for the first build...
docker compose up --build -d

echo.
echo ⏳ Waiting 45 seconds for services to fully start...
timeout /t 45 /nobreak >nul

echo.
echo 🔍 Checking service status...
docker compose ps

echo.
echo 🏥 HEALTH CHECK RESULTS:
echo ============================================================================

echo.
echo 📊 Backend Health Check:
curl -s -f http://localhost:4728/health
if %errorlevel% equ 0 (
    echo ✅ BACKEND IS HEALTHY! 🎉
) else (
    echo ❌ Backend health check failed
    echo Checking backend logs...
    docker compose logs backend --tail=20
)

echo.
echo 🌐 Frontend Health Check:
curl -s -f http://localhost:5369/api/health
if %errorlevel% equ 0 (
    echo ✅ FRONTEND IS HEALTHY! 🎉
) else (
    echo ❌ Frontend health check failed
    echo Checking frontend logs...
    docker compose logs frontend --tail=20
)

echo.
echo 📋 Final Service Status:
docker compose ps

echo.
echo ============================================================================
echo 🎯 ACCESS POINTS
echo ============================================================================
echo 🌐 Frontend Application: http://localhost:5369
echo 🔌 Backend API: http://localhost:4728
echo 🏥 Backend Health: http://localhost:4728/health
echo 🏥 Frontend Health: http://localhost:5369/api/health
echo.
echo 📊 To view real-time logs: docker compose logs -f
echo 🛑 To stop services: docker compose down
echo ============================================================================

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Both services are up and running with good health!
    echo 👨‍⚕️ Your CRM has GOOD DOCTOR HEALTH! 🏥✅
) else (
    echo.
    echo ⚠️ Some services may have issues. Check the logs above.
)

echo.
pause
