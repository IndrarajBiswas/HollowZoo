import os
import json
import google.generativeai as genai
from datetime import datetime

class AgentBrain:
    """
    Core AI brain for RooKnight using Gemini 2.0 Flash
    Handles decision-making, learning, and memory
    """

    def __init__(self):
        # Configure Gemini API
        # TODO: Set USE_REAL_AI = True to enable actual Gemini AI (requires valid API key)
        USE_REAL_AI = True  # <-- Set to True to use real Gemini AI

        api_key = os.environ.get('GEMINI_API_KEY')
        if not USE_REAL_AI or not api_key:
            if not USE_REAL_AI:
                print("🤖 Using simulated AI - Prompt-based gameplay ready!")
            else:
                print("⚠️  Warning: GEMINI_API_KEY not set. Using mock mode.")
            self.mock_mode = True
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.mock_mode = False
            print("🧠 Using real Gemini AI")

        # Initialize memory system
        self.memory = []
        self.load_memory()

    def decide(self, agent_state, enemy_state, environment, user_prompt, memory):
        """
        Main decision-making function using user's tactical prompt
        Returns AI action and reasoning
        """
        if self.mock_mode:
            return self._mock_decision(agent_state, enemy_state, user_prompt)

        # Build context prompt with user's instructions
        prompt = self._build_decision_prompt(
            agent_state, enemy_state, environment, user_prompt, memory
        )

        try:
            # Get Gemini's decision
            response = self.model.generate_content(prompt)
            decision_text = response.text

            # Parse the response
            decision = self._parse_decision(decision_text)

            return decision

        except Exception as e:
            print(f"Error in AI decision: {e}")
            return self._fallback_decision(agent_state, enemy_state)

    def _build_decision_prompt(self, agent_state, enemy_state, environment, user_prompt, memory):
        """Build the prompt for Gemini with user's tactical instructions"""

        health_status = "critical" if agent_state.get('health', 100) < 30 else "low" if agent_state.get('health', 100) < 60 else "good"
        enemy_threat = "immediate" if enemy_state.get('distance', 100) < 50 else "close" if enemy_state.get('distance', 100) < 100 else "distant"

        prompt = f"""You are RooKnight, an AI combat agent following your commander's tactical orders.

🎯 COMMANDER'S STRATEGY:
"{user_prompt}"

⚔️ COMBAT SITUATION:
Your Status: {agent_state.get('health', 100)}/100 HP ({health_status}), {agent_state.get('energy', 100)}/100 energy
Enemy: {enemy_state.get('type', 'Unknown')} - {enemy_state.get('health', 100)}/100 HP ({enemy_threat} threat)
Distance: {enemy_state.get('distance', 0):.0f} units | Enemy is: {enemy_state.get('state', 'idle')}
Position: {"grounded" if agent_state.get('onGround') else "airborne"} in {environment.get('zone', 'arena')}

📚 PAST LESSONS:
{self._format_memory(memory)}

🎮 AVAILABLE ACTIONS & WHEN TO USE:
- ATTACK: Strike enemy (best at 15-50 units, deals damage)
- JUMP_ATTACK: Aerial assault (high damage, crosses gaps, 50-100 units ideal)
- DODGE: Quick evasive dash (escape danger, reposition)
- BLOCK: Defensive stance (reduces damage 65%, use when enemy attacking)
- RETREAT: Fall back when low health or overwhelmed
- MOVE_CLOSER: Advance toward enemy (when >100 units away)
- MOVE_AWAY: Create space (when too close <15 units)
- WAIT_AND_OBSERVE: Study patterns (use sparingly, when enemy idle)

CRITICAL: Your commander's strategy is paramount. Interpret their instructions and adapt them to this exact situation. If they say "be aggressive", favor ATTACK/JUMP_ATTACK. If "defensive", use DODGE/BLOCK more. If "smart", analyze before acting.

Respond ONLY with valid JSON:
{{
  "action": "EXACT_ACTION_NAME",
  "reasoning": "1-2 sentences explaining how this follows commander's strategy for THIS situation",
  "confidence": 0.0-1.0
}}"""

        return prompt

    def _parse_decision(self, decision_text):
        """Parse Gemini's response into structured decision"""
        try:
            # Try to extract JSON from the response
            start_idx = decision_text.find('{')
            end_idx = decision_text.rfind('}') + 1

            if start_idx >= 0 and end_idx > start_idx:
                json_str = decision_text[start_idx:end_idx]
                decision = json.loads(json_str)
                return decision
            else:
                raise ValueError("No JSON found in response")

        except Exception as e:
            print(f"Error parsing decision: {e}")
            # Return default decision
            return {
                "action": "WAIT_AND_OBSERVE",
                "reasoning": "Analyzing the situation...",
                "confidence": 0.5
            }

    def _mock_decision(self, agent_state, enemy_state, user_prompt=''):
        """Mock decision - simulates smart AI behavior (for demo without real API)"""
        import random

        distance = enemy_state.get('distance', 100)
        health = agent_state.get('health', 100)
        enemy_health = enemy_state.get('health', 100)
        enemy_state_str = enemy_state.get('state', 'idle')

        # Log user prompt for debugging (in real mode, Gemini would use this)
        if user_prompt:
            print(f"📋 User Prompt: {user_prompt[:80]}...")

        # Critical health - always retreat
        if health < 25:
            return {
                "action": "RETREAT",
                "reasoning": "Critical health! Must retreat to survive",
                "confidence": 0.95
            }

        # Low health but enemy almost dead - finish them
        elif health < 40 and enemy_health < 30:
            return {
                "action": "JUMP_ATTACK",
                "reasoning": "Both wounded - finishing blow!",
                "confidence": 0.88
            }

        # Low health - defensive
        elif health < 40:
            if random.random() < 0.7:
                return {
                    "action": "DODGE",
                    "reasoning": "Low health - staying mobile and defensive",
                    "confidence": 0.82
                }
            else:
                return {
                    "action": "BLOCK",
                    "reasoning": "Low health - blocking incoming attacks",
                    "confidence": 0.78
                }

        # Enemy attacking - counter or dodge
        elif enemy_state_str == 'attacking':
            if distance < 30:
                return {
                    "action": "DODGE",
                    "reasoning": "Enemy attacking! Evading now!",
                    "confidence": 0.92
                }
            else:
                return {
                    "action": "MOVE_AWAY",
                    "reasoning": "Enemy attacking - creating distance",
                    "confidence": 0.85
                }

        # Perfect attack range
        elif distance < 25 and distance > 10:
            actions = ["ATTACK", "JUMP_ATTACK"]
            action = random.choice(actions)
            return {
                "action": action,
                "reasoning": f"Perfect range! {'Aerial assault' if action == 'JUMP_ATTACK' else 'Strike now'}!",
                "confidence": 0.90
            }

        # Too close - might get hit
        elif distance < 10:
            if random.random() < 0.6:
                return {
                    "action": "ATTACK",
                    "reasoning": "Point-blank range - quick strike!",
                    "confidence": 0.87
                }
            else:
                return {
                    "action": "DODGE",
                    "reasoning": "Too close - need space to maneuver",
                    "confidence": 0.83
                }

        # Too far - close distance
        elif distance > 80:
            return {
                "action": "MOVE_CLOSER",
                "reasoning": "Enemy too far - closing the gap",
                "confidence": 0.80
            }

        # Medium range - tactical choice
        elif distance > 40:
            if random.random() < 0.4:
                return {
                    "action": "MOVE_CLOSER",
                    "reasoning": "Moving into attack range",
                    "confidence": 0.75
                }
            else:
                return {
                    "action": "WAIT_AND_OBSERVE",
                    "reasoning": "Studying enemy patterns and timing",
                    "confidence": 0.72
                }

        # Default - observe
        else:
            return {
                "action": "WAIT_AND_OBSERVE",
                "reasoning": "Analyzing the situation...",
                "confidence": 0.70
            }

    def _fallback_decision(self, agent_state, enemy_state):
        """Fallback decision if AI fails"""
        return {
            "action": "BLOCK",
            "reasoning": "Defensive stance while recalculating",
            "confidence": 0.6
        }

    def reflect(self, battle_data, outcome):
        """
        Post-battle reflection and learning
        """
        if self.mock_mode:
            return self._mock_reflection(battle_data, outcome)

        prompt = f"""You are RooKnight. You just finished a battle.

BATTLE DATA:
- Enemy Type: {battle_data.get('enemy_type', 'Unknown')}
- Duration: {battle_data.get('duration', 0)} seconds
- Damage Taken: {battle_data.get('damage_taken', 0)}
- Damage Dealt: {battle_data.get('damage_dealt', 0)}
- Actions Used: {', '.join(battle_data.get('actions', []))}
- Outcome: {outcome}

Reflect on this battle. What did you learn? What would you do differently?

Respond in JSON format:
{{
  "lesson": "One sentence key takeaway",
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "confidence_change": "More confident / Less confident / Same"
}}"""

        try:
            response = self.model.generate_content(prompt)
            reflection_text = response.text

            # Parse reflection
            start_idx = reflection_text.find('{')
            end_idx = reflection_text.rfind('}') + 1
            json_str = reflection_text[start_idx:end_idx]
            reflection = json.loads(json_str)

            # Store lesson in memory
            self.add_memory(reflection.get('lesson', 'Battle completed'))

            return reflection

        except Exception as e:
            print(f"Error in reflection: {e}")
            return self._mock_reflection(battle_data, outcome)

    def _mock_reflection(self, battle_data, outcome):
        """Mock reflection when API is not available - generates dynamic insights"""
        import random

        enemy_type = battle_data.get('enemy_type', 'enemy')
        damage_taken = battle_data.get('damage_taken', 0)
        damage_dealt = battle_data.get('damage_dealt', 0)
        duration = battle_data.get('duration', 0)

        # Generate contextual lessons based on battle performance
        lessons = []
        improvements = []

        if outcome == "victory":
            if damage_taken < 20:
                lessons.append(f"Dominated {enemy_type} with minimal damage")
                improvements.append("Maintain aggressive positioning")
            elif damage_taken < 50:
                lessons.append(f"Defeated {enemy_type} effectively")
                improvements.append("Could dodge more incoming attacks")
            else:
                lessons.append(f"Hard-fought victory against {enemy_type}")
                improvements.append("Need better defensive timing")
                improvements.append("Watch for attack patterns")
        else:
            lessons.append(f"Learned from defeat against {enemy_type}")
            if damage_dealt < 30:
                improvements.append("Must be more aggressive")
                improvements.append("Close distance faster")
            else:
                improvements.append("Better retreat timing needed")
                improvements.append("Monitor own health more carefully")

        # Add tactical insights
        if duration > 30:
            improvements.append("End fights faster - too drawn out")

        lesson = random.choice(lessons)
        self.add_memory(lesson)

        confidence_changes = {
            "victory": ["More confident", "Much more confident"],
            "defeat": ["Less confident", "Same"]
        }

        confidence_change = random.choice(confidence_changes.get(outcome, ["Same"]))

        return {
            "lesson": lesson,
            "improvements": improvements[:2],  # Keep it concise
            "confidence_change": confidence_change
        }

    def add_memory(self, memory_text):
        """Add a memory to the agent's history"""
        memory_entry = {
            "timestamp": datetime.now().isoformat(),
            "memory": memory_text
        }
        self.memory.append(memory_entry)

        # Keep only last 50 memories
        if len(self.memory) > 50:
            self.memory = self.memory[-50:]

        self.save_memory()

    def get_memory(self):
        """Get all memories"""
        return self.memory

    def _format_memory(self, recent_memory):
        """Format memory for prompt"""
        if not recent_memory:
            return "No past lessons yet."

        formatted = "\n".join([f"- {mem}" for mem in recent_memory[-5:]])
        return formatted

    def load_memory(self):
        """Load memory from file"""
        try:
            if os.path.exists('memory.json'):
                with open('memory.json', 'r') as f:
                    self.memory = json.load(f)
        except Exception as e:
            print(f"Could not load memory: {e}")
            self.memory = []

    def save_memory(self):
        """Save memory to file"""
        try:
            with open('memory.json', 'w') as f:
                json.dump(self.memory, f, indent=2)
        except Exception as e:
            print(f"Could not save memory: {e}")
