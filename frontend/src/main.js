import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0a0e27',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false // Set to true for debugging physics
        }
    },
    scene: [MenuScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Wire up coaching slider controls
document.getElementById('aggression').addEventListener('input', (e) => {
    document.getElementById('aggression-value').textContent = e.target.value;
    // Update game coaching parameters
    if (game.scene.scenes[1] && game.scene.scenes[1].scene.isActive()) {
        game.scene.scenes[1].updateCoaching('aggression', parseInt(e.target.value));
    }
});

document.getElementById('caution').addEventListener('input', (e) => {
    document.getElementById('caution-value').textContent = e.target.value;
    // Update game coaching parameters
    if (game.scene.scenes[1] && game.scene.scenes[1].scene.isActive()) {
        game.scene.scenes[1].updateCoaching('caution', parseInt(e.target.value));
    }
});

// Wire up button controls
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset all memory and learning? This cannot be undone.')) {
        // Call backend reset API
        fetch('http://localhost:5000/api/reset', { method: 'POST' })
            .then(() => {
                // Restart the game
                if (game.scene.scenes[1]) {
                    game.scene.scenes[1].scene.restart();
                }
            })
            .catch(err => console.error('Reset failed:', err));
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    if (game.scene.scenes[1]) {
        game.scene.scenes[1].scene.restart();
    }
});

// Export game instance for debugging
window.game = game;
