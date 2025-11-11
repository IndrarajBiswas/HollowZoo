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
        const glowColor = this.hexToColor(palette[3] || '#ffffff').color;

        // Layered gradient sky
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
        gradient.setDepth(-10);

        // Background silhouettes
        const silhouettes = this.add.graphics();
        silhouettes.fillStyle(this.hexToColor(palette[0]).color, 0.9);
        const cageWidth = 140;
        for (let i = 0; i < width; i += cageWidth + 80) {
            silhouettes.fillRect(i, height - 220, cageWidth, 220);
        }
        silhouettes.fillStyle(this.hexToColor(palette[1] || palette[0]).color, 0.9);
        silhouettes.fillEllipse(width * 0.2, height - 180, 220, 90);
        silhouettes.fillEllipse(width * 0.7, height - 200, 260, 110);
        silhouettes.setDepth(-9);

        // Glowing light beams
        this.lightBeams = [];
        for (let i = 0; i < 3; i++) {
            const beam = this.add.rectangle(
                200 + i * 320,
                height / 2,
                200,
                height,
                accentColor,
                0.08
            );
            beam.setAngle(-12 + i * 4);
            beam.setBlendMode(Phaser.BlendModes.SCREEN);
            beam.setDepth(-8);
            this.lightBeams.push(beam);
        }

        // Floating embers (manual sprites instead of deprecated particle manager)
        this.floatingLights = [];
        for (let i = 0; i < 20; i++) {
            const light = this.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                3,
                12,
                glowColor,
                0.28
            );
            light.setDepth(-7);
            this.floatingLights.push(light);

            this.tweens.add({
                targets: light,
                y: light.y - Phaser.Math.Between(30, 80),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 7000),
                repeat: -1,
                yoyo: true,
                delay: Phaser.Math.Between(0, 1500)
            });
        }

        this.backgroundLayers = {
            gradient,
            silhouettes
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
        // Set background color based on biome
        this.cameras.main.setBackgroundColor(GameConfig.COLORS.BACKGROUND);

        // Add biome info text
        this.biomeText = this.add.text(20, 20,
            `Zone: ${GameState.currentBiome} • Level ${this.levelData.id}: ${this.levelData.title}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#c6b28a'
        }).setDepth(5);
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const worldWidth = this.cameras.main.width;
        const palette = this.getActivePalette();
        const groundColor = this.hexToColor(palette[1] || '#2a2f3f').color;
        const platformColor = this.hexToColor(palette[2] || '#3a4358').color;
        const perchColor = this.hexToColor(palette[3] || '#454f6a').color;

        // Ground
        const ground = this.add.rectangle(worldWidth / 2, 720, worldWidth, 120, groundColor);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Platforms
        const platform1 = this.add.rectangle(260, 520, 220, 22, platformColor);
        this.physics.add.existing(platform1, true);
        this.platforms.add(platform1);

        const platform2 = this.add.rectangle(worldWidth - 260, 420, 220, 22, platformColor);
        this.physics.add.existing(platform2, true);
        this.platforms.add(platform2);

        const platform3 = this.add.rectangle(worldWidth / 2, 320, 180, 18, perchColor);
        this.physics.add.existing(platform3, true);
        this.platforms.add(platform3);

        const platform4 = this.add.rectangle(worldWidth / 2 - 200, 260, 120, 16, perchColor);
        this.physics.add.existing(platform4, true);
        this.platforms.add(platform4);

        const platform5 = this.add.rectangle(worldWidth / 2 + 200, 260, 120, 16, perchColor);
        this.physics.add.existing(platform5, true);
        this.platforms.add(platform5);
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
        // Display user's tactical prompt
        this.promptDisplay = this.add.text(20, 50,
            `Instructions: ${GameState.missionPrompt.substring(0, 100)}${GameState.missionPrompt.length > 100 ? '...' : ''}`,
            {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#8a7a6a',
                backgroundColor: 'rgba(26, 26, 46, 0.7)',
                padding: { x: 10, y: 8 },
                wordWrap: { width: 800 }
            }
        ).setDepth(5);

        // Create AI thought panel
        this.thoughtPanel = new AIThoughtPanel(this);

        this.levelBadge = this.add.text(20, 150,
            `Difficulty: ${this.levelData.title}\n${this.levelData.description}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#9ab4ff',
            backgroundColor: 'rgba(10,10,20,0.7)',
            padding: { x: 10, y: 6 }
        }).setDepth(5);

        // Create health bars
        this.playerHealthBar = new HealthBar(this, 20, 110, this.player.health, 'RooKnight');
        this.enemyHealthBar = new HealthBar(this, this.cameras.main.width - 280, 110, this.enemy.health, this.enemy.enemyType);

        // Combo display
        this.comboText = this.add.text(this.cameras.main.width / 2, 20, '', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10).setAlpha(0);
    }

    setupAI() {
        // AI decision loop
        const interval = (this.levelData.modifiers?.aiInterval) || GameConfig.AI_DECISION_INTERVAL;
        this.aiDecisionTimer = this.time.addEvent({
            delay: interval,
            callback: this.makeAIDecision,
            callbackScope: this,
            loop: true
        });

        this.lastDecision = null;
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
            hazards: 'none'
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

        // Display AI reasoning
        this.thoughtPanel.showThought(decision.reasoning, decision.confidence);

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
        if (this.lightBeams) {
            this.lightBeams.forEach((beam, index) => {
                beam.alpha = 0.08 + Math.sin(time * 0.0005 + index) * 0.02;
            });
        }

        if (this.backgroundLayers?.silhouettes) {
            this.backgroundLayers.silhouettes.x = Math.sin(time * 0.0002) * 8;
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

                // Pulse effect
                const scale = 1 + Math.sin(time * 0.01) * 0.1;
                this.comboText.setScale(scale);
            } else {
                this.comboText.setAlpha(Math.max(0, this.comboText.alpha - 0.02));
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
        const palette = GameConfig.PALETTES?.[GameState.currentBiome] || GameConfig.PALETTES.RooSanctum;
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
