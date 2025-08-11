param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..")
)
$ErrorActionPreference = 'Stop'

$opsEnv = Join-Path $ProjectRoot 'ops\env'
$opsDocker = Join-Path $ProjectRoot 'ops\docker'
$opsConfig = Join-Path $ProjectRoot 'ops\config'
$opsDocs = Join-Path $ProjectRoot 'ops\docs'
$backupBase = Join-Path (Split-Path -Parent $ProjectRoot) ("CRM_BACKUP_" + (Get-Date -Format 'yyyyMMdd_HHmm'))

New-Item -ItemType Directory -Force -Path $opsEnv,$opsDocker,$opsConfig,$opsDocs | Out-Null

# Create selective backup (only relevant files), avoiding locked/heavy dirs
New-Item -ItemType Directory -Force -Path $backupBase | Out-Null
$backupEnv = Join-Path $backupBase 'env'
$backupDocker = Join-Path $backupBase 'docker'
$backupConfig = Join-Path $backupBase 'config'
$backupDocs = Join-Path $backupBase 'docs'
New-Item -ItemType Directory -Force -Path $backupEnv,$backupDocker,$backupConfig,$backupDocs | Out-Null

function Copy-IfExists($src, $dstDir) {
  if (Test-Path $src) {
    Write-Host "Copying: $src -> $dstDir"
    Copy-Item -Path $src -Destination $dstDir -Force
  }
}

# Environment files
$envFiles = @(
  '.env',
  '.env.local',
  '.env.local.example',
  '.env.production.secure',
  'env-vars-template.txt'
)
foreach ($f in $envFiles) {
  $p = Join-Path $ProjectRoot $f
  Copy-IfExists $p $opsEnv
  Copy-IfExists $p $backupEnv
}

# Docker files
$dockerFiles = @(
  'docker-compose.yml',
  'docker-compose.express.yml',
  'docker-compose.dev.yml',
  'docker-compose.prod.yml',
  'Dockerfile',
  'Dockerfile.express',
  'Dockerfile.appsail',
  'docker-setup.bat',
  'docker-setup.sh'
)
foreach ($f in $dockerFiles) {
  $p = Join-Path $ProjectRoot $f
  Copy-IfExists $p $opsDocker
  Copy-IfExists $p $backupDocker
}

# Config and JSON
$configFiles = @(
  'catalyst.json',
  '.catalystrc',
  'components.json',
  'database-schema.json',
  'mcp_config.json'
)
foreach ($f in $configFiles) {
  $p = Join-Path $ProjectRoot $f
  Copy-IfExists $p $opsConfig
  Copy-IfExists $p $backupConfig
}

# Docs
$docFiles = @(
  'CLAUDE.md'
)
foreach ($f in $docFiles) {
  $p = Join-Path $ProjectRoot $f
  Copy-IfExists $p $opsDocs
  Copy-IfExists $p $backupDocs
}

# Generate a unified env example without secrets
$unifiedPath = Join-Path $ProjectRoot '.env.unified.example'
$unified = @()
$unified += '# ================================='
$unified += '# UNIFIED CRM ENVIRONMENT (EXAMPLE)'
$unified += '# Non-secret template; fill securely'
$unified += '# ================================='
$unified += ''
$unified += '# NODE ENVIRONMENT'
$unified += 'NODE_ENV=production'
$unified += 'CATALYST_ENVIRONMENT=production'
$unified += ''
$unified += '# CATALYST CONFIGURATION'
$unified += 'CATALYST_PROJECT_ID=30300000000011038'
$unified += 'CATALYST_PROJECT_KEY='
$unified += 'CATALYST_PROJECT_DOMAIN='
$unified += 'CATALYST_FUNCTION_URL=https://project-rainfall-891140386.development.catalystserverless.com/server/quick-actions'
$unified += ''
$unified += '# ZOHO API (replace with your values)'
$unified += 'ZOHO_CLIENT_ID='
$unified += 'ZOHO_CLIENT_SECRET='
$unified += 'ZOHO_REFRESH_TOKEN='
$unified += ''
$unified += '# APPLICATION SETTINGS'
$unified += 'PORT=9000'
$unified += 'NEXTJS_PORT=5369'
$unified += 'NEXTAUTH_URL=https://project-rainfall-891140386.development.catalystserverless.com'
$unified += 'NEXTAUTH_SECRET='
$unified += 'NEXT_PUBLIC_APP_URL=http://localhost:5369'
$unified += ''
$unified -join "`r`n" | Set-Content -Encoding UTF8 $unifiedPath

# Config map doc
$configMap = @()
$configMap += "# Config Map (copied, originals left in place)"
$configMap += ""
$configMap += "- .env* -> ops/env/ (and backup/env/)"
$configMap += "- Dockerfile*, docker-compose* -> ops/docker/ (and backup/docker/)"
$configMap += "- catalyst.json, .catalystrc, components.json, database-schema.json, mcp_config.json -> ops/config/ (and backup/config/)"
$configMap += "- CLAUDE.md -> ops/docs/ (and backup/docs/)"
$configMap += ""
$configMap += "Unified example created: .env.unified.example (no secrets)"
$configMap -join "`r`n" | Set-Content -Encoding UTF8 (Join-Path $opsDocs 'config-map.md')

Write-Host "Organization complete. Originals remain in place; copies available under ops/. Selective backup at: $backupBase"