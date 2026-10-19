@echo off
echo ========================================================
echo        Starting Happy Life LMS Full-Stack System
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "Happy Life - Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node index.js"

echo [2/3] Starting Web Frontend (Port 5173)...
start "Happy Life - Web (Port 5173)" cmd /k "cd /d %~dp0web && npm run dev"

echo [3/3] Starting Admin Panel (Port 5174)...
start "Happy Life - Admin Panel (Port 5174)" cmd /k "cd /d %~dp0admin && npm run dev"

echo.
echo ========================================================
echo   Backend API:   http://localhost:5000
echo   Web Frontend:  http://localhost:5173
echo   Admin Panel:   http://localhost:5174
echo ========================================================
