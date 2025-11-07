# Agent Arena Academy

An innovative 2D combat game where you don't control the fighter—you **coach** an AI agent powered by Google's Gemini 2.0 Flash AI model. Watch as your AI character "Thunder" learns to fight autonomously, adapting to your coaching style and improving through experience.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Game](#running-the-game)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- **AI-Powered Combat**: Google Gemini 2.0 Flash makes real-time combat decisions
- **Coaching System**: Influence AI behavior through coaching parameters and custom prompts
- **Learning & Memory**: Agent remembers past decisions and learns from outcomes
- **Real-time Visualization**: Watch the AI's thought process as it fights
- **Phaser 3 Game Engine**: Smooth 2D physics and animations
- **RESTful API**: Flask backend with comprehensive API endpoints

## Architecture

```
┌─────────────────────┐
│  Phaser Frontend    │
│  (JavaScript)       │
│  - Game rendering   │
│  - User interface   │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  Flask Backend      │
│  (Python)           │
│  - API endpoints    │
│  - State management │
└──────────┬──────────┘
           │ API Call
           ▼
┌─────────────────────┐
│  Google Gemini AI   │
│  (Gemini 2.0 Flash) │
│  - Decision making  │
│  - Strategy         │
└─────────────────────┘
```

## Prerequisites

- **Python 3.9+**
- **pip** (Python package manager)
- **Google AI API Key** ([Get one here](https://ai.google.dev/))
- **Modern web browser** (Chrome, Firefox, Safari, or Edge)
- **Git** (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/IndrarajBiswas/AgentWar.git
cd AgentWar
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cat > .env << EOF
GOOGLE_API_KEY=your_google_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
EOF
```

Replace `your_google_api_key_here` with your actual Google AI API key.

**Important**: Never commit your `.env` file to version control!

## Configuration

### Backend Configuration

Edit `backend/.env`:

```bash
GOOGLE_API_KEY=your_api_key          # Required: Your Google AI API key
FLASK_ENV=development                 # development or production
FLASK_DEBUG=True                      # True for development, False for production
```

### Frontend Configuration

The frontend connects to `http://localhost:5000` by default. To change this, edit the API URLs in:
- `frontend/src/scenes/GameScene.js`
- `frontend/src/scenes/MenuScene.js`

## Running the Game

### 1. Start the Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

### 2. Open the Frontend

Open `frontend/index.html` in your web browser:

```bash
# On Linux/Mac:
open frontend/index.html

# On Windows:
start frontend/index.html

# Or manually open the file in your browser
```

Alternatively, use a simple HTTP server:

```bash
# Using Python 3
cd frontend
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser

# Using Node.js (if installed)
npx http-server frontend -p 8000
```

### 3. Play the Game!

1. Adjust coaching sliders (Aggression and Caution)
2. Optionally set custom coaching prompts via API (see below)
3. Start the match and watch Thunder fight autonomously
4. Observe the AI's reasoning in the thought panel

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### 1. Health Check
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Agent Arena Academy API is running"
}
```

#### 2. Get AI Decision
```bash
POST /api/decide
```

**Request:**
```json
{
  "agent": {
    "health": 85,
    "energy": 60,
    "onGround": true
  },
  "enemy": {
    "health": 45
  },
  "distance": 75,
  "coaching": {
    "aggression": 70,
    "caution": 30
  },
  "memory": []
}
```

**Response:**
```json
{
  "action": "ATTACK",
  "reasoning": "Enemy is weak at 45 HP; aggressive coaching suggests pressing the advantage.",
  "confidence": 0.85
}
```

#### 3. Set Custom Coaching
```bash
POST /api/coach
```

**Request:**
```json
{
  "prompt": "Always prioritize defense and only attack when enemy health is below 30%"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Coaching prompt applied",
  "prompt": "Always prioritize defense and only attack when enemy health is below 30%"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Be very aggressive and attack whenever possible!"}'
```

#### 4. Get Current Coaching
```bash
GET /api/coach
```

**Response:**
```json
{
  "status": "success",
  "prompt": "Always prioritize defense and only attack when enemy health is below 30%"
}
```

#### 5. Post-Match Reflection
```bash
POST /api/reflect
```

**Request:**
```json
{
  "survival_time": 45.3,
  "decision_count": 120,
  "final_hp": 0,
  "enemy_hp": 25,
  "memory": [],
  "coaching": {"aggression": 50, "caution": 50}
}
```

#### 6. Reset Memory
```bash
POST /api/reset
```

**Response:**
```json
{
  "status": "success",
  "message": "Memory reset"
}
```

### Coaching Examples

```bash
# Defensive strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Play defensively. Only attack when enemy health is below 30%."}'

# Aggressive strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Be extremely aggressive. Attack whenever possible."}'

# Hit-and-run tactics
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Use hit-and-run tactics. Attack once, then jump away."}'
```

## Project Structure

```
AgentWar/
├── backend/
│   ├── .env                  # Environment variables (not in git)
│   ├── app.py               # Flask API server
│   ├── agent_brain.py       # AI decision-making logic
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Virtual environment (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── entities/
│   │   │   ├── Agent.js     # AI-controlled player
│   │   │   └── Enemy.js     # Opponent logic
│   │   ├── scenes/
│   │   │   ├── GameScene.js # Main gameplay
│   │   │   └── MenuScene.js # Title screen
│   │   ├── managers/
│   │   │   └── (future managers)
│   │   ├── ui/
│   │   │   └── (future UI components)
│   │   └── main.js          # Phaser configuration
│   ├── assets/              # Game assets
│   ├── index.html           # Main HTML file
│   └── styles.css           # UI styling
│
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── PROGRESS.md             # Current progress and next steps
├── claude.md               # Development guide
└── GOOGLE_AI_INTEGRATION.md # AI integration documentation
```

## Development Guide

### Game Mechanics

**Available Actions:**
1. **ATTACK** - Melee attack (deals ~15 damage, costs 10 energy)
2. **DEFEND** - Block/reduce damage (minimal energy cost)
3. **JUMP** - Vertical leap for repositioning (costs 5 energy)

**Energy System:**
- Max: 100
- Regenerates: +0.1 per frame (~6/second)
- Actions cost energy to prevent spam

**Health System:**
- Agent & Enemy start: 100 HP
- Death at 0 HP triggers post-match reflection

### AI Decision Timing

- AI makes decisions every **2.5 seconds**
- Prevents excessive API calls
- Allows animations to complete
- Creates strategic, deliberate gameplay

### Adding New Features

1. **Backend**: Add endpoints in `app.py`, logic in `agent_brain.py`
2. **Frontend**: Add scenes in `scenes/`, entities in `entities/`
3. **Testing**: Use cURL or Postman to test API endpoints

See `claude.md` for detailed development patterns and best practices.

## Deployment

### Backend Deployment (Production)

#### Option 1: Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set GOOGLE_API_KEY=your_api_key
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main
```

#### Option 2: Deploy to Railway

1. Visit [Railway.app](https://railway.app/)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

#### Option 3: Deploy to your own server

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment

#### Option 1: GitHub Pages

```bash
# Push to gh-pages branch
git subtree push --prefix frontend origin gh-pages
```

#### Option 2: Netlify

1. Drag and drop `frontend/` folder to [Netlify](https://netlify.com/)
2. Update API URLs to point to your backend

#### Option 3: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Important**: Update the backend URL in frontend JavaScript files to point to your deployed backend!

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'flask'`
- **Solution:** Activate virtual environment and install dependencies:
  ```bash
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Error:** `GOOGLE_API_KEY not found in environment variables`
- **Solution:** Create `.env` file in `backend/` directory with your API key

### Frontend can't connect to backend

**Error:** `Failed to fetch` or `CORS error`
- **Solution:** Make sure backend is running on `http://localhost:5000`
- **Solution:** Check CORS is enabled in `backend/app.py`

### AI makes poor decisions

- Adjust coaching parameters (aggression/caution)
- Set custom coaching prompts via `/api/coach`
- Review AI reasoning in the response
- Check that game state data is being sent correctly

### Port already in use

**Error:** `Address already in use`
- **Solution:** Kill the process using port 5000:
  ```bash
  # On Linux/Mac:
  lsof -ti:5000 | xargs kill -9

  # On Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- **Game Engine**: [Phaser 3](https://phaser.io/)
- **AI Model**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
- **Backend**: [Flask](https://flask.palletsprojects.com/)

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/IndrarajBiswas/AgentWar/issues)
- Check existing documentation in `claude.md` and `GOOGLE_AI_INTEGRATION.md`

---

**Made with AI coaching by [Indraraj Biswas](https://github.com/IndrarajBiswas)**

Happy Coaching! 🎮🤖
