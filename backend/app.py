from flask import Flask, request, jsonify
from flask_cors import CORS
from agent_brain import AgentBrain
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize the AI agent brain
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")
agent_brain = AgentBrain(api_key=GOOGLE_API_KEY)

@app.route('/api/decide', methods=['POST'])
def decide():
    """
    Main endpoint: AI agent decides what action to take
    """
    try:
        data = request.json

        # Extract game state
        agent_state = data.get('agent', {})
        enemy_state = data.get('enemy', {})
        distance = data.get('distance', 0)
        coaching = data.get('coaching', {'aggression': 50, 'caution': 50})
        memory = data.get('memory', [])

        # Get AI decision
        decision = agent_brain.make_decision(
            agent_state=agent_state,
            enemy_state=enemy_state,
            distance=distance,
            coaching=coaching,
            memory=memory
        )

        return jsonify(decision)

    except Exception as e:
        print(f"Error in /api/decide: {str(e)}")
        return jsonify({
            'action': 'DEFEND',
            'reasoning': 'Error occurred - taking defensive stance',
            'confidence': 0.5
        }), 500


@app.route('/api/reflect', methods=['POST'])
def reflect():
    """
    Post-match reflection: AI learns from the fight
    """
    try:
        data = request.json

        reflection = agent_brain.reflect_on_match(
            survival_time=data.get('survival_time', 0),
            decision_count=data.get('decision_count', 0),
            final_hp=data.get('final_hp', 0),
            enemy_hp=data.get('enemy_hp', 0),
            memory=data.get('memory', []),
            coaching=data.get('coaching', {})
        )

        return jsonify(reflection)

    except Exception as e:
        print(f"Error in /api/reflect: {str(e)}")
        return jsonify({
            'reflection': 'Unable to reflect on this match',
            'run_number': 1
        }), 500


@app.route('/api/reset', methods=['POST'])
def reset():
    """
    Reset agent memory
    """
    try:
        agent_brain.reset_memory()
        return jsonify({'status': 'success', 'message': 'Memory reset'})
    except Exception as e:
        print(f"Error in /api/reset: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/coach', methods=['POST'])
def coach():
    """
    Send a custom coaching prompt to the character
    This allows you to give natural language instructions to influence the AI's behavior
    """
    try:
        data = request.json
        coaching_prompt = data.get('prompt', '')

        if not coaching_prompt:
            return jsonify({
                'status': 'error',
                'message': 'No coaching prompt provided'
            }), 400

        # Store the coaching prompt in the agent brain
        agent_brain.set_custom_coaching(coaching_prompt)

        return jsonify({
            'status': 'success',
            'message': 'Coaching prompt applied',
            'prompt': coaching_prompt
        })

    except Exception as e:
        print(f"Error in /api/coach: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/coach', methods=['GET'])
def get_coaching():
    """
    Get the current custom coaching prompt
    """
    try:
        current_coaching = agent_brain.get_custom_coaching()
        return jsonify({
            'status': 'success',
            'prompt': current_coaching
        })
    except Exception as e:
        print(f"Error in /api/coach GET: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    """
    Health check endpoint
    """
    return jsonify({'status': 'ok', 'message': 'Agent Arena Academy API is running'})


if __name__ == '__main__':
    print("🎮 Agent Arena Academy - Backend Starting...")
    print("🤖 Google AI (Gemini) is powering the agent brain")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
