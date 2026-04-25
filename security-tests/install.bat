@echo off
echo ========================================
echo KF Next Security Testing Suite
echo Installation Script
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo [2/3] Verifying installation...
call npm list axios chalk cli-table3 > nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: Some dependencies may not be installed correctly
    echo Try running: npm install --force
)

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo Installation Successful!
echo ========================================
echo.
echo Next steps:
echo 1. Edit config.js to set your target URL
echo 2. Run: npm run test:all
echo.
echo Quick start: npm run test:all
echo.
pause
