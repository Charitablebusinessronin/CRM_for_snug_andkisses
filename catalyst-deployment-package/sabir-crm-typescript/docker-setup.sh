#!/bin/bash

# Sabir's TypeScript CRM API - Docker Setup Script
# Port 4728 - No conflicts with existing services

echo "🚀 Setting up Sabir's TypeScript CRM API"
echo "📍 Port: 4728 (No conflicts with existing containers)"
echo "🐳 Container: sabir-crm-typescript-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

print_success "Docker is running ✅"

# Check for existing containers on port 4728
if docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -q ":4728->"; then
    print_warning "Port 4728 is already in use by another container"
    echo "Current containers using port 4728:"
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep ":4728->"
    echo ""
    read -p "Do you want to stop conflicting containers? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CONFLICTING_CONTAINERS=$(docker ps --format "{{.Names}}" --filter "publish=4728")
        for container in $CONFLICTING_CONTAINERS; do
            print_status "Stopping container: $container"
            docker stop "$container"
        done
    else
        print_error "Cannot proceed with port conflict. Exiting."
        exit 1
    fi
fi

# Show current CRM containers for reference
print_status "Current CRM containers:"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep -E "(crm|express)" || echo "No CRM containers found"

# Create network if it doesn't exist
NETWORK_NAME="crm-network"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    print_status "Creating Docker network: $NETWORK_NAME"
    docker network create "$NETWORK_NAME"
    print_success "Network created"
else
    print_status "Network $NETWORK_NAME already exists"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
        print_warning "Please update .env with your Zoho credentials before starting"
    else
        print_error ".env.example not found. Please create .env manually"
        exit 1
    fi
fi

# Build and start the container
print_status "Building TypeScript CRM API container..."

# Choose build target based on environment
if [ "$1" == "dev" ] || [ "$1" == "development" ]; then
    print_status "Building development container with hot reload..."
    docker-compose --profile dev up --build -d sabir-crm-typescript-dev
    CONTAINER_NAME="sabir-crm-typescript-dev"
else
    print_status "Building production container..."
    docker-compose up --build -d sabir-crm-typescript
    CONTAINER_NAME="sabir-crm-typescript-api"
fi

# Wait for container to be healthy
print_status "Waiting for container to be healthy..."
MAX_WAIT=60
WAIT_TIME=0

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if docker ps --filter "name=$CONTAINER_NAME" --filter "health=healthy" | grep -q "$CONTAINER_NAME"; then
        print_success "Container is healthy! ✅"
        break
    elif docker ps --filter "name=$CONTAINER_NAME" --filter "health=unhealthy" | grep -q "$CONTAINER_NAME"; then
        print_error "Container failed health check ❌"
        echo "Container logs:"
        docker logs "$CONTAINER_NAME" --tail 20
        exit 1
    else
        echo -n "."
        sleep 2
        WAIT_TIME=$((WAIT_TIME + 2))
    fi
done

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    print_warning "Health check timeout. Container may still be starting..."
    echo "Current container status:"
    docker ps --filter "name=$CONTAINER_NAME"
fi

# Test the API endpoints
print_status "Testing API endpoints..."

# Wait a moment for the service to be fully ready
sleep 3

# Test health endpoint
if curl -s http://localhost:4728/health > /dev/null; then
    print_success "Health endpoint responding ✅"
    
    # Get health status
    echo ""
    echo "=== Health Check Response ==="
    curl -s http://localhost:4728/health | jq . 2>/dev/null || curl -s http://localhost:4728/health
    echo ""
    
    # Test API info endpoint
    echo "=== API Info ==="
    curl -s http://localhost:4728/api | jq . 2>/dev/null || curl -s http://localhost:4728/api
    echo ""
else
    print_warning "API not responding yet. Container may still be starting."
    echo "You can check the logs with: docker logs $CONTAINER_NAME"
fi

# Display container information
echo ""
print_success "=== Container Information ==="
echo "Container Name: $CONTAINER_NAME"
echo "Port Mapping: 4728:4728"
echo "Health Check: http://localhost:4728/health"
echo "API Info: http://localhost:4728/api"
echo ""

print_success "=== Your CRM Services ==="
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | head -1
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep -E "(crm|express|sabir)" || echo "No CRM containers found"

echo ""
print_success "=== TypeScript CRM API is ready! 🎉 ==="
echo ""
echo "🏥 Health Check: http://localhost:4728/health"
echo "📚 API Documentation: http://localhost:4728/api"
echo "🔍 Container Logs: docker logs $CONTAINER_NAME"
echo "🛑 Stop Container: docker-compose down"
echo ""

# Check for existing CRM integration
if docker ps --format "{{.Names}}" | grep -q "snugs-kisses-crm"; then
    print_success "Integration ready! Your existing CRM can now connect to:"
    echo "   Backend API: http://localhost:4728/api"
    echo ""
    echo "Update your frontend API calls to use port 4728 instead of 9000"
    echo "Example: fetch('http://localhost:4728/api/contacts')"
fi

print_status "Setup complete! 🚀"