class MentorRunes {
    constructor(scene) {
        this.scene = scene;
        this.runes = [];
        this.tooltip = null;
        this.createUI();
    }

    createUI() {
        const baseX = 140;
        const baseY = 150;

        this.backing = this.scene.add.rectangle(baseX, baseY + 90, 220, 260, 0x0d1424, 0.78)
            .setStrokeStyle(2, 0x283654)
            .setDepth(9);

        this.title = this.scene.add.text(baseX, baseY - 40, 'Mentor Runes', {
            fontSize: '18px',
            fontFamily: 'Space Grotesk',
            color: '#b9c9ff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        const runeConfigs = [
            {
                label: 'Feral',
                icon: '☄',
                parameter: 'aggression',
                tint: 0xffa273,
                tooltip: 'Sharpen RooKnight\'s hunger for pressure and finishing blows.'
            },
            {
                label: 'Cautious',
                icon: '⛯',
                parameter: 'caution',
                tint: 0x9cd5ff,
                tooltip: 'Anchor defensive reflexes, favoring dodges and retreats.'
            },
            {
                label: 'Naturalist',
                icon: '✶',
                parameter: 'curiosity',
                tint: 0xa0ffbf,
                tooltip: 'Encourage adaptive observation and phase reactions.'
            }
        ];

        runeConfigs.forEach((config, idx) => {
            const y = baseY + idx * 90;
            this.createRune(baseX, y, config);
        });

        this.tooltip = this.scene.add.text(baseX, baseY + 210, '', {
            fontSize: '13px',
            fontFamily: 'Space Grotesk',
            color: '#ffd7a8',
            wordWrap: { width: 190 }
        }).setOrigin(0.5, 0).setDepth(10).setAlpha(0);
    }

    createRune(x, y, config) {
        const container = this.scene.add.container(x, y).setDepth(10);

        const circle = this.scene.add.circle(0, 0, 36, 0x121c33, 0.9)
            .setStrokeStyle(2, config.tint, 0.6);

        const ring = this.scene.add.arc(0, 0, 38, 270, 270 + (GameState.coaching[config.parameter] / 100) * 360, false, config.tint, 0.45);
        ring.setStartAngle(270);

        const icon = this.scene.add.text(0, -6, config.icon, {
            fontSize: '28px',
            fontFamily: 'Space Grotesk',
            color: '#f5ead4'
        }).setOrigin(0.5);

        const label = this.scene.add.text(0, 34, `${config.label}`, {
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            color: '#cdd7ff'
        }).setOrigin(0.5);

        const value = this.scene.add.text(0, 52, `${GameState.coaching[config.parameter]}`, {
            fontSize: '12px',
            fontFamily: 'Space Grotesk',
            color: '#9fd6ff'
        }).setOrigin(0.5);

        container.add([circle, ring, icon, label, value]);

        container.setSize(80, 90);
        container.setInteractive(new Phaser.Geom.Circle(0, 0, 45), Phaser.Geom.Circle.Contains);

        container.on('pointerover', () => {
            circle.setStrokeStyle(2, config.tint, 1);
            icon.setColor('#ffeccc');
            if (this.tooltip) {
                this.tooltip.setText(config.tooltip);
                this.tooltip.setAlpha(1);
            }
        });

        container.on('pointerout', () => {
            circle.setStrokeStyle(2, config.tint, 0.6);
            icon.setColor('#f5ead4');
            if (this.tooltip) {
                this.tooltip.setAlpha(0);
            }
        });

        container.on('pointerdown', () => {
            const current = GameState.coaching[config.parameter] ?? 50;
            const next = (current + 25) % 125;
            GameState.coaching[config.parameter] = next > 100 ? 0 : next;
            const valueNumber = GameState.coaching[config.parameter];
            value.setText(valueNumber);
            ring.setStartAngle(270);
            ring.setEndAngle(270 + (valueNumber / 100) * 360);
            this.scene.tweens.add({
                targets: ring,
                alpha: { from: 0.5, to: 0.9 },
                duration: 200,
                yoyo: true
            });
        });

        this.runes.push({ container, ring, value, config });
    }

    getRuneValues() {
        return {
            aggression: GameState.coaching.aggression,
            caution: GameState.coaching.caution,
            curiosity: GameState.coaching.curiosity
        };
    }

    show() {
        if (this.backing) this.backing.setVisible(true);
        this.runes.forEach(({ container }) => container.setVisible(true));
        if (this.title) this.title.setVisible(true);
        if (this.tooltip) this.tooltip.setVisible(true);
    }

    hide() {
        if (this.backing) this.backing.setVisible(false);
        this.runes.forEach(({ container }) => container.setVisible(false));
        if (this.title) this.title.setVisible(false);
        if (this.tooltip) this.tooltip.setVisible(false);
    }
}
