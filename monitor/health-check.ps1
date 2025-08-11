param(
  [string]$Url = "http://localhost:4728/health",
  [string]$LogPath = "$PSScriptRoot/health.log"
)

function Write-HealthLog {
  param([string]$message)
  $timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffK')
  $line = "[$timestamp] $message"
  Add-Content -Path $LogPath -Value $line -Encoding UTF8
}

try {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
  $sw.Stop()
  $status = $response.status
  $port = $response.port
  $env  = $response.environment
  Write-HealthLog "OK latency=${($sw.ElapsedMilliseconds)}ms status=$status port=$port env=$env"
}
catch {
  $sw.Stop()
  $err = $_.Exception.Message.Replace("`r"," ").Replace("`n"," ")
  Write-HealthLog "FAIL latency=${($sw.ElapsedMilliseconds)}ms error=$err"
}
