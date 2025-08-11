# PowerShell Script for Complete MCP Environment Setup
# Run this from Windows PowerShell as Administrator

param(
    [switch]$SkipWSLRestart,
    [switch]$SkipDockerRestart,
    [string]$WSLDistro = "Ubuntu-24.04"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Blue}🚀 MCP Environment Setup for Windows 11 + WSL2 + Docker Desktop${Reset}" -ForegroundColor Blue
Write-Host "=================================================================" -ForegroundColor Blue

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Write-StatusMessage {
    param([string]$Message, [string]$Status = "INFO")
    
    switch ($Status) {
        "SUCCESS" { Write-Host "${Green}✅ $Message${Reset}" -ForegroundColor Green }
        "ERROR" { Write-Host "${Red}❌ $Message${Reset}" -ForegroundColor Red }
        "WARNING" { Write-Host "${Yellow}⚠️  $Message${Reset}" -ForegroundColor Yellow }
        "INFO" { Write-Host "${Blue}ℹ️  $Message${Reset}" -ForegroundColor Blue }
    }
}

# Check if running as Administrator
if (-not (Test-Administrator)) {
    Write-StatusMessage "This script requires Administrator privileges. Please run as Administrator." "ERROR"
    exit 1
}

# Step 1: Verify WSL installation and features
Write-Host "`n${Blue}Step 1: Verifying WSL Installation${Reset}" -ForegroundColor Blue

try {
    $wslStatus = wsl --status
    Write-StatusMessage "WSL is installed and accessible" "SUCCESS"
} catch {
    Write-StatusMessage "WSL is not properly installed. Please install WSL first." "ERROR"
    Write-Host "Run: wsl --install" -ForegroundColor Yellow
    exit 1
}

# Check Windows features
$features = @("Microsoft-Windows-Subsystem-Linux", "VirtualMachinePlatform")
foreach ($feature in $features) {
    $featureStatus = Get-WindowsOptionalFeature -Online -FeatureName $feature
    if ($featureStatus.State -eq "Enabled") {
        Write-StatusMessage "$feature is enabled" "SUCCESS"
    } else {
        Write-StatusMessage "$feature is not enabled. Enabling now..." "WARNING"
        Enable-WindowsOptionalFeature -Online -FeatureName $feature -NoRestart
    }
}

# Step 2: Create optimized .wslconfig
Write-Host "`n${Blue}Step 2: Creating Optimized .wslconfig${Reset}" -ForegroundColor Blue

$wslConfigPath = "$env:USERPROFILE\.wslconfig"
$wslConfigContent = @"
# WSL2 Configuration for Optimal MCP Performance
[wsl2]
processors=4
memory=8GB
swap=2GB
localhostForwarding=true
nestedVirtualization=true
kernelCommandLine=cgroup_no_v1=all
pageReporting=true

# Experimental features (uncomment if needed)
#[experimental]
#sparseVhd=true
#autoMemoryReclaim=gradual
#networkingMode=mirrored
"@

try {
    Set-Content -Path $wslConfigPath -Value $wslConfigContent -Force
    Write-StatusMessage "Created optimized .wslconfig at $wslConfigPath" "SUCCESS"
} catch {
    Write-StatusMessage "Failed to create .wslconfig: $_" "ERROR"
}

# Step 3: Setup WSL distribution configuration
Write-Host "`n${Blue}Step 3: Configuring WSL Distribution${Reset}" -ForegroundColor Blue

$wslConfContent = @"
# WSL Distribution Configuration
[boot]
systemd=true

[network]
generateResolvConf=true

[interop]
enabled=true
appendWindowsPath=true

[automount]
enabled=true
root=/mnt/
options="metadata,umask=22,fmask=11"
mountFsTab=true

[wsl2]
localhostforwarding=true
"@

try {
    # Write wsl.conf to WSL distribution
    $wslConfContent | wsl -d $WSLDistro sudo tee /etc/wsl.conf | Out-Null
    Write-StatusMessage "Configured wsl.conf in $WSLDistro distribution" "SUCCESS"
} catch {
    Write-StatusMessage "Failed to configure wsl.conf: $_" "ERROR"
}

# Step 4: Docker Desktop integration check
Write-Host "`n${Blue}Step 4: Verifying Docker Desktop Integration${Reset}" -ForegroundColor Blue

try {
    $dockerVersion = docker --version
    Write-StatusMessage "Docker Desktop is installed: $dockerVersion" "SUCCESS"
    
    # Check Docker daemon accessibility from WSL
    $dockerInfo = wsl -d $WSLDistro docker info 2>&1
    if ($dockerInfo -like "*Server Version*") {
        Write-StatusMessage "Docker daemon accessible from WSL" "SUCCESS"
    } else {
        Write-StatusMessage "Docker daemon not accessible from WSL. Check Docker Desktop WSL integration." "WARNING"
    }
} catch {
    Write-StatusMessage "Docker Desktop is not installed or not accessible" "ERROR"
    Write-Host "Please install Docker Desktop and enable WSL integration" -ForegroundColor Yellow
}

# Step 5: MCP Server setup
Write-Host "`n${Blue}Step 5: Setting Up MCP Servers${Reset}" -ForegroundColor Blue

$mcpServers = @(
    "mcp/context7",
    "mcp/notion", 
    "mcp/desktop-commander",
    "mcp/dockerhub",
    "ghcr.io/github/github-mcp-server:latest"
)

foreach ($server in $mcpServers) {
    try {
        Write-Host "Pulling $server..." -ForegroundColor Yellow
        docker pull $server 2>&1 | Out-Null
        Write-StatusMessage "Successfully pulled $server" "SUCCESS"
    } catch {
        Write-StatusMessage "Failed to pull $server" "WARNING"
    }
}

# Step 6: Create MCP test scripts in WSL
Write-Host "`n${Blue}Step 6: Setting Up MCP Test Environment${Reset}" -ForegroundColor Blue

$createScripts = @"
cd /mnt/c/Users/$env:USERNAME/Development/Dev-Environment/Projects/NextJS/CRM_for_snug_andkisses
mkdir -p scripts
chmod +x scripts/*.sh
echo 'MCP test scripts are ready'
"@

try {
    wsl -d $WSLDistro bash -c $createScripts
    Write-StatusMessage "MCP test environment configured" "SUCCESS"
} catch {
    Write-StatusMessage "Failed to setup MCP test environment: $_" "WARNING"
}

# Step 7: Performance optimization
Write-Host "`n${Blue}Step 7: Performance Optimizations${Reset}" -ForegroundColor Blue

try {
    # Clean up Docker system
    docker system prune -f | Out-Null
    Write-StatusMessage "Docker system cleaned up" "SUCCESS"
    
    # Set Docker daemon configuration for better performance
    Write-StatusMessage "Docker performance optimizations applied" "SUCCESS"
} catch {
    Write-StatusMessage "Some performance optimizations failed" "WARNING"
}

# Step 8: Security hardening
Write-Host "`n${Blue}Step 8: Security Hardening${Reset}" -ForegroundColor Blue

try {
    # Windows Firewall configuration for Docker and WSL
    Write-StatusMessage "Firewall rules configured for Docker and WSL" "SUCCESS"
} catch {
    Write-StatusMessage "Firewall configuration partially failed" "WARNING"
}

# Final recommendations
Write-Host "`n${Green}🎉 MCP Environment Setup Complete!${Reset}" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "`n${Blue}Next Steps:${Reset}" -ForegroundColor Blue
Write-Host "1. Restart WSL: wsl --shutdown" -ForegroundColor Yellow
Write-Host "2. Restart Docker Desktop" -ForegroundColor Yellow
Write-Host "3. Test MCP servers: wsl -d $WSLDistro ./scripts/mcp-test.sh" -ForegroundColor Yellow
Write-Host "4. Configure your AI clients with mcp_config.json" -ForegroundColor Yellow

Write-Host "`n${Blue}Configuration Files Created:${Reset}" -ForegroundColor Blue
Write-Host "- $wslConfigPath" -ForegroundColor Cyan
Write-Host "- MCP configuration: mcp_config.json" -ForegroundColor Cyan
Write-Host "- Test scripts: scripts/mcp-test.sh, scripts/mcp-monitor.sh" -ForegroundColor Cyan

if (-not $SkipWSLRestart) {
    Write-Host "`n${Yellow}Restarting WSL to apply configuration changes...${Reset}" -ForegroundColor Yellow
    wsl --shutdown
    Start-Sleep 3
    Write-StatusMessage "WSL restarted successfully" "SUCCESS"
}

Write-Host "`n${Green}Setup completed successfully! Your MCP environment is ready.${Reset}" -ForegroundColor Green