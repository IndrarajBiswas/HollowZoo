class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Initializing...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 + 5,
            text: 'Ready!',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x8a7a6a, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Store references for cleanup in create() if load never happens
        this.progressBar = progressBar;
        this.progressBox = progressBox;
        this.loadingText = loadingText;
        this.percentText = percentText;

        // Load animal sprites from Kenney pack
        this.load.image('rabbit', 'assets/animals/rabbit.png');
        this.load.image('bear', 'assets/animals/bear.png');
        this.load.image('gorilla', 'assets/animals/gorilla.png');
        this.load.image('elephant', 'assets/animals/elephant.png');
        this.load.image('rhino', 'assets/animals/rhino.png');
        this.load.image('hippo', 'assets/animals/hippo.png');
    }

    create() {
        // Clean up loading UI if it wasn't already cleaned by the complete event
        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBox.destroy();
            this.loadingText.destroy();
            this.percentText.destroy();
        }

        // Initialize game systems asynchronously
        this.initializeAPI().then(() => {
            // Move to menu scene after initialization
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        }).catch(() => {
            // Even if API fails, continue to menu
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });
    }

    async initializeAPI() {
        if (GameConfig.USE_FAKE_AI) {
            console.log('🧠 Offline simulation mode active - skipping backend bootstrap');
            GameState.memory = [];
            return;
        }

        try {
            // Test API connection
            const response = await fetch(`${GameConfig.API_BASE_URL}/health`, {
                timeout: 2000  // 2 second timeout
            });
            const data = await response.json();
            console.log('🎮 Backend connected:', data);

            // Load memory
            GameState.memory = await API.getMemory();
            console.log(`🧠 Loaded ${GameState.memory.length} memories`);
        } catch (error) {
            console.warn('⚠️ Backend not available, running in offline mode');
            GameState.memory = [];  // Initialize empty memory
        }
    }
}
