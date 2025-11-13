# 🚀 Gemini AI Setup Guide

## Quick Start (5 minutes)

### 1. Get Your Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste your API key:
```
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start Development Servers

**Option A: Use the development script (recommended)**
```bash
# On Mac/Linux:
./dev.sh

# On Windows:
dev.bat
```

This automatically:
- Checks for `.env` file
- Creates virtual environment if needed
- Installs dependencies
- Starts both backend (port 5000) and frontend (port 8000)
- Enables auto-reload on code changes

**Option B: Manual start**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
python -m http.server 8000
```

You should see:
```
🦘 Starting Hollow Zoo AI Backend...
🧠 Using real Gemini AI
```

### 5. Open the Game
Go to http://localhost:8000 in your browser (Chrome/Edge recommended)

---

## ✨ New Gameplay Features Added

### 1. **Combo System**
- Chain DIFFERENT actions to build combos (2x, 3x, 4x...)
- Each combo level adds +10% damage (max +50%)
- Repeating the same action breaks your combo
- Combo resets after 2 seconds of inactivity
- **Example**: ATTACK → JUMP_ATTACK → DODGE → ATTACK = 4x combo!

### 2. **Visual Feedback**
- **Screen shake** on impacts (bigger shake for crits)
- **Floating damage text** shows CRIT, AERIAL STRIKE, etc.
- **Combo counter** at top center shows your multiplier
- **Pulsing combo display** when active

### 3. **Better AI Integration**
- Gemini now receives clear tactical situation analysis
- Prompt includes distance, health status, enemy threat level
- AI explains decisions referencing YOUR strategy
- Past lessons incorporated into decisions

### 4. **Quick Strategy Buttons**
In the Mission Briefing screen, click preset strategies:
- **Balanced**: Medium range, mixed tactics
- **Aggressive**: Rush down, constant pressure
- **Defensive**: Stay back, patient counters
- **Tactical**: Observe patterns, combo focus

---

## 🎮 Pro Tips for Better Prompts

### What Works Well ✅
```
"Stay at 50-80 units range. Use jump attacks when enemy is idle.
Dodge when enemy attacks. If my health < 40%, retreat and block."
```

### What Doesn't Work ❌
```
"Win the fight"  (too vague)
```

### Advanced Strategies 🧠
```
"First 10 seconds: observe and dodge only. Learn enemy patterns.
Then alternate ATTACK and JUMP_ATTACK for combos. Block if health < 50.
Retreat if health < 30. Finish with aerial attacks when enemy < 40 HP."
```

---

## 🔧 Troubleshooting

### "Using mock AI" message
- Check `.env` file exists in `backend/` folder
- Verify API key is correct (no quotes, no spaces)
- Check `backend/agent_brain.py` line 15: `USE_REAL_AI = True`

### Game freezes during combat
- Check browser console (F12) for errors
- Verify backend is running (`python app.py`)
- Check API quota at https://aistudio.google.com/

### API rate limits
Gemini Free Tier: 60 requests/minute
- Each AI decision = 1 request
- Game makes ~1 request per second during combat
- Should be fine for MVP testing!

---

## 📊 Cost Estimate

**Gemini 2.0 Flash Pricing** (as of 2025):
- FREE tier: 1,500 requests/day
- Each battle uses ~30-60 requests (30-60 seconds)
- **You can play 25-50 battles per day FREE**

For unlimited: ~$0.35 per 1M tokens (incredibly cheap)

---

## 🎯 Next Steps to Improve Gameplay

1. **Add more enemy types** with unique behaviors
2. **Power-ups** that drop during combat
3. **Special abilities** with cooldowns
4. **Leaderboard** tracking best prompts
5. **Replay system** to review AI decisions
6. **Multiplayer** - compete with others' prompts
7. **Custom arenas** with hazards and obstacles

---

## 🐛 Known Issues

- Combo counter might not reset if scene changes mid-battle (minor)
- Screen shake disabled in some browsers (Chrome works best)
- Long prompts (>500 chars) might slow AI response time

---

## 💡 Testing Your Setup

1. Start backend: `python backend/app.py`
2. Open `frontend/index.html`
3. Click "PLAY"
4. Choose Level 1
5. Use this test prompt: "Attack when close, dodge when enemy attacks"
6. Watch the AI Thought Panel - it should show Gemini's reasoning
7. Check backend terminal - you'll see API calls

Success! 🎉

---

## Questions?

- Check `README.md` for full project docs
- Backend issues? Check `backend/app.py` console output
- Frontend issues? Press F12, check Console tab
- API issues? Visit https://aistudio.google.com/
