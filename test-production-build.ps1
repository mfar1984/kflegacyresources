# Test production build locally to see real memory usage
# This will show the TRUE impact of our fixes (without Next.js dev mode overhead)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Production Build Memory Test" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Build the app for production" -ForegroundColor White
Write-Host "2. Start production server" -ForegroundColor White
Write-Host "3. Open monitoring terminal" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Production mode has NO HMR overhead!" -ForegroundColor Green
Write-Host "This is the REAL memory usage you'll see in cPanel" -ForegroundColor Green
Write-Host ""

$response = Read-Host "Continue? (y/n)"
if ($response -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 1: Building for production..." -ForegroundColor Yellow
npm run build:production

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Starting production server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "Waiting 10 seconds for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Step 3: Starting memory monitor..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node monitor-memory.js"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Production Test Started!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2 minutes for baseline" -ForegroundColor White
Write-Host "2. Run: node stress-test.js" -ForegroundColor White
Write-Host "3. Watch memory in monitor window" -ForegroundColor White
Write-Host "4. Expected: Memory stays 50-65% (vs 96% in dev mode!)" -ForegroundColor White
Write-Host ""
Write-Host "Production mode = NO HMR = Real memory usage!" -ForegroundColor Green
Write-Host ""
