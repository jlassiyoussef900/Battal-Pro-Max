@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Job Matcher - System Verification
echo ========================================
echo.

set "PASS=0"
set "FAIL=0"

REM Check 1: Database Connection
echo [1/8] Checking PostgreSQL database...
psql -U azer -d battal_db -c "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Database connection successful
    set /a PASS+=1
) else (
    echo [FAIL] Cannot connect to database
    echo        Make sure PostgreSQL is running and credentials are correct
    set /a FAIL+=1
)
echo.

REM Check 2: Jobs in Database
echo [2/8] Checking for jobs in database...
for /f "tokens=*" %%i in ('psql -U azer -d battal_db -t -c "SELECT COUNT(*) FROM jobs WHERE status='active';" 2^>nul') do set JOB_COUNT=%%i
set JOB_COUNT=%JOB_COUNT: =%
if defined JOB_COUNT (
    if %JOB_COUNT% gtr 0 (
        echo [PASS] Found %JOB_COUNT% active jobs in database
        set /a PASS+=1
    ) else (
        echo [WARN] No active jobs found in database
        echo        Run trigger-scrape.bat to add jobs
        set /a FAIL+=1
    )
) else (
    echo [FAIL] Could not query jobs table
    set /a FAIL+=1
)
echo.

REM Check 3: Companies in Database
echo [3/8] Checking for companies in database...
for /f "tokens=*" %%i in ('psql -U azer -d battal_db -t -c "SELECT COUNT(*) FROM companies;" 2^>nul') do set COMPANY_COUNT=%%i
set COMPANY_COUNT=%COMPANY_COUNT: =%
if defined COMPANY_COUNT (
    if %COMPANY_COUNT% gtr 0 (
        echo [PASS] Found %COMPANY_COUNT% companies in database
        set /a PASS+=1
    ) else (
        echo [WARN] No companies found in database
        echo        Run trigger-scrape.bat to add companies
        set /a FAIL+=1
    )
) else (
    echo [FAIL] Could not query companies table
    set /a FAIL+=1
)
echo.

REM Check 4: Backend API
echo [4/8] Checking Backend API (Port 8000)...
curl -s http://127.0.0.1:8000/jobs >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Backend API is running
    set /a PASS+=1
) else (
    echo [FAIL] Backend API is not running
    echo        Start it with: start-backend.bat
    set /a FAIL+=1
)
echo.

REM Check 5: Scraping Service
echo [5/8] Checking Scraping Service (Port 3002)...
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Scraping service is running
    set /a PASS+=1
) else (
    echo [WARN] Scraping service is not running
    echo        Start it with: cd scraping ^&^& npm start
    set /a FAIL+=1
)
echo.

REM Check 6: Frontend Dependencies
echo [6/8] Checking Frontend dependencies...
if exist "node_modules\" (
    echo [PASS] Frontend dependencies installed
    set /a PASS+=1
) else (
    echo [FAIL] Frontend dependencies not installed
    echo        Run: npm install
    set /a FAIL+=1
)
echo.

REM Check 7: Environment Files
echo [7/8] Checking environment files...
set "ENV_OK=1"
if not exist ".env" (
    echo [WARN] Frontend .env file missing
    set "ENV_OK=0"
)
if not exist "backend\.env" (
    echo [WARN] Backend .env file missing
    set "ENV_OK=0"
)
if not exist "scraping\.env" (
    echo [WARN] Scraping .env file missing
    set "ENV_OK=0"
)
if "%ENV_OK%"=="1" (
    echo [PASS] All environment files present
    set /a PASS+=1
) else (
    echo [FAIL] Some environment files are missing
    echo        Copy from .env.example files
    set /a FAIL+=1
)
echo.

REM Check 8: Frontend Build
echo [8/8] Checking Frontend build configuration...
if exist "vite.config.ts" (
    echo [PASS] Vite configuration found
    set /a PASS+=1
) else (
    echo [FAIL] Vite configuration missing
    set /a FAIL+=1
)
echo.

REM Summary
echo ========================================
echo   Verification Summary
echo ========================================
echo.
echo Tests Passed: %PASS%/8
echo Tests Failed: %FAIL%/8
echo.

if %FAIL% equ 0 (
    echo [SUCCESS] All checks passed! System is ready.
    echo.
    echo Next steps:
    echo   1. Start all services: start-all.bat
    echo   2. Open browser: http://localhost:5173
    echo   3. Login and start swiping jobs!
) else (
    echo [WARNING] Some checks failed. Please fix the issues above.
    echo.
    echo Common fixes:
    echo   - Start PostgreSQL service
    echo   - Run: npm install
    echo   - Copy .env.example to .env files
    echo   - Start backend: start-backend.bat
    echo   - Trigger scraping: trigger-scrape.bat
)

echo.
echo ========================================
echo.
pause
