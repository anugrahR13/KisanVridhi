@echo off
title KisanVridhi Platform Launcher
echo ===================================================
echo     Launching KisanVridhi Full-Stack Platform      
echo ===================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "KisanVridhi Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "KisanVridhi Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Platform Services are launching in new windows!   
echo ===================================================
echo   Frontend App:    http://localhost:5173
echo   Backend API Doc: http://localhost:8000/docs
echo.
echo   Demo Login Credentials:
echo   - Farmer: farmer@eco.farm / Farmer@123456
echo   - Admin:  admin@eco.farm  / Admin@123456
echo ===================================================
echo.
pause
