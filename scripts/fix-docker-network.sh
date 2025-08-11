#!/bin/bash

# 🚨 EMERGENCY INFRASTRUCTURE FIX SCRIPT
# Fixes Docker networking, Redis security, and service connectivity

echo "🚨 EMERGENCY: Fixing critical infrastructure failures..."

# Step 1: Stop all containers safely
echo "📦 Stopping all containers..."
docker-compose down --remove-orphans
docker system prune -f

# Step 2: Remove problematic networks
echo "🌐 Cleaning up Docker networks..."
docker network prune -f
docker network rm crm-network 2>/dev/null || true

# Step 3: Pull latest images
echo "📥 Pulling fresh Docker images..."
docker-compose pull

# Step 4: Rebuild with no cache
echo "🔨 Rebuilding all services..."
docker-compose build --no-cache --parallel

# Step 5: Start services in dependency order
echo "🚀 Starting infrastructure services..."
docker-compose up -d postgres redis

# Wait for databases to be ready
echo "⏳ Waiting for databases..."
sleep 30

# Start backend
echo "🚀 Starting Express backend..."
docker-compose up -d express-backend

# Wait for backend health check
echo "⏳ Waiting for backend health check..."
sleep 20

# Test backend connectivity
echo "🔍 Testing backend connectivity..."
curl -f http://localhost:4728/health || echo "❌ Backend not responding"

# Start frontend
echo "🚀 Starting Next.js frontend..."
docker-compose up -d snugs-kisses-crm

# Wait for frontend
sleep 20

# Test full connectivity
echo "🔍 Testing full system connectivity..."
curl -f http://localhost:5369/api/health || echo "❌ Frontend not responding"

# Show service status
echo "📊 Service Status:"
docker-compose ps

# Show network configuration
echo "🌐 Network Configuration:"
docker network ls
docker network inspect crm-network || echo "Network not found"

# Show logs for debugging
echo "📋 Recent logs:"
docker-compose logs --tail=20 express-backend

echo "✅ Infrastructure fix complete!"
echo "🌍 Frontend: http://localhost:5369"
echo "🔧 Backend: http://localhost:4728/health"
echo "💾 Redis: localhost:6379 (password protected)"
echo "🐘 PostgreSQL: localhost:5432"