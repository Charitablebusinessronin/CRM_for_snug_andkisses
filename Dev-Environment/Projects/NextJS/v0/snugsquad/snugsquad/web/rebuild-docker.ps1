#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "🚀 Rebuilding SnugSquad web Docker image (no cache) and restarting container..." -ForegroundColor Cyan

# Ensure script runs from its own directory
Set-Location -Path $PSScriptRoot

$imageName = "snugsquad-web:latest"
$containerName = "snugsquad-web"
$port = 3000

try {
    # Stop and remove existing container if present
    $existing = (docker ps -aq --filter "name=$containerName")
    if ($existing) {
        Write-Host "🛑 Stopping container $containerName..."
        docker stop $containerName | Out-Null
        Write-Host "🧹 Removing container $containerName..."
        docker rm $containerName | Out-Null
    }

    # Prune builder and dangling images to avoid stale cache
    Write-Host "🧽 Pruning Docker builder cache..."
    docker builder prune -f | Out-Null
    Write-Host "🧽 Pruning dangling images..."
    docker image prune -f | Out-Null

    # Build without cache
    Write-Host "🏗️  Building image $imageName (no cache)..."
    docker build --no-cache -t $imageName .

    # Run container with or without env file
    $envFile = Join-Path (Get-Location) ".env.local"
    if (Test-Path $envFile) {
        Write-Host "▶️  Starting container with env file .env.local on port $port..."
        docker run -d --name $containerName --env-file .env.local -p ${port}:${port} $imageName | Out-Null
    } else {
        Write-Warning ".env.local not found. Starting container without env file."
        docker run -d --name $containerName -p ${port}:${port} $imageName | Out-Null
    }

    Write-Host "✅ Container is running. Visit http://localhost:$port" -ForegroundColor Green
    docker ps --filter "name=$containerName"
}
catch {
    Write-Error $_
    exit 1
}

# PowerShell script to rebuild Docker container with updated SnugSquad branding
# Run this script to rebuild the container with the latest source code changes

Write-Host "🔄 Rebuilding SnugSquad Docker container with latest changes..." -ForegroundColor Cyan

# Navigate to the web directory
$ProjectPath = "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\v0\snugsquad\snugsquad\web"
Set-Location $ProjectPath

Write-Host "📂 Working directory: $ProjectPath" -ForegroundColor Green

# Stop the current container
Write-Host "🛑 Stopping current container..." -ForegroundColor Yellow
docker-compose down

# Remove old images to force rebuild
Write-Host "🗑️ Removing old images..." -ForegroundColor Yellow
try {
    docker image rm snugsquad-web_snugsquad-web 2>$null
    docker image rm $(docker images -f "dangling=true" -q) 2>$null
} catch {
    Write-Host "   No old images to remove" -ForegroundColor Gray
}

# Clear Docker build cache for this project
Write-Host "🧹 Clearing build cache..." -ForegroundColor Yellow
docker builder prune -f

# Rebuild and start the container
Write-Host "🔨 Building new container with updated source code..." -ForegroundColor Cyan
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
docker-compose up --build -d

# Wait for the container to be ready
Write-Host "⏳ Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check container status
Write-Host "🔍 Container status:" -ForegroundColor Green
docker ps | Select-String "snugsquad"

# Test the endpoint
Write-Host "🌐 Testing the application..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "   HTTP Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Could not reach application yet - container may still be starting" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host "🌐 Application should be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🎨 Expected: SnugSquad branding with plum (#3B2352) and lavender (#D7C7ED) colors" -ForegroundColor Magenta
Write-Host ""
Write-Host "If you still see the default Next.js template, wait 30 seconds and refresh your browser." -ForegroundColor Yellow
