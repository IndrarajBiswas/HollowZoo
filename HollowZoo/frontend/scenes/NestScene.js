class NestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NestScene' });
    }

    create() {
        // Boss battle scene
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Darker, more dramatic atmosphere
        this.cameras.main.setBackgroundColor(0x0a0a1e);

        // Title
        const title = this.add.text(width / 2, height / 2 - 100, "KING'S CHAMBER", {
            fontSize: '48px',
            fontFamily: 'monospace',
            color: '#8a3a4a'
        });
        title.setOrigin(0.5);

        // Warning text
        const warning = this.add.text(width / 2, height / 2,
            'Face the Kangaroo King\nThe ultimate test of your coaching', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#c4a573',
            align: 'center'
        });
        warning.setOrigin(0.5);

        // Coming soon notice
        const notice = this.add.text(width / 2, height / 2 + 100,
            '[BOSS BATTLE - COMING SOON]', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#6a6a8a',
            backgroundColor: '#2a2a4a',
            padding: { x: 20, y: 10 }
        });
        notice.setOrigin(0.5);

        // Back button
        const backButton = this.add.text(width / 2, height - 100, '[ BACK TO MENU ]', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#2a2a4a',
            padding: { x: 20, y: 10 }
        });
        backButton.setOrigin(0.5);
        backButton.setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Animate warning
        this.tweens.add({
            targets: warning,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
}
