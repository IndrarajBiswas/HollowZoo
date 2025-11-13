// Global game state
const GameState = {
    missionPrompt: '',  // User's tactical instructions
    lastPrompt: '',
    memory: [],
    currentBiome: GameConfig.BIOMES.LANTERN_AVIARY,
    agentLevel: 1,
    battlesWon: 0,
    battlesLost: 0,
    currentLevelIndex: 0,
    unlockedLevelCount: 1,
    levelHistory: {},
    coaching: {
        aggression: 35,
        caution: 55,
        curiosity: 60
    }
};

// Expose game state globally for any late-loaded scripts
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}

const hideLoadingScreen = (delay = 0) => {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) {
        return;
    }

    setTimeout(() => {
        loadingScreen.style.transition = 'opacity 0.5s';
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.classList.add('hidden'), 500);
    }, delay);
};

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

// Expose helpers for other scripts
if (typeof window !== 'undefined') {
    window.hideLoadingScreen = hideLoadingScreen;
    window.addEventListener('load', () => hideLoadingScreen(1500));
}

// Create game instance
const game = new Phaser.Game(config);

if (game?.events && typeof Phaser !== 'undefined' && Phaser.Core?.Events?.READY) {
    game.events.once(Phaser.Core.Events.READY, () => hideLoadingScreen(500));
}
