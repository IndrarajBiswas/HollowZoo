from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from agent_brain import AgentBrain
from world_state import WorldState

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize game systems
agent_brain = AgentBrain()
world_state = WorldState()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "HollowZoo AI Backend"})

@app.route('/api/decide', methods=['POST'])
def decide_action():
    """
    Main AI decision endpoint
    Receives game state and user's tactical prompt, returns AI decision
    """
    try:
        data = request.json

        agent_state = data.get('agent', {})
        enemy_state = data.get('enemy', {})
        environment = data.get('environment', {})
        user_prompt = data.get('user_prompt', '')  # User's tactical instructions
        memory = data.get('memory', [])

        # Get AI decision from agent brain using user's prompt
        decision = agent_brain.decide(
            agent_state=agent_state,
            enemy_state=enemy_state,
            environment=environment,
            user_prompt=user_prompt,
            memory=memory
        )

        return jsonify(decision)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reflect', methods=['POST'])
def reflect_on_battle():
    """
    Post-battle reflection endpoint
    AI analyzes what happened and updates memory
    """
    try:
        data = request.json

        battle_data = data.get('battle_data', {})
        outcome = data.get('outcome', 'unknown')

        # Generate reflection
        reflection = agent_brain.reflect(battle_data, outcome)

        return jsonify(reflection)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/memory', methods=['GET'])
def get_memory():
    """Get agent's memory history"""
    try:
        memory = agent_brain.get_memory()
        return jsonify({"memory": memory})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/memory', methods=['POST'])
def save_memory():
    """Save a memory to agent's history"""
    try:
        data = request.json
        memory_entry = data.get('memory', '')

        agent_brain.add_memory(memory_entry)

        return jsonify({"status": "saved", "memory": memory_entry})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/world/biome', methods=['GET'])
def get_biome_info():
    """Get information about a specific biome"""
    try:
        biome_name = request.args.get('name', 'RooSanctum')
        biome_info = world_state.get_biome(biome_name)
        return jsonify(biome_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/world/enemies', methods=['GET'])
def get_enemy_types():
    """Get all enemy types and their characteristics"""
    try:
        enemies = world_state.get_enemy_types()
        return jsonify({"enemies": enemies})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🦘 Starting Hollow Zoo AI Backend...")
    print("🧠 Gemini AI integration active")
    app.run(debug=True, host='0.0.0.0', port=5000)
