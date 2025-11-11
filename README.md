# 🦘 Hollow Zoo: AI Awakening

A unique 2D exploration and combat game where you don't directly control your character. Instead, you coach an AI agent (RooKnight) who autonomously navigates a mysterious abandoned zoo overrun by rogue AI kangaroos.

Inspired by Hollow Knight's atmospheric exploration and powered by Google's Gemini 2.0 Flash AI.

## 🎮 Concept

In the depths of an abandoned zoo, AI test subjects have broken free. You guide **RooKnight**, an AI agent who learns and adapts through your coaching. Use "Mentor Runes" to shape their behavior:

- **🩸 Feral** - Increases aggression
- **🛡️ Cautious** - Enhances defense and caution
- **🌿 Naturalist** - Boosts curiosity and observation

Watch your AI companion make decisions in real-time, learn from battles, and gradually unlock harder arenas through your coaching prompts.

## 🏗️ Project Structure

```
HollowZoo/
├── backend/
│   ├── app.py              # Flask server with API endpoints
│   ├── agent_brain.py      # Gemini AI integration & decision logic
│   ├── world_state.py      # Biome and enemy data management
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
│
├── frontend/
│   ├── index.html          # Main game page
│   ├── config.js           # Game configuration & API helpers
│   ├── main.js             # Phaser game initialization
│   │
│   ├── scenes/
│   │   ├── BootScene.js    # Loading and initialization
│   │   ├── MenuScene.js    # Main menu
│   │   ├── ZooScene.js     # Main exploration/combat scene
│   │   └── NestScene.js    # Boss battle arena
│   │
│   ├── entities/
│   │   ├── RooKnight.js    # Player AI agent
│   │   └── Kangaroo.js     # Enemy entities
│   │
│   └── ui/
│       ├── MentorRunes.js  # Coaching interface
│       ├── AIThoughtPanel.js # AI reasoning display
│       └── HealthBar.js    # Health display component
│
└── README.md
```

## 🚀 Quick Start (One Command!)

The easiest way to run the entire project with live reloading:

```bash
# On Linux/Mac
./dev.sh

# On Windows
dev.bat
```

This will:
- Activate the virtual environment (or create one if needed)
- Install all dependencies
- Start both backend and frontend servers
- Enable live reloading for code changes

Then open your browser to `http://localhost:8000`

## 🔧 Detailed Setup Instructions

### Prerequisites

- Python 3.8+
- A Google AI Studio API key (for Gemini 2.0 Flash)
- Modern web browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd HollowZoo/backend
```

2. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

6. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd HollowZoo/frontend
```

2. Start a local web server:
```bash
# Using Python's built-in server
python3 -m http.server 8000

# OR using npm if you have Node.js
npx http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 🎯 How to Play

1. **Start a Mission** - Click "START MISSION" from the main menu

2. **Observe Your AI** - Watch RooKnight (blue kangaroo) make autonomous decisions

3. **Choose a Level** – The main menu lists five handcrafted encounters. Clear a level to unlock the next one.

4. **Brief the Agent** – On the Mission Briefing screen, type natural-language instructions (e.g., “Stay defensive until HP < 40%, then chain jump attacks”). Your prompt is saved between runs for quick tweaks.

5. **Read AI Thoughts** – The bottom panel shows RooKnight's reasoning and confidence level.

6. **Watch & Learn** – Your AI will fight based on your prompt. Win to unlock the next arena; lose to refine your strategy.

## 🧠 AI System

### Decision Making

Every 0.7–0.9 seconds (faster on later levels), the AI:
1. Analyzes the current game state (health, distance, enemy pose)
2. Reviews past lessons from memory
3. Considers your latest tactical prompt
4. Chooses an action (attack, dodge, retreat, etc.)

> **No API key handy?** Set `USE_FAKE_AI = true` in `frontend/config.js` (default). This uses the built-in simulated agent so you can play the full campaign offline. Flip it back to `false` to reconnect to the Gemini backend.

### Learning Loop

After each battle:
1. Battle data is collected (damage dealt/taken, actions used)
2. Gemini generates a reflection
3. Key lessons are stored in memory (`memory.json`)
4. Future decisions incorporate these lessons

### Available Actions

- **ATTACK** - Direct melee strike
- **DODGE** - Quick evasive dash
- **BLOCK** - Defensive stance
- **WAIT_AND_OBSERVE** - Study enemy patterns
- **RETREAT** - Fall back to safety
- **JUMP_ATTACK** - Aerial assault
- **MOVE_CLOSER** - Advance toward enemy
- **MOVE_AWAY** - Create distance

## 🌍 Campaign Levels

1. **Sanctum Patrol** – Tutorial duel; the enemy is slow and fragile so any coherent prompt should win.
2. **Dome Ambush** – Desert Dome skirmish with aggressive patrols.
3. **Flooded Vault** – Low-visibility Aqua Vault battle with slippery footing.
4. **Thorn Garden Hunt** – Poisonous flora forces constant movement.
5. **King’s Chamber** – Final showdown against the Kangaroo King.

Each level increases enemy health, damage, and AI cadence. Unlocks persist per session so you can iterate quickly.

## 🔧 Development & Configuration

### Live Reloading

When using `./dev.sh` or `dev.bat`, both servers support live reloading:
- **Backend**: Flask's debug mode automatically reloads when you edit Python files
- **Frontend**: Refresh your browser to see HTML/JS/CSS changes instantly

### Game Configuration

Edit `frontend/config.js` to customize:

- Game dimensions
- Physics settings
- AI decision interval
- Default coaching parameters
- API endpoint URL

## 📡 API Endpoints

- `GET /api/health` - Health check
- `POST /api/decide` - Get AI decision for current game state
- `POST /api/reflect` - Generate post-battle reflection
- `GET /api/memory` - Retrieve agent memory
- `POST /api/memory` - Save new memory entry
- `GET /api/world/biome?name=BiomeName` - Get biome information
- `GET /api/world/enemies` - Get all enemy types

## 📘 Next Steps

Future ideas (co-op sparring, biome hazards, persistent unlocks) are tracked in [`NEXT_STEPS.md`](NEXT_STEPS.md). Contributions and experiments are welcome!

## 🎨 Future Enhancements

- [ ] Hand-drawn Hollow Knight-style sprites
- [ ] Multiple biome levels
- [ ] Boss battle implementation
- [ ] Procedural coaching suggestions from Gemini
- [ ] Spectator mode: Two AI agents battle
- [ ] Moral system: Affect AI personality through encouragement/scolding
- [ ] Sound effects and atmospheric music
- [ ] Save/load game states
- [ ] Achievement system

## 🐛 Troubleshooting

**Backend won't start:**
- Check that you've activated the virtual environment
- Verify all dependencies are installed
- Ensure your Gemini API key is valid

**Frontend shows "API unavailable":**
- Verify the backend is running on port 5000
- Check browser console for CORS errors
- Ensure `API_BASE_URL` in `config.js` is correct

**AI decisions seem random:**
- The AI works better with a valid Gemini API key
- Without an API key, it falls back to simple logic
- Try adjusting coaching parameters for different behaviors

**Game runs slowly:**
- Close other browser tabs
- Check browser console for errors
- Reduce the number of active tweens/animations

## 📝 License

MIT License - Feel free to modify and build upon this project!

## 🙏 Credits

- Concept inspired by Hollow Knight
- AI powered by Google Gemini 2.0 Flash
- Built with Phaser 3 game framework
- Backend with Flask

## 🔗 Links

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Google AI Studio](https://aistudio.google.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Made with AI-powered creativity** 🧠🦘
