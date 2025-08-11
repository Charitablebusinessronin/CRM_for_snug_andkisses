@echo off
REM 🚨 EMERGENCY INFRASTRUCTURE FIX SCRIPT (Windows)
REM Fixes Docker networking, Redis security, and service connectivity

echo 🚨 EMERGENCY: Fixing critical infrastructure failures...

REM Step 1: Stop all containers safely
echo 📦 Stopping all containers...
docker-compose down --remove-orphans
docker system prune -f

REM Step 2: Remove problematic networks  
echo 🌐 Cleaning up Docker networks...
docker network prune -f
docker network rm crm-network 2>nul

REM Step 3: Pull latest images
echo 📥 Pulling fresh Docker images...
docker-compose pull

REM Step 4: Rebuild with no cache
echo 🔨 Rebuilding all services...
docker-compose build --no-cache --parallel

REM Step 5: Start services in dependency order
echo 🚀 Starting infrastructure services...
docker-compose up -d postgres redis

REM Wait for databases to be ready
echo ⏳ Waiting for databases...
timeout /t 30 /nobreak >nul

REM Start backend
echo 🚀 Starting Express backend...
docker-compose up -d express-backend

REM Wait for backend health check
echo ⏳ Waiting for backend health check...
timeout /t 20 /nobreak >nul

REM Test backend connectivity
echo 🔍 Testing backend connectivity...
curl -f http://localhost:4728/health || echo ❌ Backend not responding

REM Start frontend
echo 🚀 Starting Next.js frontend...
docker-compose up -d snugs-kisses-crm

REM Wait for frontend
timeout /t 20 /nobreak >nul

REM Test full connectivity
echo 🔍 Testing full system connectivity...
curl -f http://localhost:5369/api/health || echo ❌ Frontend not responding

REM Show service status
echo 📊 Service Status:
docker-compose ps

REM Show network configuration
echo 🌐 Network Configuration:
docker network ls
docker network inspect crm-network

REM Show logs for debugging
echo 📋 Recent logs:
docker-compose logs --tail=20 express-backend

echo ✅ Infrastructure fix complete!
echo 🌍 Frontend: http://localhost:5369  
echo 🔧 Backend: http://localhost:4728/health
echo 💾 Redis: localhost:6379 (password protected)
echo 🐘 PostgreSQL: localhost:5432

pause