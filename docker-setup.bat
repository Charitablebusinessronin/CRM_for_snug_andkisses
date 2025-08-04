@echo off
echo ========================================
echo Snugs & Kisses CRM - Docker Setup
echo ========================================

echo.
echo Building Docker containers...
docker-compose build

echo.
echo Starting development environment...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Checking container status...
docker-compose ps

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Application is available at:
echo   http://localhost:5369
echo.
echo Demo Accounts:
echo   ADMIN:      admin@snugandkisses.demo / SecureDemo2025!
echo   CONTRACTOR: contractor@snugandkisses.demo / SecureDemo2025!
echo   CLIENT:     client@snugandkisses.demo / SecureDemo2025!
echo   EMPLOYEE:   employee@snugandkisses.demo / SecureDemo2025!
echo.
echo Services:
echo   - CRM Application: http://localhost:5369
echo   - Health Check:    http://localhost:5369/api/health
echo   - Login Page:      http://localhost:5369/auth/signin
echo   - PostgreSQL:      localhost:5432
echo   - Redis:           localhost:6379
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo ========================================

pause