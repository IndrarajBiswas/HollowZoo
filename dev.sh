#!/bin/bash

# Hollow Zoo: AI Awakening - Development Mode with Live Reloading

echo "🦘 Starting Hollow Zoo: AI Awakening in DEV mode..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "Please copy backend/.env.example to backend/.env and add your Gemini API key"
    exit 1
fi

# Clean up any old processes on ports 5000 and 8000
echo "🧹 Cleaning up old processes..."
lsof -ti :5000 | xargs kill -9 2>/dev/null
lsof -ti :8000 | xargs kill -9 2>/dev/null
sleep 1

# Check/create virtual environment
if [ ! -d "venv" ]; then
    echo "⚠️  Warning: venv not found in project root!"
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Install/upgrade dependencies using venv's pip
echo "📦 Ensuring dependencies are installed..."
venv/bin/python3 -m pip install -q -r backend/requirements.txt

echo ""
echo "✨ Starting development servers with live reloading..."
echo ""
echo "Backend:  http://localhost:5000 (Flask debug mode - auto-reloads on changes)"
echo "Frontend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both processes with honcho from venv
venv/bin/honcho start
