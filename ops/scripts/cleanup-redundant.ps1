param(
  [switch]$ConfirmDelete,
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..")
)
$ErrorActionPreference = 'Stop'

$targets = @(
  '.env.local',
  '.env.development',
  '.env.production',
  'docker-compose.express.yml',
  'docker-compose.dev.yml',
  'docker-compose.prod.yml'
) | ForEach-Object { Join-Path $ProjectRoot $_ }

Write-Host "Redundant candidates:" -ForegroundColor Cyan
$existing = @()
foreach ($t in $targets) {
  if (Test-Path $t) { $existing += $t; Write-Host " - $t" }
}

if ($existing.Count -eq 0) { Write-Host "Nothing to remove."; exit 0 }

if (-not $ConfirmDelete) {
  Write-Host "Preview only. Re-run with -ConfirmDelete to remove." -ForegroundColor Yellow
  exit 0
}

foreach ($t in $existing) {
  try {
    Remove-Item -Path $t -Force -Recurse -ErrorAction Stop
    Write-Host "Removed: $t" -ForegroundColor Green
  }
  catch {
    Write-Host "Failed to remove: $t -> $_" -ForegroundColor Red
  }
}
