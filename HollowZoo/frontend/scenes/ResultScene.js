class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.result = data.result; // 'victory' or 'defeat'
        this.battleData = data.battleData || {};
        this.userPrompt = data.userPrompt || '';
        this.levelIndex = data.levelIndex ?? GameState.currentLevelIndex ?? 0;
    }

    create() {
        this.recordOutcome();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.cameras.main.setBackgroundColor(this.result === 'victory' ? '#1a3a1a' : '#3a1a1a');

        // Result title
        const resultText = this.result === 'victory' ? '🏆 MISSION SUCCESS!' : '💀 MISSION FAILED';
        const resultColor = this.result === 'victory' ? '#6aff6a' : '#ff6a6a';

        this.add.text(width / 2, 100, resultText, {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: resultColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 160,
            `Level ${this.levelIndex + 1}: ${GameConfig.LEVELS[this.levelIndex]?.title || 'Unknown Level'}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#c4a573',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats box
        const statsY = 200;
        const damageTaken = this.battleData.damageTaken || 0;
        const damageDealt = this.battleData.damageDealt || 0;
        const duration = Math.floor((this.battleData.duration || 0) / 1000);
        const actions = this.battleData.actions || 0;

        const statsText = [
            'BATTLE STATS',
            '',
            `Duration: ${duration} seconds`,
            `Damage Dealt: ${Math.floor(damageDealt)}`,
            `Damage Taken: ${Math.floor(damageTaken)}`,
            `Actions Taken: ${actions}`,
            '',
            'YOUR PROMPT:',
            `"${this.userPrompt.substring(0, 100)}${this.userPrompt.length > 100 ? '...' : ''}"`
        ].join('\n');

        this.add.text(width / 2, statsY, statsText, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#e0e0e0',
            align: 'center',
            lineSpacing: 8,
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5, 0);

        // Feedback based on performance
        let feedback = '';
        if (this.result === 'victory') {
            if (damageTaken < 30) {
                feedback = '⭐ Flawless Victory! Your prompt was excellent!';
            } else if (damageTaken < 60) {
                feedback = '✅ Good job! Your strategy worked well.';
            } else {
                feedback = '⚠️ Victory, but your AI took heavy damage. Try a more defensive prompt.';
            }
        } else {
            if (damageDealt < 30) {
                feedback = '❌ Your prompt was too passive. Be more aggressive!';
            } else if (damageDealt >= 50) {
                feedback = '⚡ Good damage output! Your strategy needs better defense.';
            } else {
                feedback = '❌ Your prompt needs more specific tactics.';
            }
        }

        this.add.text(width / 2, 500, feedback, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffaa44',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // Buttons
        const tryAgainBtn = this.add.rectangle(width / 2 - 150, 600, 250, 60, 0x8a7a6a)
            .setInteractive({ useHandCursor: true });

        const tryAgainText = this.add.text(width / 2 - 150, 600, 'TRY AGAIN', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#1a1a2e',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        tryAgainBtn.on('pointerover', () => tryAgainBtn.setFillStyle(0xa49a8a));
        tryAgainBtn.on('pointerout', () => tryAgainBtn.setFillStyle(0x8a7a6a));
        tryAgainBtn.on('pointerdown', () => {
            this.scene.start('PromptScene');
        });

        const menuBtn = this.add.rectangle(width / 2 + 150, 600, 250, 60, 0x6a6a8a)
            .setInteractive({ useHandCursor: true });

        const menuText = this.add.text(width / 2 + 150, 600, 'MAIN MENU', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#e0e0e0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x8a8aaa));
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x6a6a8a));
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        if (this.levelUnlockedMessage) {
            this.add.text(width / 2, 560, this.levelUnlockedMessage, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#6afff2'
            }).setOrigin(0.5);
        }
    }

    recordOutcome() {
        const durationSeconds = Math.max(1, Math.floor((this.battleData.duration || 0) / 1000));

        if (this.result === 'victory') {
            GameState.battlesWon++;
        } else {
            GameState.battlesLost++;
        }

        GameState.levelHistory[this.levelIndex] = {
            result: this.result,
            duration: durationSeconds,
            timestamp: new Date().toISOString()
        };

        if (this.result === 'victory' && this.levelIndex + 1 >= GameState.unlockedLevelCount &&
            this.levelIndex + 1 < GameConfig.LEVELS.length) {
            GameState.unlockedLevelCount = this.levelIndex + 2;
            this.levelUnlockedMessage = `🎉 Level ${this.levelIndex + 2} unlocked!`;
            GameState.currentLevelIndex = GameState.unlockedLevelCount - 1;
        } else {
            this.levelUnlockedMessage = '';
            if (this.result === 'victory') {
                GameState.currentLevelIndex = Math.min(
                    this.levelIndex + 1,
                    GameConfig.LEVELS.length - 1
                );
            }
        }
    }
}
