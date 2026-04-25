# PowerShell Script: Prepare Production Package
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KF-Next Production Package Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Set environment
Write-Host "[1/5] Setting environment to production..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
Write-Host "Done: NODE_ENV set to production" -ForegroundColor Green
Write-Host ""

# Step 2: Check dependencies
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Done: Dependencies ready" -ForegroundColor Green
Write-Host ""

# Step 3: Build production
Write-Host "[3/5] Building production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Done: Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Create package
Write-Host "[4/5] Creating production package..." -ForegroundColor Yellow

$filesToInclude = @(
    ".next",
    "src",
    "public",
    "server.js",
    "package.json",
    "package-lock.json",
    "next.config.mjs",
    "tsconfig.json",
    ".env.production.example"
)

Write-Host "NOTE: node_modules excluded - will install on server" -ForegroundColor Yellow

# Check files exist
$missingFiles = @()
foreach ($file in $filesToInclude) {
    if (-Not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "ERROR: Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
}

# Create zip
$zipFileName = "kf-next-production-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Host "Creating $zipFileName..." -ForegroundColor Yellow

# Remove old zips
Get-ChildItem -Path . -Filter "kf-next-production-*.zip" | Remove-Item -Force

# Compress
Compress-Archive -Path $filesToInclude -DestinationPath $zipFileName -Force

if (Test-Path $zipFileName) {
    $zipSize = (Get-Item $zipFileName).Length / 1MB
    Write-Host "Done: Package created ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to create package" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Summary
Write-Host "[5/5] Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Production package ready!" -ForegroundColor Green
Write-Host "File: $zipFileName" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Upload $zipFileName to cPanel" -ForegroundColor White
Write-Host "2. Extract in application root folder" -ForegroundColor White
Write-Host "3. Create .env.local with production credentials" -ForegroundColor White
Write-Host "4. Setup Node.js App (startup: server.js)" -ForegroundColor White
Write-Host "5. Start application" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Create .env.local on server!" -ForegroundColor Yellow
Write-Host "Use .env.production.example as reference" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
