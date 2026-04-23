@echo off
echo ========================================
echo Starting Job Matcher Application
echo ========================================
echo.

REM Check if AI service .env exists
if not exist "ai\.env" (
    echo [ERROR] AI service .env file not found!
    echo Please create ai\.env file with your GEMINI_API_KEY
    echo.
    echo Example:
    echo GEMINI_API_KEY=your_api_key_here
    echo PORT=3001
    echo.
    pause
    exit /b 1
)

REM Check if scraping service .env exists
if not exist "scraping\.env" (
    echo [WARNING] Scraping service .env file not found, creating from example...
    copy scraping\.env.example scraping\.env
    echo Please update scraping\.env with your configuration
    echo.
)

REM Check if app .env exists
if not exist ".env" (
    echo [WARNING] Frontend .env file not found, creating from example...
    copy .env.example .env
    echo Please update .env with your configuration
    echo.
)

echo [1/4] Starting Backend (PHP)...
start "Backend Server" cmd /k "cd backend\public && php -S 127.0.0.1:8000"
timeout /t 2 /nobreak >nul

echo [2/4] Starting AI Service (Node.js)...
start "AI Service" cmd /k "cd ai && npm start"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Scraping Service (Node.js)...
start "Scraping Service" cmd /k "cd scraping && npm start"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend (Vite)...
start "Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:     http://127.0.0.1:8000
echo AI Service:  http://localhost:3001
echo Scraping:    http://localhost:3002
echo Frontend:    http://localhost:5173
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping all services...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq AI Service*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Scraping Service*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend*" /T /F >nul 2>&1

echo All services stopped.
pause
