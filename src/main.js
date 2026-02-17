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
    
    // Hide menu overlay for now (TODO: implement proper menu system)
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.classList.add('hidden');
        console.log('Menu overlay hidden');
    }
    
    // Initialize the game
    try {
        const game = new Game(canvas);
        game.start().catch(error => {
            console.error('Failed to start game:', error);
        });
        console.log('Game initialization started...');
    } catch (error) {
        console.error('Failed to create game:', error);
    }
});
