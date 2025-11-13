class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.selectedLevelIndex = Math.min(
            GameState.currentLevelIndex || 0,
            GameState.unlockedLevelCount - 1
        );

        const initialLevel = GameConfig.LEVELS[this.selectedLevelIndex];
        this.createBackdrop(width, height, initialLevel);

        const title = this.add.text(width / 2, 86, 'HOLLOW ZOO', {
            fontSize: '66px',
            fontFamily: 'IM Fell English SC, serif',
            color: '#f5ead4',
            shadow: { offsetX: 0, offsetY: 10, color: '#05060f', blur: 16, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 140, 'Moonlit Escape Ledger', {
            fontSize: '26px',
            fontFamily: 'Space Grotesk',
            color: '#aab8e8',
            letterSpacing: 4
        }).setOrigin(0.5);

        this.renderLevelCards(width, height);

        this.infoPanel = this.add.rectangle(width / 2, height - 235, 880, 160, 0x101625, 0.88)
            .setStrokeStyle(2, 0x3b4b6b)
            .setDepth(5);

        this.infoTitle = this.add.text(width / 2 - 400, height - 295, '', {
            fontSize: '20px',
            fontFamily: 'Space Grotesk',
            color: '#cdd7ff'
        }).setDepth(6);

        this.infoText = this.add.text(width / 2 - 400, height - 265, '', {
            fontSize: '16px',
            fontFamily: 'Space Grotesk',
            color: '#f1e8d4',
            wordWrap: { width: 820 }
        }).setDepth(6);

        this.promptHint = this.add.text(width / 2 - 400, height - 200, '', {
            fontSize: '15px',
            fontFamily: 'Space Grotesk',
            color: '#9fd6ff',
            wordWrap: { width: 820 }
        }).setDepth(6);

        this.progressText = this.add.text(width / 2, height - 60,
            `Escapes Planned: ${GameState.unlockedLevelCount}/${GameConfig.LEVELS.length} • Memories Archived: ${GameState.memory.length}`, {
            fontSize: '16px',
            fontFamily: 'Space Grotesk',
            color: '#7c8baa'
        }).setOrigin(0.5);

        this.startButton = this.add.rectangle(width / 2, height - 120, 320, 66, 0x1b2134, 0.94)
            .setStrokeStyle(2, 0x8fb0ff)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        const glyph = this.add.graphics({ x: width / 2 - 150, y: height - 120 });
        glyph.fillStyle(0x8fb0ff, 0.25).fillCircle(0, 0, 28);
        glyph.lineStyle(2, 0xbfd6ff, 0.6).strokeCircle(0, 0, 28);
        glyph.setDepth(11);

        this.startButtonText = this.add.text(width / 2 + 10, height - 120, 'Commit to Briefing', {
            fontSize: '24px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setDepth(11);

        this.startButton.on('pointerdown', () => {
            if (!this.canLaunchSelectedLevel()) {
                this.showToast('Conquer the prior warden to unseal this gate.');
                return;
            }
            GameState.currentLevelIndex = this.selectedLevelIndex;
            this.scene.start('PromptScene');
        });
        this.infoText = this.missionPanel.body;
        this.infoText.setFontSize(18);
        this.infoText.setLineSpacing(6);

        this.progressPanel = this.createParchmentPanel(width / 2, height - 90, 620, 110, {
            title: 'Campaign Chronicle',
            icon: '🕯️',
            depth: 12,
            align: 'center'
        });
        this.progressText = this.progressPanel.body;
        this.progressText.setFontSize(16);
        this.progressText.setLineSpacing(4);

        this.toastText = this.add.text(width / 2, height - 320, '', {
            fontSize: '18px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: '#f7d7a2',
            backgroundColor: 'rgba(28, 25, 30, 0.7)',
            padding: { x: 16, y: 8 },
            wordWrap: { width: 520 },
            align: 'center'
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x262f47, 0.96);
            this.startButton.setStrokeStyle(2, 0xc8d6ff, 0.8);
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x1b2134, 0.94);
            this.startButton.setStrokeStyle(2, 0x8fb0ff);
        });

        this.toastText = this.add.text(width / 2, height - 160, '', {
            fontSize: '16px',
            fontFamily: 'Space Grotesk',
            color: '#ffd7a8',
            backgroundColor: 'rgba(27,33,52,0.85)',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setAlpha(0);

        this.updateLevelInfo();
    }

    createBackdrop(width, height, level) {
        const palette = GameConfig.PALETTES[level?.biome] || Object.values(GameConfig.PALETTES)[0];

        const gradient = MoonlitEnvironment.drawVerticalGradient(this, {
            width,
            height,
            palette,
            depth: -30,
            step: 4
        });

        this.parallaxLayers = [];

        this.moon = MoonlitEnvironment.createMoon(this, {
            x: width * 0.82,
            y: height * 0.2,
            radius: 80,
            palette,
            depth: -25,
            alpha: 0.4
        });
        this.parallaxLayers.push({ node: this.moon, axis: 'y', amplitude: 8, base: this.moon.y });

        this.parallaxBars = this.add.graphics();
        this.parallaxBars.setDepth(-24);
        this.parallaxBars.lineStyle(2, MoonlitEnvironment.hexToColor(palette[2] || '#3c5e7f').color, 0.6);
        for (let x = 0; x <= width; x += 80) {
            this.parallaxBars.lineBetween(x, height, x + 40, height - 220);
        }
        this.parallaxLayers.push({ node: this.parallaxBars, axis: 'x', amplitude: 14, base: this.parallaxBars.x || 0 });

        this.lanternGroup = [];
        for (let i = 0; i < 7; i++) {
            const lantern = this.add.rectangle(
                Phaser.Math.Between(80, width - 80),
                Phaser.Math.Between(140, 360),
                14,
                36,
                MoonlitEnvironment.hexToColor(palette[4] || '#ffe7b7').color,
                0.45
            );
            lantern.setDepth(-22);
            lantern.setAngle(Phaser.Math.Between(-6, 6));
            this.tweens.add({
                targets: lantern,
                angle: lantern.angle + Phaser.Math.Between(-4, 4),
                duration: Phaser.Math.Between(2800, 4200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 1600)
            });
            this.lanternGroup.push(lantern);
        }
        const nx = Phaser.Math.Clamp(pointer.x / this.sceneSize.width, 0, 1) - 0.5;
        const ny = Phaser.Math.Clamp(pointer.y / this.sceneSize.height, 0, 1) - 0.5;
        this.targetBackdropOffset.set(nx * 80, ny * 40);
    }

        this.fog = this.add.rectangle(width / 2, height - 120, width * 1.2, 260,
            MoonlitEnvironment.hexToColor(palette[1] || '#1b2440').color, 0.22);
        this.fog.setDepth(-21);

        this.backgroundGradient = gradient;
    }

    renderLevelCards(width, height) {
        this.levelCards = [];
        const startX = width / 2 - 360;
        const startY = height / 2 - 30;
        const spacing = 180;

        GameConfig.LEVELS.forEach((level, index) => {
            const x = startX + index * spacing;
            const container = this.add.container(x, startY).setSize(160, 220);
            const locked = index >= GameState.unlockedLevelCount;
            const completed = GameState.levelHistory[index]?.result === 'victory';
            const card = this.createLevelCard(x, startY, level, index, locked, completed);
            this.levelCards.push(card);
        });

            const parchment = this.add.rectangle(0, 0, 160, 220, 0x141b2c, locked ? 0.55 : 0.92)
                .setStrokeStyle(2, locked ? 0x2c334a : 0x546a9c)
                .setOrigin(0.5);

            const glow = this.add.rectangle(0, 0, 160, 220, 0xa8c0ff, 0.12)
                .setOrigin(0.5)
                .setVisible(false);

            const title = this.add.text(0, -80, `Warden ${level.id}`, {
                fontSize: '17px',
                fontFamily: 'Space Grotesk',
                color: locked ? '#516085' : '#9eb4ff'
            }).setOrigin(0.5);

            const subtitle = this.add.text(0, -42, level.title, {
                fontSize: '16px',
                fontFamily: 'Space Grotesk',
                color: locked ? '#616b84' : '#f5ead4',
                align: 'center',
                wordWrap: { width: 130 }
            }).setOrigin(0.5);

            const enemy = this.add.text(0, 0, level.enemyType, {
                fontSize: '14px',
                fontFamily: 'Space Grotesk',
                color: locked ? '#6b768c' : '#b8c5ff',
                align: 'center',
                wordWrap: { width: 140 }
            }).setOrigin(0.5);

            const tier = this.add.text(0, 46, level.difficultyTier || '', {
                fontSize: '13px',
                fontFamily: 'Space Grotesk',
                color: locked ? '#6e6e88' : '#ffd7a8'
            }).setOrigin(0.5);

            const badge = completed ? '✦' : locked ? '✖' : '➤';
            const badgeColor = completed ? '#8ce8c1' : locked ? '#7a7a92' : '#ffd48f';
            const status = this.add.text(0, 82, badge, {
                fontSize: '30px',
                fontFamily: 'Space Grotesk',
                color: badgeColor
            }).setOrigin(0.5);

            container.add([parchment, glow, title, subtitle, enemy, tier, status]);

            container.setInteractive(new Phaser.Geom.Rectangle(-80, -110, 160, 220), Phaser.Geom.Rectangle.Contains);
            container.on('pointerdown', () => {
                if (locked) {
                    this.showToast(level.unlockText);
                    return;
                }
                this.selectedLevelIndex = index;
                GameState.currentLevelIndex = index;
                this.updateBackdropForLevel(level);
                this.updateLevelSelection();
                this.updateLevelInfo();
            });
        });

            container.on('pointerover', () => {
                if (!locked) {
                    glow.setVisible(true);
                }
            });

            container.on('pointerout', () => glow.setVisible(false));

            this.levelCards.push({ container, parchment, glow, locked, index });
        });

        this.updateStartButtonState();
    }

    updateBackdropForLevel(level) {
        if (!level) return;
        const palette = GameConfig.PALETTES[level.biome] || Object.values(GameConfig.PALETTES)[0];
        const color = Phaser.Display.Color.HexStringToColor(palette[4] || '#ffe7b7').color;

        if (this.backgroundGradient) {
            const { width, height } = this.cameras.main;
            this.backgroundGradient.clear();
            for (let i = 0; i <= height; i += 3) {
                const mix = Phaser.Display.Color.Interpolate.ColorWithColor(
                    Phaser.Display.Color.HexStringToColor(palette[0]),
                    Phaser.Display.Color.HexStringToColor(palette[1] || palette[0]),
                    height,
                    i
                );
                this.backgroundGradient.fillStyle(Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b), 1);
                this.backgroundGradient.fillRect(0, i, width, 3);
            }
        }

        if (this.lanternGroup) {
            this.lanternGroup.forEach((lantern, idx) => {
                lantern.fillColor = color;
                lantern.alpha = 0.35 + (idx % 3) * 0.1;
            });
        }

        if (this.moon) {
            this.moon.fillColor = Phaser.Display.Color.HexStringToColor(palette[3] || '#9fb8ff').color;
            this.moon.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(palette[4] || '#ffe7b7').color, 0.6);
        }

        if (this.parallaxBars) {
            const { width, height } = this.cameras.main;
            this.parallaxBars.clear();
            this.parallaxBars.lineStyle(2, Phaser.Display.Color.HexStringToColor(palette[2] || '#3c5e7f').color, 0.6);
            for (let x = 0; x <= width; x += 80) {
                this.parallaxBars.lineBetween(x, height, x + 40, height - 220);
            }
        }

        if (this.fog) {
            this.fog.fillColor = Phaser.Display.Color.HexStringToColor(palette[1] || '#1b2440').color;
        }
    }

    updateLevelSelection() {
        this.levelCards.forEach(({ container, parchment, glow, locked, index }) => {
            if (locked) {
                container.setAlpha(0.45);
                parchment.setStrokeStyle(2, 0x2c334a);
                glow.setVisible(false);
            } else {
                const selected = index === this.selectedLevelIndex;
                container.setAlpha(selected ? 1 : 0.78);
                parchment.setStrokeStyle(2, selected ? 0xbfd6ff : 0x546a9c);
                glow.setVisible(selected);
            }
        });
        this.updateStartButtonState();
    }

    updateLevelInfo() {
        const level = GameConfig.LEVELS[this.selectedLevelIndex];
        const history = GameState.levelHistory[this.selectedLevelIndex];

        const status = history
            ? `Last Attempt: ${history.result === 'victory' ? 'Victory' : 'Defeat'} after ${history.duration}s`
            : 'No attempts yet — parchment uninked.';

        this.infoTitle.setText(`${level.title} • ${level.enemyType}`);
        this.infoText.setText(`${level.description}\n${status}`);
        this.promptHint.setText(`Prompt Scaffold: ${level.promptScaffold}\nMentor Hint: ${level.mentorHint}`);
    }

    updateStartButtonState() {
        const canStart = this.canLaunchSelectedLevel();
        const alpha = canStart ? 1 : 0.45;
        this.startButton.setAlpha(alpha);
        this.startButton.input?.enabled = true; // keep pointer for toast feedback
        this.startButtonLabel.setColor(canStart ? '#f7f0dc' : '#c9b8a4');
        this.startButtonSeal.setFillStyle(canStart ? 0x4f1f24 : 0x2f1a21, canStart ? 0.95 : 0.65);
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
            duration: 2400,
            ease: 'Sine.easeOut',
            delay: 900
        });
    }

    animateBackground(time) {
        if (this.parallaxLayers) {
            this.parallaxLayers.forEach(({ node, axis, amplitude, base }, idx) => {
                const offset = Math.sin(time * 0.0003 + idx) * amplitude;
                if (!node) return;
                if (axis === 'y' && typeof node.y === 'number') {
                    node.y = (base ?? node.y) + offset;
                } else if (axis === 'x' && typeof node.x === 'number') {
                    node.x = (base ?? node.x) + offset;
                }
            });
        }

        if (this.fog) {
            this.fog.x = this.cameras.main.width / 2 + Math.sin(time * 0.0003) * 20;
            this.fog.alpha = 0.18 + Math.sin(time * 0.0006) * 0.06;
        }
    }

    update(time) {
        this.animateBackground(time);
    }
}
