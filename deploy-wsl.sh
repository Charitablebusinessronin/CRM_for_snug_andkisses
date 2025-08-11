#!/bin/bash
# ============================================================================
# SNUG & KISSES CRM - WSL DEPLOYMENT SCRIPT
# ============================================================================

echo "============================================================================"
echo "🚀 SNUG & KISSES CRM - WSL DEPLOYMENT & HEALTH CHECK"
echo "============================================================================"
echo ""

# Convert Windows path to WSL path
PROJECT_PATH="/mnt/c/Users/SabirAsheed/Development/Dev-Environment/Projects/NextJS/CRM_for_snug_andkisses"

echo "📁 Changing to project directory..."
cd "$PROJECT_PATH" || {
    echo "❌ ERROR: Cannot access project directory: $PROJECT_PATH"
    echo "Make sure the path exists and WSL can access Windows drives"
    exit 1
}

echo "✅ Working in: $(pwd)"

# Check Docker status
echo ""
echo "🔍 Checking Docker status..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running or not accessible from WSL"
    echo "💡 Make sure:"
    echo "   1. Docker Desktop is running"
    echo "   2. WSL 2 integration is enabled in Docker Desktop settings"
    echo "   3. Your WSL distribution is enabled in Docker Desktop"
    exit 1
fi

echo "✅ Docker is running and accessible from WSL"

# Check docker-compose
if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
    echo "❌ ERROR: docker-compose not found"
    echo "💡 Try: sudo apt update && sudo apt install docker-compose"
    exit 1
fi

echo "✅ Docker Compose is available"

# Clean up existing containers
echo ""
echo "🧹 Cleaning up existing containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null
echo "✅ Cleanup completed"

# Build and start services
echo ""
echo "🔨 Building and starting services..."
echo "This may take a few minutes for the first build..."

# Use docker compose (newer) or docker-compose (legacy)
if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "Using: $COMPOSE_CMD"

# Build with verbose output
$COMPOSE_CMD up --build -d

BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo "Showing recent logs..."
    $COMPOSE_CMD logs --tail=50
    exit 1
fi

# Wait for services to start
echo ""
echo "⏳ Waiting 60 seconds for services to fully start..."
sleep 60

# Check service status
echo ""
echo "🔍 Current service status:"
$COMPOSE_CMD ps

# Health check function
check_health() {
    local url=$1
    local service_name=$2
    local max_attempts=5
    local attempt=1
    
    echo ""
    echo "📊 $service_name Health Check:"
    
    while [ $attempt -le $max_attempts ]; do
        echo "   Attempt $attempt/$max_attempts..."
        
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo "✅ $service_name IS HEALTHY! 🎉"
            # Show the actual response
            echo "Response:"
            curl -s "$url" | jq . 2>/dev/null || curl -s "$url"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    echo "❌ $service_name health check failed after $max_attempts attempts"
    echo "Checking $service_name logs..."
    $COMPOSE_CMD logs "$(echo "$service_name" | tr '[:upper:]' '[:lower:]')" --tail=20
    return 1
}

# Install jq if not available (for pretty JSON formatting)
if ! command -v jq >/dev/null 2>&1; then
    echo "Installing jq for JSON formatting..."
    sudo apt update >/dev/null 2>&1 && sudo apt install -y jq >/dev/null 2>&1
fi

echo ""
echo "🏥 HEALTH CHECK RESULTS:"
echo "============================================================================"

# Backend health check
BACKEND_HEALTHY=false
if check_health "http://localhost:4728/health" "BACKEND"; then
    BACKEND_HEALTHY=true
fi

# Frontend health check  
FRONTEND_HEALTHY=false
if check_health "http://localhost:5369/api/health" "FRONTEND"; then
    FRONTEND_HEALTHY=true
fi

# Additional service checks
echo ""
echo "🔍 Additional Service Information:"
echo "Backend container status:"
$COMPOSE_CMD exec backend ps aux 2>/dev/null || echo "Backend container not accessible"

echo ""
echo "Frontend container status:"
$COMPOSE_CMD exec frontend ps aux 2>/dev/null || echo "Frontend container not accessible"

# Final status
echo ""
echo "📋 Final Service Status:"
$COMPOSE_CMD ps

echo ""
echo "============================================================================"
echo "🎯 ACCESS POINTS"
echo "============================================================================"
echo "🌐 Frontend Application: http://localhost:5369"
echo "🔌 Backend API: http://localhost:4728"
echo "🏥 Backend Health: http://localhost:4728/health"
echo "🏥 Frontend Health: http://localhost:5369/api/health"
echo ""
echo "📊 To view real-time logs: $COMPOSE_CMD logs -f"
echo "🛑 To stop services: $COMPOSE_CMD down"
echo "🔄 To restart: $COMPOSE_CMD restart"
echo "🔍 To check logs: $COMPOSE_CMD logs [service_name]"
echo "============================================================================"

# Final health assessment
echo ""
if [ "$BACKEND_HEALTHY" = true ] && [ "$FRONTEND_HEALTHY" = true ]; then
    echo "🎉 SUCCESS! Both services are up and running with good health!"
    echo "👨‍⚕️ YOUR CRM HAS GOOD DOCTOR HEALTH! 🏥✅"
    echo ""
    echo "🚀 You can now access your CRM at: http://localhost:5369"
elif [ "$BACKEND_HEALTHY" = true ]; then
    echo "⚠️ Backend is healthy but frontend needs attention"
    echo "🔍 Check frontend logs: $COMPOSE_CMD logs frontend"
elif [ "$FRONTEND_HEALTHY" = true ]; then
    echo "⚠️ Frontend is healthy but backend needs attention"  
    echo "🔍 Check backend logs: $COMPOSE_CMD logs backend"
else
    echo "❌ Both services need attention. Check the logs above."
    echo "🔍 Debug commands:"
    echo "   $COMPOSE_CMD logs backend"
    echo "   $COMPOSE_CMD logs frontend"
    echo "   $COMPOSE_CMD exec backend curl http://localhost:4728/health"
    echo "   $COMPOSE_CMD exec frontend curl http://localhost:5369/api/health"
fi

echo ""
echo "Press Enter to continue..."
read -r