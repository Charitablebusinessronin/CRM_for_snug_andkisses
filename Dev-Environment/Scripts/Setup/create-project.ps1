#!/usr/bin/env pwsh
# Project Creation Script
# This script automates the creation of new projects with proper port assignments

param (
    [Parameter(Mandatory = $true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory = $true)]
    [ValidateSet("nextjs", "express", "wordpress", "shopify")]
    [string]$ProjectType,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputDirectory = "",
    
    [Parameter(Mandatory = $false)]
    [switch]$UseTypeScript = $true
)

# Define paths
$rootDir = "../../"
$templatesDir = "$rootDir/Projects"
$portManagerScript = "$rootDir/Scripts/Port-Management/port-manager.ps1"
$logFile = "$rootDir/Temp/Logs/project-creation.log"

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

# Function to get port for project type
function Get-ProjectPort {
    param (
        [string]$ProjectType
    )
    
    $serviceType = ""
    
    switch ($ProjectType.ToLower()) {
        "nextjs" { $serviceType = "web" }
        "express" { $serviceType = "app" }
        "wordpress" { $serviceType = "web" }
        "shopify" { $serviceType = "web" }
        default { $serviceType = "web" }
    }
    
    $port = & $portManagerScript -Action assign -ServiceType $serviceType
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Failed to assign port for $ProjectType project" "ERROR"
        exit 1
    }
    
    return $port
}

# Function to create a Next.js project
function New-NextJSProject {
    param (
        [string]$ProjectName,
        [string]$OutputPath,
        [int]$Port
    )
    
    Write-Log "Creating Next.js project: $ProjectName at $OutputPath with port $Port"
    
    # Copy template files
    $templateDir = "$templatesDir/NextJS/template"
    
    if (-not (Test-Path -Path $templateDir)) {
        Write-Log "Next.js template directory not found: $templateDir" "ERROR"
        exit 1
    }
    
    # Create project directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Copy template files
    Copy-Item -Path "$templateDir/*" -Destination $OutputPath -Recurse -Force
    
    # Update package.json with project name and port
    $packageJsonPath = "$OutputPath/package.json"
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    $packageJson.name = $ProjectName
    $packageJson.scripts.dev = "next dev -p $Port"
    $packageJson.scripts.start = "next start -p $Port"
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    
    # Create basic project structure
    New-Item -ItemType Directory -Path "$OutputPath/src" -Force | Out-Null
    New-Item -ItemType Directory -Path "$OutputPath/src/app" -Force | Out-Null
    New-Item -ItemType Directory -Path "$OutputPath/src/components" -Force | Out-Null
    New-Item -ItemType Directory -Path "$OutputPath/public" -Force | Out-Null
    
    # Create basic app files
    $layoutContent = @"
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '$ProjectName',
  description: 'Created with Sabir\'s Development Environment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
"@
    
    $pageContent = @"
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Welcome to $ProjectName</h1>
      <p>Running on port $Port</p>
    </main>
  )
}
"@
    
    $globalCssContent = @"
:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
"@
    
    $pageModuleCssContent = @"
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rem;
  min-height: 100vh;
}

.main h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
"@
    
    Set-Content -Path "$OutputPath/src/app/layout.tsx" -Value $layoutContent
    Set-Content -Path "$OutputPath/src/app/page.tsx" -Value $pageContent
    Set-Content -Path "$OutputPath/src/app/globals.css" -Value $globalCssContent
    Set-Content -Path "$OutputPath/src/app/page.module.css" -Value $pageModuleCssContent
    
    Write-Log "Next.js project created successfully: $ProjectName"
    Write-Host "Next.js project created successfully: $ProjectName" -ForegroundColor Green
    Write-Host "To start the development server, run:" -ForegroundColor Cyan
    Write-Host "  cd $OutputPath" -ForegroundColor Yellow
    Write-Host "  npm install" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Write-Host "The application will be available at: http://localhost:$Port" -ForegroundColor Cyan
}

# Function to create an Express API project
function New-ExpressProject {
    param (
        [string]$ProjectName,
        [string]$OutputPath,
        [int]$Port
    )
    
    Write-Log "Creating Express API project: $ProjectName at $OutputPath with port $Port"
    
    # Copy template files
    $templateDir = "$templatesDir/APIs/template"
    
    if (-not (Test-Path -Path $templateDir)) {
        Write-Log "Express API template directory not found: $templateDir" "ERROR"
        exit 1
    }
    
    # Create project directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Copy template files
    Copy-Item -Path "$templateDir/*" -Destination $OutputPath -Recurse -Force
    
    # Update package.json with project name
    $packageJsonPath = "$OutputPath/package.json"
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    $packageJson.name = $ProjectName
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    
    # Update server.ts with port
    $serverFilePath = "$OutputPath/src/server.ts"
    $serverContent = Get-Content -Path $serverFilePath -Raw
    $serverContent = $serverContent -replace "const PORT = process.env.PORT \|\| \d+", "const PORT = process.env.PORT || $Port"
    Set-Content -Path $serverFilePath -Value $serverContent
    
    # Create .env file
    $envContent = @"
PORT=$Port
NODE_ENV=development
"@
    
    Set-Content -Path "$OutputPath/.env" -Value $envContent
    
    Write-Log "Express API project created successfully: $ProjectName"
    Write-Host "Express API project created successfully: $ProjectName" -ForegroundColor Green
    Write-Host "To start the development server, run:" -ForegroundColor Cyan
    Write-Host "  cd $OutputPath" -ForegroundColor Yellow
    Write-Host "  npm install" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Write-Host "The API will be available at: http://localhost:$Port" -ForegroundColor Cyan
}

# Function to create a WordPress project
function New-WordPressProject {
    param (
        [string]$ProjectName,
        [string]$OutputPath,
        [int]$Port
    )
    
    Write-Log "Creating WordPress project: $ProjectName at $OutputPath with port $Port"
    
    # Copy template files
    $templateDir = "$templatesDir/WordPress/template"
    
    if (-not (Test-Path -Path $templateDir)) {
        Write-Log "WordPress template directory not found: $templateDir" "ERROR"
        exit 1
    }
    
    # Create project directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Copy template files
    Copy-Item -Path "$templateDir/*" -Destination $OutputPath -Recurse -Force
    
    # Create wp-config.php from sample
    $configSamplePath = "$OutputPath/wp-config-sample.php"
    $configPath = "$OutputPath/wp-config.php"
    
    if (Test-Path -Path $configSamplePath) {
        $configContent = Get-Content -Path $configSamplePath -Raw
        $configContent = $configContent -replace "define\( 'WP_SITEURL', 'http://localhost:\d+' \)", "define( 'WP_SITEURL', 'http://localhost:$Port' )"
        $configContent = $configContent -replace "define\( 'WP_HOME', 'http://localhost:\d+' \)", "define( 'WP_HOME', 'http://localhost:$Port' )"
        Set-Content -Path $configPath -Value $configContent
    }
    
    # Create docker-compose.yml for WordPress
    $dockerComposeContent = @"
version: '3'

services:
  wordpress:
    image: wordpress:latest
    container_name: ${ProjectName}-wordpress
    restart: unless-stopped
    ports:
      - "$Port:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:5.7
    container_name: ${ProjectName}-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
"@
    
    Set-Content -Path "$OutputPath/docker-compose.yml" -Value $dockerComposeContent
    
    Write-Log "WordPress project created successfully: $ProjectName"
    Write-Host "WordPress project created successfully: $ProjectName" -ForegroundColor Green
    Write-Host "To start the WordPress site, run:" -ForegroundColor Cyan
    Write-Host "  cd $OutputPath" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor Yellow
    Write-Host "The WordPress site will be available at: http://localhost:$Port" -ForegroundColor Cyan
}

# Function to create a Shopify app project
function New-ShopifyProject {
    param (
        [string]$ProjectName,
        [string]$OutputPath,
        [int]$Port
    )
    
    Write-Log "Creating Shopify app project: $ProjectName at $OutputPath with port $Port"
    
    # Copy template files
    $templateDir = "$templatesDir/Shopify/template"
    
    if (-not (Test-Path -Path $templateDir)) {
        Write-Log "Shopify template directory not found: $templateDir" "ERROR"
        exit 1
    }
    
    # Create project directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Copy template files
    Copy-Item -Path "$templateDir/*" -Destination $OutputPath -Recurse -Force
    
    # Update package.json with project name and port
    $packageJsonPath = "$OutputPath/package.json"
    $packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
    
    $packageJson.name = $ProjectName
    $packageJson.scripts.dev = "cross-env PORT=$Port shopify app dev"
    
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath
    
    # Create basic web directory structure
    New-Item -ItemType Directory -Path "$OutputPath/web/frontend" -Force | Out-Null
    New-Item -ItemType Directory -Path "$OutputPath/web/backend" -Force | Out-Null
    
    # Create basic index.js
    $indexContent = @"
// Shopify App - $ProjectName
// Running on port $Port

import { resolve } from 'path';
import express from 'express';

const PORT = process.env.PORT || $Port;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>$ProjectName - Shopify App</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { color: #5c6ac4; }
        </style>
      </head>
      <body>
        <h1>$ProjectName</h1>
        <p>Shopify app running on port $Port</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(\`$ProjectName app running on port \${PORT}\`);
});
"@
    
    Set-Content -Path "$OutputPath/web/index.js" -Value $indexContent
    
    Write-Log "Shopify app project created successfully: $ProjectName"
    Write-Host "Shopify app project created successfully: $ProjectName" -ForegroundColor Green
    Write-Host "To start the development server, run:" -ForegroundColor Cyan
    Write-Host "  cd $OutputPath" -ForegroundColor Yellow
    Write-Host "  npm install" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Write-Host "The Shopify app will be available at: http://localhost:$Port" -ForegroundColor Cyan
}

# Main script logic
try {
    Write-Log "Project creation started for $ProjectType project: $ProjectName"
    
    # Determine output directory
    if ($OutputDirectory -eq "") {
        switch ($ProjectType.ToLower()) {
            "nextjs" { $OutputDirectory = "$rootDir/Projects/NextJS/$ProjectName" }
            "express" { $OutputDirectory = "$rootDir/Projects/APIs/$ProjectName" }
            "wordpress" { $OutputDirectory = "$rootDir/Projects/WordPress/$ProjectName" }
            "shopify" { $OutputDirectory = "$rootDir/Projects/Shopify/$ProjectName" }
        }
    }
    
    # Check if project directory already exists
    if (Test-Path -Path $OutputDirectory) {
        Write-Host "Project directory already exists: $OutputDirectory" -ForegroundColor Red
        Write-Host "Please choose a different project name or output directory." -ForegroundColor Yellow
        exit 1
    }
    
    # Get port for project
    $port = Get-ProjectPort -ProjectType $ProjectType
    
    # Create project based on type
    switch ($ProjectType.ToLower()) {
        "nextjs" { New-NextJSProject -ProjectName $ProjectName -OutputPath $OutputDirectory -Port $port }
        "express" { New-ExpressProject -ProjectName $ProjectName -OutputPath $OutputDirectory -Port $port }
        "wordpress" { New-WordPressProject -ProjectName $ProjectName -OutputPath $OutputDirectory -Port $port }
        "shopify" { New-ShopifyProject -ProjectName $ProjectName -OutputPath $OutputDirectory -Port $port }
        default {
            Write-Host "Invalid project type: $ProjectType" -ForegroundColor Red
            Write-Host "Valid types: nextjs, express, wordpress, shopify" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Log "Project creation completed successfully: $ProjectName ($ProjectType)"
} catch {
    Write-Log "Error: $_" "ERROR"
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
