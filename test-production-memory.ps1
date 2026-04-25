# Test Production Build with Memory Monitoring
# This script runs the production build with 1GB heap and monitors memory usage

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Production Memory Test" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Build production version" -ForegroundColor Yellow
Write-Host "  2. Start server with 512MB heap limit" -ForegroundColor Yellow
Write-Host "  3. Run advanced memory monitor" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if production build exists
if (-not (Test-Path ".next")) {
    Write-Host "Building production version..." -ForegroundColor Yellow
    npm run build:production
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Build complete!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting server with 512MB heap..." -ForegroundColor Yellow
Write-Host ""

# Start server in new window with 1GB heap and GC enabled
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "`$env:NODE_ENV='production'; `$env:NODE_OPTIONS='--expose-gc --max-old-space-size=512'; node server.js"

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Server is running!" -ForegroundColor Green
} catch {
    Write-Host "Server not responding yet, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting advanced memory monitor..." -ForegroundColor Yellow
Write-Host ""

# Start monitor in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node advanced-monitor.js"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Both windows are now running!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server window: Production server with 512MB heap" -ForegroundColor Yellow
Write-Host "Monitor window: Advanced memory monitor" -ForegroundColor Yellow
Write-Host ""
Write-Host "To run stress test, open another terminal and run:" -ForegroundColor Cyan
Write-Host "  npm run stress" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
