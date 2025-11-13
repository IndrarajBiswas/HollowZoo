class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.sceneSize = { width, height };

        this.createBackdrop(width, height);

        this.selectedLevelIndex = Math.min(
            GameState.currentLevelIndex || 0,
            GameState.unlockedLevelCount - 1
        );

        const title = this.add.text(width / 2, 90, 'HOLLOW ZOO', {
            fontSize: '68px',
            fontFamily: 'Cinzel Decorative, "IBM Plex Serif", serif',
            color: '#f4ecd9',
            stroke: '#0d0f16',
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 20,
                color: '#000000',
                blur: 32,
                fill: true
            },
            letterSpacing: 10
        }).setOrigin(0.5);

        this.add.text(width / 2, 156, 'AI Awakening', {
            fontSize: '30px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: '#d4c6ab',
            fontStyle: 'italic',
            letterSpacing: 6
        }).setOrigin(0.5);

        this.renderLevelCards(width, height);

        this.missionPanel = this.createParchmentPanel(width / 2, height - 240, 760, 140, {
            title: 'Mission Brief',
            icon: '📜',
            depth: 12,
            align: 'center'
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

        this.createStartButton(width, height);

        this.updateLevelInfo();
        this.updateProgressionSummary();

        this.tweens.add({
            targets: title,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createBackdrop(width, height) {
        const palette = GameConfig.PALETTES?.RooSanctum || ['#0b0d16', '#1a2130', '#6b738f', '#f1d6a7'];
        const topColor = Phaser.Display.Color.HexStringToColor(palette[0]);
        const bottomColor = Phaser.Display.Color.HexStringToColor(palette[1] || palette[0]);
        const accent = Phaser.Display.Color.HexStringToColor(palette[2] || '#6b738f').color;
        const glow = Phaser.Display.Color.HexStringToColor(palette[3] || '#f1d6a7').color;

        this.backdropOffset = new Phaser.Math.Vector2(0, 0);
        this.targetBackdropOffset = new Phaser.Math.Vector2(0, 0);
        this.parallaxLayers = [];
        this.fogLayers = [];

        const gradient = this.add.graphics();
        for (let i = 0; i <= height; i += 4) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                topColor,
                bottomColor,
                height,
                i
            );
            gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
            gradient.fillRect(0, i, width, 4);
        }
        gradient.setDepth(-50);
        this.parallaxLayers.push({ gameObject: gradient, ratio: 0.02, baseX: 0, baseY: 0 });

        const moon = this.add.graphics({ x: width * 0.18, y: height * 0.18 });
        moon.fillStyle(Phaser.Display.Color.GetColor(232, 238, 255), 0.22);
        moon.fillCircle(0, 0, 120);
        moon.fillStyle(Phaser.Display.Color.GetColor(248, 243, 226), 0.35);
        moon.fillCircle(-12, -10, 90);
        moon.setDepth(-48);
        moon.setBlendMode(Phaser.BlendModes.SCREEN);
        this.parallaxLayers.push({ gameObject: moon, ratio: 0.05, baseX: moon.x, baseY: moon.y });

        const cageLayer = this.add.graphics();
        cageLayer.fillStyle(Phaser.Display.Color.GetColor(16, 20, 31), 0.82);
        for (let x = -60; x < width + 120; x += 90) {
            cageLayer.fillRoundedRect(x, height - 360, 26, 360, 12);
        }
        cageLayer.fillStyle(Phaser.Display.Color.GetColor(22, 27, 40), 0.7);
        cageLayer.fillRect(-100, height - 270, width + 200, 10);
        cageLayer.fillRect(-100, height - 150, width + 200, 12);
        cageLayer.setDepth(-45);
        this.parallaxLayers.push({ gameObject: cageLayer, ratio: 0.08, baseX: 0, baseY: 0 });

        this.lanterns = [];
        const lanternBaseY = height - 320;
        const lanternPositions = [width * 0.18, width * 0.42, width * 0.66, width * 0.82];
        lanternPositions.forEach((x, index) => {
            const lantern = this.createLantern(x, lanternBaseY + Phaser.Math.Between(-20, 20), accent, glow);
            lantern.setDepth(-42 + index * 0.2);
            this.lanterns.push(lantern);
            this.parallaxLayers.push({ gameObject: lantern, ratio: 0.12 + index * 0.01, baseX: lantern.x, baseY: lantern.y });
        });

        for (let i = 0; i < 3; i++) {
            const fog = this.createFogLayer(width, height, 0.16 - i * 0.03, i);
            fog.setDepth(-40 + i);
            this.fogLayers.push({
                gameObject: fog,
                baseX: fog.x,
                baseY: fog.y,
                speed: 0.08 + i * 0.04
            });
            this.parallaxLayers.push({ gameObject: fog, ratio: 0.18 + i * 0.02, baseX: fog.x, baseY: fog.y });
        }

        const groundMist = this.add.graphics();
        groundMist.fillGradientStyle(0x0b1019, 0x0b1019, 0x0b1019, 0x0b1019, 0.6, 0.6, 0.85, 0.9);
        groundMist.fillRect(-10, height - 120, width + 20, 160);
        groundMist.setDepth(-30);
        this.parallaxLayers.push({ gameObject: groundMist, ratio: 0.25, baseX: 0, baseY: 0 });

        this.input.on('pointermove', this.handleParallaxPointer, this);
    }

    createLantern(x, y, accentColor, glowColor) {
        const lantern = this.add.container(x, y);
        const pole = this.add.rectangle(0, 240, 10, 260, 0x121722, 0.82).setOrigin(0.5, 1);
        const crossbar = this.add.rectangle(0, 40, 130, 6, 0x161c2a, 0.9).setOrigin(0.5);
        const support = this.add.rectangle(-60, 90, 6, 100, 0x161c2a, 0.9).setOrigin(0.5, 0);

        const glow = this.add.ellipse(-60, 58, 160, 120, glowColor, 0.1).setBlendMode(Phaser.BlendModes.ADD);
        const lampGlass = this.add.rectangle(-60, 40, 36, 64, accentColor, 0.45);
        const lampFrame = this.add.rectangle(-60, 40, 42, 70, 0x0f1421, 0.85);

        lantern.add([glow, pole, crossbar, support, lampFrame, lampGlass]);

        this.tweens.add({
            targets: [glow, lampGlass],
            alpha: {
                getStart: () => 0.08,
                getEnd: () => 0.22
            },
            duration: 3200 + Phaser.Math.Between(-600, 600),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 1200)
        });

        return lantern;
    }

    createFogLayer(width, height, alpha, index) {
        const fog = this.add.graphics({ x: width / 2, y: height - (220 - index * 40) });
        const color = Phaser.Display.Color.GetColor(187, 198, 221);
        fog.fillGradientStyle(color, color, color, color, alpha, alpha * 0.8, alpha * 0.6, alpha * 0.4);
        fog.fillRoundedRect(-width * 0.65, -40, width * 1.3, 160, 80);
        fog.setBlendMode(Phaser.BlendModes.SCREEN);
        return fog;
    }

    handleParallaxPointer(pointer) {
        if (!this.sceneSize) {
            return;
        }
        const nx = Phaser.Math.Clamp(pointer.x / this.sceneSize.width, 0, 1) - 0.5;
        const ny = Phaser.Math.Clamp(pointer.y / this.sceneSize.height, 0, 1) - 0.5;
        this.targetBackdropOffset.set(nx * 80, ny * 40);
    }

    createParchmentPanel(x, y, width, height, options = {}) {
        const container = this.add.container(x, y).setDepth(options.depth || 10);
        const frame = this.add.graphics();
        container.add(frame);
        this.drawParchmentFrame(frame, width, height, { elevated: true });

        if (options.icon || options.title) {
            const heading = this.add.text(0, -height / 2 + 28, `${options.icon || ''} ${options.title || ''}`.trim(), {
                fontSize: '22px',
                fontFamily: 'Cinzel Decorative, "IBM Plex Serif", serif',
                color: '#3b2a1b',
                align: 'center',
                shadow: {
                    offsetX: 0,
                    offsetY: 2,
                    color: 'rgba(0, 0, 0, 0.25)',
                    blur: 2,
                    fill: true
                }
            }).setOrigin(0.5, 0.5);
            container.add(heading);
        }

        const body = this.add.text(0, options.title ? -4 : 0, '', {
            fontSize: '17px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: '#2f2721',
            wordWrap: { width: width - 80 },
            align: options.align || 'left'
        }).setOrigin(0.5, 0);
        container.add(body);

        return { container, frame, body, width, height };
    }

    drawParchmentFrame(graphics, width, height, options = {}) {
        const baseColor = options.locked ? 0xc6c1b2 : 0xf4ecd9;
        const strokeColor = options.selected ? 0x9b612a : 0x9a907e;
        const shadowColor = options.locked ? 0x3b362f : 0x4f4338;
        const cutoutColor = 0xd3cbb8;

        graphics.clear();
        graphics.fillStyle(0x000000, 0.25);
        graphics.fillRoundedRect(-width / 2 + 6, -height / 2 + 14, width - 12, height - 6, 28);

        graphics.fillStyle(baseColor, 0.96);
        graphics.lineStyle(3, strokeColor, options.locked ? 0.6 : 0.9);
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 32);
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 32);

        graphics.fillStyle(cutoutColor, 0.45);
        const notchRadius = 12;
        graphics.fillCircle(-width / 2 + 34, -height / 2 + 34, notchRadius);
        graphics.fillCircle(width / 2 - 34, -height / 2 + 34, notchRadius);
        graphics.fillCircle(-width / 2 + 34, height / 2 - 34, notchRadius);
        graphics.fillCircle(width / 2 - 34, height / 2 - 34, notchRadius);

        graphics.lineStyle(1, shadowColor, 0.25);
        graphics.beginPath();
        graphics.moveTo(-width / 2 + 32, -height / 2 + 32);
        graphics.lineTo(width / 2 - 32, height / 2 - 32);
        graphics.moveTo(width / 2 - 32, -height / 2 + 32);
        graphics.lineTo(-width / 2 + 32, height / 2 - 32);
        graphics.strokePath();
    }

    createLevelCard(x, y, level, index, locked, completed) {
        const cardWidth = 190;
        const cardHeight = 230;
        const container = this.add.container(x, y).setDepth(10);
        const frame = this.add.graphics();
        container.add(frame);
        this.drawParchmentFrame(frame, cardWidth, cardHeight, { locked, selected: index === this.selectedLevelIndex });

        const title = this.add.text(0, -cardHeight / 2 + 50, `LEVEL ${level.id}`, {
            fontSize: '20px',
            fontFamily: 'Cinzel Decorative, "IBM Plex Serif", serif',
            color: locked ? '#6d6256' : '#3f3327',
            align: 'center',
            letterSpacing: 3
        }).setOrigin(0.5);
        container.add(title);

        const subtitle = this.add.text(0, -20, level.title, {
            fontSize: '18px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: locked ? '#7f7466' : '#2f2721',
            align: 'center',
            wordWrap: { width: cardWidth - 60 }
        }).setOrigin(0.5);
        container.add(subtitle);

        const status = this.add.text(0, cardHeight / 2 - 60, locked ? '🔒 Sealed' : completed ? '✦ Conquered' : '🗝️ Awaiting', {
            fontSize: '20px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: locked ? '#6a5f52' : completed ? '#35563e' : '#4a2d2b',
            align: 'center'
        }).setOrigin(0.5);
        container.add(status);

        container.setSize(cardWidth, cardHeight);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => {
            if (locked) {
                this.showToast(level.unlockText || 'Complete the previous mission to unlock this level.');
                return;
            }
            this.selectedLevelIndex = index;
            GameState.currentLevelIndex = index;
            this.updateLevelSelection();
            this.updateLevelInfo();
        });

        container.on('pointerover', () => {
            if (!locked) {
                this.tweens.add({
                    targets: container,
                    scale: 1.02,
                    duration: 220,
                    ease: 'Sine.easeOut'
                });
            }
        });

        container.on('pointerout', () => {
            container.setScale(1);
        });

        return { container, frame, title, subtitle, status, index, locked, completed, width: cardWidth, height: cardHeight };
    }

    renderLevelCards(width, height) {
        this.levelCards = [];
        const spacing = 220;
        const totalWidth = (GameConfig.LEVELS.length - 1) * spacing;
        const startX = width / 2 - totalWidth / 2;
        const startY = height / 2 - 10;

        GameConfig.LEVELS.forEach((level, index) => {
            const x = startX + index * spacing;
            const locked = index >= GameState.unlockedLevelCount;
            const completed = GameState.levelHistory[index]?.result === 'victory';
            const card = this.createLevelCard(x, startY, level, index, locked, completed);
            this.levelCards.push(card);
        });

        this.updateLevelSelection();
    }

    createStartButton(width, height) {
        this.startButton = this.add.container(width / 2, height - 150).setDepth(30);
        const shadow = this.add.ellipse(0, 36, 170, 54, 0x020203, 0.55);
        const glow = this.add.circle(0, 0, 88, 0xf7e1af, 0.18).setBlendMode(Phaser.BlendModes.ADD);
        const seal = this.add.circle(0, 0, 74, 0x4f1f24, 0.95);
        const sealEdge = this.add.circle(0, 0, 68, 0x702a32, 0.9);
        const label = this.add.text(0, -6, 'COMMENCE MISSION', {
            fontSize: '20px',
            fontFamily: 'Cinzel Decorative, "IBM Plex Serif", serif',
            color: '#f7f0dc',
            letterSpacing: 4
        }).setOrigin(0.5);

        this.startButton.add([shadow, glow, seal, sealEdge, label]);
        this.startButtonSeal = seal;
        this.startButtonLabel = label;
        this.startButtonGlow = glow;

        this.startButton.setSize(240, 160);
        this.startButton.setInteractive({ useHandCursor: true });

        this.startButton.on('pointerdown', () => {
            if (!this.canLaunchSelectedLevel()) {
                this.showToast('Complete the previous mission to unlock this level.');
                return;
            }
            GameState.currentLevelIndex = this.selectedLevelIndex;
            this.scene.start('PromptScene');
        });

        this.startButton.on('pointerover', () => {
            this.tweens.add({
                targets: [this.startButtonGlow, this.startButtonSeal],
                scale: 1.05,
                duration: 220,
                yoyo: true,
                ease: 'Sine.easeOut'
            });
        });

        this.startButton.on('pointerout', () => {
            this.startButtonGlow.setScale(1);
            this.startButtonSeal.setScale(1);
        });

        this.updateStartButtonState();
    }

    updateLevelSelection() {
        this.levelCards.forEach(card => {
            const selected = card.index === this.selectedLevelIndex;
            const locked = card.locked;
            this.drawParchmentFrame(card.frame, card.width, card.height, { selected, locked });
            const tint = locked ? '#6d6256' : selected ? '#3a241d' : '#3f3327';
            card.title.setColor(tint);
            card.status.setColor(locked ? '#6a5f52' : card.completed ? '#35563e' : selected ? '#632f2a' : '#4a2d2b');
            if (!locked) {
                card.container.setAlpha(selected ? 1 : 0.85);
            } else {
                card.container.setAlpha(0.5);
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
            `${level.title}\nBiome: ${level.biome} • Nemesis: ${level.enemyType}\n${status}`
        );
        this.updateProgressionSummary();
    }

    updateProgressionSummary() {
        if (!this.progressText) {
            return;
        }
        const unlocked = GameState.unlockedLevelCount;
        const total = GameConfig.LEVELS.length;
        const victories = GameState.battlesWon;
        const defeats = GameState.battlesLost;
        const memories = GameState.memory.length;

        this.progressText.setText(
            `Unlocked Paths: ${unlocked}/${total}\nVictories: ${victories} • Defeats: ${defeats} • Memories Preserved: ${memories}`
        );
    }

    updateStartButtonState() {
        if (!this.startButton) {
            return;
        }
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
            duration: 2600,
            ease: 'Sine.easeOut',
            delay: 1000
        });
    }

    update(time, delta) {
        if (this.parallaxLayers?.length) {
            const lerpFactor = Phaser.Math.Clamp(delta / 500, 0.02, 0.08);
            this.backdropOffset.x = Phaser.Math.Linear(this.backdropOffset.x, this.targetBackdropOffset.x, lerpFactor);
            this.backdropOffset.y = Phaser.Math.Linear(this.backdropOffset.y, this.targetBackdropOffset.y, lerpFactor * 0.8);

            this.parallaxLayers.forEach(layer => {
                const obj = layer.gameObject;
                if (!obj) {
                    return;
                }
                obj.x = layer.baseX + this.backdropOffset.x * layer.ratio;
                obj.y = layer.baseY + this.backdropOffset.y * layer.ratio;
            });
        }

        if (this.fogLayers?.length) {
            this.fogLayers.forEach((layer, index) => {
                const wave = Math.sin(time / (4000 - index * 600));
                layer.gameObject.x = layer.baseX + wave * 30;
                layer.gameObject.alpha = 0.12 + Math.abs(Math.sin(time / (6000 + index * 500))) * 0.15;
            });
        }
    }
}
