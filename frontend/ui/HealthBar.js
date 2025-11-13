class HealthBar {
    constructor(scene, x, y, maxHealth, entityName) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.entityName = entityName;

        this.displayHealth = maxHealth;
        this.smoothPercent = 1;
        this.damagePercent = 1;

        this.createUI();
    }

    createUI() {
        // Name label
        this.nameText = this.scene.add.text(this.x, this.y - 16, this.entityName, {
            fontSize: '15px',
            fontFamily: 'Space Grotesk',
            color: '#cdd7ff'
        });

        this.shell = this.scene.add.rectangle(this.x - 6, this.y + 12, 264, 28, 0x0d1424, 0.88)
            .setOrigin(0, 0.5)
            .setStrokeStyle(2, 0x2c3a57);

        this.barBg = this.scene.add.rectangle(this.x, this.y + 12, 240, 18, 0x1b2338, 0.9)
            .setOrigin(0, 0.5);

        this.damageOverlay = this.scene.add.rectangle(this.x, this.y + 12, 240, 18, 0xff9aa8, 0.35)
            .setOrigin(0, 0.5);

        this.barFill = this.scene.add.rectangle(this.x, this.y + 12, 240, 18, 0x8ce8c1, 0.95)
            .setOrigin(0, 0.5);

        this.healthText = this.scene.add.text(this.x + 120, this.y + 12, `${this.currentHealth}/${this.maxHealth}`, {
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4'
        }).setOrigin(0.5);
    }

    update(health) {
        this.currentHealth = Math.max(0, health);
        this.displayHealth = Phaser.Math.Linear(this.displayHealth, this.currentHealth, 0.3);

        // Update bar width
        const targetPercent = this.currentHealth / this.maxHealth;
        this.smoothPercent = Phaser.Math.Linear(this.smoothPercent, targetPercent, 0.25);
        this.damagePercent = Phaser.Math.Linear(this.damagePercent, targetPercent, 0.08);

        this.barFill.width = 240 * this.smoothPercent;
        this.damageOverlay.width = 240 * this.damagePercent;

        // Update text
        this.healthText.setText(`${Math.round(this.currentHealth)}/${this.maxHealth}`);

        // Change color based on health percentage
        if (targetPercent > 0.6) {
            this.barFill.setFillStyle(0x8ce8c1);
        } else if (targetPercent > 0.3) {
            this.barFill.setFillStyle(0xffd48f);
        } else {
            this.barFill.setFillStyle(0xff9aa8);
        }

        // Pulse effect when low health
        if (targetPercent < 0.3 && targetPercent > 0) {
            this.scene.tweens.add({
                targets: this.barFill,
                alpha: 0.6,
                duration: 500,
                yoyo: true,
                repeat: 0
            });
        }
    }

    destroy() {
        this.nameText.destroy();
        this.shell.destroy();
        this.barBg.destroy();
        this.barFill.destroy();
        this.damageOverlay.destroy();
        this.healthText.destroy();
    }
}
