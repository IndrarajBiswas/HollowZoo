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
        this.nameText = this.scene.add.text(this.x, this.y - 10, this.entityName, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#c4a573'
        });

        // Health bar background
        this.barBg = this.scene.add.rectangle(this.x, this.y + 10, 250, 20, 0x1a1d2a);
        this.barBg.setOrigin(0, 0);
        this.barBg.setStrokeStyle(2, 0x4a4a6a);

        // Damage trail bar
        this.damageOverlay = this.scene.add.rectangle(this.x + 2, this.y + 12, 246, 16, 0xa44a3a, 0.5);
        this.damageOverlay.setOrigin(0, 0);

        // Health bar fill
        this.barFill = this.scene.add.rectangle(this.x + 2, this.y + 12, 246, 16, 0x6aa44a);
        this.barFill.setOrigin(0, 0);

        // Health text
        this.healthText = this.scene.add.text(this.x + 125, this.y + 20, `${this.currentHealth}/${this.maxHealth}`, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        this.healthText.setOrigin(0.5);
    }

    update(health) {
        this.currentHealth = Math.max(0, health);
        this.displayHealth = Phaser.Math.Linear(this.displayHealth, this.currentHealth, 0.3);

        // Update bar width
        const targetPercent = this.currentHealth / this.maxHealth;
        this.smoothPercent = Phaser.Math.Linear(this.smoothPercent, targetPercent, 0.25);
        this.damagePercent = Phaser.Math.Linear(this.damagePercent, targetPercent, 0.08);

        this.barFill.width = 246 * this.smoothPercent;
        this.damageOverlay.width = 246 * this.damagePercent;

        // Update text
        this.healthText.setText(`${Math.round(this.currentHealth)}/${this.maxHealth}`);

        // Change color based on health percentage
        if (targetPercent > 0.6) {
            this.barFill.setFillStyle(0x6aa44a); // Green
        } else if (targetPercent > 0.3) {
            this.barFill.setFillStyle(0xc4a573); // Yellow
        } else {
            this.barFill.setFillStyle(0xa44a3a); // Red
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
        this.barBg.destroy();
        this.barFill.destroy();
        this.damageOverlay.destroy();
        this.healthText.destroy();
    }
}
