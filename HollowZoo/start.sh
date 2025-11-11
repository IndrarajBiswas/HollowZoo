#!/bin/bash

# Hollow Zoo: AI Awakening - Quick Start Script

echo "🦘 Starting Hollow Zoo: AI Awakening..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "Please copy backend/.env.example to backend/.env and add your Gemini API key"
    exit 1
fi

# Start backend
echo "🧠 Starting AI Backend..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start Flask in background
python3 app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
cd ../frontend
echo "🎮 Starting Game Frontend..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Hollow Zoo is running!"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo '👋 Shutting down...'; exit" INT

wait
