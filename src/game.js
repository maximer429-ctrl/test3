// Main game class - orchestrates all game systems
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.lastTime = 0;
        this.isRunning = false;
        
        // Core WebGL and rendering
        this.webglContext = null;
        this.gl = null;
        this.shaderProgram = null;
        this.spriteRenderer = null;
        this.textureManager = null;
        
        // Input and systems
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
        
        // Initialize core systems
        this.initializePromise = this.initialize();
    }
    
    async initialize() {
        console.log('Initializing game systems...');
        
        // Initialize WebGL context
        this.webglContext = new WebGLContext(this.canvas);
        this.gl = this.webglContext.initialize();
        
        if (!this.gl) {
            console.error('Failed to initialize WebGL!');
            return false;
        }
        
        // Initialize shader program
        this.shaderProgram = new ShaderProgram(this.gl);
        const shadersLoaded = await this.shaderProgram.loadFromFiles(
            'shaders/sprite.vert',
            'shaders/sprite.frag'
        );
        
        if (!shadersLoaded) {
            console.error('Failed to load shaders!');
            return false;
        }
        
        // Set up projection matrix
        const projectionMatrix = ShaderProgram.createProjectionMatrix(
            this.canvas.width,
            this.canvas.height
        );
        this.shaderProgram.use();
        this.gl.uniformMatrix4fv(
            this.shaderProgram.getUniformLocation('projection'),
            false,
            projectionMatrix
        );
        
        // Initialize other systems as they become available
        // Initialize sprite renderer
        this.spriteRenderer = new SpriteRenderer(this.gl, this.shaderProgram);
        
        // Create a test sprite to verify rendering works
        this.testSprites = [
            new Sprite(100, 100, 40, 40, CONFIG.COLORS.PLAYER),
            new Sprite(200, 150, 30, 30, CONFIG.COLORS.ENEMY_1),
            new Sprite(300, 200, 30, 30, CONFIG.COLORS.ENEMY_2),
            new Sprite(400, 250, 30, 30, CONFIG.COLORS.ENEMY_3),
        ];
        
        // TODO: Initialize texture manager (test3-hmq)
        // TODO: Initialize input manager (test3-724)
        // TODO: Initialize collision manager (test3-5ag)
        // TODO: Initialize game state manager (test3-h3q)
        // TODO: Initialize score manager (test3-8sm)
        
        console.log('Game systems initialized');
        return true;
    }
    
    async start() {
        console.log('Game starting...');
        
        // Wait for initialization to complete
        await this.initializePromise;
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
        if (!this.webglContext || !this.gl || !this.spriteRenderer) return;
        
        // Clear the screen
        this.webglContext.clear();
        
        // Render test sprites
        if (this.testSprites) {
            this.spriteRenderer.render(this.testSprites);
        }
        
        // TODO: Render all game entities
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
