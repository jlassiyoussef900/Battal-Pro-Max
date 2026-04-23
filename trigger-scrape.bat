@echo off
echo.
echo ========================================
echo   Triggering Job Scraping Service
echo ========================================
echo.

REM Check if scraping service is running
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Scraping service is not running on port 3002
    echo Please start it first with: cd scraping ^&^& npm start
    echo.
    pause
    exit /b 1
)

echo [OK] Scraping service is running
echo.
echo Triggering manual scrape...
echo.

curl -X POST http://localhost:3002/api/scrape

echo.
echo.
echo ========================================
echo   Scraping Complete!
echo ========================================
echo.
echo Check the output above for results.
echo Jobs have been added to the database.
echo.
pause
