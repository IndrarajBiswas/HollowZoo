# Google AI Integration Documentation

## Overview

This project integrates **Google's Gemini 2.0 Flash** AI model to power an intelligent fighting character named "Thunder" in a 2D combat arena. The AI makes real-time combat decisions and can be coached using custom natural language prompts.

---

## Project Structure

```
hackaroo/
├── backend/
│   ├── .env                 # Environment variables (API keys)
│   ├── app.py              # Flask API server
│   ├── agent_brain.py      # AI decision-making logic
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── entities/
│   │   │   ├── Agent.js    # AI character entity
│   │   │   └── Enemy.js    # Enemy character entity
│   │   ├── scenes/
│   │   │   ├── GameScene.js
│   │   │   └── MenuScene.js
│   │   └── main.js
│   └── ...
└── GOOGLE_AI_INTEGRATION.md  # This file
```

---

## Setup Instructions

### 1. Environment Variables

The API key is stored securely in `backend/.env`:

```bash
# backend/.env
GOOGLE_API_KEY=your_google_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### 2. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the Backend

```bash
cd backend
python app.py
```

Server will run on: `http://localhost:5000`

---

## How It Works

### Architecture

1. **Frontend (Phaser.js)**: Renders the game and sends game state to backend
2. **Backend (Flask)**: Receives game state, queries Gemini AI, returns decisions
3. **Google Gemini AI**: Processes game state and coaching to make smart decisions

### Decision-Making Flow

```
Game State → Flask API → AgentBrain → Gemini AI → Action Decision → Game
```

Each frame, the AI receives:
- Agent health, energy, position
- Enemy health, position
- Distance between fighters
- Coaching parameters (aggression, caution)
- Recent action memory
- **Custom coaching prompts** (optional)

The AI responds with:
- Action to take (ATTACK, DEFEND, JUMP)
- Reasoning for the decision
- Confidence level

---

## API Endpoints

### 1. `/api/decide` (POST)

Make an AI decision for the current game state.

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
  "memory": [
    {"action": "ATTACK", "reasoning": "Enemy weak"}
  ]
}
```

**Response:**
```json
{
  "action": "ATTACK",
  "reasoning": "My aggressive coaching (70%) tells me to press the advantage while enemy is weak at 45 HP.",
  "confidence": 0.85
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/decide \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {"health": 85, "energy": 60, "onGround": true},
    "enemy": {"health": 45},
    "distance": 75,
    "coaching": {"aggression": 70, "caution": 30},
    "memory": []
  }'
```

---

### 2. `/api/coach` (POST) - NEW!

Send a custom coaching prompt to influence the AI's behavior.

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

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Always prioritize defense and only attack when enemy health is below 30%"
  }'
```

#### Coaching Prompt Examples

```bash
# Defensive strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Play very defensively. Only attack when enemy health is below 30%. Prioritize survival."}'

# Aggressive strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Be extremely aggressive. Attack whenever possible. Take risks to win quickly."}'

# Hit-and-run strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Use hit-and-run tactics. Attack once, then jump away. Keep distance."}'

# Counter-attack strategy
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Wait for the enemy to attack, defend, then counter-attack immediately."}'

# Energy management
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Always keep energy above 50%. Be patient and strategic with actions."}'
```

---

### 3. `/api/coach` (GET)

Get the current custom coaching prompt.

**Response:**
```json
{
  "status": "success",
  "prompt": "Always prioritize defense and only attack when enemy health is below 30%"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/coach
```

---

### 4. `/api/reflect` (POST)

Post-match reflection for learning.

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

**Response:**
```json
{
  "reflection": "Defeated after 45.3s. Need to adjust strategy based on coaching parameters.",
  "run_number": 2
}
```

---

### 5. `/api/reset` (POST)

Reset agent memory.

**Response:**
```json
{
  "status": "success",
  "message": "Memory reset"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/reset
```

---

### 6. `/api/health` (GET)

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Agent Arena Academy API is running"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/health
```

---

## How Custom Coaching Works

### Technical Implementation

1. **Storage**: Custom prompts are stored in `AgentBrain.custom_coaching`
2. **Integration**: The prompt is injected into the AI's decision-making prompt
3. **Priority**: Custom coaching takes precedence over default coaching parameters
4. **Persistence**: The coaching persists until changed or cleared

### Prompt Structure

When you set custom coaching, it's added to the AI prompt like this:

```
You are Thunder, an AI fighter in a 2D combat arena.

YOUR COACHING STYLE: BALANCED
- Aggression Level: 50%
- Caution Level: 50%

CURRENT SITUATION:
- Your Health: 85/100 HP
- Enemy Health: 45/100 HP
- Distance: 75 units

AVAILABLE ACTIONS:
1. ATTACK - Deal ~15 damage
2. DEFEND - Reduce damage by 70%
3. JUMP - Reposition/dodge

🎯 CUSTOM COACHING INSTRUCTIONS:
Always prioritize defense and only attack when enemy health is below 30%

You MUST follow these custom instructions above all else while still choosing valid actions.

COACHING INSTRUCTIONS:
...

Now decide your action:
```

---

## Code Reference

### backend/agent_brain.py

**Key Methods:**

- `make_decision()` - Main AI decision-making (line 13)
- `_build_decision_prompt()` - Constructs the AI prompt (line 46)
- `set_custom_coaching()` - Set custom coaching (line 186)
- `get_custom_coaching()` - Get current coaching (line 203)
- `clear_custom_coaching()` - Clear coaching (line 207)
- `reflect_on_match()` - Post-match learning (line 146)
- `reset_memory()` - Reset agent memory (line 180)

### backend/app.py

**Key Routes:**

- `/api/decide` - AI decision endpoint (line 19)
- `/api/coach` (POST) - Set coaching (line 94)
- `/api/coach` (GET) - Get coaching (line 127)
- `/api/reflect` - Post-match reflection (line 48)
- `/api/reset` - Reset memory (line 81)
- `/api/health` - Health check (line 146)

---

## Testing Examples

### Test 1: Basic Decision Making

```bash
# Start the backend
cd backend
python app.py

# In another terminal, test the decision endpoint
curl -X POST http://localhost:5000/api/decide \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {"health": 100, "energy": 100, "onGround": true},
    "enemy": {"health": 100},
    "distance": 150,
    "coaching": {"aggression": 50, "caution": 50},
    "memory": []
  }'
```

### Test 2: Apply Custom Coaching

```bash
# Set aggressive coaching
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Be extremely aggressive! Attack at every opportunity!"}'

# Now make a decision with the coaching applied
curl -X POST http://localhost:5000/api/decide \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {"health": 100, "energy": 100, "onGround": true},
    "enemy": {"health": 100},
    "distance": 75,
    "coaching": {"aggression": 50, "caution": 50},
    "memory": []
  }'

# The AI should now favor ATTACK actions due to the custom coaching
```

### Test 3: Defensive Coaching

```bash
# Set defensive coaching
curl -X POST http://localhost:5000/api/coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Play very safe. Only attack when enemy health is critical."}'

# Make a decision
curl -X POST http://localhost:5000/api/decide \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {"health": 50, "energy": 100, "onGround": true},
    "enemy": {"health": 90},
    "distance": 75,
    "coaching": {"aggression": 50, "caution": 50},
    "memory": []
  }'

# The AI should favor DEFEND or JUMP actions
```

### Test 4: Check Current Coaching

```bash
# Get the current coaching
curl http://localhost:5000/api/coach
```

---

## Troubleshooting

### Error: "GOOGLE_API_KEY not found in environment variables"

**Solution:** Make sure the `.env` file exists in the `backend/` directory with your API key:
```bash
echo 'GOOGLE_API_KEY=your_google_api_key_here' > backend/.env
```

### Error: "No module named 'google.generativeai'"

**Solution:** Install dependencies:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Error: Connection refused

**Solution:** Make sure the backend is running:
```bash
cd backend
python app.py
```

### AI makes poor decisions

**Solution:**
1. Check if custom coaching is too restrictive
2. Adjust aggression/caution parameters
3. Review the AI's reasoning in the response
4. Try different coaching prompts

---

## Next Steps

### Potential Enhancements

1. **Coaching Presets**: Create preset coaching strategies
2. **Learning System**: Make AI learn from wins/losses
3. **Multi-character Support**: Different AI personalities
4. **Real-time Coaching Updates**: Change coaching mid-match
5. **Coaching Analytics**: Track which strategies work best
6. **Voice Coaching**: Use speech-to-text for real-time coaching

### Frontend Integration

To integrate the coaching UI in the frontend:

```javascript
// Example: Add coaching input in MenuScene.js
async function setCoaching(prompt) {
  const response = await fetch('http://localhost:5000/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  console.log('Coaching set:', data);
}

// Usage
setCoaching("Be aggressive and attack often!");
```

---

## Summary

You now have a fully functional Google AI integration with custom coaching!

**What you can do:**
- ✅ AI makes intelligent combat decisions using Gemini 2.0 Flash
- ✅ Send custom coaching prompts via API
- ✅ Control AI strategy with natural language
- ✅ API key stored securely in environment variables
- ✅ Full API documentation with cURL examples
- ✅ Test the system with various coaching strategies

**Key Files Modified:**
- `backend/.env` - Created (API key storage)
- `backend/app.py` - Updated (added /api/coach endpoints)
- `backend/agent_brain.py` - Updated (custom coaching support)

**New API Endpoints:**
- `POST /api/coach` - Set custom coaching
- `GET /api/coach` - Get current coaching

Enjoy coaching your AI fighter! 🎮🤖
