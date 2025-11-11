# 🚀 Quick Start Guide

Get Hollow Zoo running in 5 minutes!

## Step 1: Install Python Dependencies

```bash
cd HollowZoo/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Get Your Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your key

## Step 3: Configure Environment

```bash
# Still in backend/ directory
cp .env.example .env
# Edit .env and paste your API key
```

Or manually create `backend/.env`:
```
GEMINI_API_KEY=your_actual_key_here
```

## Step 4: Run the Game

### Option A: Use the Start Script (Easy)

**On Linux/Mac:**
```bash
cd HollowZoo
./start.sh
```

**On Windows:**
```bash
cd HollowZoo
start.bat
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd HollowZoo/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd HollowZoo/frontend
python3 -m http.server 8000
```

## Step 5: Play!

Open your browser to: **http://localhost:8000**

## Controls

- **Mentor Runes** (left panel) - Drag sliders to coach your AI
- **AI Thoughts** (bottom panel) - See what RooKnight is thinking
- **ESC** - Pause/return to menu

## Tips

1. **Aggressive Start:** Set Feral to 80+, Caution to 30
2. **Defensive Play:** Set Caution to 80+, Feral to 40
3. **Observant Style:** Set Naturalist to 80+, watch the AI learn

Your AI gets smarter with each battle - try different coaching styles!

## Troubleshooting

**"API unavailable" message:**
- Make sure backend is running (Terminal 1)
- Check your Gemini API key is set in `.env`

**Game won't load:**
- Check browser console (F12) for errors
- Make sure you're on http://localhost:8000

**Backend crashes:**
- Verify all dependencies: `pip install -r requirements.txt`
- Check Python version: `python3 --version` (needs 3.8+)

---

**Ready to coach your AI kangaroo!** 🦘🧠
