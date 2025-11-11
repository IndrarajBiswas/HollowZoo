@echo off
REM Hollow Zoo: AI Awakening - Development Mode with Live Reloading

echo 🦘 Starting Hollow Zoo: AI Awakening in DEV mode...

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  Warning: backend\.env not found!
    echo Please copy backend\.env.example to backend\.env and add your Gemini API key
    exit /b 1
)

REM Clean up any old processes on ports 5000 and 8000
echo 🧹 Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 1 /nobreak >nul

REM Check/create virtual environment
if not exist "venv\Scripts\python.exe" (
    echo ⚠️  Warning: venv not found in project root!
    echo Creating virtual environment...
    python -m venv venv
)

REM Install/upgrade dependencies using venv's pip
echo 📦 Ensuring dependencies are installed...
venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt

echo.
echo ✨ Starting development servers with live reloading...
echo.
echo Backend:  http://localhost:5000 (Flask debug mode - auto-reloads on changes)
echo Frontend: http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Run both processes with honcho from venv
venv\Scripts\honcho.exe start
