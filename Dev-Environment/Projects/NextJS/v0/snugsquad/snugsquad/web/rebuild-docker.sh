#!/bin/bash
# Docker rebuild script for SnugSquad with updated branding

echo "🔄 Rebuilding SnugSquad Docker container with latest changes..."

# Navigate to the web directory
cd /mnt/c/Users/SabirAsheed/Development/Dev-Environment/Projects/NextJS/v0/snugsquad/snugsquad/web

# Stop the current container
echo "🛑 Stopping current container..."
docker-compose down

# Remove old images to force rebuild
echo "🗑️ Removing old images..."
docker image rm snugsquad-web_snugsquad-web 2>/dev/null || true
docker image rm $(docker images -f "dangling=true" -q) 2>/dev/null || true

# Clear Docker build cache for this project
echo "🧹 Clearing build cache..."
docker builder prune -f

# Rebuild and start the container
echo "🔨 Building new container with updated source code..."
docker-compose up --build -d

# Wait for the container to be ready
echo "⏳ Waiting for container to start..."
sleep 10

# Check container status
echo "🔍 Container status:"
docker ps | grep snugsquad

# Test the endpoint
echo "🌐 Testing the application..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000

echo "✅ Rebuild complete! Application should be available at http://localhost:3000"
echo "🎨 Expected: SnugSquad branding with plum and lavender colors"
