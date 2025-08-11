$ErrorActionPreference = 'Stop'

# Move to project root
Set-Location 'c:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses'

# Load required env vars from .env.local into process environment
$required = @('ZOHO_CLIENT_ID','ZOHO_CLIENT_SECRET','ZOHO_REFRESH_TOKEN','CATALYST_PROJECT_ID')
Get-Content '.env.local' | ForEach-Object {
  if ($_ -match '^(?<k>[A-Za-z0-9_]+)=(?<v>.*)$') {
    $k = $Matches.k
    $v = $Matches.v
    if ($required -contains $k) {
      [Environment]::SetEnvironmentVariable($k, $v, 'Process')
    }
  }
}

# Optional: activate venv if present
$venv = 'c:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses\catalyst_env\Scripts\python.exe'
if (Test-Path $venv) {
  & $venv 'scripts\catalyst_automation.py'
} else {
  python 'scripts\catalyst_automation.py'
}