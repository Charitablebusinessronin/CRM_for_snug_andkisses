param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..")
)
$ErrorActionPreference = 'Stop'
$outDir = Join-Path $ProjectRoot 'ops\docs'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir 'inventory.txt'

function Section($title) {
  Add-Content -Path $outFile -Value ("`n=== $title ===")
}

# Paths to exclude from recursion
$excludeRegex = '\\(?:node_modules|\.venv|\.next|logs|_backup_removed|\.git)(?:\\|$)'

function Get-FilesSafe {
  param(
    [string]$root,
    [string[]]$include
  )
  Get-ChildItem -Path $root -Recurse -Force -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch $excludeRegex } |
    Where-Object {
      if (-not $include -or $include.Count -eq 0) { return $true }
      foreach ($pattern in $include) {
        if ($_.Name -like $pattern) { return $true }
      }
      return $false
    }
}

"CRM Inventory generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ssK')" | Set-Content -Encoding UTF8 $outFile
"ProjectRoot: $ProjectRoot" | Add-Content -Path $outFile

# Env files
Section 'Environment files'
Get-FilesSafe -root $ProjectRoot -include @('*.env*') |
  Select-Object FullName, Length, LastWriteTime |
  Format-Table -AutoSize | Out-String | Add-Content -Path $outFile

# Docker files
Section 'Docker files'
Get-FilesSafe -root $ProjectRoot -include @('Dockerfile*','docker-compose*','*.docker*') |
  Select-Object FullName, Length, LastWriteTime |
  Format-Table -AutoSize | Out-String | Add-Content -Path $outFile

# TypeScript configs
Section 'TypeScript configs'
Get-FilesSafe -root $ProjectRoot -include @('tsconfig*.json','tsconfig*.server.json') |
  Select-Object FullName, Length, LastWriteTime |
  Format-Table -AutoSize | Out-String | Add-Content -Path $outFile

# Key JSON/Configs
Section 'Key JSON/Configs'
$targets = @('catalyst.json','components.json','database-schema.json','mcp_config.json','.catalystrc','CLAUDE.md')
foreach ($t in $targets) {
  Get-FilesSafe -root $ProjectRoot -include @($t) |
    Select-Object FullName, Length, LastWriteTime |
    Format-Table -AutoSize | Out-String | Add-Content -Path $outFile
}

# Summaries of specific files (heads)
Section '.env.local head'
Get-Content -Path (Join-Path $ProjectRoot '.env.local') -ErrorAction SilentlyContinue -TotalCount 50 | Add-Content -Path $outFile
Section '.env head'
Get-Content -Path (Join-Path $ProjectRoot '.env') -ErrorAction SilentlyContinue -TotalCount 50 | Add-Content -Path $outFile

Write-Host "Inventory written to: $outFile"