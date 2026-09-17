@echo off
setlocal enabledelayedexpansion
title CyberTrace Forensic Suite - 1-Click Launcher

echo =====================================================================
echo  CyberTrace - Digital Forensic Case & Incident Management System
echo =====================================================================
echo.

:: 1. Check Node.js and NPM availability
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/
    pause
    exit /b 1
)

:: 2. Ensure environment configuration exists
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [INFO] Creating backend\.env from backend\.env.example...
        copy "backend\.env.example" "backend\.env" >nul
    )
)
if not exist ".env" (
    if exist "backend\.env.example" (
        echo [INFO] Creating root .env from backend\.env.example...
        copy "backend\.env.example" ".env" >nul
    )
)

:: 3. Check for node_modules and install if missing
if not exist "node_modules\" (
    echo [INFO] Root dependencies missing. Installing...
    call npm install
)
if not exist "backend\node_modules\" (
    echo [INFO] Backend dependencies missing. Installing...
    call npm install --prefix backend
)
if not exist "frontend\node_modules\" (
    echo [INFO] Frontend dependencies missing. Installing...
    call npm install --prefix frontend
)

:: 4. Check if MongoDB is reachable on port 27017
echo [INFO] Checking MongoDB connection on port 27017...
node -e "const net=require('net'); const s=net.createConnection(27017, '127.0.0.1'); s.on('connect', ()=>{s.end(); process.exit(0);}); s.on('error', ()=>{process.exit(1);});" >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] MongoDB service does not appear to be active on 127.0.0.1:27017.
    echo If MongoDB is running in Docker or as a local Windows Service, ignore this message.
    echo Otherwise, please run: net start MongoDB (or start mongod.exe)
    echo.
) else (
    echo [OK] MongoDB is running and responding.
)

:: 5. Open Default Browser after a brief delay in the background
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

:: 6. Launch Backend and Frontend concurrently
echo [INFO] Starting CyberTrace backend (port 5000) and frontend (port 5173)...
echo [INFO] Opening http://localhost:5173 in your default browser...
echo.
call npm run dev

pause
