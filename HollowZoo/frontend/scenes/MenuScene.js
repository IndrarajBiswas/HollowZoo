class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.createBackdrop(width, height);

        this.selectedLevelIndex = Math.min(
            GameState.currentLevelIndex || 0,
            GameState.unlockedLevelCount - 1
        );

        // Title
        const title = this.add.text(width / 2, 80, 'HOLLOW ZOO', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#8a7a6a',
            stroke: '#1a1a2e',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, 140, 'AI Awakening', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#c4a573'
        }).setOrigin(0.5);

        // Level grid
        this.renderLevelCards(width, height);

        // Info + controls
        this.infoText = this.add.text(width / 2, height - 150, '', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#b8b8d0',
            align: 'center',
            wordWrap: { width: 720 }
        }).setOrigin(0.5);

        this.progressText = this.add.text(width / 2, height - 100,
            `Unlocked Levels: ${GameState.unlockedLevelCount}/${GameConfig.LEVELS.length}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#6a6a8a'
        }).setOrigin(0.5);

        const stats = this.add.text(width / 2, height - 60,
            `Battles Won: ${GameState.battlesWon} | Lost: ${GameState.battlesLost} | Memories: ${GameState.memory.length}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#4a4a6a'
        }).setOrigin(0.5);

        // Start button
        this.startButton = this.add.rectangle(width / 2, height - 20, 320, 60, 0x2a2a4a)
            .setInteractive({ useHandCursor: true }).setOrigin(0.5, 1);
        this.startButtonText = this.add.text(width / 2, height - 50, 'START MISSION', {
            fontSize: '26px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.on('pointerdown', () => {
            if (!this.canLaunchSelectedLevel()) {
                this.showToast('Complete the previous mission to unlock this level.');
                return;
            }
            GameState.currentLevelIndex = this.selectedLevelIndex;
            this.scene.start('PromptScene');
        });

        this.startButton.on('pointerover', () => this.startButton.setFillStyle(0x3a3a5a));
        this.startButton.on('pointerout', () => this.startButton.setFillStyle(0x2a2a4a));

        // helper toast text
        this.toastText = this.add.text(width / 2, height - 200, '', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffae8a',
            backgroundColor: 'rgba(42,42,74,0.8)',
            padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setAlpha(0);

        // Animate title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.updateLevelInfo();
    }

    createBackdrop(width, height) {
        const palette = GameConfig.PALETTES?.RooSanctum || ['#051923', '#2A2F4F', '#8F3985'];
        const gradient = this.add.graphics();
        const topColor = Phaser.Display.Color.HexStringToColor(palette[0]);
        const bottomColor = Phaser.Display.Color.HexStringToColor(palette[1] || palette[0]);
        for (let i = 0; i <= height; i += 6) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                topColor,
                bottomColor,
                height,
                i
            );
            gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
            gradient.fillRect(0, i, width, 6);
        }
        gradient.setDepth(-20);

        const accentColor = Phaser.Display.Color.HexStringToColor(palette[2] || '#8F3985').color;
        this.orbiters = [];
        for (let i = 0; i < 12; i++) {
            const orb = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 4),
                accentColor,
                0.3
            );
            orb.setDepth(-19);
            this.orbiters.push(orb);
            this.tweens.add({
                targets: orb,
                x: orb.x + Phaser.Math.Between(-30, 30),
                y: orb.y + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(4000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 1500)
            });
        }

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.2).setDepth(-18);
    }

    renderLevelCards(width, height) {
        this.levelCards = [];
        const startX = width / 2 - 360;
        const startY = height / 2 - 40;
        const spacing = 180;

        GameConfig.LEVELS.forEach((level, index) => {
            const x = startX + index * spacing;
            const card = this.add.rectangle(x, startY, 160, 200, 0x1c1f33, 0.8)
                .setStrokeStyle(2, 0x35395a)
                .setInteractive({ useHandCursor: true });

            const locked = index >= GameState.unlockedLevelCount;
            const completed = GameState.levelHistory[index]?.result === 'victory';

            const title = this.add.text(x, startY - 70, `LEVEL ${level.id}`, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: locked ? '#555575' : '#c4a573'
            }).setOrigin(0.5);

            const subtitle = this.add.text(x, startY - 40, level.title, {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: locked ? '#6a6a8a' : '#e0e0e0',
                align: 'center',
                wordWrap: { width: 140 }
            }).setOrigin(0.5);

            if (locked) {
                this.add.text(x, startY + 40, '🔒', {
                    fontSize: '40px'
                }).setOrigin(0.5);
            } else if (completed) {
                this.add.text(x, startY + 40, '✓', {
                    fontSize: '42px',
                    color: '#6aff6a'
                }).setOrigin(0.5);
            } else {
                this.add.text(x, startY + 40, '⚔️', {
                    fontSize: '32px'
                }).setOrigin(0.5);
            }

            card.on('pointerdown', () => {
                if (locked) {
                    this.showToast(level.unlockText);
                    return;
                }
                this.selectedLevelIndex = index;
                GameState.currentLevelIndex = index;
                this.updateLevelSelection();
                this.updateLevelInfo();
            });

            this.levelCards.push({ card, title, subtitle, index, locked });
        });

        this.updateLevelSelection();
    }

    updateLevelSelection() {
        this.levelCards.forEach(({ card, index, locked }) => {
            if (locked) {
                card.setAlpha(0.4);
            } else {
                const selected = index === this.selectedLevelIndex;
                card.setAlpha(selected ? 1 : 0.7);
                card.setStrokeStyle(2, selected ? 0xc4a573 : 0x35395a);
            }
        });
        this.updateStartButtonState();
    }

    updateLevelInfo() {
        const level = GameConfig.LEVELS[this.selectedLevelIndex];
        const history = GameState.levelHistory[this.selectedLevelIndex];

        const status = history
            ? `Last run: ${history.result === 'victory' ? 'Victory' : 'Defeat'} in ${history.duration}s`
            : 'No attempts yet';

        this.infoText.setText(
            `${level.title} • ${level.description}\nEnemy: ${level.enemyType} • Biome: ${level.biome}\n${status}`
        );
    }

    updateStartButtonState() {
        if (!this.startButton || !this.startButtonText) {
            return;
        }
        const canStart = this.canLaunchSelectedLevel();
        this.startButton.setAlpha(canStart ? 1 : 0.5);
        this.startButtonText.setAlpha(canStart ? 1 : 0.5);
    }

    canLaunchSelectedLevel() {
        return this.selectedLevelIndex < GameState.unlockedLevelCount;
    }

    showToast(message) {
        this.toastText.setText(message);
        this.tweens.killTweensOf(this.toastText);
        this.toastText.setAlpha(1);
        this.tweens.add({
            targets: this.toastText,
            alpha: 0,
            duration: 2500,
            ease: 'Sine.easeOut',
            delay: 800
        });
    }
}
