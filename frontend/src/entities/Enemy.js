export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create physics sprite (for now, using a colored rectangle)
        this.sprite = scene.physics.add.sprite(x, y, null);

        // Create a simple visual representation
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(0, 0, 40, 60);
        graphics.generateTexture('enemy-sprite', 40, 60);
        graphics.destroy();

        this.sprite.setTexture('enemy-sprite');

        // Physics properties
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.1);

        // Game properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.isAttacking = false;
        this.isDead = false;
        this.lastActionTime = 0;
        this.actionCooldown = 2000; // 2 seconds between actions

        // Add name label
        this.nameText = scene.add.text(x, y - 50, 'OPPONENT', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#ff0000',
            backgroundColor: '#0a0e27',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
    }

    update(time, agentX) {
        if (this.isDead) return;

        // Update name position
        this.nameText.setPosition(this.sprite.x, this.sprite.y - 50);

        // Simple AI behavior - attack if close and cooldown is ready
        if (time - this.lastActionTime > this.actionCooldown) {
            const distance = Math.abs(this.sprite.x - agentX);

            if (distance < 100 && this.sprite.body.touching.down) {
                // Random action: 70% attack, 30% jump
                if (Math.random() < 0.7) {
                    this.attack();
                } else {
                    this.jump();
                }
                this.lastActionTime = time;
            } else if (distance > 100 && distance < 300) {
                // If too far, occasionally jump to close distance
                if (Math.random() < 0.3 && this.sprite.body.touching.down) {
                    this.jump();
                    this.lastActionTime = time;
                }
            }
        }

        // Simple movement towards agent
        if (!this.isAttacking && !this.isDead) {
            const distance = this.sprite.x - agentX;
            if (Math.abs(distance) > 80) {
                const moveSpeed = 100;
                this.sprite.setVelocityX(distance > 0 ? -moveSpeed : moveSpeed);
            } else {
                this.sprite.setVelocityX(0);
            }
        }
    }

    attack() {
        if (this.isDead || this.isAttacking) return false;

        this.isAttacking = true;

        // Simple attack animation - flash and move forward
        const originalX = this.sprite.x;
        const direction = this.sprite.body.velocity.x >= 0 ? 1 : -1;

        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + (30 * direction),
            duration: 150,
            yoyo: true,
            onComplete: () => {
                this.sprite.x = originalX;
                this.isAttacking = false;
            }
        });

        // Flash effect
        this.sprite.setTint(0xffff00);
        this.scene.time.delayedCall(150, () => {
            this.sprite.setTint(0xffffff);
        });

        return true;
    }

    jump() {
        if (this.isDead || !this.sprite.body.touching.down) return false;

        this.sprite.setVelocityY(-350);
        return true;
    }

    takeDamage(amount) {
        if (this.isDead) return;

        this.health = Math.max(0, this.health - amount);

        // Visual feedback
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.sprite.setTint(0xffffff);
        });

        // Knockback
        const knockbackDirection = this.sprite.x > 640 ? 1 : -1;
        this.sprite.setVelocityX(knockbackDirection * 100);

        // Check for death
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.health = 0;

        // Death animation
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            angle: -90,
            y: this.sprite.y + 50,
            duration: 1000,
            onComplete: () => {
                this.sprite.setVisible(false);
            }
        });

        this.nameText.setVisible(false);
    }

    getX() {
        return this.sprite.x;
    }

    getY() {
        return this.sprite.y;
    }

    destroy() {
        this.sprite.destroy();
        this.nameText.destroy();
    }
}
