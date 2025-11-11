class MentorRunes {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
    }

    createUI() {
        const startX = 16;
        const startY = 120;
        const spacing = 100;

        // Panel background
        this.panel = this.scene.add.rectangle(startX + 150, startY + 80, 320, 220, 0x1a1a2e, 0.9);
        this.panel.setOrigin(0, 0);
        this.panel.setStrokeStyle(2, 0x4a4a6a);

        // Title
        this.title = this.scene.add.text(startX + 160, startY + 90, 'MENTOR RUNES', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#8a7a6a'
        });

        // Create three rune controls
        this.createRune('Feral', '🩸', 'aggression', startX + 170, startY + 130);
        this.createRune('Cautious', '🛡️', 'caution', startX + 170, startY + 190);
        this.createRune('Naturalist', '🌿', 'curiosity', startX + 170, startY + 250);
    }

    createRune(name, icon, parameter, x, y) {
        // Rune icon/label
        const runeText = this.scene.add.text(x, y, `${icon} ${name}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#c4a573'
        });

        // Value display
        const valueText = this.scene.add.text(x + 250, y, GameState.coaching[parameter], {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // Slider bar background
        const sliderBg = this.scene.add.rectangle(x, y + 25, 200, 10, 0x3a3a4a);
        sliderBg.setOrigin(0, 0.5);

        // Slider fill
        const sliderFill = this.scene.add.rectangle(
            x,
            y + 25,
            (GameState.coaching[parameter] / 100) * 200,
            10,
            0x8a7a6a
        );
        sliderFill.setOrigin(0, 0.5);

        // Slider handle
        const handle = this.scene.add.circle(
            x + (GameState.coaching[parameter] / 100) * 200,
            y + 25,
            8,
            0xc4a573
        );
        handle.setInteractive({ draggable: true, useHandCursor: true });

        // Drag functionality
        handle.on('drag', (pointer, dragX) => {
            const minX = x;
            const maxX = x + 200;
            const newX = Phaser.Math.Clamp(dragX, minX, maxX);

            handle.x = newX;
            const value = Math.round(((newX - x) / 200) * 100);

            // Update coaching value
            GameState.coaching[parameter] = value;

            // Update visuals
            valueText.setText(value);
            sliderFill.width = (value / 100) * 200;
        });

        // Store references for later
        this[`${parameter}Value`] = valueText;
        this[`${parameter}Fill`] = sliderFill;
        this[`${parameter}Handle`] = handle;
    }

    show() {
        this.panel.setVisible(true);
        this.title.setVisible(true);
        // Show all rune elements
    }

    hide() {
        this.panel.setVisible(false);
        this.title.setVisible(false);
        // Hide all rune elements
    }
}
