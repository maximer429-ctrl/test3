// Main game class - orchestrates all game systems
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.lastTime = 0;
        this.isRunning = false;
        
        // Will be initialized in subsequent tasks
        this.webglContext = null;
        this.shaderProgram = null;
        this.spriteRenderer = null;
        this.textureManager = null;
        this.inputManager = null;
        this.collisionManager = null;
        this.audioManager = null;
        
        // Game systems
        this.gameStateManager = null;
        this.scoreManager = null;
        this.waveManager = null;
        this.particleSystem = null;
        
        // Entities
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.shields = [];
        this.ufo = null;
        
        console.log('Game instance created');
    }
    
    start() {
        console.log('Game starting...');
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        
        // Render frame
        this.render();
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update all game systems and entities
        // Will be implemented when systems are ready
        
        // TODO: Update input
        // TODO: Update player
        // TODO: Update enemies
        // TODO: Update bullets
        // TODO: Update collisions
        // TODO: Update particles
        // TODO: Update game state
    }
    
    render() {
        // Clear the screen
        // TODO: Implement WebGL rendering
        
        // For now, just clear with black
        const gl = this.canvas.getContext('webgl');
        if (gl) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        
        // TODO: Render all entities
        // TODO: Render particles
        // TODO: Render UI
    }
    
    stop() {
        this.isRunning = false;
    }
    
    reset() {
        // Reset game state for new game
        this.enemies = [];
        this.bullets = [];
        this.shields = [];
        this.ufo = null;
        
        // TODO: Reinitialize entities
        // TODO: Reset wave manager
        // TODO: Reset score
    }
}
