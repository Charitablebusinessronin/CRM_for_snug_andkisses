#!/usr/bin/env pwsh
# Port Management Script
# This script helps manage ports for development services according to Sabir's port schema

param (
    [Parameter(Mandatory = $false)]
    [string]$Action = "status",
    
    [Parameter(Mandatory = $false)]
    [int]$Port = 0,
    
    [Parameter(Mandatory = $false)]
    [string]$ServiceType = ""
)

# Port schema constants
$SCRIPT_PORTS_START = 4000
$SCRIPT_PORTS_END = 4999
$WEB_PORTS_START = 5000
$WEB_PORTS_END = 5999
$APP_PORTS_START = 6000
$APP_PORTS_END = 6999
$DB_PORTS_START = 7000
$DB_PORTS_END = 7999
$DEV_TOOLS_PORTS_START = 8000
$DEV_TOOLS_PORTS_END = 8999

# Log file setup
$logFile = "../../Temp/Logs/port-manager.log"
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

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $Port }
    
    return ($null -ne $connections)
}

# Function to get process using a specific port
function Get-ProcessUsingPort {
    param (
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $Port }
    
    if ($connections) {
        $process = Get-Process -Id $connections.OwningProcess -ErrorAction SilentlyContinue
        return $process
    }
    
    return $null
}

# Function to kill process using a specific port
function Stop-ProcessUsingPort {
    param (
        [int]$Port
    )
    
    $process = Get-ProcessUsingPort -Port $Port
    
    if ($process) {
        Write-Log "Stopping process $($process.Name) (PID: $($process.Id)) using port $Port" "WARNING"
        Stop-Process -Id $process.Id -Force
        return $true
    }
    
    Write-Log "No process found using port $Port" "WARNING"
    return $false
}

# Function to get next available port in a range
function Get-NextAvailablePort {
    param (
        [int]$StartPort,
        [int]$EndPort
    )
    
    for ($port = $StartPort; $port -le $EndPort; $port++) {
        if (-not (Test-PortInUse -Port $port)) {
            return $port
        }
    }
    
    return 0
}

# Function to get port range based on service type
function Get-PortRange {
    param (
        [string]$ServiceType
    )
    
    switch ($ServiceType.ToLower()) {
        "script" { return @($SCRIPT_PORTS_START, $SCRIPT_PORTS_END) }
        "web" { return @($WEB_PORTS_START, $WEB_PORTS_END) }
        "app" { return @($APP_PORTS_START, $APP_PORTS_END) }
        "db" { return @($DB_PORTS_START, $DB_PORTS_END) }
        "devtool" { return @($DEV_TOOLS_PORTS_START, $DEV_TOOLS_PORTS_END) }
        default { return @(0, 0) }
    }
}

# Function to display port status
function Show-PortStatus {
    param (
        [int]$Port = 0,
        [string]$ServiceType = ""
    )
    
    if ($Port -gt 0) {
        # Check specific port
        $inUse = Test-PortInUse -Port $Port
        $process = Get-ProcessUsingPort -Port $Port
        
        if ($inUse) {
            Write-Host "Port $Port is in use by process $($process.Name) (PID: $($process.Id))" -ForegroundColor Red
        } else {
            Write-Host "Port $Port is available" -ForegroundColor Green
        }
    } elseif ($ServiceType -ne "") {
        # Check ports for specific service type
        $range = Get-PortRange -ServiceType $ServiceType
        
        if ($range[0] -eq 0) {
            Write-Host "Invalid service type: $ServiceType" -ForegroundColor Red
            Write-Host "Valid types: script, web, app, db, devtool" -ForegroundColor Yellow
            return
        }
        
        Write-Host "Port status for $ServiceType ($($range[0])-$($range[1])):" -ForegroundColor Cyan
        
        $usedPorts = @()
        $availablePorts = @()
        
        for ($port = $range[0]; $port -le $range[1]; $port++) {
            $inUse = Test-PortInUse -Port $port
            
            if ($inUse) {
                $process = Get-ProcessUsingPort -Port $port
                $usedPorts += @{
                    Port = $port
                    Process = $process.Name
                    PID = $process.Id
                }
            } else {
                $availablePorts += $port
            }
        }
        
        # Display used ports
        if ($usedPorts.Count -gt 0) {
            Write-Host "`nUsed ports:" -ForegroundColor Yellow
            $usedPorts | ForEach-Object {
                Write-Host "  Port $($_.Port): $($_.Process) (PID: $($_.PID))" -ForegroundColor Red
            }
        }
        
        # Display available ports (first 10)
        if ($availablePorts.Count -gt 0) {
            Write-Host "`nAvailable ports (showing first 10):" -ForegroundColor Green
            $availablePorts | Select-Object -First 10 | ForEach-Object {
                Write-Host "  Port $_" -ForegroundColor Green
            }
            
            if ($availablePorts.Count -gt 10) {
                Write-Host "  ... and $($availablePorts.Count - 10) more" -ForegroundColor Green
            }
        }
        
        # Show next available port
        $nextPort = Get-NextAvailablePort -StartPort $range[0] -EndPort $range[1]
        if ($nextPort -gt 0) {
            Write-Host "`nNext available port: $nextPort" -ForegroundColor Cyan
        } else {
            Write-Host "`nNo available ports in range $($range[0])-$($range[1])" -ForegroundColor Red
        }
    } else {
        # Show overall port status
        Write-Host "Port Schema Status:" -ForegroundColor Cyan
        
        $serviceTypes = @("script", "web", "app", "db", "devtool")
        
        foreach ($type in $serviceTypes) {
            $range = Get-PortRange -ServiceType $type
            $usedCount = 0
            $totalCount = $range[1] - $range[0] + 1
            
            for ($port = $range[0]; $port -le $range[1]; $port++) {
                if (Test-PortInUse -Port $port) {
                    $usedCount++
                }
            }
            
            $availableCount = $totalCount - $usedCount
            $usagePercentage = [math]::Round(($usedCount / $totalCount) * 100, 2)
            
            # Determine color based on usage
            $color = "Green"
            if ($usagePercentage -gt 75) {
                $color = "Red"
            } elseif ($usagePercentage -gt 50) {
                $color = "Yellow"
            }
            
            Write-Host "`n$($type.ToUpper()) ($($range[0])-$($range[1])):" -ForegroundColor Cyan
            Write-Host "  Used: $usedCount / $totalCount ($usagePercentage%)" -ForegroundColor $color
            
            # Show next available port
            $nextPort = Get-NextAvailablePort -StartPort $range[0] -EndPort $range[1]
            if ($nextPort -gt 0) {
                Write-Host "  Next available port: $nextPort" -ForegroundColor Green
            } else {
                Write-Host "  No available ports" -ForegroundColor Red
            }
        }
    }
}

# Function to find and assign a port for a new service
function Get-AssignPort {
    param (
        [string]$ServiceType
    )
    
    $range = Get-PortRange -ServiceType $ServiceType
    
    if ($range[0] -eq 0) {
        Write-Host "Invalid service type: $ServiceType" -ForegroundColor Red
        Write-Host "Valid types: script, web, app, db, devtool" -ForegroundColor Yellow
        return 0
    }
    
    $port = Get-NextAvailablePort -StartPort $range[0] -EndPort $range[1]
    
    if ($port -eq 0) {
        Write-Host "No available ports in range $($range[0])-$($range[1])" -ForegroundColor Red
        return 0
    }
    
    Write-Host "Assigned port $port for $ServiceType service" -ForegroundColor Green
    return $port
}

# Main script logic
try {
    Write-Log "Port Manager started with action: $Action, port: $Port, service type: $ServiceType"
    
    switch ($Action.ToLower()) {
        "status" {
            Show-PortStatus -Port $Port -ServiceType $ServiceType
        }
        "kill" {
            if ($Port -eq 0) {
                Write-Host "Please specify a port to kill" -ForegroundColor Red
                exit 1
            }
            
            $result = Stop-ProcessUsingPort -Port $Port
            
            if ($result) {
                Write-Host "Successfully stopped process using port $Port" -ForegroundColor Green
            } else {
                Write-Host "Failed to stop process using port $Port" -ForegroundColor Red
            }
        }
        "assign" {
            if ($ServiceType -eq "") {
                Write-Host "Please specify a service type to assign a port" -ForegroundColor Red
                Write-Host "Valid types: script, web, app, db, devtool" -ForegroundColor Yellow
                exit 1
            }
            
            $port = Get-AssignPort -ServiceType $ServiceType
            
            if ($port -gt 0) {
                Write-Host $port
            } else {
                exit 1
            }
        }
        default {
            Write-Host "Invalid action: $Action" -ForegroundColor Red
            Write-Host "Valid actions: status, kill, assign" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Log "Error: $_" "ERROR"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
