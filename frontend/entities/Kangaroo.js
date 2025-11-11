class Kangaroo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyType = 'Scout Roo', modifiers = {}) {
        // Choose sprite based on enemy type
        const spriteKey = enemyType.includes('Alpha') ? 'gorilla' :
                         enemyType.includes('Brute') ? 'elephant' :
                         enemyType.includes('King') ? 'rhino' :
                         'bear';

        super(scene, x, y, spriteKey);

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Scale and tint for enemy
        this.setScale(0.75);
        this.setTint(0xff8844); // Orange/red tint for enemies

        // Set up physics body
        this.body.setSize(45, 65);
        this.body.setBounce(0.1);
        this.body.setCollideWorldBounds(true);

        // Enemy type and stats - set defaults first, then load from API
        this.enemyType = enemyType;
        this.modifiers = modifiers || {};
        this.setDefaultStats();  // Set immediately so healthbar can access
        this.loadEnemyStats();   // Then override with API data if available

        // State indicator
        this.stateIndicator = scene.add.circle(x, y - 45, 6, 0xff4444, 0.6);

        // AI state
        this.currentState = 'idle';
        this.stateTimer = 0;
        this.attackCooldown = 0;
        this.facingRight = false;

        // Combat
        this.lastAttackTime = 0;
        this.baseDamage = GameConfig.ENEMY.DAMAGE || 16;
        this.damageVariance = 6;
        this.frenzyActive = false;
        this.lastCornerEscape = 0;
        this.lastVerticalShuffle = 0;
    }

    async loadEnemyStats() {
        try {
            const enemies = await API.getEnemyTypes();
            const enemyData = enemies[this.enemyType];

            if (enemyData) {
                this.maxHealth = enemyData.health || GameConfig.ENEMY.BASE_HEALTH || 90;
                this.health = this.maxHealth;
                this.speed = this.getSpeedValue(enemyData.speed);
                this.attackPattern = enemyData.attack_pattern;
                this.abilities = enemyData.abilities || [];
                this.aggression = enemyData.aggression || 50;
                this.intelligence = enemyData.intelligence || 50;
                this.baseDamage = enemyData.damage || GameConfig.ENEMY.DAMAGE || 16;
                this.applyModifiers();
            } else {
                this.setDefaultStats();
            }
        } catch (error) {
            console.warn('Could not load enemy stats, using defaults');
            this.setDefaultStats();
        }
    }

    setDefaultStats() {
        this.maxHealth = GameConfig.ENEMY.BASE_HEALTH || 90;
        this.health = this.maxHealth;
        this.speed = 110;
        this.attackPattern = 'Basic attack';
        this.abilities = ['Attack', 'Jump'];
        this.aggression = 65;
        this.intelligence = 50;
        this.baseDamage = GameConfig.ENEMY.DAMAGE || 18;
        this.applyModifiers();
    }

    getSpeedValue(speedString) {
        switch (speedString) {
            case 'high': return 150;
            case 'medium': return 100;
            case 'low': return 60;
            default: return 100;
        }
    }

    updateGraphics() {
        // Update state indicator
        this.stateIndicator.setPosition(this.x, this.y - 45);

        if (this.currentState === 'attacking') {
            this.stateIndicator.setFillStyle(0xff0000, 1.0);
            this.stateIndicator.setRadius(10);
        } else if (this.currentState === 'moving') {
            this.stateIndicator.setFillStyle(0xffaa00, 0.7);
            this.stateIndicator.setRadius(6);
        } else {
            this.stateIndicator.setFillStyle(0xff4444, 0.5);
            this.stateIndicator.setRadius(6);
        }

        // Update facing direction
        this.setFlipX(!this.facingRight);
    }

    updateAI(target) {
        if (!target || this.health <= 0) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const arenaWidth = this.scene.scale.width;

        // Update facing direction
        this.facingRight = target.x < this.x;

        // Simple AI behavior based on distance and aggression
        if (distance < 60 && this.attackCooldown <= 0) {
            this.attack(target);
        } else if (distance > 200) {
            this.moveTowards(target);
        } else if (distance > 100) {
            // Random behavior based on intelligence
            if (Math.random() * 100 < this.aggression) {
                this.moveTowards(target);
            } else {
                this.currentState = 'observing';
            }
        } else {
            // In medium range - circle or prepare attack
            if (Math.random() < 0.5) {
                this.circle(target);
            }
        }

        // Add aerial movement to avoid camping
        if (this.body.blocked.down && (this.scene.time.now - this.lastVerticalShuffle) > 2000) {
            if (Math.random() < 0.2 || this.isNearCorner(arenaWidth)) {
                this.jumpAttack(target);
                this.lastVerticalShuffle = this.scene.time.now;
            }
        }

        if (this.isNearCorner(arenaWidth) && (this.scene.time.now - this.lastCornerEscape) > 800) {
            this.escapeCorner(arenaWidth);
        }

        if (!this.frenzyActive && this.health < this.maxHealth * 0.35) {
            this.enterFrenzy();
        }

        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        this.updateGraphics();
    }

    moveTowards(target) {
        this.currentState = 'moving';
        const direction = target.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * this.speed);
    }

    circle(target) {
        this.currentState = 'circling';
        // Move perpendicular to target
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const perpAngle = angle + Math.PI / 2;
        const vx = Math.cos(perpAngle) * this.speed * 0.7;
        this.body.setVelocityX(vx);
    }

    attack(target) {
        if (Date.now() - this.lastAttackTime < 1500) return;

        this.currentState = 'attacking';
        this.lastAttackTime = Date.now();
        this.attackCooldown = 60; // ~1 second at 60fps

        // Lunge towards target
        const direction = target.x > this.x ? 1 : -1;
        this.body.setVelocityX(direction * this.speed * 1.5);

        // Deal damage
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        if (distance < 90) {
            const damage = this.baseDamage + Math.random() * this.damageVariance;
            target.takeDamage(damage, this.scene);
        }

        // Return to normal state
        this.scene.time.delayedCall(400, () => {
            this.currentState = 'idle';
            this.body.setVelocityX(0);
        });

        this.updateGraphics();
    }

    jumpAttack(target) {
        this.currentState = 'jumping';

        const direction = target.x > this.x ? 1 : -1;
        this.body.setVelocityY(GameConfig.ENEMY.LEAP_FORCE || -320);
        this.body.setVelocityX(direction * this.speed * 1.1);

        this.scene.time.delayedCall(300, () => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            if (distance < 80) {
                target.takeDamage(this.baseDamage * 1.05, this.scene);
            }
            this.currentState = 'idle';
        });
    }

    takeDamage(amount, scene) {
        this.health = Math.max(0, this.health - amount);

        // Track damage in scene
        if (scene && scene.damageDealt !== undefined) {
            scene.damageDealt += amount;
        }

        // Visual feedback
        this.scene.tweens.add({
            targets: [this, this.stateIndicator],
            alpha: { from: 0.4, to: 1 },
            duration: 120
        });

        // Become more aggressive when damaged
        if (this.health < this.maxHealth * 0.5) {
            this.aggression = Math.min(100, this.aggression + 10);
        }

        console.log(`${this.enemyType} took ${amount.toFixed(1)} damage! Health: ${this.health.toFixed(1)}`);

        return amount;
    }

    update() {
        this.updateGraphics();
    }

    applyModifiers() {
        if (!this.modifiers) return;
        if (this.modifiers.enemyHealth) {
            this.maxHealth = Math.round(this.maxHealth * this.modifiers.enemyHealth);
            this.health = this.maxHealth;
        }
        if (this.modifiers.enemyDamage) {
            this.baseDamage = Math.round(this.baseDamage * this.modifiers.enemyDamage);
        }
        if (this.modifiers.enemySpeed) {
            this.speed = Math.round(this.speed * this.modifiers.enemySpeed);
        }
        if (this.modifiers.aggressionBonus) {
            this.aggression = Math.min(100, this.aggression + this.modifiers.aggressionBonus);
        }
    }

    isNearCorner(arenaWidth) {
        const threshold = GameConfig.FIGHT?.CORNER_THRESHOLD || 140;
        return this.x < threshold || this.x > arenaWidth - threshold;
    }

    escapeCorner(arenaWidth) {
        this.lastCornerEscape = this.scene.time.now;
        const direction = this.x < arenaWidth / 2 ? 1 : -1;
        this.body.setVelocityX(direction * this.speed * 1.6);
        if (this.body.blocked.down) {
            this.body.setVelocityY((GameConfig.ENEMY.LEAP_FORCE || -320) * 0.8);
        }
    }

    enterFrenzy() {
        this.frenzyActive = true;
        this.baseDamage *= 1.2;
        this.speed *= 1.1;
        this.aggression = Math.min(100, this.aggression + 20);

        this.scene.tweens.add({
            targets: this.stateIndicator,
            fillAlpha: { from: 0.6, to: 1 },
            duration: 200,
            yoyo: true,
            repeat: 4
        });
    }
}
