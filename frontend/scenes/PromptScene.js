class PromptScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PromptScene' });
    }

    create() {
        this.levelData = GameConfig.LEVELS[GameState.currentLevelIndex] || GameConfig.LEVELS[0];

        // Dark background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Title
        this.add.text(512, 90, '🎯 MISSION BRIEFING', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#8a7a6a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(512, 150,
            'Give your AI agent tactical instructions for this mission.\n' +
            'Be specific! Your prompt quality determines success or failure.',
            {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#e0e0e0',
                align: 'center',
                wordWrap: { width: 800 }
            }
        ).setOrigin(0.5);

        this.add.text(512, 210,
            `Level ${this.levelData.id}: ${this.levelData.title}\nBiome: ${this.levelData.biome} • Enemy: ${this.levelData.enemyType}`,
            {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#c4a573',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Example prompts text
        this.add.text(512, 270,
            'Example: "Stay defensive until enemy HP < 50%, dodge all attacks, strike when vulnerable, retreat if my HP < 30%"',
            {
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#8a7a6a',
                align: 'center',
                wordWrap: { width: 850 }
            }
        ).setOrigin(0.5);

        // Label for textarea
        this.add.text(512, 320, 'YOUR TACTICAL INSTRUCTIONS:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#c4a573',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create HTML textarea for prompt input (better than Phaser text input)
        this.createPromptInput();

        // Start Mission button
        const startButton = this.add.rectangle(512, 590, 300, 60, 0x8a7a6a)
            .setInteractive({ useHandCursor: true });

        const startText = this.add.text(512, 590, 'START MISSION', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#1a1a2e',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0xa49a8a);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x8a7a6a);
        });

        startButton.on('pointerdown', () => {
            this.startMission();
        });

        // Back button
        const backButton = this.add.text(40, 50, '← BACK', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#8a7a6a'
        }).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setColor('#c4a573'));
        backButton.on('pointerout', () => backButton.setColor('#8a7a6a'));
        backButton.on('pointerdown', () => {
            this.removePromptInput();
            this.scene.start('MenuScene');
        });

        // Level modifier summary
        this.add.text(512, 670, `Enemy difficulty boosts: ${this.describeModifiers(this.levelData.modifiers)}`, {
            fontSize: '15px',
            fontFamily: 'monospace',
            color: '#aa8a4a',
            align: 'center',
            wordWrap: { width: 840 }
        }).setOrigin(0.5);
    }

    describeModifiers(modifiers = {}) {
        const labels = [];
        if (modifiers.enemyHealth && modifiers.enemyHealth !== 1) {
            labels.push(`HP x${modifiers.enemyHealth}`);
        }
        if (modifiers.enemyDamage && modifiers.enemyDamage !== 1) {
            labels.push(`DMG x${modifiers.enemyDamage}`);
        }
        if (modifiers.enemySpeed && modifiers.enemySpeed !== 1) {
            labels.push(`SPD x${modifiers.enemySpeed}`);
        }
        return labels.length ? labels.join(', ') : 'Standard loadout';
    }

    createPromptInput() {
        // Create HTML textarea overlay
        const textarea = document.createElement('textarea');
        textarea.id = 'mission-prompt';
        textarea.placeholder = 'Enter tactical instructions here...\n\nTip: call out health thresholds, distance rules, and action priorities (attack/defend/jump).';
        textarea.value = GameState.lastPrompt || '';
        textarea.style.cssText = `
            position: absolute;
            left: 50%;
            top: 360px;
            transform: translateX(-50%);
            width: 680px;
            height: 160px;
            padding: 18px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background: #2a2a3e;
            color: #e0e0e0;
            border: 2px solid #8a7a6a;
            border-radius: 10px;
            resize: none;
            outline: none;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        `;

        textarea.addEventListener('focus', () => {
            textarea.style.borderColor = '#c4a573';
        });

        textarea.addEventListener('blur', () => {
            textarea.style.borderColor = '#8a7a6a';
        });

        textarea.addEventListener('input', () => {
            if (this.counterEl) {
                this.counterEl.textContent = `${textarea.value.length} / 360 characters`;
            }
        });

        document.body.appendChild(textarea);

        this.counterEl = document.createElement('div');
        this.counterEl.id = 'prompt-counter';
        this.counterEl.textContent = `${textarea.value.length} / 360 characters`;
        this.counterEl.style.cssText = `
            position: absolute;
            left: calc(50% + 300px);
            top: 530px;
            transform: translateX(-50%);
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #c4a573;
            z-index: 1000;
            text-align: right;
            width: 120px;
        `;
        document.body.appendChild(this.counterEl);

        textarea.focus();
    }

    removePromptInput() {
        const textarea = document.getElementById('mission-prompt');
        if (textarea) {
            textarea.remove();
        }
        const counter = document.getElementById('prompt-counter');
        if (counter) {
            counter.remove();
        }
    }

    startMission() {
        const textarea = document.getElementById('mission-prompt');
        const userPrompt = textarea ? textarea.value.trim().slice(0, 360) : '';

        if (!userPrompt || userPrompt.length < 20) {
            // Flash warning
            const warning = this.add.text(512, 550,
                'Please provide more detailed instructions (at least 20 characters)',
                {
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: '#ff4444'
                }
            ).setOrigin(0.5);

            this.time.delayedCall(2000, () => warning.destroy());
            return;
        }

        // Store prompt in GameState
        GameState.missionPrompt = userPrompt;
        GameState.lastPrompt = userPrompt;
        console.log('Mission Prompt:', userPrompt);

        // Remove textarea and start mission
        this.removePromptInput();
        this.scene.start('ZooScene');
    }
}
