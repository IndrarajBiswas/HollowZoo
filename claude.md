# Agent Arena Academy - Development Guide

## 🎯 Project Overview

You are helping build **Agent Arena Academy**, a 2D sidescroller game where players COACH an AI agent (powered by Claude LLM) that learns to fight autonomously through reinforcement and memory.

**Core Innovation:** Players don't control the character directly—they set coaching parameters (aggression, caution) and watch an AI agent make decisions, learn from mistakes, and improve over time.

---

## 🏗️ Technical Architecture

### Stack
- **Frontend:** Phaser 3 (JavaScript game engine)
- **Backend:** Flask (Python) + Anthropic Claude API
- **Visualization:** D3.js for memory graphs
- **Styling:** Custom CSS with dark/neon theme

### Data Flow
```
Phaser Game (JavaScript)
    ↓ [game state every 2.5 seconds]
Flask API (/api/decide)
    ↓ [formatted prompt]
Claude LLM
    ↓ [action + reasoning]
Phaser Game (executes action)
    ↓ [stores in memory]
Memory Visualization (D3.js)
```

---

## 📁 Project Structure
```
agent-arena-academy/
├── frontend/
│   ├── index.html                 # Main page
│   ├── styles.css                 # UI styling
│   ├── src/
│   │   ├── main.js               # Phaser config & initialization
│   │   ├── scenes/
│   │   │   ├── MenuScene.js      # Title screen
│   │   │   ├── GameScene.js      # Main gameplay ⭐ CORE
│   │   │   └── ComparisonScene.js # Side-by-side run comparison
│   │   ├── entities/
│   │   │   ├── Agent.js          # AI-controlled player
│   │   │   └── Enemy.js          # Opponent logic
│   │   ├── ui/
│   │   │   ├── ThoughtPanel.js   # Displays agent reasoning
│   │   │   ├── CoachingPanel.js  # Slider controls
│   │   │   └── MemoryGraph.js    # D3.js visualization ⭐ KILLER FEATURE
│   │   └── managers/
│   │       ├── AIManager.js      # API communication
│   │       └── MemoryManager.js  # Decision storage
│   └── assets/                   # Downloaded asset packs
│       ├── sprites/              # Character animations
│       ├── tiles/                # Platform tiles
│       └── effects/              # Hit effects, particles
│
├── backend/
│   ├── app.py                    # Flask server ⭐ CORE
│   ├── agent_brain.py           # LLM decision logic
│   ├── memory_system.py         # Learning system
│   ├── prompts.py               # LLM prompt templates
│   └── requirements.txt         # Python dependencies
│
└── README.md
```

---

## 🎮 Game Mechanics

### Agent Actions
1. **ATTACK** - Melee attack when close (< 80 units), costs 10 energy, deals ~15 damage
2. **DEFEND** - Block/reduce damage, minimal energy cost, 1 second duration
3. **JUMP** - Vertical leap for repositioning/dodging, costs 5 energy, only on ground

### Physics
- Gravity: 800 (Phaser units)
- Agent bounce: 0.1
- Jump velocity: -400 (negative = up)
- World bounds: 1280x720

### Energy System
- Max: 100
- Regenerates: +0.1 per frame (~6/second)
- Actions cost energy, prevents spam

### Health System
- Agent & Enemy start: 100 HP
- Death at 0 HP triggers post-match reflection
- Health bars display at top of screen

---

## 🧠 AI Agent Decision System

### LLM Prompt Structure

**Inputs sent to Claude:**
- Agent HP, energy, position, onGround status
- Enemy HP, position
- Distance between combatants
- Coaching parameters (aggression %, caution %)
- Recent memory (last 3-5 decisions)

**Expected Output Format:**
```
ACTION: [ATTACK/DEFEND/JUMP]
REASON: [One clear sentence explaining decision, referencing coaching]
```

**Example:**
```
ACTION: ATTACK
REASON: Enemy is at 40% health and within range; my high aggression coaching 
        suggests pressing the advantage.
```

### Decision Timing
- AI makes decision every **2.5 seconds**
- Prevents too-frequent API calls
- Allows animations to complete
- Feels deliberate and strategic

### Memory System
Agent stores each decision with:
- Game state snapshot
- Action taken
- Reasoning provided
- Outcome (success/failure)
- Timestamp

After death, agent reflects:
- What worked?
- What failed?
- What to try next time?

---

## 🎨 Visual Design Guidelines

### Color Palette
```css
Background: #0a0e27 (dark blue-black)
Primary UI: #16213e (deep blue)
Accent: #00d9ff (cyan/electric blue)
Secondary: #533483 (purple)
Text: #e0e0e0 (light gray)
Success: #00ff00 (green)
Danger: #ff0000 (red)
```

### UI Layout
- Left 70%: Game canvas (Phaser rendering)
- Right 30%: Control panel (coaching, stats, memory)
- Fixed 400px panel width (responsive to 350px on smaller screens)

### Typography
- Font: 'Courier New', monospace
- Heading size: 1.2em
- Body: 0.9em
- Monospace gives "coding/AI" aesthetic

---

## 🔌 API Endpoints

### POST `/api/decide`
**Purpose:** Get AI decision for current game state

**Request Body:**
```json
{
  "agent": {
    "health": 85,
    "x": 450,
    "y": 600,
    "energy": 70,
    "onGround": true
  },
  "enemy": {
    "health": 60,
    "x": 800,
    "y": 600
  },
  "distance": 350,
  "coaching": {
    "aggression": 70,
    "caution": 40
  },
  "memory": [
    {
      "action": "ATTACK",
      "reasoning": "...",
      "timestamp": "..."
    }
  ]
}
```

**Response:**
```json
{
  "action": "ATTACK",
  "reasoning": "Enemy is weakened and within striking distance; aggressive coaching suggests finishing the fight.",
  "confidence": 0.85
}
```

### POST `/api/reflect`
**Purpose:** Post-match learning reflection

**Request Body:**
```json
{
  "survival_time": 45,
  "decision_count": 18,
  "final_hp": 0,
  "cause": "Overwhelmed by enemy attacks"
}
```

**Response:**
```json
{
  "reflection": "LEARNED: Need to defend more when health drops below 30%\nNEXT_STRATEGY: Balance aggression with defensive positioning",
  "run_number": 3
}
```

### GET `/api/memory`
**Purpose:** Retrieve learning history for visualization

**Response:**
```json
{
  "decisions": [ /* array of all decisions */ ],
  "runs": [ /* array of run reflections */ ],
  "total_decisions": 127
}
```

### POST `/api/reset`
**Purpose:** Clear memory for new session

---

## 💡 Coding Patterns to Follow

### Phaser Scene Structure
```javascript
class GameScene extends Phaser.Scene {
    constructor() { /* Setup instance variables */ }
    preload() { /* Load assets */ }
    create() { /* Initialize game objects */ }
    update() { /* Called every frame */ }
}
```

### Async API Calls
```javascript
async requestAIDecision() {
    if (this.isWaitingForDecision) return; // Prevent concurrent calls
    
    this.isWaitingForDecision = true;
    
    try {
        const response = await fetch('http://localhost:5000/api/decide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameState)
        });
        
        const data = await response.json();
        this.executeAction(data.action);
        
    } catch (error) {
        console.error('Decision failed:', error);
        this.executeAction('DEFEND'); // Safe fallback
    }
    
    this.isWaitingForDecision = false;
}
```

### Animation Callbacks
```javascript
agentAttack() {
    this.agent.play('agent-attack');
    
    // Execute damage after animation plays
    this.time.delayedCall(300, () => {
        if (this.isInRange()) {
            this.dealDamage(15);
        }
    });
}
```

### Health Bar Updates
```javascript
updateHealthBar() {
    const healthPercent = this.agent.health / this.agent.maxHealth;
    this.agentHealthBar.width = 200 * healthPercent; // Scale from 0-200px
}
```

---

## 🎯 Key Features to Implement

### 1. Game Loop (PRIORITY 1)
- [x] Phaser renders sprites
- [x] Agent and enemy collide with platforms
- [x] Basic combat (attack deals damage)
- [x] Health bars update
- [x] Death detection

### 2. AI Integration (PRIORITY 1)
- [x] Game state collected every 2.5s
- [x] POST to backend with state
- [x] LLM returns action + reasoning
- [x] Agent executes action
- [x] Thought panel displays reasoning

### 3. Coaching System (PRIORITY 1)
- [x] Sliders for aggression & caution
- [x] Values sent in API request
- [x] LLM prompt references coaching
- [x] Behavior visibly changes with sliders

### 4. Memory System (PRIORITY 2)
- [ ] Store each decision with context
- [ ] Retrieve last N decisions for LLM
- [ ] Post-death reflection API call
- [ ] Display learning in UI

### 5. Memory Visualization (PRIORITY 2) ⭐ KILLER FEATURE
- [ ] D3.js force-directed graph
- [ ] Nodes = learned patterns
- [ ] Edges = connections between patterns
- [ ] Interactive (click to see details)
- [ ] Animates as agent learns

### 6. Comparison View (PRIORITY 3)
- [ ] Side-by-side: Run 1 vs Run 5
- [ ] Show both simultaneously
- [ ] Statistics comparison
- [ ] Highlight improvements

### 7. Polish (PRIORITY 3)
- [ ] Particle effects (hits, jumps)
- [ ] Screen shake on impacts
- [ ] Sound effects
- [ ] Smooth transitions
- [ ] Tutorial overlay

---

## 🐛 Common Issues & Solutions

### Issue: LLM returns invalid action
**Solution:** Parse with fallback
```python
valid_actions = ['ATTACK', 'DEFEND', 'JUMP']
if action not in valid_actions:
    action = 'DEFEND'  # Safe default
```

### Issue: API calls too slow (>3 seconds)
**Solution:** 
1. Increase decision interval to 3-4 seconds
2. Show "thinking..." animation during wait
3. Cache common responses
4. Use streaming API (advanced)

### Issue: Agent gets stuck in loops
**Solution:**
1. Add randomness to prompts (temperature 0.7-0.9)
2. Include more memory context
3. Penalize repeated actions in prompt
4. Add timeout/override system

### Issue: Phaser physics acting weird
**Solution:**
1. Check collision groups are set up
2. Verify gravity is applied
3. Ensure velocities reset between actions
4. Debug with physics.debug = true

### Issue: Memory graph looks cluttered
**Solution:**
1. Limit to most recent/important patterns
2. Cluster similar patterns
3. Use force simulation with collision detection
4. Add zoom/pan controls

---

## 📊 Performance Targets

- **Frame rate:** 60 FPS (monitor with Phaser stats)
- **API latency:** < 2 seconds for decision
- **Memory usage:** < 200MB in browser
- **Load time:** < 3 seconds initial
- **Asset size:** < 10MB total

---

## 🎬 Demo Script (For Reference)

**0:00-0:30** - Hook
"Meet Thunder, an AI agent learning to fight. I don't control Thunder—I coach it."
[Show agent making decision, display thought bubble]

**0:30-1:30** - Setup
"Adjust coaching sliders"
[Move aggression up, agent fights differently]
"Your coaching shapes AI behavior in real-time."

**1:30-2:30** - Learning
[Show side-by-side: Run 1 dies fast, Run 5 survives longer]
"Thunder learned from experience—nobody coded this improvement."

**2:30-3:00** - Close
"Students learn AI agents by coaching, not coding."

---

## 🚀 Development Priorities

### Day 1 (Foundation)
1. Get Phaser rendering
2. Agent moves and attacks
3. Backend returns decisions
4. End-to-end works once

### Day 2 (Intelligence)
1. Thought panel displays reasoning
2. Coaching sliders affect behavior
3. Memory stored after each decision
4. Basic learning visible

### Day 3 (Wow Factor)
1. Memory graph visualization
2. Run comparison view
3. Post-match reflection
4. Polish effects

### Day 4 (Demo Ready)
1. Fix all bugs
2. Visual polish
3. Practice presentation
4. Backup video

---

## 🔗 Helpful Resources

- **Phaser 3 Docs:** https://photonstorm.github.io/phaser3-docs/
- **Anthropic API Docs:** https://docs.anthropic.com/
- **D3.js Examples:** https://observablehq.com/@d3/gallery
- **Free Asset Packs:** https://itch.io/game-assets/free

---

## ❓ When to Ask for Help

**Ask the developer when:**
- Unclear about game design decision (e.g., "Should agent dodge or block?")
- Need to choose between multiple valid approaches
- Hitting the 4-day time constraint
- Feature seems too complex for timeline

**Don't ask when:**
- Syntax errors (look them up)
- Standard library usage (check docs)
- Basic debugging (console.log first)
- Simple refactoring decisions

---

## 🎯 Success Criteria

**Minimum Viable Demo (MUST HAVE):**
- ✅ Agent fights autonomously via LLM
- ✅ Visible thought process
- ✅ Coaching sliders work
- ✅ Agent learns across runs
- ✅ Smooth 3-minute demo

**Impressive But Optional:**
- ⭐ Memory graph visualization
- ⭐ Side-by-side comparison
- ⭐ Tutorial system
- ⭐ Perfect pixel art

**The Goal:** Win the AI Agent track by showing clear, visible AI-agent concepts through engaging gameplay.

---

## 💬 Prompt Templates for AI Assistance

### For implementing a new feature:
```
Context: I'm building [feature] for Agent Arena Academy, a Phaser 3 game where 
an AI agent learns to fight.

Current code: [paste relevant files]

Goal: Implement [specific feature] that [does X]

Requirements:
- Must integrate with existing [system]
- Should follow [pattern] from GameScene.js
- Needs to handle [edge case]

Please provide complete, working code with comments.
```

### For debugging:
```
Issue: [describe problem]

Expected behavior: [what should happen]
Actual behavior: [what's happening]

Relevant code: [paste snippet]

Error message (if any): [paste error]

What I've tried: [list attempts]

Please help me fix this.
```

### For optimization:
```
This code works but is slow/inefficient: [paste code]

Bottleneck: [describe performance issue]

Constraints: Must maintain [requirements]

Please optimize while keeping [behavior] the same.
```

---

## 🏆 This Project Wins Because:

1. **Clear AI-agent demonstration** - All concepts visible
2. **Novel interaction** - Coaching, not controlling
3. **Visual learning** - Can SEE intelligence emerging
4. **Educational value** - Teaches real AI concepts
5. **Polished demo** - Engaging and memorable
6. **Technical depth** - LLM integration, memory, learning
7. **Achievable scope** - Can finish in 4 days

---

**Remember:** Focus on making the core loop perfect before adding features. 
A polished simple game beats a half-broken complex one every time.

**Now go build something amazing! 🚀**
```

---

## 📝 **HOW TO USE THIS FILE**

### **For Cursor/Windsurf/Copilot:**

1. **Place `CLAUDE.md` in project root**

2. **Reference in chat:**
```
   @CLAUDE.md I need help implementing [feature]
```

3. **For new features:**
```
   @CLAUDE.md Review the architecture and help me add [X]
```

4. **For debugging:**
```
   @CLAUDE.md Check this against the coding patterns and fix the bug
```

### **For Claude Desktop/API:**

Copy relevant sections into your prompt:
```
Here's the project context: [paste relevant section from CLAUDE.md]

Now help me with: [your specific task]