#!/usr/bin/env pwsh
# Node.js Docker Management Script
# This script helps manage Node.js Docker containers for development

param (
    [Parameter(Mandatory = $false)]
    [string]$Action = "start",
    
    [Parameter(Mandatory = $false)]
    [switch]$InstallGlobalPackages = $false
)

# Define paths
$rootDir = "../../"
$dockerComposeFile = "$rootDir/Config/Docker/nodejs-docker-compose.yml"
$logFile = "$rootDir/Temp/Logs/nodejs-docker.log"

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

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            return $false
        }
        return $true
    }
    catch {
        return $false
    }
}

# Function to start Node.js Docker containers
function Start-NodeJsContainers {
    Write-Host "Starting Node.js Docker containers..." -ForegroundColor Cyan
    
    if (-not (Test-DockerRunning)) {
        Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    
    # Check if containers are already running
    $nodeJsContainer = docker ps -q -f "name=nodejs-dev"
    $nodeJsToolsContainer = docker ps -q -f "name=nodejs-tools"
    
    if ($nodeJsContainer -and $nodeJsToolsContainer) {
        Write-Host "Node.js Docker containers are already running." -ForegroundColor Yellow
        return
    }
    
    # Start containers
    docker-compose -f $dockerComposeFile up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start Node.js Docker containers." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Node.js Docker containers started successfully!" -ForegroundColor Green
    
    # Display container information
    docker ps -f "name=nodejs"
}

# Function to stop Node.js Docker containers
function Stop-NodeJsContainers {
    Write-Host "Stopping Node.js Docker containers..." -ForegroundColor Cyan
    
    docker-compose -f $dockerComposeFile down
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to stop Node.js Docker containers." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Node.js Docker containers stopped successfully!" -ForegroundColor Green
}

# Function to restart Node.js Docker containers
function Restart-NodeJsContainers {
    Write-Host "Restarting Node.js Docker containers..." -ForegroundColor Cyan
    
    Stop-NodeJsContainers
    Start-NodeJsContainers
}

# Function to install global Node.js packages in Docker
function Install-GlobalPackages {
    Write-Host "Installing global Node.js packages in Docker..." -ForegroundColor Cyan
    
    # Check if containers are running
    $nodeJsContainer = docker ps -q -f "name=nodejs-dev"
    
    if (-not $nodeJsContainer) {
        Write-Host "Node.js Docker container is not running. Starting containers..." -ForegroundColor Yellow
        Start-NodeJsContainers
    }
    
    # Install global packages in nodejs-dev container
    $packages = @(
        "next",
        "@shopify/cli",
        "@wordpress/scripts",
        "typescript",
        "eslint",
        "prettier",
        "nodemon",
        "pm2",
        "serve"
    )
    
    foreach ($package in $packages) {
        Write-Host "Installing $package globally..." -ForegroundColor Yellow
        docker exec nodejs-dev npm install -g $package
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install $package." -ForegroundColor Red
        } else {
            Write-Host "$package installed successfully!" -ForegroundColor Green
        }
    }
    
    # Configure npm to use custom ports
    Write-Host "Configuring npm to use custom ports..." -ForegroundColor Yellow
    docker exec nodejs-dev npm config set port 5001
    docker exec nodejs-dev npm config set serve-port 5002
    
    Write-Host "Global Node.js packages installed successfully!" -ForegroundColor Green
}

# Function to execute a command in the Node.js container
function Invoke-NodeJsCommand {
    param (
        [string]$Command
    )
    
    # Check if container is running
    $nodeJsContainer = docker ps -q -f "name=nodejs-dev"
    
    if (-not $nodeJsContainer) {
        Write-Host "Node.js Docker container is not running. Starting containers..." -ForegroundColor Yellow
        Start-NodeJsContainers
    }
    
    # Execute command
    Write-Host "Executing command in Node.js container: $Command" -ForegroundColor Cyan
    docker exec nodejs-dev sh -c "$Command"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Command execution failed." -ForegroundColor Red
        exit 1
    }
}

# Function to display Node.js container status
function Show-NodeJsStatus {
    Write-Host "Node.js Docker Container Status:" -ForegroundColor Cyan
    
    # Check if containers exist
    $nodeJsContainer = docker ps -a -q -f "name=nodejs-dev"
    $nodeJsToolsContainer = docker ps -a -q -f "name=nodejs-tools"
    
    if (-not $nodeJsContainer -and -not $nodeJsToolsContainer) {
        Write-Host "No Node.js Docker containers found." -ForegroundColor Yellow
        return
    }
    
    # Display container status
    docker ps -a -f "name=nodejs"
    
    # Display Node.js version
    Write-Host "`nNode.js Version:" -ForegroundColor Cyan
    docker exec nodejs-dev node --version
    
    # Display npm version
    Write-Host "`nnpm Version:" -ForegroundColor Cyan
    docker exec nodejs-dev npm --version
    
    # Display global packages
    Write-Host "`nGlobal npm Packages:" -ForegroundColor Cyan
    docker exec nodejs-dev npm list -g --depth=0
}

# Main script logic
try {
    Write-Log "Node.js Docker Management Script started with action: $Action"
    
    switch ($Action.ToLower()) {
        "start" {
            Start-NodeJsContainers
            
            if ($InstallGlobalPackages) {
                Install-GlobalPackages
            }
        }
        "stop" {
            Stop-NodeJsContainers
        }
        "restart" {
            Restart-NodeJsContainers
        }
        "status" {
            Show-NodeJsStatus
        }
        "install" {
            Install-GlobalPackages
        }
        "exec" {
            $command = Read-Host "Enter command to execute in Node.js container"
            Invoke-NodeJsCommand -Command $command
        }
        default {
            Write-Host "Invalid action: $Action" -ForegroundColor Red
            Write-Host "Valid actions: start, stop, restart, status, install, exec" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Log "Node.js Docker Management Script completed successfully"
} catch {
    Write-Log "Error: $_" "ERROR"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
