class AIThoughtPanel {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
    }

    createUI() {
        const width = this.scene.cameras.main.width;

        // Panel position at bottom of screen
        const panelX = width / 2;
        const panelY = this.scene.cameras.main.height - 80;

        // Background panel
        this.panel = this.scene.add.rectangle(panelX, panelY, 900, 120, 0x1a1a2e, 0.85);
        this.panel.setStrokeStyle(2, 0x4a4a6a);

        // Thought icon
        this.icon = this.scene.add.text(panelX - 430, panelY - 35, '💭', {
            fontSize: '32px'
        });

        // Title
        this.title = this.scene.add.text(panelX - 390, panelY - 45, 'RooKnight\'s Thoughts:', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#8a7a6a'
        });

        // Thought text
        this.thoughtText = this.scene.add.text(panelX - 390, panelY - 20, 'Awaiting orders...', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff',
            wordWrap: { width: 750 }
        });

        // Confidence bar
        this.confidenceLabel = this.scene.add.text(panelX - 390, panelY + 20, 'Confidence:', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#6a6a8a'
        });

        this.confidenceBarBg = this.scene.add.rectangle(panelX - 300, panelY + 28, 200, 10, 0x3a3a4a);
        this.confidenceBarBg.setOrigin(0, 0.5);

        this.confidenceBar = this.scene.add.rectangle(panelX - 300, panelY + 28, 100, 10, 0x6aa44a);
        this.confidenceBar.setOrigin(0, 0.5);

        this.confidenceValue = this.scene.add.text(panelX - 85, panelY + 20, '50%', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
    }

    showThought(reasoning, confidence) {
        if (!reasoning) return;

        // Update thought text
        this.thoughtText.setText(reasoning);

        // Update confidence bar
        const confidencePercent = Math.round(confidence * 100);
        this.confidenceValue.setText(`${confidencePercent}%`);
        this.confidenceBar.width = confidence * 200;

        // Color based on confidence
        if (confidence > 0.7) {
            this.confidenceBar.setFillStyle(0x6aa44a); // Green
        } else if (confidence > 0.4) {
            this.confidenceBar.setFillStyle(0xc4a573); // Yellow
        } else {
            this.confidenceBar.setFillStyle(0xa44a3a); // Red
        }

        // Animate panel
        this.scene.tweens.add({
            targets: this.panel,
            alpha: 1,
            scaleY: 1.02,
            duration: 200,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        // Flash thought text
        this.scene.tweens.add({
            targets: this.thoughtText,
            alpha: 0.7,
            duration: 150,
            yoyo: true
        });
    }

    hide() {
        this.panel.setAlpha(0.5);
    }

    show() {
        this.panel.setAlpha(0.85);
    }
}
