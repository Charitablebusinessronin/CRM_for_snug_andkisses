param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\.."),
  [string]$OutputFile = ".env.unified.candidate"
)
$ErrorActionPreference = 'Stop'

$envFiles = @()
$envPath = Join-Path $ProjectRoot '.env'
$envLocalPath = Join-Path $ProjectRoot '.env.local'
if (Test-Path $envPath) { $envFiles += $envPath }
if (Test-Path $envLocalPath) { $envFiles += $envLocalPath }

$dict = @{}

function Parse-Line($line) {
  if ([string]::IsNullOrWhiteSpace($line)) { return $null }
  if ($line.TrimStart().StartsWith('#')) { return $null }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { return $null }
  $key = $line.Substring(0, $idx).Trim()
  $val = $line.Substring($idx + 1).Trim()
  return @($key, $val)
}

foreach ($file in $envFiles) {
  Get-Content $file -ErrorAction SilentlyContinue | ForEach-Object {
    $parsed = Parse-Line $_
    if ($null -ne $parsed) {
      $k = $parsed[0]
      $v = $parsed[1]
      # .env.local comes last in list and will override .env
      $dict[$k] = $v
    }
  }
}

# Ensure critical defaults if missing
if (-not $dict.ContainsKey('NODE_ENV')) { $dict['NODE_ENV'] = 'production' }
if (-not $dict.ContainsKey('CATALYST_ENVIRONMENT')) { $dict['CATALYST_ENVIRONMENT'] = 'production' }
if (-not $dict.ContainsKey('PORT') -and -not $dict.ContainsKey('EXPRESS_PORT')) { $dict['EXPRESS_PORT'] = '9000' }
if (-not $dict.ContainsKey('NEXTJS_PORT')) { $dict['NEXTJS_PORT'] = '5369' }

# Write out in sorted key order for stability
$outLines = @()
$outLines += '# Auto-generated candidate unified env. Review before replacing live env files.'
$outLines += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ssK')"
$outLines += ''
foreach ($key in ($dict.Keys | Sort-Object)) {
  $outLines += ("$key=$($dict[$key])")
}

$target = Join-Path $ProjectRoot $OutputFile
$outLines -join "`r`n" | Set-Content -Encoding UTF8 $target

Write-Host "Unified candidate written to: $target"