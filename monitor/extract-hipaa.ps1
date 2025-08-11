$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $root
$d = Get-Date -Format 'yyyy-MM-dd'
$src = "/app/logs/hipaa/hipaa-audit-$d.log"
$dest = Join-Path $root ("hipaa-sample-$d.jsonl")
$tailDest = Join-Path $root ("hipaa-sample-$d-tail.jsonl")

# Copy the file from container if it exists
try {
  docker cp catalyst-express-backend:$src $dest | Out-Null
  if (Test-Path $dest) {
    Get-Content -Path $dest -Tail 10 | Set-Content -Encoding UTF8 $tailDest
    Write-Host "HIPAA sample written:" (Resolve-Path $tailDest)
  } else {
    Write-Warning "HIPAA log not found in container: $src"
  }
} catch {
  Write-Warning "Failed to copy HIPAA log: $($_.Exception.Message)"
}
