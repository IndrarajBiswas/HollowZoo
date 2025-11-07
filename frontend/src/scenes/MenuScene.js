export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load any assets needed for menu (currently using text-based menu)
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, height / 3, 'AGENT ARENA', {
            fontSize: '64px',
            fontFamily: 'Courier New',
            color: '#00d9ff',
            stroke: '#0a0e27',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 70, 'ACADEMY', {
            fontSize: '64px',
            fontFamily: 'Courier New',
            color: '#00d9ff',
            stroke: '#0a0e27',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2, 'Coach Your AI Fighter', {
            fontSize: '24px',
            fontFamily: 'Courier New',
            color: '#533483'
        }).setOrigin(0.5);

        // Instructions
        const instructions = [
            'Use coaching sliders to guide the AI agent',
            'Watch it learn and adapt to your strategy',
            'Every run teaches it something new',
            '',
            'Click anywhere to start'
        ];

        instructions.forEach((line, index) => {
            this.add.text(width / 2, height / 2 + 80 + (index * 30), line, {
                fontSize: '16px',
                fontFamily: 'Courier New',
                color: '#e0e0e0',
                align: 'center'
            }).setOrigin(0.5);
        });

        // Start button (interactive area)
        const startButton = this.add.rectangle(width / 2, height - 100, 300, 60, 0x00d9ff, 0.8)
            .setInteractive({ useHandCursor: true });

        const startText = this.add.text(width / 2, height - 100, 'START TRAINING', {
            fontSize: '24px',
            fontFamily: 'Courier New',
            color: '#0a0e27',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00b8d4);
            this.tweens.add({
                targets: startButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200
            });
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00d9ff);
            this.tweens.add({
                targets: startButton,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
        });

        // Start game on click
        startButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });

        // Fade in effect
        this.cameras.main.fadeIn(1000);
    }
}
