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
        this.enemyFormation = null;
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
        
        // Initialize texture manager and load sprites
        this.textureManager = new TextureManager(this.gl);
        await this.textureManager.loadSpriteAtlas('assets/sprite-atlas.json');
        
        // Initialize sprite renderer
        this.spriteRenderer = new SpriteRenderer(this.gl, this.shaderProgram);
        
        // Create test sprites with textures
        this.testSprites = [
            this.createTexturedSprite('player', 100, 100),
            this.createTexturedSprite('sheep-enemy', 200, 150),
            this.createTexturedSprite('goat-enemy', 300, 200),
            this.createTexturedSprite('alpaca-enemy', 400, 250),
            this.createTexturedSprite('ufo', 500, 100),
        ];
        
        console.log(`✓ Created ${this.testSprites.length} test sprites`);
        
        // Initialize game state manager
        this.gameStateManager = new GameStateManager();
        
        // Set up keyboard input for state management
        this.setupStateInput();
        
        // Register state change callbacks
        this.gameStateManager.onStateChange((oldState, newState) => {
            console.log(`Game responding to state change: ${oldState} -> ${newState}`);
            
            // Handle state-specific initialization
            if (newState === CONFIG.GAME_STATES.PLAYING && oldState === CONFIG.GAME_STATES.MENU) {
                this.reset(); // Start fresh game
            }
        });
        
        // Initialize enemy formation
        this.enemyFormation = new EnemyFormation();
        
        // Initialize input manager (test3-724)
        this.inputManager = new InputManager();
        this.inputManager.initialize();
        
        // TODO: Initialize collision manager (test3-5ag)
        // TODO: Initialize score manager (test3-8sm)
        
        console.log('Game systems initialized');
        return true;
    }
    
    /**
     * Helper to create a sprite with texture from sprite atlas
     * @param {string} spriteName - Name from sprite atlas
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Sprite}
     */
    createTexturedSprite(spriteName, x, y) {
        const spriteData = this.textureManager.getSpriteData(spriteName);
        const texture = this.textureManager.getTexture(spriteName);
        
        if (!spriteData || !texture) {
            console.warn(`Sprite not found: ${spriteName}`);
            return new Sprite(x, y, 30, 30, [1, 0, 1, 1]); // Fallback magenta sprite
        }
        
        const sprite = new Sprite(x, y, spriteData.width, spriteData.height, [1, 1, 1, 1]);
        sprite.texture = texture;
        return sprite;
    }
    
    /**
     * Set up keyboard input for game state transitions
     * This runs separately from InputManager to handle meta-game input
     */
    setupStateInput() {
        // Note: Meta-game controls handled separately to avoid conflicts
        // InputManager handles in-game controls (player movement, shooting)
        window.addEventListener('keydown', (event) => {
            if (!this.gameStateManager) return;
            
            switch (event.code) {
                case 'Space':
                    // Start game from menu
                    if (this.gameStateManager.isState(CONFIG.GAME_STATES.MENU)) {
                        event.preventDefault();
                        this.gameStateManager.startGame();
                    }
                    break;
                    
                case 'KeyP':
                case 'Escape':
                    // Toggle pause
                    if (this.gameStateManager.isState(CONFIG.GAME_STATES.PLAYING) ||
                        this.gameStateManager.isState(CONFIG.GAME_STATES.PAUSED)) {
                        event.preventDefault();
                        this.gameStateManager.togglePause();
                    }
                    break;
                    
                case 'KeyR':
                    // Restart from game over
                    if (this.gameStateManager.isState(CONFIG.GAME_STATES.GAME_OVER)) {
                        event.preventDefault();
                        this.gameStateManager.setState(CONFIG.GAME_STATES.MENU);
                        this.gameStateManager.startGame();
                    }
                    break;
            }
        });
        
        console.log('✓ State management keyboard input configured');
    }
    
    async start() {
        console.log('Game starting...');
        
        // Wait for initialization to complete
        const initialized = await this.initializePromise;
        
        if (!initialized) {
            console.error('Game initialization failed, cannot start');
            return;
        }
        
        console.log('Game initialized successfully, starting game loop...');
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
        // Only update game logic when in playing state
        if (!this.gameStateManager || !this.gameStateManager.isPlaying()) {
            return;
        }
        
        // Update all game systems and entities
        
        // Update enemy formation
        if (this.enemyFormation) {
            this.enemyFormation.update(deltaTime);
        }
        
        // TODO: Update player (test3-03n) - will use inputManager.getHorizontalAxis() and inputManager.isActionTriggered('SHOOT')
        // TODO: Update bullets (test3-966)
        // TODO: Update collisions (test3-5ag)
        // TODO: Update particles (test3-13u)
        
        // Update input manager (clear action buffer at end of frame)
        if (this.inputManager) {
            this.inputManager.update();
        }
    }
    
    render() {
        if (!this.webglContext || !this.gl || !this.spriteRenderer) {
            return;
        }
        
        // Clear the screen
        this.webglContext.clear();
        
        // Only render game content when in playing state
        if (this.gameStateManager && this.gameStateManager.isPlaying()) {
            // Render enemies
            if (this.enemyFormation) {
                const enemies = this.enemyFormation.getAliveEnemies();
                if (enemies.length > 0) {
                    this.spriteRenderer.render(enemies);
                }
            }
            
            // TODO: Render player
            // TODO: Render bullets
            // TODO: Render shields
            // TODO: Render UFO
            // TODO: Render particles
            // TODO: Render UI
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    reset() {
        // Reset game state for new game
        console.log('Resetting game...');
        
        // Reset bullets and other entities
        this.bullets = [];
        this.shields = [];
        this.ufo = null;
        
        // Create enemy formation
        if (this.enemyFormation && this.textureManager) {
            this.enemyFormation.reset();
            this.enemyFormation.createFormation(this.textureManager);
        }
        
        // TODO: Reinitialize player
        // TODO: Reinitialize shields
        // TODO: Reset wave manager
        // TODO: Reset score
    }
}
