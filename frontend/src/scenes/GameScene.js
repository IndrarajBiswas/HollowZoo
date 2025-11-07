import Agent from '../entities/Agent.js';
import Enemy from '../entities/Enemy.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Game state
        this.agent = null;
        this.enemy = null;
        this.platforms = null;

        // AI decision tracking
        this.isWaitingForDecision = false;
        this.lastActionTime = 0;
        this.actionInterval = 2500; // Agent acts every 2.5 seconds

        // Coaching parameters
        this.coaching = {
            aggression: 50,
            caution: 50
        };

        // Memory system
        this.memory = [];
        this.maxMemorySize = 10; // Keep last 10 decisions

        // Stats tracking
        this.runNumber = 1;
        this.startTime = 0;
        this.survivalTime = 0;
        this.decisionCount = 0;

        // UI elements
        this.healthBars = {};
        this.gameOver = false;
    }

    preload() {
        // Assets would be loaded here
    }

    create() {
        const { width, height } = this.cameras.main;
        this.startTime = this.time.now;
        this.gameOver = false;

        // Create platforms
        this.platforms = this.physics.add.staticGroup();

        // Ground platform
        const ground = this.add.rectangle(width / 2, height - 20, width, 40, 0x16213e);
        this.platforms.add(ground);

        // Left platform
        const leftPlatform = this.add.rectangle(200, height - 150, 300, 20, 0x16213e);
        this.platforms.add(leftPlatform);

        // Right platform
        const rightPlatform = this.add.rectangle(width - 200, height - 150, 300, 20, 0x16213e);
        this.platforms.add(rightPlatform);

        // Center platform (higher)
        const centerPlatform = this.add.rectangle(width / 2, height - 300, 200, 20, 0x16213e);
        this.platforms.add(centerPlatform);

        // Create agent (automated for now)
        this.agent = new Agent(this, 300, height - 200);

        // Create enemy (simple AI)
        this.enemy = new Enemy(this, width - 300, height - 200);

        // Setup physics collisions
        this.physics.add.collider(this.agent.sprite, this.platforms);
        this.physics.add.collider(this.enemy.sprite, this.platforms);

        // Create health bars
        this.createHealthBars();

        // Update stats panel
        this.updateStatsPanel();

        // Initial thought
        this.updateThoughtPanel('Starting fight... evaluating situation...');

        // Fade in
        this.cameras.main.fadeIn(500);
    }

    update(time, delta) {
        if (!this.agent || !this.enemy) return;

        // Update entities
        this.agent.update();
        this.enemy.update(time, this.agent.getX());

        // Update health bars
        this.updateHealthBars();

        // Update survival time
        this.survivalTime = Math.floor((time - this.startTime) / 1000);
        this.updateSurvivalTime();

        // Check for collisions and damage
        this.checkCombat();

        // Request AI decision at intervals
        if (time - this.lastActionTime > this.actionInterval && !this.isWaitingForDecision && !this.agent.isDead) {
            this.requestAIDecision();
            this.lastActionTime = time;
        }

        // Check for game over
        if (this.agent.isDead && !this.gameOver) {
            this.handleGameOver();
        } else if (this.enemy.isDead && !this.gameOver) {
            this.handleVictory();
        }
    }

    createHealthBars() {
        const { width } = this.cameras.main;
        const barWidth = 200;
        const barHeight = 20;
        const yPos = 30;

        // Agent health bar (left side)
        this.add.text(20, yPos - 20, 'THUNDER (AI)', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#00d9ff'
        });

        const agentBg = this.add.rectangle(20, yPos, barWidth, barHeight, 0x16213e);
        agentBg.setOrigin(0, 0.5);

        const agentBar = this.add.rectangle(20, yPos, barWidth, barHeight, 0x00ff00);
        agentBar.setOrigin(0, 0.5);

        this.healthBars.agentBg = agentBg;
        this.healthBars.agentBar = agentBar;

        // Enemy health bar (right side)
        this.add.text(width - 220, yPos - 20, 'OPPONENT', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#ff0000'
        });

        const enemyBg = this.add.rectangle(width - 220, yPos, barWidth, barHeight, 0x16213e);
        enemyBg.setOrigin(0, 0.5);

        const enemyBar = this.add.rectangle(width - 220, yPos, barWidth, barHeight, 0xff0000);
        enemyBar.setOrigin(0, 0.5);

        this.healthBars.enemyBg = enemyBg;
        this.healthBars.enemyBar = enemyBar;
    }

    updateHealthBars() {
        const barWidth = 200;

        // Update agent health bar
        const agentHealthPercent = this.agent.health / this.agent.maxHealth;
        const agentBarWidth = barWidth * agentHealthPercent;
        this.healthBars.agentBar.width = agentBarWidth;

        // Change color based on health
        if (agentHealthPercent > 0.6) {
            this.healthBars.agentBar.setFillStyle(0x00ff00);
        } else if (agentHealthPercent > 0.3) {
            this.healthBars.agentBar.setFillStyle(0xffff00);
        } else {
            this.healthBars.agentBar.setFillStyle(0xff0000);
        }

        // Update enemy health bar
        const enemyHealthPercent = this.enemy.health / this.enemy.maxHealth;
        const enemyBarWidth = barWidth * enemyHealthPercent;
        this.healthBars.enemyBar.width = enemyBarWidth;

        if (enemyHealthPercent > 0.6) {
            this.healthBars.enemyBar.setFillStyle(0x00ff00);
        } else if (enemyHealthPercent > 0.3) {
            this.healthBars.enemyBar.setFillStyle(0xffff00);
        } else {
            this.healthBars.enemyBar.setFillStyle(0xff0000);
        }
    }

    checkCombat() {
        const distance = Math.abs(this.agent.getX() - this.enemy.getX());

        // Check if agent's attack hits enemy
        if (this.agent.isAttacking && distance < 80) {
            this.enemy.takeDamage(15);
        }

        // Check if enemy's attack hits agent
        if (this.enemy.isAttacking && distance < 80) {
            this.agent.takeDamage(15);
        }
    }

    async requestAIDecision() {
        if (this.isWaitingForDecision || this.agent.isDead) return;

        this.isWaitingForDecision = true;

        // Update thought panel to show "thinking"
        this.updateThoughtPanel('🤖 AI thinking...');

        // Prepare game state for AI
        const gameState = {
            agent: {
                health: this.agent.health,
                x: this.agent.getX(),
                y: this.agent.getY(),
                energy: this.agent.energy,
                onGround: this.agent.isOnGround()
            },
            enemy: {
                health: this.enemy.health,
                x: this.enemy.getX(),
                y: this.enemy.getY()
            },
            distance: Math.abs(this.agent.getX() - this.enemy.getX()),
            coaching: this.coaching,
            memory: this.memory.slice(-5) // Send last 5 decisions
        };

        try {
            const response = await fetch('http://localhost:5000/api/decide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameState)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Execute the action
            this.executeAction(data.action, data.reasoning);

            // Store in memory
            this.storeDecision(gameState, data.action, data.reasoning);

            // Update decision count
            this.decisionCount++;
            this.updateStatsPanel();

        } catch (error) {
            console.error('AI decision failed:', error);

            // Fallback to defend if API fails
            this.executeAction('DEFEND', '⚠️ Connection lost - defending!');
        }

        this.isWaitingForDecision = false;
    }

    executeAction(action, reasoning) {
        let success = false;

        switch (action) {
            case 'ATTACK':
                success = this.agent.attack();
                break;
            case 'DEFEND':
                success = this.agent.defend();
                break;
            case 'JUMP':
                success = this.agent.jump();
                break;
            default:
                console.warn('Unknown action:', action);
                success = this.agent.defend(); // Fallback
        }

        // Update thought panel with reasoning
        if (success) {
            this.updateThoughtPanel(`${action}: ${reasoning}`);
        } else {
            this.updateThoughtPanel(`${action} failed: ${reasoning}`);
        }
    }

    storeDecision(gameState, action, reasoning) {
        const decision = {
            timestamp: Date.now(),
            gameState: gameState,
            action: action,
            reasoning: reasoning,
            agentHealth: this.agent.health,
            enemyHealth: this.enemy.health
        };

        this.memory.push(decision);

        // Keep memory size manageable
        if (this.memory.length > this.maxMemorySize) {
            this.memory.shift();
        }
    }

    updateThoughtPanel(text) {
        const panel = document.getElementById('thought-panel');
        if (panel) {
            const thoughtText = panel.querySelector('.thought-text');
            if (thoughtText) {
                thoughtText.textContent = text;
            }
        }
    }

    updateStatsPanel() {
        const runEl = document.getElementById('run-number');
        const decisionsEl = document.getElementById('decision-count');

        if (runEl) runEl.textContent = this.runNumber;
        if (decisionsEl) decisionsEl.textContent = this.decisionCount;
    }

    updateSurvivalTime() {
        const survivalEl = document.getElementById('survival-time');
        if (survivalEl) {
            survivalEl.textContent = `${this.survivalTime}s`;
        }
    }

    async handleGameOver() {
        this.gameOver = true;
        this.updateThoughtPanel('💀 Defeated... analyzing what went wrong...');

        // Call reflection API
        try {
            const reflectionData = {
                survival_time: this.survivalTime,
                decision_count: this.decisionCount,
                final_hp: 0,
                enemy_hp: this.enemy.health,
                memory: this.memory,
                coaching: this.coaching
            };

            const response = await fetch('http://localhost:5000/api/reflect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reflectionData)
            });

            if (response.ok) {
                const data = await response.json();
                this.runNumber = data.run_number || this.runNumber + 1;

                // Display learning reflection
                this.time.delayedCall(2000, () => {
                    this.updateThoughtPanel(`📚 LEARNED: ${data.reflection}`);
                });
            }

        } catch (error) {
            console.error('Reflection failed:', error);
            this.runNumber++;
        }

        // Show restart prompt after delay
        this.time.delayedCall(5000, () => {
            this.updateThoughtPanel('Click "Restart Fight" to try again with new knowledge!');
        });
    }

    handleVictory() {
        this.gameOver = true;
        this.updateThoughtPanel(`Victory! Survived ${this.survivalTime}s!`);

        // Show restart prompt after delay
        this.time.delayedCall(3000, () => {
            this.updateThoughtPanel('Click "Restart Fight" to train more!');
        });
    }

    updateCoaching(parameter, value) {
        this.coaching[parameter] = value;
        console.log(`Coaching updated: ${parameter} = ${value}`);
    }
}
