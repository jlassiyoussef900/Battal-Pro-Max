# Start essential services for Job Matcher App (without AI)

Write-Host ""
Write-Host "========================================"
Write-Host "Starting Job Matcher Application"
Write-Host "========================================"
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend (PHP)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend\public'; Write-Host 'Backend API running on http://127.0.0.1:8000'; php -S 127.0.0.1:8000"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend (Vite)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================"
Write-Host "Services started!"
Write-Host "========================================"
Write-Host ""
Write-Host "Backend:     http://127.0.0.1:8000"
Write-Host "Frontend:    http://localhost:5173"
Write-Host ""
Write-Host "Database has 207 jobs ready to browse!"
Write-Host ""
Write-Host "Open your browser and go to:"
Write-Host "http://localhost:5173"
Write-Host ""
Write-Host "Press Ctrl+C to exit (services will keep running)"
Write-Host "To stop services, close the PowerShell windows"
Write-Host ""

# Keep script running
while ($true) {
    Start-Sleep -Seconds 1
}
