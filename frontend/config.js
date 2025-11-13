// Game Configuration
const GameConfig = {
    // API Configuration
    API_BASE_URL: 'http://localhost:5000/api',
    USE_FAKE_AI: true,  // Hollow Knight-style overhaul defaults to the diegetic simulator

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
        PRIMARY: 0xadc2f9,
        SECONDARY: 0x3b2c54,
        ACCENT: 0xbdd0ff,
        DANGER: 0xe47b6a,
        SUCCESS: 0x83d4a4,
        BACKGROUND: 0x080b15
    },

    PALETTES: {
        LanternAviary: ['#05060f', '#1b2440', '#3c5e7f', '#9fb8ff', '#ffe7b7'],
        Serpentarium: ['#090c13', '#1d2a2a', '#35534b', '#7fd2af', '#f2c494'],
        TidePens: ['#04070e', '#14253f', '#1e3f61', '#68a7d9', '#bfe7ff'],
        ThornSanctum: ['#06060b', '#1f2421', '#3c4a30', '#8fb479', '#f0d4a8'],
        CrownChamber: ['#08060a', '#241830', '#3d2748', '#c997ff', '#ffcf99']
    },

    // Biomes
    BIOMES: {
        LANTERN_AVIARY: 'LanternAviary',
        SERPENTARIUM: 'Serpentarium',
        TIDE_PENS: 'TidePens',
        THORN_SANCTUM: 'ThornSanctum',
        CROWN_CHAMBER: 'CrownChamber'
    },

    // Level progression (filled after object creation to avoid self-reference issues)
    LEVELS: []
};

GameConfig.LEVELS = [
    {
        id: 1,
        title: 'Lantern Watch',
        description: 'A moon-drenched perch patrolled by Nyx, the owl warden who tests your resolve with languid sweeps.',
        difficultyTier: 'Tier I — Gentle Trial',
        biome: GameConfig.BIOMES.LANTERN_AVIARY,
        enemyType: 'Nyx, Owl Warden',
        unlockText: 'Ink your first set of orders to unseal the lantern gates.',
        promptScaffold: 'Keep RooKnight calm, ask for measured spacing, and call for a finishing strike once Nyx tires.',
        mentorHint: 'Favor Cautious and Naturalist runes to emphasize observation over fury.',
        modifiers: {
            enemyHealth: 0.75,
            enemyDamage: 0.7,
            enemySpeed: 0.85,
            aggressionBonus: -12,
            aiInterval: 1150
        }
    },
    {
        id: 2,
        title: 'Serpentarium Break',
        description: 'Coils of glass terrariums where Vey, the serpent matron, lashes out in deliberate rhythms.',
        difficultyTier: 'Tier II — Stirred Embers',
        biome: GameConfig.BIOMES.SERPENTARIUM,
        enemyType: 'Vey, Serpent Matron',
        unlockText: 'Defeat the lantern sentinel to slip beneath the terrarium grate.',
        promptScaffold: 'Script patterns: dodge venom bursts, punish tail recoveries, retreat if venom stacks build.',
        mentorHint: 'Blend Feral surges with a defensive fallback when RooKnight is wounded.',
        modifiers: {
            enemyHealth: 1.05,
            enemyDamage: 0.95,
            enemySpeed: 1.05,
            aggressionBonus: 4,
            aiInterval: 950
        }
    },
    {
        id: 3,
        title: 'Tideworn Pens',
        description: 'Flooded walkways shrouded in mist where Oran the leviathan seal lunges from the water’s edge.',
        difficultyTier: 'Tier III — Rising Tempest',
        biome: GameConfig.BIOMES.TIDE_PENS,
        enemyType: 'Oran, Leviathan Seal',
        unlockText: 'Break the serpent’s hold to drain the sluice gates and access the pens.',
        promptScaffold: 'Rotate between aerial slashes and grounded pokes, maintain stamina for the tidal surges.',
        mentorHint: 'Keep Naturalist high for adaptability while pulsing Feral only on counter windows.',
        modifiers: {
            enemyHealth: 1.35,
            enemyDamage: 1.25,
            enemySpeed: 1.12,
            aggressionBonus: 12,
            aiInterval: 780
        }
    },
    {
        id: 4,
        title: 'Thornbound Conservatory',
        description: 'A glasshouse of strangling vines where Maul the briar bear stalks beneath broken moonlight.',
        difficultyTier: 'Tier IV — Dire Crescendo',
        biome: GameConfig.BIOMES.THORN_SANCTUM,
        enemyType: 'Maul, Briar Bear',
        unlockText: 'Breach the tide pens to enter the overgrown heart of the zoo.',
        promptScaffold: 'Command pre-emptive dodges, break armor with charged strikes, and stay airborne when vines lash.',
        mentorHint: 'Alternate Feral and Cautious pulses every phase to keep Maul guessing.',
        modifiers: {
            enemyHealth: 1.6,
            enemyDamage: 1.4,
            enemySpeed: 1.18,
            aggressionBonus: 18,
            aiInterval: 700
        }
    },
    {
        id: 5,
        title: 'Crown of Bars',
        description: 'The final menagerie dais guarded by Rex, the lion regent whose roar fractures stone and will alike.',
        difficultyTier: 'Tier V — Moonlit Finale',
        biome: GameConfig.BIOMES.CROWN_CHAMBER,
        enemyType: 'Rex, Lion Regent',
        unlockText: 'Only by felling every prior warden can the crown gate be confronted.',
        promptScaffold: 'Outline multi-phase tactics: open defensively, pivot to relentless aerial combos, and retreat if morale wanes.',
        mentorHint: 'Cycle every rune deliberately—Rex punishes predictability.',
        modifiers: {
            enemyHealth: 2.05,
            enemyDamage: 1.6,
            enemySpeed: 1.25,
            aggressionBonus: 26,
            aiInterval: 620
        }
    }
];

const SimulatedAI = {
    decide(agentState = {}, enemyState = {}, environment = {}, userPrompt = '', memory = []) {
        const distance = enemyState.distance ?? 120;
        const playerHP = agentState.health ?? 100;
        const enemyHP = enemyState.health ?? 100;
        const enemyStateStr = enemyState.state ?? 'idle';

        const promptAggressive = /attack|aggressive|press|relentless|rush/i.test(userPrompt);
        const promptDefensive = /defend|dodge|wait|observe|retreat|protect/i.test(userPrompt);
        const promptAerial = /jump|air|aerial|leap/i.test(userPrompt);

        const runeAggression = environment?.runes?.aggression ?? 50;
        const runeCaution = environment?.runes?.caution ?? 50;
        const runeCuriosity = environment?.runes?.curiosity ?? 50;

        const fragments = [];
        const memoryEcho = memory?.length ? memory[memory.length - 1] : null;

        if (memoryEcho) {
            fragments.push({
                stage: 'Memory',
                text: `Recalled lesson: ${memoryEcho}`
            });
        }

        fragments.push({
            stage: 'Runes',
            text: `Feral ${runeAggression} • Cautious ${runeCaution} • Naturalist ${runeCuriosity}`
        });

        const lowHealth = playerHP < 35;
        const enemyLow = enemyHP < 25;
        const farAway = distance > 150;
        const nearRange = distance < 45;

        let confidence = 0.68;
        confidence += promptAggressive ? 0.04 : 0;
        confidence += promptDefensive ? 0.02 : 0;
        confidence -= lowHealth ? 0.18 : 0;
        confidence += enemyLow ? 0.12 : 0;
        confidence += (runeAggression - 50) / 250;
        confidence += (runeCaution - 50) / 400;
        confidence += (runeCuriosity - 50) / 400;
        confidence = Phaser.Math.Clamp ? Phaser.Math.Clamp(confidence, 0.18, 0.96) : Math.min(Math.max(confidence, 0.18), 0.96);

        let action = 'MOVE_CLOSER';
        const feralLean = runeAggression > 65;
        const cautiousLean = runeCaution > 65;
        const curiousLean = runeCuriosity > 65;

        if (playerHP <= 0) {
            action = 'RETREAT';
            fragments.push({ stage: 'Crisis', text: 'Vital signs collapsed—attempting extraction.' });
            confidence = 0.22;
        } else if (lowHealth && !enemyLow) {
            action = promptDefensive || cautiousLean ? 'DODGE' : 'RETREAT';
            fragments.push({ stage: 'Stability', text: 'Wounds deep; prioritizing survival lines from briefing.' });
        } else if (enemyStateStr === 'attacking' && nearRange) {
            action = promptAerial || feralLean ? 'JUMP_ATTACK' : 'DODGE';
            fragments.push({ stage: 'Counter', text: 'Enemy strike imminent—evade then punish as scripted.' });
            confidence += 0.06;
        } else if (enemyStateStr === 'attacking' && !nearRange) {
            action = 'MOVE_AWAY';
            fragments.push({ stage: 'Spacing', text: 'Serpentine charge detected; widening gap per plan.' });
        } else if (enemyLow && playerHP > 30) {
            action = promptAerial ? 'JUMP_ATTACK' : 'ATTACK';
            fragments.push({ stage: 'Finisher', text: 'Target staggered—launching moonlit execution.' });
            confidence += 0.08;
        } else if (farAway) {
            action = 'MOVE_CLOSER';
            fragments.push({ stage: 'Approach', text: 'Closing distance under cover of fog.' });
        } else if (promptAggressive || nearRange || feralLean) {
            action = promptAerial ? 'JUMP_ATTACK' : 'ATTACK';
            fragments.push({ stage: 'Assault', text: 'Coach ordered pressure—striking with tempered fury.' });
        } else if ((promptDefensive || cautiousLean) && !nearRange) {
            action = 'WAIT_AND_OBSERVE';
            fragments.push({ stage: 'Patience', text: 'Holding stance, mapping opponent cadence.' });
            confidence -= 0.04;
        } else if (curiousLean) {
            action = 'WAIT_AND_OBSERVE';
            fragments.push({ stage: 'Survey', text: 'Naturalist rune humming—scanning for phase shift.' });
        } else {
            action = 'MOVE_CLOSER';
            fragments.push({ stage: 'Flow', text: 'Gliding through shadow to maintain tempo.' });
        }

        const reasoningLines = fragments.map(f => `• ${f.stage}: ${f.text}`);
        const reasoning = reasoningLines.join('\n');

        const cadence = [
            { beat: 'Survey', delay: 140 },
            { beat: 'Runes', delay: 180 },
            { beat: 'Intent', delay: 210 },
            { beat: 'Action', delay: 180 }
        ];

        const decision = {
            action,
            reasoning,
            fragments,
            cadence,
            confidence,
            memoryEcho
        };

        return new Promise(resolve => {
            const latency = 260 + Math.random() * 420;
            setTimeout(() => resolve(decision), latency);
        });
    },

    reflect(battleData, outcome) {
        const survived = outcome === 'victory';
        const durationSec = Math.max(1, Math.floor((battleData.duration || 0) / 1000));
        const peakCombo = battleData.actions || 0;
        const highlight = survived
            ? `Held formation for ${durationSec}s and found ${peakCombo} decisive beats.`
            : `Structure collapsed after ${durationSec}s with ${peakCombo} misaligned beats.`;

        const lesson = survived
            ? `${highlight} Continue chaining aerial surges after every safe dodge.`
            : `${highlight} Re-script dodge timings when health dips below 40%.`;

        return {
            lesson,
            improvements: survived
                ? ['Bank this cadence: dodge • counter • leap.']
                : ['Signal earlier retreats when stamina falters.'],
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
            const offlineBiomes = {
                [GameConfig.BIOMES.LANTERN_AVIARY]: {
                    name: 'Lantern Aviary',
                    hazards: ['shifting rafters', 'falling lantern glass'],
                    notes: 'Soft moonbeams cut across suspended cages.'
                },
                [GameConfig.BIOMES.SERPENTARIUM]: {
                    name: 'Shattered Serpentarium',
                    hazards: ['venom pools', 'lash traps'],
                    notes: 'Humidity fogs the air; strikes emerge from glass shadows.'
                },
                [GameConfig.BIOMES.TIDE_PENS]: {
                    name: 'Tideworn Pens',
                    hazards: ['tidal surges', 'slippery grates'],
                    notes: 'Salt spray and mist demand deliberate footing.'
                },
                [GameConfig.BIOMES.THORN_SANCTUM]: {
                    name: 'Thornbound Conservatory',
                    hazards: ['snaring vines', 'spore clouds'],
                    notes: 'Vines shiver when heavy footfalls disturb the soil.'
                },
                [GameConfig.BIOMES.CROWN_CHAMBER]: {
                    name: 'Crown of Bars',
                    hazards: ['cracking pillars', 'resonant roars'],
                    notes: 'The regent\'s roar shakes loose debris from the vaulted ceiling.'
                }
            };

            return offlineBiomes[biomeName] || {
                name: biomeName,
                hazards: [],
                notes: 'Unknown exhibit in offline simulation.'
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
                'Nyx, Owl Warden': {
                    health: 65,
                    speed: 'measured',
                    attack_pattern: 'Gliding talon swipes and lantern dives',
                    aggression: 42,
                    intelligence: 71,
                    damage: 18
                },
                'Vey, Serpent Matron': {
                    health: 110,
                    speed: 'coiled bursts',
                    attack_pattern: 'Venom spit then tail slam',
                    aggression: 58,
                    intelligence: 68,
                    damage: 22
                },
                'Oran, Leviathan Seal': {
                    health: 145,
                    speed: 'surging',
                    attack_pattern: 'Wave crash and rolling maul',
                    aggression: 66,
                    intelligence: 54,
                    damage: 27
                },
                'Maul, Briar Bear': {
                    health: 190,
                    speed: 'stalking',
                    attack_pattern: 'Vine snare into armored slam',
                    aggression: 74,
                    intelligence: 61,
                    damage: 32
                },
                'Rex, Lion Regent': {
                    health: 250,
                    speed: 'regal pounce',
                    attack_pattern: 'Roar shockwave, claw combo, aerial maul',
                    aggression: 86,
                    intelligence: 79,
                    damage: 38
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
