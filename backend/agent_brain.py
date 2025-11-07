import google.generativeai as genai
import json
import re

class AgentBrain:
    def __init__(self, api_key):
        """Initialize the AI agent brain with Google Gemini"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.run_number = 1
        self.learning_history = []
        self.custom_coaching = None  # Store custom coaching prompts

    def make_decision(self, agent_state, enemy_state, distance, coaching, memory):
        """
        Use Gemini AI to decide the next action based on game state and coaching
        """
        # Build the prompt with coaching emphasis
        prompt = self._build_decision_prompt(
            agent_state, enemy_state, distance, coaching, memory
        )

        try:
            # Call Gemini API
            response = self.model.generate_content(prompt)
            text = response.text

            # Parse the response
            action = self._extract_action(text)
            reasoning = self._extract_reasoning(text)

            return {
                'action': action,
                'reasoning': reasoning,
                'confidence': 0.85
            }

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Fallback to safe action
            return {
                'action': 'DEFEND',
                'reasoning': f'AI thinking... (error: {str(e)[:50]})',
                'confidence': 0.5
            }

    def _build_decision_prompt(self, agent_state, enemy_state, distance, coaching, memory):
        """Build a detailed prompt that emphasizes coaching parameters"""

        aggression = coaching.get('aggression', 50)
        caution = coaching.get('caution', 50)

        # Calculate derived coaching style
        if aggression > 70:
            style = "VERY AGGRESSIVE - prioritize attacking and finishing the opponent quickly"
        elif aggression > 50:
            style = "AGGRESSIVE - favor offensive actions when opportunities arise"
        elif caution > 70:
            style = "VERY DEFENSIVE - prioritize survival and safe positioning"
        elif caution > 50:
            style = "DEFENSIVE - play it safe and protect yourself"
        else:
            style = "BALANCED - mix offense and defense based on situation"

        # Build recent memory context
        memory_context = ""
        if memory and len(memory) > 0:
            memory_context = "\n\nRECENT ACTIONS:\n"
            for i, mem in enumerate(memory[-3:]):  # Last 3 decisions
                memory_context += f"- {mem.get('action', 'UNKNOWN')}: {mem.get('reasoning', 'No reason')}\n"

        # Add custom coaching if available
        custom_coaching_section = ""
        if self.custom_coaching:
            custom_coaching_section = f"\n\n🎯 CUSTOM COACHING INSTRUCTIONS:\n{self.custom_coaching}\n\nYou MUST follow these custom instructions above all else while still choosing valid actions."

        prompt = f"""You are Thunder, an AI fighter in a 2D combat arena. You must decide your next action.

YOUR COACHING STYLE: {style}
- Aggression Level: {aggression}% (higher = more attacking)
- Caution Level: {caution}% (higher = more defending)

CURRENT SITUATION:
- Your Health: {agent_state.get('health', 0)}/100 HP
- Your Energy: {agent_state.get('energy', 0)}/100
- Enemy Health: {enemy_state.get('health', 0)}/100 HP
- Distance to Enemy: {distance} units (close = <80, medium = 80-200, far = >200)
- You are {"on ground" if agent_state.get('onGround') else "in air"}
{memory_context}

AVAILABLE ACTIONS:
1. ATTACK - Deal ~15 damage, costs 10 energy, only works when close (<80 units)
2. DEFEND - Reduce incoming damage by 70%, costs 2 energy, lasts 1 second
3. JUMP - Reposition/dodge, costs 5 energy, only works on ground
{custom_coaching_section}

COACHING INSTRUCTIONS:
- With aggression {aggression}%, you should {"attack often and press advantages" if aggression > 60 else "attack cautiously" if aggression > 40 else "rarely attack"}
- With caution {caution}%, you should {"defend frequently and prioritize survival" if caution > 60 else "defend when threatened" if caution > 40 else "take risks"}

You MUST respond in this EXACT format:
ACTION: [choose ATTACK, DEFEND, or JUMP]
REASON: [one clear sentence explaining why, referencing your coaching style]

Example responses:
ACTION: ATTACK
REASON: My aggressive coaching (70%) tells me to press the advantage while enemy is weak at 40 HP.

ACTION: DEFEND
REASON: High caution (80%) means I should protect myself when health is below 50%.

ACTION: JUMP
REASON: Enemy is far and my balanced approach suggests repositioning to find an opening.

Now decide your action:"""

        return prompt

    def _extract_action(self, text):
        """Extract action from AI response"""
        # Look for ACTION: pattern
        action_match = re.search(r'ACTION:\s*(ATTACK|DEFEND|JUMP)', text, re.IGNORECASE)
        if action_match:
            return action_match.group(1).upper()

        # Fallback: look for the words themselves
        text_upper = text.upper()
        if 'ATTACK' in text_upper:
            return 'ATTACK'
        elif 'DEFEND' in text_upper:
            return 'DEFEND'
        elif 'JUMP' in text_upper:
            return 'JUMP'

        # Default fallback
        return 'DEFEND'

    def _extract_reasoning(self, text):
        """Extract reasoning from AI response"""
        # Look for REASON: pattern
        reason_match = re.search(r'REASON:\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if reason_match:
            return reason_match.group(1).strip()

        # Fallback: try to find any sentence
        lines = text.strip().split('\n')
        for line in lines:
            if line and not line.startswith('ACTION:') and len(line) > 10:
                return line.strip()

        return "Analyzing situation and executing strategy..."

    def reflect_on_match(self, survival_time, decision_count, final_hp, enemy_hp, memory, coaching):
        """Post-match reflection to learn and improve"""

        won = final_hp > 0
        outcome = "won" if won else "lost"

        # Store this match in history
        self.learning_history.append({
            'run': self.run_number,
            'outcome': outcome,
            'survival_time': survival_time,
            'coaching': coaching
        })

        # Simple reflection based on outcome
        if won:
            reflection = f"Victory! The coaching strategy worked. Survived {survival_time}s with aggressive plays."
        else:
            reflection = f"Defeated after {survival_time}s. Need to adjust strategy based on coaching parameters."

        self.run_number += 1

        return {
            'reflection': reflection,
            'run_number': self.run_number
        }

    def reset_memory(self):
        """Reset the agent's learning history"""
        self.learning_history = []
        self.run_number = 1
        print("Agent memory reset")

    def set_custom_coaching(self, coaching_prompt):
        """
        Set a custom coaching prompt that will influence the AI's decisions

        Args:
            coaching_prompt (str): Natural language coaching instructions

        Examples:
            - "Always prioritize defense and only attack when enemy health is below 30%"
            - "Be very aggressive and attack whenever possible"
            - "Try to stay at medium distance and jump often to dodge"
            - "Mirror the enemy's strategy"
        """
        self.custom_coaching = coaching_prompt
        print(f"Custom coaching set: {coaching_prompt}")
        return True

    def get_custom_coaching(self):
        """Get the current custom coaching prompt"""
        return self.custom_coaching if self.custom_coaching else "No custom coaching set"

    def clear_custom_coaching(self):
        """Clear the custom coaching prompt"""
        self.custom_coaching = None
        print("Custom coaching cleared")
        return True
