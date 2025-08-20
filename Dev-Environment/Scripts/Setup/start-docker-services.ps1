#!/usr/bin/env pwsh
# Docker Services Startup Script
# This script starts all database services defined in the docker-compose.yml file

$ErrorActionPreference = "Stop"

# Define paths
$dockerComposeFile = "../../Config/Docker/docker-compose.yml"
$logFile = "../../Temp/Logs/docker-services.log"

# Create log directory if it doesn't exist
$logDir = Split-Path -Path $logFile -Parent
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int] $Port
    )
    
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $Port }
    
    return ($null -ne $connections)
}

# Check if required ports are available
$requiredPorts = @(7001, 7002, 7003, 8001)
$portsInUse = @()

foreach ($port in $requiredPorts) {
    if (Test-PortInUse -Port $port) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "Error: The following ports are already in use: $($portsInUse -join ', ')" -ForegroundColor Red
    Write-Host "Please free these ports before starting Docker services." -ForegroundColor Red
    exit 1
}

# Navigate to the Docker configuration directory
try {
    Push-Location (Split-Path -Path $dockerComposeFile -Parent)
    
    # Start Docker services
    Write-Host "Starting Docker services..." -ForegroundColor Green
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker services started successfully!" -ForegroundColor Green
        
        # Log service status
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $status = docker-compose ps
        
        # Write to log file
        Add-Content -Path $logFile -Value "[$timestamp] Docker services started"
        Add-Content -Path $logFile -Value "----------------------------------------"
        Add-Content -Path $logFile -Value $status
        Add-Content -Path $logFile -Value "----------------------------------------`n"
        
        # Display service status
        Write-Host "`nService Status:" -ForegroundColor Cyan
        Write-Host $status
        
        # Display connection information
        Write-Host "`nConnection Information:" -ForegroundColor Cyan
        Write-Host "PostgreSQL: localhost:7001 (Username: sabir, Password: password, DB: main_db)" -ForegroundColor Yellow
        Write-Host "MongoDB:    localhost:7002 (Username: sabir, Password: password)" -ForegroundColor Yellow
        Write-Host "Redis:      localhost:7003" -ForegroundColor Yellow
        Write-Host "Adminer:    http://localhost:8001" -ForegroundColor Yellow
    }
    else {
        Write-Host "Failed to start Docker services. Check Docker installation and try again." -ForegroundColor Red
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    # Return to original directory
    Pop-Location
}
