// Main game entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Troup\'O Invaders - Initializing...');
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Check WebGL support
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        alert('WebGL not supported! Please use a modern browser.');
        return;
    }
    
    console.log('WebGL context created successfully');
    
    // Initialize the game
    try {
        const game = new Game(canvas);
        game.start();
        console.log('Game started successfully');
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});
