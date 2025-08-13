@echo off
REM Sabir's TypeScript CRM API - Docker Setup Script for Windows
REM Port 4728 - No conflicts with existing services

echo 🚀 Setting up Sabir's TypeScript CRM API
echo 📍 Port: 4728 (No conflicts with existing containers)
echo 🐳 Container: sabir-crm-typescript-api
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is running ✅
echo.

REM Check for existing containers on port 4728
docker ps --format "table {{.Names}}\t{{.Ports}}" | findstr ":4728->" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 4728 is already in use by another container
    echo Current containers using port 4728:
    docker ps --format "table {{.Names}}\t{{.Ports}}" | findstr ":4728->"
    echo.
    set /p "choice=Do you want to stop conflicting containers? (y/N): "
    if /i "%choice%"=="y" (
        echo [INFO] Stopping conflicting containers...
        for /f "tokens=*" %%i in ('docker ps --format "{{.Names}}" --filter "publish=4728"') do (
            echo Stopping container: %%i
            docker stop "%%i"
        )
    ) else (
        echo [ERROR] Cannot proceed with port conflict. Exiting.
        pause
        exit /b 1
    )
)

REM Show current CRM containers for reference
echo [INFO] Current CRM containers:
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | findstr /i "crm express" 2>nul
if errorlevel 1 echo No CRM containers found
echo.

REM Create network if it doesn't exist
set NETWORK_NAME=crm-network
docker network ls | findstr "%NETWORK_NAME%" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Creating Docker network: %NETWORK_NAME%
    docker network create "%NETWORK_NAME%"
    echo [SUCCESS] Network created
) else (
    echo [INFO] Network %NETWORK_NAME% already exists
)

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env >nul
        echo [SUCCESS] Created .env from .env.example
        echo [WARNING] Please update .env with your Zoho credentials before starting
    ) else (
        echo [ERROR] .env.example not found. Please create .env manually
        pause
        exit /b 1
    )
)

REM Build and start the container
echo [INFO] Building TypeScript CRM API container...

REM Choose build target based on argument
if "%1"=="dev" (
    echo [INFO] Building development container with hot reload...
    docker-compose --profile dev up --build -d sabir-crm-typescript-dev
    set CONTAINER_NAME=sabir-crm-typescript-dev
) else if "%1"=="development" (
    echo [INFO] Building development container with hot reload...
    docker-compose --profile dev up --build -d sabir-crm-typescript-dev
    set CONTAINER_NAME=sabir-crm-typescript-dev
) else (
    echo [INFO] Building production container...
    docker-compose up --build -d sabir-crm-typescript
    set CONTAINER_NAME=sabir-crm-typescript-api
)

REM Wait for container to be healthy
echo [INFO] Waiting for container to be healthy...
set MAX_WAIT=30
set /a WAIT_TIME=0

:healthcheck_loop
if %WAIT_TIME% geq %MAX_WAIT% goto healthcheck_timeout

docker ps --filter "name=%CONTAINER_NAME%" --filter "health=healthy" | findstr "%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Container is healthy! ✅
    goto healthcheck_done
)

docker ps --filter "name=%CONTAINER_NAME%" --filter "health=unhealthy" | findstr "%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] Container failed health check ❌
    echo Container logs:
    docker logs "%CONTAINER_NAME%" --tail 20
    pause
    exit /b 1
)

echo|set /p="."
timeout /t 2 /nobreak >nul
set /a WAIT_TIME+=2
goto healthcheck_loop

:healthcheck_timeout
echo [WARNING] Health check timeout. Container may still be starting...
echo Current container status:
docker ps --filter "name=%CONTAINER_NAME%"

:healthcheck_done
REM Test the API endpoints
echo.
echo [INFO] Testing API endpoints...

REM Wait a moment for the service to be fully ready
timeout /t 3 /nobreak >nul

REM Test health endpoint using PowerShell (more reliable than curl on Windows)
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:4728/health' -TimeoutSec 5; Write-Host '[SUCCESS] Health endpoint responding ✅'; Write-Host ''; Write-Host '=== Health Check Response ==='; $response | ConvertTo-Json -Depth 3; Write-Host '' } catch { Write-Host '[WARNING] API not responding yet. Container may still be starting.' }"

REM Display container information
echo.
echo [SUCCESS] === Container Information ===
echo Container Name: %CONTAINER_NAME%
echo Port Mapping: 4728:4728
echo Health Check: http://localhost:4728/health
echo API Info: http://localhost:4728/api
echo.

echo [SUCCESS] === Your CRM Services ===
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | findstr /i "crm express sabir" 2>nul
if errorlevel 1 echo No CRM containers found

echo.
echo [SUCCESS] === TypeScript CRM API is ready! 🎉 ===
echo.
echo 🏥 Health Check: http://localhost:4728/health
echo 📚 API Documentation: http://localhost:4728/api
echo 🔍 Container Logs: docker logs %CONTAINER_NAME%
echo 🛑 Stop Container: docker-compose down
echo.

REM Check for existing CRM integration
docker ps --format "{{.Names}}" | findstr "snugs-kisses-crm" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Integration ready! Your existing CRM can now connect to:
    echo    Backend API: http://localhost:4728/api
    echo.
    echo Update your frontend API calls to use port 4728 instead of 9000
    echo Example: fetch('http://localhost:4728/api/contacts'^)
)

echo [INFO] Setup complete! 🚀
pause