class PromptScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PromptScene' });
    }

    create() {
        this.levelData = GameConfig.LEVELS[GameState.currentLevelIndex] || GameConfig.LEVELS[0];

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#080b15');

        const backdrop = this.add.graphics();
        for (let i = 0; i <= height; i += 4) {
            const c = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.HexStringToColor('#070910'),
                Phaser.Display.Color.HexStringToColor('#121b2e'),
                height,
                i
            );
            backdrop.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
            backdrop.fillRect(0, i, width, 4);
        }

        const table = this.add.rectangle(width / 2, height / 2 + 40, 960, 520, 0x121b2e, 0.92)
            .setStrokeStyle(2, 0x2e3d5a)
            .setDepth(2);

        const vignette = this.add.rectangle(width / 2, height / 2, width, height, 0x05060a, 0.35).setDepth(1);

        this.add.text(width / 2, 80, 'Moonlit Mission Ledger', {
            fontSize: '40px',
            fontFamily: 'IM Fell English SC, serif',
            color: '#f5ead4'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(width / 2, 128, 'Ink precise instructions. RooKnight obeys the parchment you scribe.', {
            fontSize: '18px',
            fontFamily: 'Space Grotesk',
            color: '#aab8e8',
            align: 'center',
            wordWrap: { width: 820 }
        }).setOrigin(0.5).setDepth(3);

        const flavor = `Warden ${this.levelData.id}: ${this.levelData.title}\n${this.levelData.enemyType} • ${this.levelData.difficultyTier}`;
        this.add.text(width / 2, 188, flavor, {
            fontSize: '20px',
            fontFamily: 'Space Grotesk',
            color: '#ffd7a8',
            align: 'center'
        }).setOrigin(0.5).setDepth(3);

        const loreText = `${this.levelData.description}`;
        this.add.text(width / 2, 236, loreText, {
            fontSize: '15px',
            fontFamily: 'Space Grotesk',
            color: '#f1e8d4',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5).setDepth(3);

        this.add.text(width / 2, 300, `Prompt Scaffold: ${this.levelData.promptScaffold}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#9fd6ff',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5).setDepth(3);

        this.add.text(width / 2, 340, `Mentor Hint: ${this.levelData.mentorHint}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#b9c9ff',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5).setDepth(3);

        this.add.text(width / 2, 382, 'Scribe your tactical instructions below. Reference rune moods, health thresholds, and distance cues.', {
            fontSize: '15px',
            fontFamily: 'Space Grotesk',
            color: '#aab8e8',
            align: 'center',
            wordWrap: { width: 820 }
        }).setOrigin(0.5).setDepth(3);

        this.createPromptInput();

        const startButton = this.add.rectangle(width / 2, 640, 320, 64, 0x1b2134, 0.95)
            .setStrokeStyle(2, 0x8fb0ff)
            .setInteractive({ useHandCursor: true })
            .setDepth(3);

        const startText = this.add.text(width / 2, 640, 'Dispatch RooKnight', {
            fontSize: '24px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(4);

        startButton.on('pointerover', () => startButton.setFillStyle(0x242c44, 0.96));
        startButton.on('pointerout', () => startButton.setFillStyle(0x1b2134, 0.95));
        startButton.on('pointerdown', () => this.startMission());

        const backButton = this.add.text(48, 52, '⟵ Return to Ledger', {
            fontSize: '18px',
            fontFamily: 'Space Grotesk',
            color: '#8fb0ff'
        }).setInteractive({ useHandCursor: true }).setDepth(4);

        backButton.on('pointerover', () => backButton.setColor('#c8d6ff'));
        backButton.on('pointerout', () => backButton.setColor('#8fb0ff'));
        backButton.on('pointerdown', () => {
            this.removePromptInput();
            this.scene.start('MenuScene');
        });

        this.add.text(width / 2, 700, `Enemy difficulty boosts: ${this.describeModifiers(this.levelData.modifiers)}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#ffd48f',
            align: 'center',
            wordWrap: { width: 780 }
        }).setOrigin(0.5).setDepth(3);
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
        textarea.placeholder = 'Ink RooKnight\'s orders...\n\nCall out rune moods (Feral/Cautious/Naturalist), distance rules, health thresholds, and finishing patterns.';
        textarea.value = GameState.lastPrompt || '';
        textarea.style.cssText = `
            position: absolute;
            left: 50%;
            top: 410px;
            transform: translateX(-50%);
            width: 720px;
            height: 170px;
            padding: 20px 24px;
            font-family: 'Space Grotesk', 'Courier New', monospace;
            font-size: 15px;
            line-height: 1.5;
            background: rgba(12, 18, 32, 0.9);
            color: #f1e8d4;
            border: 2px solid rgba(143, 176, 255, 0.7);
            border-radius: 16px;
            resize: none;
            outline: none;
            z-index: 1000;
            box-shadow: 0 18px 40px rgba(5, 8, 20, 0.55);
            backdrop-filter: blur(4px);
        `;

        textarea.addEventListener('focus', () => {
            textarea.style.borderColor = '#cdd7ff';
        });

        textarea.addEventListener('blur', () => {
            textarea.style.borderColor = 'rgba(143, 176, 255, 0.7)';
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
            left: calc(50% + 320px);
            top: 600px;
            transform: translateX(-50%);
            font-family: 'Space Grotesk', monospace;
            font-size: 12px;
            color: #9fd6ff;
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
                    fontFamily: 'Space Grotesk',
                    color: '#ff9aa8'
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
