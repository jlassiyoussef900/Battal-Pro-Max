# Start all services for Job Matcher App

Write-Host ""
Write-Host "========================================"
Write-Host "Starting Job Matcher Application"
Write-Host "========================================"
Write-Host ""

# Start Backend
Write-Host "[1/4] Starting Backend (PHP)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\public'; php -S 127.0.0.1:8000"
Start-Sleep -Seconds 2

# Start AI Service
Write-Host "[2/4] Starting AI Service (Node.js)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ai'; npm start"
Start-Sleep -Seconds 3

# Start Scraping Service
Write-Host "[3/4] Starting Scraping Service (Node.js)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\scraping'; npm start"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[4/4] Starting Frontend (Vite)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================"
Write-Host "All services started!"
Write-Host "========================================"
Write-Host ""
Write-Host "Backend:     http://127.0.0.1:8000"
Write-Host "AI Service:  http://localhost:3001"
Write-Host "Scraping:    http://localhost:3002"
Write-Host "Frontend:    http://localhost:5173"
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (services will keep running)"
Write-Host "To stop all services, close the PowerShell windows"
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 1
}
