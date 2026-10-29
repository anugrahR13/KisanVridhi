# KisanVridhi Platform PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Green
Write-Host "    Launching KisanVridhi Full-Stack Platform      " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn app.main:app --reload --port 8000"

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Platform Services are running in new windows!    " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Frontend Web App: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Demo Credentials:" -ForegroundColor White
Write-Host "  - Full Features Profile: gurpreet@eco.farm / Gurpreet@123 (or 123456)" -ForegroundColor Green
Write-Host "  - Phone OTP Sign In:     +91 98765 01234 (OTP: 123456)" -ForegroundColor Green
Write-Host "  - Farmer Demo:           farmer@eco.farm   / Farmer@123456"
Write-Host "  - Admin Demo:            admin@eco.farm    / Admin@123456"
Write-Host "===================================================" -ForegroundColor Green
