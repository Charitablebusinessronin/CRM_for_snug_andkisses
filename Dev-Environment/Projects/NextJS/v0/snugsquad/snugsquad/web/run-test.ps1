# PowerShell script to test the Next.js application
Set-Location "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\v0\snugsquad\snugsquad\web"

Write-Host "Clearing Next.js cache..." -ForegroundColor Green
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "Cleared .next directory" -ForegroundColor Yellow
}

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting development server on port 3001..." -ForegroundColor Green
Write-Host "Application will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Start the development server
npm run dev
