// Game Configuration
const GameConfig = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    USE_FAKE_AI: true,

    // Game Settings
    WIDTH: 1180,
    HEIGHT: 768,
    PIXEL_ART: true,

    // Physics
    GRAVITY: 880,

    // Player Settings
    PLAYER: {
        SPEED: 260,
        JUMP_VELOCITY: -460,
        HEALTH: 85,
        ENERGY: 100,
        ATTACK_DAMAGE: 22,
        CRIT_MULTIPLIER: 1.35
    },

    // Enemy Settings
    ENEMY: {
        SPAWN_DISTANCE: 300,
        AGGRO_RANGE: 220,
        ATTACK_RANGE: 60,
        BASE_HEALTH: 95,
        DAMAGE: 18,
        LEAP_FORCE: -360
    },

    // AI Decision Timing
    AI_DECISION_INTERVAL: 800, // Faster loop keeps combat snappy

    FIGHT: {
        CORNER_THRESHOLD: 140,
        CORNER_TIMEOUT: 1400,
        AERIAL_COOLDOWN: 3800,
        FRENZY_TIME: 45000
    },

    // Colors
    COLORS: {
        PRIMARY: 0x8a7a6a,
        SECONDARY: 0x4a3a3a,
        ACCENT: 0xc4a573,
        DANGER: 0xa44a3a,
        SUCCESS: 0x6aa44a,
        BACKGROUND: 0x1a1a2e
    },

    PALETTES: {
        RooSanctum: ['#051923', '#2A2F4F', '#8F3985', '#CC2B52', '#F2D1C9'],
        DesertDome: ['#2B1B0F', '#8C5613', '#C8791B', '#F2C57C', '#FFE8C2'],
        AquaVault: ['#001F3F', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6'],
        ThornGarden: ['#1B1A20', '#2E3A23', '#557153', '#A3B18A', '#FFB4A2'],
        KingsChamber: ['#120F1D', '#311847', '#7F2982', '#D7263D', '#FFB400']
    },

    // Biomes
    BIOMES: {
        ROO_SANCTUM: 'RooSanctum',
        DESERT_DOME: 'DesertDome',
        AQUA_VAULT: 'AquaVault',
        THORN_GARDEN: 'ThornGarden',
        KINGS_CHAMBER: 'KingsChamber'
    },

    // Level progression (filled after object creation to avoid self-reference issues)
    LEVELS: []
};

GameConfig.LEVELS = [
    {
        id: 1,
        title: 'Sanctum Patrol',
        description: 'Tutorial duel inside the Roo Sanctum. Enemy is sluggish and low-health for an easy win.',
        biome: GameConfig.BIOMES.ROO_SANCTUM,
        enemyType: 'Scout Roo',
        unlockText: 'Complete the briefing mission.',
        modifiers: {
            enemyHealth: 0.7,
            enemyDamage: 0.75,
            enemySpeed: 0.85,
            aggressionBonus: -10,
            aiInterval: 1100
        }
    },
    {
        id: 2,
        title: 'Dome Ambush',
        description: 'Desert Dome skirmish with aggressive patrols and limited cover.',
        biome: GameConfig.BIOMES.DESERT_DOME,
        enemyType: 'Alpha Kangaroo',
        unlockText: 'Beat Level 1 to access this arena.',
        modifiers: {
            enemyHealth: 1.35,
            enemyDamage: 1.2,
            enemySpeed: 1.05,
            aggressionBonus: 10,
            aiInterval: 820
        }
    },
    {
        id: 3,
        title: 'Flooded Vault',
        description: 'Low visibility fight among the Aqua Vault reservoirs.',
        biome: GameConfig.BIOMES.AQUA_VAULT,
        enemyType: 'Aqua Roo',
        unlockText: 'Clear Level 2 to unlock water combat drills.',
        modifiers: {
            enemyHealth: 1.55,
            enemyDamage: 1.3,
            enemySpeed: 1.1,
            aggressionBonus: 15,
            aiInterval: 760
        }
    },
    {
        id: 4,
        title: 'Thorn Garden Hunt',
        description: 'Poisonous flora forces constant motion and tighter dodges.',
        biome: GameConfig.BIOMES.THORN_GARDEN,
        enemyType: 'Garden Roo',
        unlockText: 'Best the Aqua Vault battle to enter the Thorn Garden.',
        modifiers: {
            enemyHealth: 1.75,
            enemyDamage: 1.4,
            enemySpeed: 1.18,
            aggressionBonus: 18,
            aiInterval: 700
        }
    },
    {
        id: 5,
        title: 'King’s Chamber',
        description: 'Final showdown inside the Kangaroo King’s arena.',
        biome: GameConfig.BIOMES.KINGS_CHAMBER,
        enemyType: 'Kangaroo King',
        unlockText: 'Beat every other level to challenge the King.',
        modifiers: {
            enemyHealth: 2.0,
            enemyDamage: 1.55,
            enemySpeed: 1.25,
            aggressionBonus: 25,
            aiInterval: 620
        }
    }
];

const SimulatedAI = {
    decide(agentState, enemyState, environment, userPrompt) {
        const distance = enemyState.distance ?? 100;
        const playerHP = agentState.health ?? 100;
        const enemyHP = enemyState.health ?? 100;
        const enemyStateStr = enemyState.state ?? 'idle';

        const promptAggressive = /attack|aggressive|push/i.test(userPrompt || '');
        const promptDefensive = /defend|dodge|wait|observe|retreat/i.test(userPrompt || '');

        if (playerHP <= 0) {
            return { action: 'RETREAT', reasoning: 'Too injured to continue fighting.', confidence: 0.3 };
        }

        if (playerHP < 25) {
            return {
                action: 'RETREAT',
                reasoning: 'Critical health detected, disengaging to survive.',
                confidence: 0.95
            };
        }

        if (playerHP < 40 && enemyHP < 30) {
            return {
                action: 'JUMP_ATTACK',
                reasoning: 'Both fighters are low, taking an aerial finisher as directed.',
                confidence: 0.88
            };
        }

        if (playerHP < 45 && promptDefensive) {
            return {
                action: 'DODGE',
                reasoning: 'Mission briefing emphasized caution while wounded.',
                confidence: 0.84
            };
        }

        if (enemyStateStr === 'attacking') {
            if (distance < 40) {
                return {
                    action: 'DODGE',
                    reasoning: 'Enemy strike detected within melee range, evasive maneuver.',
                    confidence: 0.9
                };
            }
            return {
                action: 'MOVE_AWAY',
                reasoning: 'Enemy charging from afar, widen the gap as instructed.',
                confidence: 0.82
            };
        }

        if (distance < 35) {
            const action = promptAggressive ? 'ATTACK' : (Math.random() < 0.5 ? 'ATTACK' : 'JUMP_ATTACK');
            return {
                action,
                reasoning: 'Perfect distance for a decisive strike.',
                confidence: 0.86
            };
        }

        if (distance < 70 && Math.random() < 0.4) {
            return {
                action: 'JUMP_ATTACK',
                reasoning: 'Mid-range opening spotted, executing aerial assault.',
                confidence: 0.78
            };
        }

        if (distance > 140) {
            return {
                action: 'MOVE_CLOSER',
                reasoning: 'Need to close the gap before executing the rest of the plan.',
                confidence: 0.72
            };
        }

        if (playerHP < 60 && Math.random() < 0.3) {
            return {
                action: 'WAIT_AND_OBSERVE',
                reasoning: 'Brief pause to study the opponent as per instructions.',
                confidence: 0.65
            };
        }

        return {
            action: promptAggressive ? 'ATTACK' : 'MOVE_CLOSER',
            reasoning: promptAggressive
                ? 'Coach ordered relentless pressure, continuing offense.'
                : 'Repositioning to prepare the next strike.',
            confidence: 0.7
        };
    },

    reflect(battleData, outcome) {
        const survived = outcome === 'victory';
        const durationSec = Math.max(1, Math.floor((battleData.duration || 0) / 1000));
        const lesson = survived
            ? `Maintained control for ${durationSec}s. Aggressive push in the last phase secured the win.`
            : `Overwhelmed after ${durationSec}s. Need tighter dodges when health dips below 40%.`;

        return {
            lesson,
            improvements: survived ? ['Keep mixing jump attacks with dodges.'] : ['Respect danger zones < 30 HP.'],
            confidence_change: survived ? 'Up' : 'Down'
        };
    }
};

// API Helper Functions
const API = {
    async decide(agentState, enemyState, environment, userPrompt, memory) {
        if (GameConfig.USE_FAKE_AI) {
            return SimulatedAI.decide(agentState, enemyState, environment, userPrompt, memory);
        }

        try {
            const response = await fetch(`${GameConfig.API_BASE_URL}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent: agentState,
                    enemy: enemyState,
                    environment: environment,
                    user_prompt: userPrompt,
                    memory: memory
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return SimulatedAI.decide(agentState, enemyState, environment, userPrompt, memory);
        }
    },

    async reflect(battleData, outcome) {
        if (GameConfig.USE_FAKE_AI) {
            return SimulatedAI.reflect(battleData, outcome);
        }

        try {
            const response = await fetch(`${GameConfig.API_BASE_URL}/reflect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    battle_data: battleData,
                    outcome: outcome
                })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return SimulatedAI.reflect(battleData, outcome);
        }
    },

    async getMemory() {
        if (GameConfig.USE_FAKE_AI) {
            return [];
        }

        try {
            const response = await fetch(`${GameConfig.API_BASE_URL}/memory`);
            const data = await response.json();
            return data.memory || [];
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async saveMemory(memory) {
        if (GameConfig.USE_FAKE_AI) return;

        try {
            await fetch(`${GameConfig.API_BASE_URL}/memory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memory: memory })
            });
        } catch (error) {
            console.error('API Error:', error);
        }
    },

    async getBiomeInfo(biomeName) {
        if (GameConfig.USE_FAKE_AI) {
            return {
                name: biomeName,
                hazards: 'none',
                notes: 'Offline simulation biome'
            };
        }

        try {
            const response = await fetch(`${GameConfig.API_BASE_URL}/world/biome?name=${biomeName}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {};
        }
    },

    async getEnemyTypes() {
        if (GameConfig.USE_FAKE_AI) {
            return {
                'Scout Roo': {
                    health: GameConfig.ENEMY.BASE_HEALTH,
                    speed: 'medium',
                    attack_pattern: 'Pokes + hops',
                    aggression: 60,
                    intelligence: 45,
                    damage: GameConfig.ENEMY.DAMAGE
                }
            };
        }

        try {
            const response = await fetch(`${GameConfig.API_BASE_URL}/world/enemies`);
            const data = await response.json();
            return data.enemies || {};
        } catch (error) {
            console.error('API Error:', error);
            return {};
        }
    }
};
