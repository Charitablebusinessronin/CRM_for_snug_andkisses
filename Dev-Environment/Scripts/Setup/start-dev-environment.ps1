#!/usr/bin/env pwsh
# Development Environment Starter Script
# This script starts all necessary services for development

param (
    [Parameter(Mandatory = $false)]
    [switch]$StartDocker = $true,
    
    [Parameter(Mandatory = $false)]
    [switch]$CheckPorts = $true,
    
    [Parameter(Mandatory = $false)]
    [switch]$OpenWindsurf = $true
)

# Define paths
$rootDir = "../../"
$dockerScript = "$rootDir/Scripts/Setup/start-docker-services.ps1"
$portManagerScript = "$rootDir/Scripts/Port-Management/port-manager.ps1"
$windsurfWorkspace = "$rootDir/Config/Windsurf/workspace.json"
$logFile = "$rootDir/Temp/Logs/dev-environment-start.log"

# Create log directory if it doesn't exist
$logDir = Split-Path -Path $logFile -Parent
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Function to log messages
function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Function to display banner
function Show-Banner {
    $banner = @"
    
 ____             _____            
|  _ \  _____   _|___ / _ ____   __
| | | |/ _ \ \ / / |_ \| '_ \ \ / /
| |_| |  __/\ V / ___) | | | \ V / 
|____/ \___| \_/ |____/|_| |_|\_/  
                                   
 _____            _                                      _   
| ____|_ ____   _(_)_ __ ___  _ __  _ __ ___   ___ _ __ | |_ 
|  _| | '_ \ \ / / | '__/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|
| |___| | | \ V /| | | | (_) | | | | | | | | |  __/ | | | |_ 
|_____|_| |_|\_/ |_|_|  \___/|_| |_|_| |_| |_|\___|_| |_|\__|
                                                             
"@
    
    Write-Host $banner -ForegroundColor Cyan
    Write-Host "Starting development environment..." -ForegroundColor Green
}

# Function to check critical ports
function Check-CriticalPorts {
    Write-Host "`nChecking critical ports..." -ForegroundColor Cyan
    
    $criticalPorts = @(
        @{ Port = 5001; Service = "Next.js Development" },
        @{ Port = 6001; Service = "Express API" },
        @{ Port = 7001; Service = "PostgreSQL" },
        @{ Port = 7002; Service = "MongoDB" },
        @{ Port = 7003; Service = "Redis" },
        @{ Port = 8001; Service = "Adminer" }
    )
    
    $portConflicts = @()
    
    foreach ($portInfo in $criticalPorts) {
        $port = $portInfo.Port
        $service = $portInfo.Service
        
        $inUse = & $portManagerScript -Action status -Port $port
        
        if ($inUse -match "Port $port is in use") {
            Write-Host "  ❌ Port $port ($service) is already in use" -ForegroundColor Red
            $portConflicts += $portInfo
        } else {
            Write-Host "  ✅ Port $port ($service) is available" -ForegroundColor Green
        }
    }
    
    if ($portConflicts.Count -gt 0) {
        Write-Host "`nPort conflicts detected!" -ForegroundColor Red
        Write-Host "The following ports are already in use:" -ForegroundColor Yellow
        
        foreach ($conflict in $portConflicts) {
            Write-Host "  - Port $($conflict.Port) ($($conflict.Service))" -ForegroundColor Yellow
        }
        
        $response = Read-Host "Do you want to kill the processes using these ports? (y/n)"
        
        if ($response.ToLower() -eq "y") {
            foreach ($conflict in $portConflicts) {
                Write-Host "Killing process using port $($conflict.Port)..." -ForegroundColor Yellow
                & $portManagerScript -Action kill -Port $conflict.Port
            }
        } else {
            Write-Host "Port conflicts not resolved. Some services may not start correctly." -ForegroundColor Red
        }
    } else {
        Write-Host "`nAll critical ports are available!" -ForegroundColor Green
    }
}

# Function to start Docker services
function Start-DockerServices {
    Write-Host "`nStarting Docker services..." -ForegroundColor Cyan
    
    if (Test-Path -Path $dockerScript) {
        & $dockerScript
    } else {
        Write-Host "Docker services script not found: $dockerScript" -ForegroundColor Red
    }
}

# Function to open Windsurf workspace
function Open-WindsurfWorkspace {
    Write-Host "`nOpening Windsurf workspace..." -ForegroundColor Cyan
    
    if (Test-Path -Path $windsurfWorkspace) {
        Start-Process "windsurf" -ArgumentList "--open-workspace", $windsurfWorkspace
        Write-Host "Windsurf workspace opened successfully!" -ForegroundColor Green
    } else {
        Write-Host "Windsurf workspace file not found: $windsurfWorkspace" -ForegroundColor Red
    }
}

# Function to display port schema status
function Show-PortSchemaStatus {
    Write-Host "`nPort Schema Status:" -ForegroundColor Cyan
    & $portManagerScript -Action status
}

# Main script logic
try {
    Show-Banner
    
    # Check critical ports
    if ($CheckPorts) {
        Check-CriticalPorts
    }
    
    # Start Docker services
    if ($StartDocker) {
        Start-DockerServices
    }
    
    # Show port schema status
    Show-PortSchemaStatus
    
    # Open Windsurf workspace
    if ($OpenWindsurf) {
        Open-WindsurfWorkspace
    }
    
    Write-Host "`nDevelopment environment started successfully!" -ForegroundColor Green
    Write-Log "Development environment started successfully"
} catch {
    Write-Log "Error: $_" "ERROR"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
