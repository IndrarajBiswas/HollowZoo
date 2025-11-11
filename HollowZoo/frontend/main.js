// Main game initialization
const config = {
    type: Phaser.AUTO,
    width: GameConfig.WIDTH,
    height: GameConfig.HEIGHT,
    parent: 'game-container',
    backgroundColor: GameConfig.COLORS.BACKGROUND,
    pixelArt: GameConfig.PIXEL_ART,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GameConfig.GRAVITY },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, PromptScene, ZooScene, ResultScene, NestScene]
};

// Create game instance
const game = new Phaser.Game(config);

// Global game state
const GameState = {
    missionPrompt: '',  // User's tactical instructions
    lastPrompt: '',
    memory: [],
    currentBiome: GameConfig.BIOMES.ROO_SANCTUM,
    agentLevel: 1,
    battlesWon: 0,
    battlesLost: 0,
    currentLevelIndex: 0,
    unlockedLevelCount: 1,
    levelHistory: {}
};

// Hide loading screen when game is ready
window.addEventListener('load', () => {
    // Hide loading screen after Phaser fully initializes
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }, 1500);  // Reduced from 2000ms to 1500ms
});

// Also hide loading screen when Phaser is ready
if (game) {
    game.events.once('ready', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }
        }, 500);
    });
}
