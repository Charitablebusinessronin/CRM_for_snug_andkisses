# Simple Docker rebuild for SnugSquad
# Run these commands one by one if the script didn't work

Write-Host "🔄 Rebuilding SnugSquad Docker container..." -ForegroundColor Cyan

# Stop and remove containers
Write-Host "1. Stopping containers..." -ForegroundColor Yellow
docker-compose down

# Force remove the specific container and image
Write-Host "2. Removing old images..." -ForegroundColor Yellow
docker container rm snugsquad-web -f 2>$null
docker image rm snugsquad-web_snugsquad-web -f 2>$null

# Clear build cache
Write-Host "3. Clearing build cache..." -ForegroundColor Yellow
docker system prune -f

# Rebuild with no cache
Write-Host "4. Building fresh container..." -ForegroundColor Cyan
docker-compose build --no-cache

# Start the container
Write-Host "5. Starting container..." -ForegroundColor Green
docker-compose up -d

Write-Host "✅ Complete! Check http://localhost:3000" -ForegroundColor Green
