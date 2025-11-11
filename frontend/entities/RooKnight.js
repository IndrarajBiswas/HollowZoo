class RooKnight extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create sprite with rabbit texture
        super(scene, x, y, 'rabbit');

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Scale the sprite
        this.setScale(0.8);
        this.setTint(0x6a8aff); // Blue tint for player

        // Set up physics body
        this.body.setSize(40, 60);
        this.body.setBounce(0.1);
        this.body.setCollideWorldBounds(true);

        // Add state indicator circle
        this.stateIndicator = scene.add.circle(x, y - 40, 8, 0xffffff, 0.7);

        // Stats
        this.maxHealth = GameConfig.PLAYER.HEALTH;
        this.health = this.maxHealth;
        this.energy = GameConfig.PLAYER.ENERGY;
        this.maxEnergy = GameConfig.PLAYER.ENERGY;
        this.attackDamage = GameConfig.PLAYER.ATTACK_DAMAGE || 18;
        this.critMultiplier = GameConfig.PLAYER.CRIT_MULTIPLIER || 1.2;

        // State
        this.isBlocking = false;
        this.isDodging = false;
        this.isAttacking = false;
        this.facingRight = true;
        this.lastAerialTime = 0;
        this.cornerRecoveryTimer = 0;
        this.frenzyActive = false;

        // Combat stats
        this.blockReduction = 0.35;

        // Combo system
        this.comboCount = 0;
        this.lastActionTime = 0;
        this.lastActionType = null;
        this.actionHistory = [];
        this.comboDamageMultiplier = 1.0;
    }

    updateGraphics() {
        // Update state indicator position and color
        this.stateIndicator.setPosition(this.x, this.y - 40);

        if (this.isBlocking) {
            this.stateIndicator.setFillStyle(0xffaa00, 0.8); // Orange for blocking
        } else if (this.isDodging) {
            this.stateIndicator.setFillStyle(0x00aaff, 0.8); // Cyan for dodging
        } else if (this.isAttacking) {
            this.stateIndicator.setFillStyle(0xff0000, 0.8); // Red for attacking
        } else {
            this.stateIndicator.setFillStyle(0xffffff, 0.5); // White for idle
        }

        // Update facing direction
        this.setFlipX(!this.facingRight);
    }

    attack(target) {
        if (this.isAttacking || !target) return;

        this.isAttacking = true;
        this.trackAction('ATTACK');

        // Move towards target
        const direction = target.x > this.x ? 1 : -1;
        this.facingRight = direction > 0;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const closingSpeed = Phaser.Math.Clamp(distance * 2, 180, GameConfig.PLAYER.SPEED * 1.4);
        this.body.setVelocityX(direction * closingSpeed);

        // Deal damage with slight delay so dashes feel weighty
        this.scene.time.delayedCall(140, () => {
            const updatedDistance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            if (updatedDistance < 85) {
                let damage = this.attackDamage * this.comboDamageMultiplier;
                if (updatedDistance < 50 && Math.random() < 0.4) {
                    damage *= this.critMultiplier;
                    this.showFloatingText('CRIT!', 0xff6600);
                    this.scene.cameras.main.shake(100, 0.003);
                }
                target.takeDamage(damage, this.scene);

                // Show combo
                if (this.comboCount > 1) {
                    this.showFloatingText(`${this.comboCount}x COMBO`, 0xffdd00);
                }

                // Impact feedback
                this.scene.cameras.main.shake(80, 0.002);
            }
        });

        // Reset after animation
        this.scene.time.delayedCall(300, () => {
            this.isAttacking = false;
            this.body.setVelocityX(0);
        });

        this.updateGraphics();
    }

    jumpAttack(target) {
        if (!target) return;

        this.trackAction('JUMP_ATTACK');

        const direction = target.x > this.x ? 1 : -1;
        this.facingRight = direction > 0;

        const verticalBoost = GameConfig.PLAYER.JUMP_VELOCITY * 0.8;
        this.body.setVelocityY(verticalBoost);
        this.body.setVelocityX(direction * GameConfig.PLAYER.SPEED);
        this.lastAerialTime = this.scene.time.now;

        this.scene.time.delayedCall(200, () => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            if (distance < 90) {
                let damage = this.attackDamage * 1.6 * this.comboDamageMultiplier;
                target.takeDamage(damage, this.scene);
                this.showFloatingText('AERIAL STRIKE!', 0x00aaff);

                if (this.comboCount > 2) {
                    this.showFloatingText(`${this.comboCount}x COMBO`, 0xffdd00);
                }

                // Heavy impact for aerial attacks
                this.scene.cameras.main.shake(150, 0.005);
            }
        });

        this.updateGraphics();
    }

    dodge() {
        if (this.isDodging) return;

        this.isDodging = true;

        // Quick dash
        const direction = this.facingRight ? 1 : -1;
        const dashDirection = Math.random() > 0.5 ? direction : -direction;
        this.body.setVelocityX(dashDirection * 360);
        if (this.body.blocked.down) {
            this.body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY * 0.4);
        }

        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.body.setVelocityX(0);
        });

        this.updateGraphics();
    }

    block() {
        this.isBlocking = true;

        this.scene.time.delayedCall(1000, () => {
            this.isBlocking = false;
        });

        this.updateGraphics();
    }

    observe() {
        // Stand still and observe
        this.body.setVelocityX(0);
        this.updateGraphics();
    }

    retreat(target) {
        if (!target) return;

        const direction = target.x > this.x ? -1 : 1;
        this.facingRight = direction < 0;
        this.body.setVelocityX(direction * GameConfig.PLAYER.SPEED);
        if (this.body.blocked.down) {
            this.body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY * 0.5);
        }

        this.scene.time.delayedCall(500, () => {
            this.body.setVelocityX(0);
        });

        this.updateGraphics();
    }

    moveTowards(target) {
        if (!target) return;

        const direction = target.x > this.x ? 1 : -1;
        this.facingRight = direction > 0;
        this.body.setVelocityX(direction * GameConfig.PLAYER.SPEED * 0.7);

        this.scene.time.delayedCall(400, () => {
            this.body.setVelocityX(0);
        });

        this.updateGraphics();
    }

    moveAway(target) {
        this.retreat(target);
    }

    takeDamage(amount, scene) {
        let actualDamage = amount;

        if (this.isBlocking) {
            actualDamage *= this.blockReduction;
        }

        if (this.isDodging) {
            actualDamage *= 0.3; // 70% damage reduction while dodging
        }

        this.health = Math.max(0, this.health - actualDamage);

        // Track damage in scene
        if (scene && scene.damageTaken !== undefined) {
            scene.damageTaken += actualDamage;
        }

        // Visual feedback
        this.scene.tweens.add({
            targets: [this, this.stateIndicator],
            alpha: { from: 0.4, to: 1 },
            duration: 150
        });

        console.log(`RooKnight took ${actualDamage.toFixed(1)} damage! Health: ${this.health.toFixed(1)}`);

        return actualDamage;
    }

    applyCornerEscape(direction = 1) {
        this.cornerRecoveryTimer = this.scene.time.now;
        this.body.setVelocityX(direction * GameConfig.PLAYER.SPEED * 1.4);
        if (this.body.blocked.down) {
            this.body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY * 0.85);
        }
    }

    requestAerialShuffle() {
        if (this.scene.time.now - this.lastAerialTime < 1200) return;
        this.body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY * 0.9);
        const direction = Math.random() > 0.5 ? 1 : -1;
        this.body.setVelocityX(direction * GameConfig.PLAYER.SPEED);
        this.lastAerialTime = this.scene.time.now;
    }

    engageFrenzy() {
        if (this.frenzyActive) return;
        this.frenzyActive = true;
        this.attackDamage *= 1.2;
        this.critMultiplier += 0.1;
        this.scene.tweens.add({
            targets: this.stateIndicator,
            radius: 12,
            duration: 250,
            yoyo: true,
            repeat: 3
        });
    }

    trackAction(actionType) {
        const now = this.scene.time.now;
        const timeSinceLastAction = now - this.lastActionTime;

        // Reset combo if too much time passed or same action repeated
        if (timeSinceLastAction > 2000 || actionType === this.lastActionType) {
            this.comboCount = 1;
            this.comboDamageMultiplier = 1.0;
        } else {
            // Build combo for varied actions
            this.comboCount++;
            this.comboDamageMultiplier = Math.min(1.0 + (this.comboCount * 0.1), 1.5); // Max 50% bonus
        }

        this.lastActionTime = now;
        this.lastActionType = actionType;
        this.actionHistory.push({ action: actionType, time: now });

        // Keep only last 10 actions
        if (this.actionHistory.length > 10) {
            this.actionHistory.shift();
        }
    }

    showFloatingText(text, color = 0xffffff) {
        if (!this.scene || !this.scene.add) return;

        const floatText = this.scene.add.text(this.x, this.y - 50, text, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: `#${color.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: floatText,
            y: floatText.y - 40,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => floatText.destroy()
        });
    }

    getComboInfo() {
        return {
            count: this.comboCount,
            multiplier: this.comboDamageMultiplier,
            lastAction: this.lastActionType
        };
    }

    update() {
        // Update graphics position
        this.updateGraphics();

        // Regenerate energy slowly
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.1);
        }
    }
}
