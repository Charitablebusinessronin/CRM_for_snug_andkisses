#!/bin/bash
# Simple WSL deployment script - step by step debugging

echo "🔍 DEBUGGING WSL DEPLOYMENT"
echo "=========================="

# Check current location
echo "Current directory: $(pwd)"

# Check if we can access the project directory
PROJECT_PATH="/mnt/c/Users/SabirAsheed/Development/Dev-Environment/Projects/NextJS/CRM_for_snug_andkisses"
echo "Trying to access: $PROJECT_PATH"

if [ -d "$PROJECT_PATH" ]; then
    echo "✅ Directory exists"
    cd "$PROJECT_PATH"
    echo "✅ Changed to directory: $(pwd)"
    
    # List important files
    echo ""
    echo "📁 Files in directory:"
    ls -la | grep -E "(docker-compose|\.env|package\.json)"
    
else
    echo "❌ Directory not found: $PROJECT_PATH"
    echo ""
    echo "🔍 Let's find the correct path..."
    echo "Checking /mnt/c/Users/SabirAsheed..."
    ls -la /mnt/c/Users/SabirAsheed/ 2>/dev/null || echo "Path not accessible"
    
    exit 1
fi

# Check Docker
echo ""
echo "🐳 Checking Docker..."
if command -v docker >/dev/null; then
    echo "✅ Docker command found"
    if docker info >/dev/null 2>&1; then
        echo "✅ Docker daemon accessible"
    else
        echo "❌ Docker daemon not accessible"
        echo "Error details:"
        docker info 2>&1 | head -5
    fi
else
    echo "❌ Docker command not found"
fi

# Check Docker Compose
echo ""
echo "🔧 Checking Docker Compose..."
if docker compose version >/dev/null 2>&1; then
    echo "✅ Docker Compose v2 available"
    docker compose version
elif command -v docker-compose >/dev/null; then
    echo "✅ Docker Compose legacy available"
    docker-compose --version
else
    echo "❌ Docker Compose not found"
fi

echo ""
echo "🚀 Ready to proceed? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Starting deployment..."
    
    # Clean up first
    echo "Cleaning up..."
    docker compose down 2>/dev/null || docker-compose down 2>/dev/null
    
    # Start services
    echo "Building and starting..."
    if docker compose up --build -d; then
        echo "✅ Services started successfully"
        
        echo "Waiting 30 seconds..."
        sleep 30
        
        echo "Checking status..."
        docker compose ps
        
        echo "Testing health endpoints..."
        echo "Backend health:"
        curl -s http://localhost:4728/health || echo "Backend not responding"
        
        echo ""
        echo "Frontend health:"
        curl -s http://localhost:5369/api/health || echo "Frontend not responding"
        
    else
        echo "❌ Failed to start services"
        echo "Checking logs..."
        docker compose logs --tail=20
    fi
else
    echo "Deployment cancelled"
fi