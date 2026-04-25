# Quick start script for local memory monitoring
# This script helps you start both dev server and monitor

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "KF-Next Local Memory Monitoring" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if monitor log exists
if (Test-Path "memory-monitor.log") {
    Write-Host "Previous monitoring log found: memory-monitor.log" -ForegroundColor Yellow
    $response = Read-Host "Delete old log? (y/n)"
    if ($response -eq "y") {
        Remove-Item "memory-monitor.log"
        Write-Host "Old log deleted" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. This script will open TWO terminal windows" -ForegroundColor White
Write-Host "2. First window: Development server (npm run dev)" -ForegroundColor White
Write-Host "3. Second window: Memory monitor (node monitor-memory.js)" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "- Keep BOTH windows open" -ForegroundColor White
Write-Host "- Browse to http://localhost:3000 and use the site" -ForegroundColor White
Write-Host "- Let it run for 1-2 hours" -ForegroundColor White
Write-Host "- Press Ctrl+C in monitor window to stop and see results" -ForegroundColor White
Write-Host ""

$response = Read-Host "Ready to start? (y/n)"
if ($response -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Starting memory monitor..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node monitor-memory.js"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Monitoring Started!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Browse pages, login to admin, click around" -ForegroundColor White
Write-Host "3. Watch the monitor window for memory usage" -ForegroundColor White
Write-Host "4. Let it run for 1-2 hours" -ForegroundColor White
Write-Host "5. Press Ctrl+C in monitor window to stop" -ForegroundColor White
Write-Host ""
Write-Host "Results will be saved to: memory-monitor.log" -ForegroundColor Cyan
Write-Host ""
