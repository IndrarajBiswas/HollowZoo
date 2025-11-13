class ZooScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ZooScene' });
    }

    createAtmosphere() {
        const { width, height } = this.cameras.main;
        const palette = this.getActivePalette();
        const topColor = this.hexToColor(palette[0]);
        const bottomColor = this.hexToColor(palette[1] || palette[0]);
        const accentColor = this.hexToColor(palette[2] || palette[0]).color;
        const glowColor = this.hexToColor(palette[3] || '#9fb8ff').color;

        const gradient = this.add.graphics();
        for (let i = 0; i <= height; i += 3) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                topColor,
                bottomColor,
                height,
                i
            );
            gradient.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
            gradient.fillRect(0, i, width, 3);
        }
        gradient.setDepth(-20);

        this.parallaxCages = this.add.graphics();
        this.parallaxCages.setDepth(-19);
        this.parallaxCages.fillStyle(this.hexToColor(palette[2] || '#3c5e7f').color, 0.4);
        for (let x = -40; x < width + 40; x += 120) {
            this.parallaxCages.fillRect(x, height - 260, 70, 260);
        }

        this.moon = this.add.circle(width * 0.8, height * 0.18, 90, glowColor, 0.25)
            .setStrokeStyle(2, this.hexToColor(palette[4] || '#ffe7b7').color, 0.7)
            .setDepth(-18);

        this.motes = [];
        for (let i = 0; i < 32; i++) {
            const mote = this.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                2,
                10,
                glowColor,
                Phaser.Math.FloatBetween(0.15, 0.35)
            );
            mote.setDepth(-17);
            this.motes.push(mote);
            this.tweens.add({
                targets: mote,
                y: mote.y - Phaser.Math.Between(40, 90),
                alpha: Phaser.Math.FloatBetween(0.05, 0.25),
                duration: Phaser.Math.Between(4200, 6800),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 1400)
            });
        }

        this.fogLayer = this.add.rectangle(width / 2, height - 140, width * 1.4, 300,
            this.hexToColor(palette[1] || '#1b2440').color, 0.22).setDepth(-16);

        this.backgroundLayers = {
            gradient
        };
    }

    create() {
        this.levelData = GameConfig.LEVELS[GameState.currentLevelIndex] || GameConfig.LEVELS[0];
        GameState.currentBiome = this.levelData.biome;

        this.createAtmosphere();
        this.setupWorld();
        this.createPlatforms();
        this.createPlayer();
        this.createEnemy();
        this.setupUI();
        this.setupAI();
        this.setupInput();
        this.setupBattleTracking();
    }

    setupWorld() {
        this.cameras.main.setBackgroundColor(GameConfig.COLORS.BACKGROUND);

        this.biomePanel = this.add.rectangle(220, 60, 320, 70, 0x0d1424, 0.78)
            .setStrokeStyle(2, 0x2c3a57)
            .setDepth(5);

        this.biomeText = this.add.text(70, 38,
            `Zone • ${this.levelData.title}`, {
            fontSize: '18px',
            fontFamily: 'Space Grotesk',
            color: '#cdd7ff'
        }).setDepth(6);

        this.biomeDetail = this.add.text(70, 64,
            `${this.levelData.enemyType} • ${this.levelData.difficultyTier}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#9fd6ff'
        }).setDepth(6);
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const worldWidth = this.cameras.main.width;
        const palette = this.getActivePalette();
        const groundColor = this.hexToColor(palette[1] || '#1b2333').color;
        const platformColor = this.hexToColor(palette[2] || '#2e3f58').color;
        const perchColor = this.hexToColor(palette[3] || '#4c5d7f').color;

        const ground = this.add.rectangle(worldWidth / 2, 720, worldWidth, 120, groundColor, 1);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        const platform1 = this.add.rectangle(260, 520, 220, 22, platformColor, 0.95);
        this.physics.add.existing(platform1, true);
        this.platforms.add(platform1);

        const platform2 = this.add.rectangle(worldWidth - 260, 420, 220, 22, platformColor, 0.95);
        this.physics.add.existing(platform2, true);
        this.platforms.add(platform2);

        const platform3 = this.add.rectangle(worldWidth / 2, 320, 190, 18, perchColor, 0.95);
        this.physics.add.existing(platform3, true);
        this.platforms.add(platform3);

        const platform4 = this.add.rectangle(worldWidth / 2 - 220, 250, 120, 16, perchColor, 0.9);
        this.physics.add.existing(platform4, true);
        this.platforms.add(platform4);

        const platform5 = this.add.rectangle(worldWidth / 2 + 220, 250, 120, 16, perchColor, 0.9);
        this.physics.add.existing(platform5, true);
        this.platforms.add(platform5);

        this.decorateArena();
    }

    decorateArena() {
        if (this.decorLayer) {
            this.decorLayer.destroy(true);
        }

        this.decorLayer = this.add.container(0, 0).setDepth(-15);
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const palette = this.getActivePalette();

        const graphics = this.add.graphics();
        graphics.setDepth(-15);

        switch (this.levelData.biome) {
            case GameConfig.BIOMES.LANTERN_AVIARY:
                graphics.lineStyle(2, this.hexToColor(palette[4]).color, 0.4);
                for (let i = 0; i < 6; i++) {
                    const x = 120 + i * 160;
                    graphics.lineBetween(x, 120, x + Phaser.Math.Between(-40, 40), 280);
                }
                break;
            case GameConfig.BIOMES.SERPENTARIUM:
                graphics.fillStyle(0x1d3a35, 0.6);
                graphics.fillEllipse(width / 2, height - 70, 480, 120);
                graphics.fillStyle(0x35a388, 0.35);
                graphics.fillEllipse(width / 2 + 140, height - 60, 260, 80);
                break;
            case GameConfig.BIOMES.TIDE_PENS:
                graphics.fillStyle(0x17415c, 0.65);
                graphics.fillRect(0, height - 90, width, 90);
                graphics.lineStyle(3, 0x3a83b7, 0.6);
                for (let i = 0; i < width; i += 60) {
                    graphics.strokeCircle(i, height - 90, Phaser.Math.Between(6, 16));
                }
                break;
            case GameConfig.BIOMES.THORN_SANCTUM:
                graphics.lineStyle(4, 0x567345, 0.6);
                for (let i = 0; i < 12; i++) {
                    const x = Phaser.Math.Between(60, width - 60);
                    graphics.beginPath();
                    graphics.moveTo(x, height);
                    graphics.lineTo(x + Phaser.Math.Between(-40, 40), height - 200);
                    graphics.lineTo(x + Phaser.Math.Between(-20, 20), height - 300);
                    graphics.strokePath();
                }
                break;
            case GameConfig.BIOMES.CROWN_CHAMBER:
                graphics.lineStyle(3, 0xc997ff, 0.5);
                for (let i = 0; i < 5; i++) {
                    const startX = Phaser.Math.Between(80, width - 80);
                    graphics.beginPath();
                    graphics.moveTo(startX, height - 120);
                    graphics.lineTo(startX + Phaser.Math.Between(-80, 80), height - 260);
                    graphics.strokePath();
                }
                graphics.fillStyle(0x3d2748, 0.4);
                graphics.fillCircle(width / 2, 160, 120);
                break;
        }

        this.decorLayer.add(graphics);
    }

    createPlayer() {
        this.player = new RooKnight(this, 200, 600);
        this.physics.add.collider(this.player, this.platforms);
    }

    createEnemy() {
        this.enemy = new Kangaroo(this, 800, 600, this.levelData.enemyType, this.levelData.modifiers);
        this.physics.add.collider(this.enemy, this.platforms);

        // Setup combat collision
        this.physics.add.overlap(this.player, this.enemy, this.handleCombat, null, this);
    }

    setupUI() {
        const width = this.cameras.main.width;

        const promptPanel = this.add.rectangle(width / 2, 84, 720, 100, 0x0d1424, 0.82)
            .setStrokeStyle(2, 0x2c3a57)
            .setDepth(12);

        this.promptDisplay = this.add.text(width / 2, 84,
            GameState.missionPrompt ? GameState.missionPrompt : 'No instructions received — RooKnight will improvise.', {
            fontSize: '16px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4',
            align: 'center',
            wordWrap: { width: 660 }
        }).setOrigin(0.5).setDepth(13);

        this.thoughtPanel = new AIThoughtPanel(this);

        this.runes = new MentorRunes(this);

        this.levelBadge = this.add.text(width - 320, 32,
            `${this.levelData.description}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#ffd7a8',
            wordWrap: { width: 280 }
        }).setDepth(12);

        this.playerHealthBar = new HealthBar(this, 30, 120, this.player.health, 'RooKnight');
        this.enemyHealthBar = new HealthBar(this, width - 270, 120, this.enemy.health, this.enemy.enemyType);

        this.comboGlow = this.add.circle(width / 2, 40, 80, 0x9fd6ff, 0).setDepth(14).setBlendMode(Phaser.BlendModes.ADD);

        this.comboText = this.add.text(width / 2, 40, '', {
            fontSize: '34px',
            fontFamily: 'Space Grotesk',
            color: '#cdd7ff',
            fontStyle: 'bold',
            stroke: '#2c3a57',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(15).setAlpha(0);
    }

    setupAI() {
        this.aiDecisionInterval = (this.levelData.modifiers?.aiInterval) || GameConfig.AI_DECISION_INTERVAL;
        this.lastDecision = null;
        this.scheduleNextDecision();
    }

    scheduleNextDecision() {
        if (this.aiDecisionTimer) {
            this.aiDecisionTimer.remove(false);
        }
        const jitter = Phaser.Math.Between(-160, 220);
        const delay = Phaser.Math.Clamp(this.aiDecisionInterval + jitter, 360, 1800);
        this.aiDecisionTimer = this.time.addEvent({
            delay,
            callback: async () => {
                await this.makeAIDecision();
                if (!this.battleEnded) {
                    this.scheduleNextDecision();
                }
            },
            callbackScope: this,
            loop: false
        });
    }

    setupInput() {
        // Escape to pause/menu
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('MenuScene');
        });
    }

    setupBattleTracking() {
        this.battleStartTime = Date.now();
        this.battleActions = [];
        this.damageTaken = 0;
        this.damageDealt = 0;
        this.cornerTimers = { player: 0, enemy: 0 };
        this.lastAerialShuffle = 0;
        this.suddenDeathTriggered = false;
        this.battleEnded = false;
        this.levelIndex = GameState.currentLevelIndex;
    }

    async makeAIDecision() {
        if (!this.player || !this.enemy || this.enemy.health <= 0 || this.battleEnded) {
            return;
        }

        // Gather state information
        const agentState = {
            health: this.player.health,
            energy: this.player.energy,
            onGround: this.player.body.touching.down,
            x: this.player.x,
            y: this.player.y
        };

        const enemyState = {
            type: this.enemy.enemyType,
            health: this.enemy.health,
            distance: Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.enemy.x, this.enemy.y
            ),
            state: this.enemy.currentState,
            x: this.enemy.x,
            y: this.enemy.y
        };

        const environment = {
            zone: GameState.currentBiome,
            lighting: 'dim',
            hazards: 'dynamic',
            runes: { ...GameState.coaching }
        };

        // Get recent memories (last 5)
        const recentMemories = GameState.memory.slice(-5).map(m => m.memory || m);

        // Request AI decision with user's tactical prompt
        const decision = await API.decide(
            agentState,
            enemyState,
            environment,
            GameState.missionPrompt,  // Send user prompt instead of coaching sliders
            recentMemories
        );

        this.lastDecision = decision;

        this.thoughtPanel.showThought(decision);

        // Execute the decision
        this.executeAIAction(decision.action);

        // Track action
        this.battleActions.push(decision.action);
    }

    executeAIAction(action) {
        if (!this.player || this.player.health <= 0) return;

        switch (action) {
            case 'ATTACK':
                this.player.attack(this.enemy);
                break;
            case 'DODGE':
                this.player.dodge();
                break;
            case 'BLOCK':
                this.player.block();
                break;
            case 'WAIT_AND_OBSERVE':
                this.player.observe();
                break;
            case 'RETREAT':
                this.player.retreat(this.enemy);
                break;
            case 'JUMP_ATTACK':
                this.player.jumpAttack(this.enemy);
                break;
            case 'MOVE_CLOSER':
                this.player.moveTowards(this.enemy);
                break;
            case 'MOVE_AWAY':
                this.player.moveAway(this.enemy);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    handleCombat(player, enemy) {
        // Combat is handled by individual attack methods
        // This is just for collision detection
    }

    async endBattle(outcome) {
        // Spectacular battle end effects
        if (outcome === 'victory') {
            this.createVictoryEffect();
            this.cameras.main.flash(1000, 100, 255, 100, false, 0.5);
        } else {
            this.createDefeatEffect();
            this.cameras.main.flash(800, 255, 50, 50, false, 0.4);
        }

        // Stop AI decisions
        if (this.aiDecisionTimer) {
            this.aiDecisionTimer.remove();
        }

        // Calculate battle stats
        const battleDuration = Date.now() - this.battleStartTime;

        const battleData = {
            enemy_type: this.enemy.enemyType,
            duration: battleDuration,
            damageTaken: this.damageTaken,
            damageDealt: this.damageDealt,
            actions: this.battleActions.length,
            level: this.levelData.id
        };

        // Get AI reflection (for memory)
        const reflection = await API.reflect(battleData, outcome);

        // Add to memory
        if (reflection.lesson) {
            GameState.memory.push({
                timestamp: new Date().toISOString(),
                memory: reflection.lesson
            });
            await API.saveMemory(reflection.lesson);
        }

        // Transition to Result Scene
        this.scene.start('ResultScene', {
            result: outcome,
            battleData: battleData,
            userPrompt: GameState.missionPrompt,
            levelIndex: this.levelIndex
        });
    }

    showReflection(reflection, outcome) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const panel = this.add.rectangle(width / 2, height / 2, 600, 400, 0x1a1a2e, 0.95);
        panel.setStrokeStyle(3, outcome === 'victory' ? 0x6aa44a : 0xa44a3a);

        const title = this.add.text(width / 2, height / 2 - 150,
            outcome === 'victory' ? '⚔️ VICTORY' : '💀 DEFEAT', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: outcome === 'victory' ? '#6aa44a' : '#a44a3a'
        });
        title.setOrigin(0.5);

        const lessonText = this.add.text(width / 2, height / 2 - 80,
            `Lesson Learned:\n${reflection.lesson}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#e0e0e0',
            align: 'center',
            wordWrap: { width: 550 }
        });
        lessonText.setOrigin(0.5);

        const continueButton = this.add.text(width / 2, height / 2 + 120, '[ CONTINUE ]', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#2a2a4a',
            padding: { x: 20, y: 10 }
        });
        continueButton.setOrigin(0.5);
        continueButton.setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    animateBackground(time) {
        if (this.parallaxCages) {
            this.parallaxCages.x = Math.sin(time * 0.0002) * 12;
        }

        if (this.moon) {
            this.moon.y = this.cameras.main.height * 0.18 + Math.sin(time * 0.0003) * 6;
        }

        if (this.fogLayer) {
            this.fogLayer.x = this.cameras.main.width / 2 + Math.sin(time * 0.00025) * 30;
            this.fogLayer.alpha = 0.18 + Math.sin(time * 0.0005) * 0.06;
        }
    }

    handleArenaFlow(time, delta = 16) {
        if (!this.player || !this.enemy) {
            return;
        }

        const arenaWidth = this.cameras.main.width;
        const dt = delta;
        const playerNearCorner = this.player.x < GameConfig.FIGHT.CORNER_THRESHOLD ||
            this.player.x > arenaWidth - GameConfig.FIGHT.CORNER_THRESHOLD;

        if (playerNearCorner && this.player.body.blocked.down) {
            this.cornerTimers.player += dt;
            if (this.cornerTimers.player > GameConfig.FIGHT.CORNER_TIMEOUT) {
                const direction = this.player.x < arenaWidth / 2 ? 1 : -1;
                this.player.applyCornerEscape(direction);
                this.cornerTimers.player = 0;
            }
        } else {
            this.cornerTimers.player = 0;
        }

        const enemyNearCorner = this.enemy.isNearCorner
            ? this.enemy.isNearCorner(arenaWidth)
            : (this.enemy.x < GameConfig.FIGHT.CORNER_THRESHOLD ||
                this.enemy.x > arenaWidth - GameConfig.FIGHT.CORNER_THRESHOLD);

        if (enemyNearCorner && this.enemy.body.blocked.down) {
            this.cornerTimers.enemy += dt;
            if (this.cornerTimers.enemy > GameConfig.FIGHT.CORNER_TIMEOUT) {
                this.enemy.escapeCorner
                    ? this.enemy.escapeCorner(arenaWidth)
                    : this.enemy.body.setVelocityX(this.enemy.x < arenaWidth / 2 ? 200 : -200);
                this.cornerTimers.enemy = 0;
            }
        } else {
            this.cornerTimers.enemy = 0;
        }

        if (time - this.lastAerialShuffle > GameConfig.FIGHT.AERIAL_COOLDOWN) {
            this.forceAerialMixup();
            this.lastAerialShuffle = time;
        }
    }

    forceAerialMixup() {
        if (this.player && this.player.health > 0 && this.player.body.blocked.down) {
            this.player.requestAerialShuffle();
        }
        if (this.enemy && this.enemy.health > 0 && this.enemy.body.blocked.down && this.enemy.jumpAttack) {
            this.enemy.jumpAttack(this.player);
        }
    }

    triggerSuddenDeath() {
        if (this.suddenDeathTriggered) return;
        this.suddenDeathTriggered = true;

        this.player?.engageFrenzy();
        this.enemy?.enterFrenzy?.();

        this.addFloatingText('FRENZY MODE - FINISH IT!', this.cameras.main.width / 2, 150, '#ff8456');
    }

    addFloatingText(text, x, y, color = '#ffffff') {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color,
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.35)',
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: floatingText,
            y: y - 30,
            alpha: 0,
            duration: 1600,
            ease: 'Sine.easeOut',
            onComplete: () => floatingText.destroy()
        });
    }

    createVictoryEffect() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Victory burst particles
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = Phaser.Math.Between(200, 400);
            const particle = this.add.circle(centerX, centerY, Phaser.Math.Between(4, 8), 0x00ff00, 1);
            particle.setDepth(200);

            this.tweens.add({
                targets: particle,
                x: centerX + Math.cos(angle) * speed,
                y: centerY + Math.sin(angle) * speed,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Victory rings
        for (let i = 0; i < 3; i++) {
            const ring = this.add.circle(centerX, centerY, 20, 0x00ff00, 0);
            ring.setStrokeStyle(5, 0xffff00, 1);
            ring.setDepth(199);

            this.tweens.add({
                targets: ring,
                radius: 300 + (i * 100),
                alpha: 0,
                delay: i * 200,
                duration: 1200,
                ease: 'Cubic.easeOut',
                onComplete: () => ring.destroy()
            });
        }
    }

    createDefeatEffect() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Defeat implosion particles
        for (let i = 0; i < 40; i++) {
            const startX = Phaser.Math.Between(0, this.cameras.main.width);
            const startY = Phaser.Math.Between(0, this.cameras.main.height);
            const particle = this.add.circle(startX, startY, Phaser.Math.Between(3, 6), 0xff0000, 1);
            particle.setDepth(200);

            this.tweens.add({
                targets: particle,
                x: centerX,
                y: centerY,
                alpha: 0,
                scale: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Defeat shockwave
        const wave = this.add.circle(centerX, centerY, 300, 0xff0000, 0);
        wave.setStrokeStyle(6, 0xff0000, 0.8);
        wave.setDepth(199);

        this.tweens.add({
            targets: wave,
            radius: 50,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeIn',
            onComplete: () => wave.destroy()
        });
    }

    update(time, delta) {
        this.animateBackground(time);
        this.handleArenaFlow(time, delta);

        // Update UI
        if (this.playerHealthBar) {
            this.playerHealthBar.update(this.player.health);
        }
        if (this.enemyHealthBar) {
            this.enemyHealthBar.update(this.enemy.health);
        }

        // Update combo display
        if (this.player && this.comboText) {
            const combo = this.player.getComboInfo();
            if (combo.count > 1) {
                this.comboText.setText(`${combo.count}x COMBO • ${Math.round((combo.multiplier - 1) * 100)}% DMG`);
                this.comboText.setAlpha(1);

                // Pulse effect with intensity based on combo
                const pulseIntensity = Math.min(combo.count * 0.03, 0.15);
                const scale = 1 + Math.sin(time * 0.015) * pulseIntensity;
                this.comboText.setScale(scale);

                // Glowing background effect
                if (this.comboGlow) {
                    const glowAlpha = 0.2 + Math.sin(time * 0.01) * 0.1;
                    const glowScale = 1 + combo.count * 0.15;
                    this.comboGlow.setAlpha(glowAlpha);
                    this.comboGlow.setScale(glowScale);
                }

                // Color shift for high combos
                if (combo.count >= 5) {
                    this.comboText.setColor('#c997ff');
                    this.comboText.setStroke('#4b2a60', 5);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0xc997ff);
                } else if (combo.count >= 3) {
                    this.comboText.setColor('#8fb0ff');
                    this.comboText.setStroke('#2c3a57', 5);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0x8fb0ff);
                } else {
                    this.comboText.setColor('#ffd7a8');
                    this.comboText.setStroke('#59402d', 4);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0xffd7a8);
                }
            } else {
                this.comboText.setAlpha(Math.max(0, this.comboText.alpha - 0.02));
                if (this.comboGlow) {
                    this.comboGlow.setAlpha(Math.max(0, this.comboGlow.alpha - 0.02));
                }
            }
        }

        // Check for battle end
        if (this.enemy && this.enemy.health <= 0 && !this.battleEnded) {
            this.battleEnded = true;
            this.endBattle('victory');
        } else if (this.player && this.player.health <= 0 && !this.battleEnded) {
            this.battleEnded = true;
            this.endBattle('defeat');
        }

        // Update enemy AI
        if (this.enemy && this.enemy.health > 0) {
            this.enemy.updateAI(this.player);
        }

        if (this.player) {
            this.player.update(time, delta);
        }

        if (!this.suddenDeathTriggered && Date.now() - this.battleStartTime > GameConfig.FIGHT.FRENZY_TIME) {
            this.triggerSuddenDeath();
        }
    }

    getActivePalette() {
        const fallback = Object.values(GameConfig.PALETTES)[0];
        const palette = GameConfig.PALETTES?.[GameState.currentBiome] || fallback;
        return palette;
    }

    hexToColor(hex) {
        if (!hex) {
            return Phaser.Display.Color.HexStringToColor('#1a1a2e');
        }
        if (!hex.startsWith('#')) {
            hex = `#${hex}`;
        }
        return Phaser.Display.Color.HexStringToColor(hex);
    }
}
