export default class Agent {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create physics sprite (for now, using a colored rectangle)
        this.sprite = scene.physics.add.sprite(x, y, null);

        // Create a simple visual representation
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x00d9ff, 1);
        graphics.fillRect(0, 0, 40, 60);
        graphics.generateTexture('agent-sprite', 40, 60);
        graphics.destroy();

        this.sprite.setTexture('agent-sprite');

        // Physics properties
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0.1);
        this.sprite.setGravityY(0); // Gravity is set globally

        // Game properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.isAttacking = false;
        this.isDefending = false;
        this.isDead = false;

        // Add name label
        this.nameText = scene.add.text(x, y - 50, 'THUNDER (AI)', {
            fontSize: '14px',
            fontFamily: 'Courier New',
            color: '#00d9ff',
            backgroundColor: '#0a0e27',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
    }

    update() {
        if (this.isDead) return;

        // Update name position
        this.nameText.setPosition(this.sprite.x, this.sprite.y - 50);

        // Regenerate energy over time
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.1);
        }

        // Reset defending state
        if (this.isDefending) {
            this.sprite.setTint(0xffffff);
            this.isDefending = false;
        }
    }

    attack() {
        if (this.isDead || this.isAttacking || this.energy < 10) return false;

        this.isAttacking = true;
        this.energy -= 10;

        // Simple attack animation - flash and move forward
        const originalX = this.sprite.x;
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + 30,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                this.sprite.x = originalX;
                this.isAttacking = false;
            }
        });

        // Flash effect
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.sprite.setTint(0xffffff);
        });

        return true;
    }

    defend() {
        if (this.isDead) return false;

        this.isDefending = true;
        this.energy = Math.max(0, this.energy - 2);

        // Visual feedback for defending
        this.sprite.setTint(0xffff00);

        return true;
    }

    jump() {
        if (this.isDead || !this.sprite.body.touching.down || this.energy < 5) return false;

        this.energy -= 5;
        this.sprite.setVelocityY(-400);

        return true;
    }

    takeDamage(amount) {
        if (this.isDead) return;

        // Reduce damage if defending
        const actualDamage = this.isDefending ? amount * 0.3 : amount;

        this.health = Math.max(0, this.health - actualDamage);

        // Visual feedback
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            if (!this.isDefending) {
                this.sprite.setTint(0xffffff);
            }
        });

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
            angle: 90,
            y: this.sprite.y + 50,
            duration: 1000,
            onComplete: () => {
                this.sprite.setVisible(false);
            }
        });

        this.nameText.setVisible(false);
    }

    isOnGround() {
        return this.sprite.body.touching.down;
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
