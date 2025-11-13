class ZooScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ZooScene' });
    }

    createAtmosphere() {
        const { width, height } = this.cameras.main;
        this.biomeLighting = this.getBiomeLightingCues();
        const palette = this.biomeLighting.palette || this.getActivePalette();
        const topColor = this.hexToColor(palette[0]);
        const bottomColor = this.hexToColor(palette[1] || palette[0]);
        const accentColor = this.hexToColor(palette[2] || palette[0]).color;
        const glowColor = this.hexToColor(palette[3] || '#ffffff').color;

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
        gradient.setDepth(-14);

        const starfield = this.add.graphics();
        for (let i = 0; i < 80; i++) {
            const radius = Phaser.Math.Between(1, 2);
            starfield.fillStyle(glowColor, Phaser.Math.FloatBetween(0.06, 0.22));
            starfield.fillCircle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(40, height * 0.55),
                radius
            );
        }
        starfield.setDepth(-13).setBlendMode(Phaser.BlendModes.SCREEN);

        const menagerie = this.add.graphics();
        const baseColor = this.hexToColor(palette[0]).color;
        menagerie.fillStyle(baseColor, 0.92);
        const enclosureWidth = 160;
        for (let x = -20; x < width + enclosureWidth; x += enclosureWidth + 60) {
            const heightOffset = Phaser.Math.Between(160, 260);
            menagerie.fillRoundedRect(x, height - heightOffset, enclosureWidth, heightOffset + 30, 18);
        }
        menagerie.fillStyle(this.hexToColor(palette[1] || palette[0]).color, 0.88);
        menagerie.fillEllipse(width * 0.25, height - 210, 260, 120);
        menagerie.fillEllipse(width * 0.68, height - 240, 320, 150);
        menagerie.setDepth(-12);

        this.lightBeams = [];
        for (let i = 0; i < 4; i++) {
            const beam = this.add.rectangle(
                160 + i * 280,
                height / 2,
                220,
                height * 1.4,
                accentColor,
                0.07
            );
            beam.setAngle(-14 + i * 6);
            beam.setBlendMode(Phaser.BlendModes.SCREEN);
            beam.setDepth(-11);
            this.lightBeams.push(beam);
        }

        this.floatingLights = [];
        for (let i = 0; i < 26; i++) {
            const mote = this.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 4),
                Phaser.Math.Between(8, 16),
                glowColor,
                0.2
            );
            mote.setDepth(-9).setBlendMode(Phaser.BlendModes.SCREEN);
            this.floatingLights.push(mote);
            this.tweens.add({
                targets: mote,
                y: mote.y - Phaser.Math.Between(40, 120),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 7200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 1400)
            });
        }

        this.createVolumetricFog(width, height, this.biomeLighting);
        this.createBiomeLightingOverlay(width, height, this.biomeLighting);

        this.backgroundLayers = {
            gradient,
            starfield,
            menagerie
        };
    }

    createVolumetricFog(width, height, lighting) {
        this.volumetricFog = [];
        const fogColors = lighting.fogColors || ['#4b5c70', '#3a4456', '#2a2f3a'];

        fogColors.forEach((hex, index) => {
            const fogColor = this.hexToColor(hex).color;
            const fog = this.add.graphics({
                x: width / 2,
                y: height - (210 - index * 60)
            });
            fog.fillGradientStyle(fogColor, fogColor, fogColor, fogColor,
                0.14 - index * 0.02,
                0.12 - index * 0.02,
                0.08 - index * 0.015,
                0.06 - index * 0.01
            );
            fog.fillEllipse(0, 0, width * (1.4 - index * 0.18), 220 - index * 28);
            fog.setBlendMode(Phaser.BlendModes.ADD);
            fog.setDepth(-10 + index);

            this.volumetricFog.push({
                sprite: fog,
                baseX: fog.x,
                baseY: fog.y,
                sway: 24 + index * 12,
                speed: 0.0003 + index * 0.00012
            });
        });
    }

    createBiomeLightingOverlay(width, height, lighting) {
        const overlayColor = this.hexToColor(lighting.overlayColor || '#1d2533').color;
        const overlayAlpha = lighting.overlayAlpha ?? 0.18;
        const overlay = this.add.rectangle(width / 2, height / 2, width * 1.2, height * 1.2, overlayColor, overlayAlpha);
        overlay.setBlendMode(Phaser.BlendModes.SOFT_LIGHT);
        overlay.setDepth(-7);
        this.biomeOverlay = overlay;
    }

    createHandDrawnForeground() {
        const { width, height } = this.cameras.main;
        const propsTint = this.biomeLighting?.propsTint || 0x2e2218;
        const highlightTint = this.biomeLighting?.highlightTint || 0xa67c52;

        this.foregroundDecor = this.add.container(0, 0).setDepth(4);

        const leftSketch = this.add.graphics();
        leftSketch.lineStyle(6, propsTint, 0.65);
        leftSketch.beginPath();
        leftSketch.moveTo(48, height);
        leftSketch.quadraticCurveTo(140, height - 260, 78, height - 520);
        leftSketch.quadraticCurveTo(36, height - 600, 60, height - 720);
        leftSketch.strokePath();
        leftSketch.fillStyle(propsTint, 0.55);
        leftSketch.fillCircle(62, height - 420, 28);
        leftSketch.fillCircle(52, height - 320, 18);

        const rightGates = this.add.graphics();
        rightGates.lineStyle(5, propsTint, 0.8);
        rightGates.strokeRoundedRect(width - 140, height - 280, 110, 220, 26);
        rightGates.lineStyle(3, highlightTint, 0.6);
        rightGates.strokePath();
        rightGates.fillStyle(propsTint, 0.45);
        rightGates.fillRect(width - 124, height - 268, 18, 160);
        rightGates.fillRect(width - 78, height - 268, 18, 160);

        const signPost = this.add.graphics({ x: width / 2 - 320, y: height - 220 });
        signPost.fillStyle(propsTint, 0.85);
        signPost.fillRect(-6, -120, 12, 160);
        signPost.fillRoundedRect(-120, -160, 240, 90, 18);
        signPost.lineStyle(3, highlightTint, 0.6);
        signPost.strokeRoundedRect(-120, -160, 240, 90, 18);
        const signText = this.add.text(signPost.x, signPost.y - 130, 'Sanctuary Gate', {
            fontFamily: 'Cinzel Decorative, "IBM Plex Serif", serif',
            fontSize: '20px',
            color: '#281a12',
            align: 'center'
        }).setOrigin(0.5);

        const hangingLantern = this.add.graphics({ x: width - 220, y: height - 560 });
        hangingLantern.lineStyle(3, propsTint, 0.7);
        hangingLantern.beginPath();
        hangingLantern.moveTo(0, -40);
        hangingLantern.lineTo(0, 60);
        hangingLantern.strokePath();
        hangingLantern.fillStyle(highlightTint, 0.85);
        hangingLantern.fillRoundedRect(-28, 60, 56, 72, 16);
        const lanternGlow = this.add.ellipse(width - 220, height - 440, 160, 120, highlightTint, 0.12)
            .setBlendMode(Phaser.BlendModes.ADD);

        const foregroundMist = this.add.graphics({ x: width / 2, y: height - 40 });
        const mistColor = this.hexToColor(this.biomeLighting?.foregroundFog || '#9ca9c4').color;
        foregroundMist.fillGradientStyle(mistColor, mistColor, mistColor, mistColor, 0.2, 0.16, 0.08, 0.05);
        foregroundMist.fillEllipse(0, 0, width * 1.4, 180);
        foregroundMist.setBlendMode(Phaser.BlendModes.SCREEN).setAlpha(0.22);
        this.foregroundFog = foregroundMist;

        this.foregroundDecor.add([
            leftSketch,
            rightGates,
            signPost,
            signText,
            hangingLantern,
            lanternGlow,
            foregroundMist
        ]);

        this.tweens.add({
            targets: lanternGlow,
            alpha: {
                getStart: () => 0.1,
                getEnd: () => 0.24
            },
            duration: 2600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    getBiomeLightingCues() {
        const biome = (GameState.currentBiome || '').toLowerCase();
        const cues = {
            desert: {
                palette: ['#1a0f08', '#342013', '#d6a15b', '#f5deb3'],
                fogColors: ['#c9924a', '#a96a2c', '#7e4f24'],
                overlayColor: '#5c371e',
                overlayAlpha: 0.16,
                propsTint: 0x5b3a20,
                highlightTint: 0xf0c07a,
                foregroundFog: '#d0a87c',
                platforms: {
                    ground: '#5b3d28',
                    platform: '#704d2a',
                    perch: '#8a6c42'
                }
            },
            rainforest: {
                palette: ['#04140d', '#123326', '#4ea38a', '#d2f1e4'],
                fogColors: ['#3c7f68', '#2f6c57', '#1d4c3d'],
                overlayColor: '#1c3b2e',
                overlayAlpha: 0.22,
                propsTint: 0x1d3a2e,
                highlightTint: 0x7fcbb0,
                foregroundFog: '#6eb29a',
                platforms: {
                    ground: '#264938',
                    platform: '#1f3a2d',
                    perch: '#3d5c4a'
                }
            },
            tundra: {
                palette: ['#0b1320', '#1a2d45', '#6c86b8', '#d6e9ff'],
                fogColors: ['#9fb8d8', '#6f87aa', '#4b5d79'],
                overlayColor: '#23354d',
                overlayAlpha: 0.2,
                propsTint: 0x2a3a55,
                highlightTint: 0xb6d4f7,
                foregroundFog: '#bcd0ea',
                platforms: {
                    ground: '#2f3f58',
                    platform: '#3f5674',
                    perch: '#546c8c'
                }
            }
        };

        return cues[biome] || {
            palette: ['#05070c', '#142033', '#3a4d63', '#c7d7f2'],
            fogColors: ['#54627a', '#3e485a', '#2b333f'],
            overlayColor: '#1a2534',
            overlayAlpha: 0.2,
            propsTint: 0x2e2218,
            highlightTint: 0xa67c52,
            foregroundFog: '#9ca9c4',
            platforms: {
                ground: '#2a3243',
                platform: '#394558',
                perch: '#485369'
            }
        };
    }

    create() {
        this.levelData = GameConfig.LEVELS[GameState.currentLevelIndex] || GameConfig.LEVELS[0];
        GameState.currentBiome = this.levelData.biome;

        this.createAtmosphere();
        this.setupWorld();
        this.createPlatforms();
        this.createHandDrawnForeground();
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
            fontSize: '18px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: '#f1e5cc',
            shadow: {
                offsetX: 0,
                offsetY: 2,
                color: 'rgba(0,0,0,0.65)',
                blur: 6,
                fill: true
            }
        }).setDepth(5);
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const worldWidth = this.cameras.main.width;
        const palette = this.biomeLighting?.platforms || {};
        const groundColor = this.hexToColor(palette.ground || '#2a2f3f').color;
        const platformColor = this.hexToColor(palette.platform || '#3a4358').color;
        const perchColor = this.hexToColor(palette.perch || '#454f6a').color;

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
                fontSize: '16px',
                fontFamily: '"IBM Plex Serif", Georgia, serif',
                color: '#f1e8d2',
                backgroundColor: 'rgba(20, 24, 32, 0.68)',
                padding: { x: 10, y: 8 },
                wordWrap: { width: 800 }
            }
        ).setDepth(5);

        // Create AI thought panel
        this.thoughtPanel = new AIThoughtPanel(this);

        this.levelBadge = this.add.text(20, 150,
            `Difficulty: ${this.levelData.title}\n${this.levelData.description}`, {
            fontSize: '16px',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            color: '#d4e0ff',
            backgroundColor: 'rgba(14, 18, 30, 0.68)',
            padding: { x: 10, y: 6 }
        }).setDepth(5);

        // Create health bars
        this.playerHealthBar = new HealthBar(this, 20, 110, this.player.health, 'RooKnight');
        this.enemyHealthBar = new HealthBar(this, this.cameras.main.width - 280, 110, this.enemy.health, this.enemy.enemyType);

        // Combo display with glow
        this.comboGlow = this.add.circle(this.cameras.main.width / 2, 30, 80, 0xffdd00, 0);
        this.comboGlow.setDepth(9).setBlendMode(Phaser.BlendModes.ADD);

        this.comboText = this.add.text(this.cameras.main.width / 2, 30, '', {
            fontSize: '36px',
            fontFamily: 'Impact, monospace',
            color: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#ff4400',
            strokeThickness: 6
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
        if (this.lightBeams) {
            this.lightBeams.forEach((beam, index) => {
                beam.alpha = 0.06 + Math.sin(time * 0.0006 + index) * 0.025;
            });
        }

        if (this.backgroundLayers?.menagerie) {
            this.backgroundLayers.menagerie.x = Math.sin(time * 0.00018) * 10;
        }

        if (this.volumetricFog) {
            this.volumetricFog.forEach((fog, index) => {
                fog.sprite.x = fog.baseX + Math.sin(time * fog.speed + index) * fog.sway;
                fog.sprite.alpha = 0.1 + Math.abs(Math.sin(time * (fog.speed * 1200) + index)) * 0.12;
            });
        }

        if (this.foregroundFog) {
            this.foregroundFog.alpha = 0.18 + Math.sin(time * 0.0008) * 0.06;
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
                    this.comboText.setColor('#ff00ff');
                    this.comboText.setStroke('#ff0000', 6);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0xff00ff);
                } else if (combo.count >= 3) {
                    this.comboText.setColor('#ff8800');
                    this.comboText.setStroke('#ff4400', 6);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0xff8800);
                } else {
                    this.comboText.setColor('#ffdd00');
                    this.comboText.setStroke('#ff4400', 6);
                    if (this.comboGlow) this.comboGlow.setFillStyle(0xffdd00);
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
