// Game configuration constants
const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Player settings
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 30,
    PLAYER_SPEED: 300, // pixels per second
    PLAYER_FIRE_RATE: 0.5, // seconds between shots
    PLAYER_START_LIVES: 3,
    
    // Enemy settings
    ENEMY_WIDTH: 40,
    ENEMY_HEIGHT: 40,
    ENEMY_ROWS: 5,
    ENEMY_COLS: 11,
    ENEMY_SPACING_X: 55,
    ENEMY_SPACING_Y: 45,
    ENEMY_START_Y: 80,
    ENEMY_MOVE_SPEED: 30, // pixels per step
    ENEMY_MOVE_DELAY: 0.8, // seconds between moves
    ENEMY_DROP_DISTANCE: 20,
    ENEMY_FIRE_CHANCE: 0.001, // per enemy per frame
    
    // Bullet settings
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 12,
    BULLET_SPEED: 400,
    BULLET_POOL_SIZE: 50,
    
    // Shield settings
    SHIELD_COUNT: 4,
    SHIELD_WIDTH: 60,
    SHIELD_HEIGHT: 40,
    SHIELD_Y: 480,
    
    // UFO settings
    UFO_WIDTH: 40,
    UFO_HEIGHT: 20,
    UFO_SPEED: 100,
    UFO_SPAWN_CHANCE: 0.001, // per frame
    UFO_POINTS: 100,
    
    // Particle settings
    PARTICLE_COUNT: 20,
    PARTICLE_LIFETIME: 1.0,
    PARTICLE_SPEED: 150,
    
    // Scoring
    ENEMY_POINTS: [10, 20, 30], // points by enemy type
    
    // Game states
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    },
    
    // Colors (RGB normalized)
    COLORS: {
        PLAYER: [0.0, 1.0, 0.3, 1.0],
        ENEMY_1: [1.0, 0.0, 0.0, 1.0],
        ENEMY_2: [1.0, 0.5, 0.0, 1.0],
        ENEMY_3: [0.8, 0.0, 0.8, 1.0],
        BULLET_PLAYER: [0.0, 1.0, 0.0, 1.0],
        BULLET_ENEMY: [1.0, 0.0, 0.0, 1.0],
        SHIELD: [0.0, 0.5, 1.0, 1.0],
        UFO: [1.0, 1.0, 0.0, 1.0],
        PARTICLE: [1.0, 0.7, 0.0, 1.0]
    }
};
