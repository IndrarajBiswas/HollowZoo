@echo off
REM Hollow Zoo: AI Awakening - Quick Start Script (Windows)

echo 🦘 Starting Hollow Zoo: AI Awakening...

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  Warning: backend\.env not found!
    echo Please copy backend\.env.example to backend\.env and add your Gemini API key
    pause
    exit /b 1
)

REM Start backend
echo 🧠 Starting AI Backend...
cd backend

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Start Flask
start /B python app.py

REM Wait for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend
cd ..\frontend
echo 🎮 Starting Game Frontend...
start /B python -m http.server 8000

echo.
echo ✅ Hollow Zoo is running!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8000
echo.
echo Press any key to stop both servers...
pause > nul

REM Kill Python processes (be careful - this kills ALL Python processes)
taskkill /F /IM python.exe > nul 2>&1
echo 👋 Shutting down...
