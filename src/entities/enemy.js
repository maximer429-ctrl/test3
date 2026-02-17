/**
 * Enemy Entity
 * Represents an individual enemy invader with animation and shooting behavior
 * Implemented in: test3-noz
 */
class Enemy extends Sprite {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} type - Enemy type (0=sheep, 1=goat, 2=alpaca)
     * @param {number} row - Row position in formation
     * @param {number} col - Column position in formation
     */
    constructor(x, y, type, row = 0, col = 0) {
        super(x, y, CONFIG.ENEMY_WIDTH, CONFIG.ENEMY_HEIGHT, [1, 1, 1, 1]);
        
        this.type = type;
        this.row = row;
        this.col = col;
        this.points = CONFIG.ENEMY_POINTS[type] || 10;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 0.3; // seconds per frame
        
        // Movement (managed by formation)
        this.formationX = x;
        this.formationY = y;
        
        // Shooting
        this.canShoot = true;
        this.shootCooldown = 0;
        
        // Set sprite based on type
        this.setSpriteType(type);
        
        this.alive = true;
    }
    
    /**
     * Set enemy sprite based on type
     * @param {number} type - Enemy type (0=sheep, 1=goat, 2=alpaca)
     */
    setSpriteType(type) {
        const spriteNames = ['sheep-enemy', 'goat-enemy', 'alpaca-enemy'];
        this.spriteName = spriteNames[type] || 'sheep-enemy';
    }
    
    /**
     * Load texture for this enemy from texture manager
     * @param {TextureManager} textureManager
     */
    loadTexture(textureManager) {
        if (!textureManager) return;
        
        const spriteData = textureManager.getSpriteData(this.spriteName);
        const texture = textureManager.getTexture(this.spriteName);
        
        if (spriteData && texture) {
            this.texture = texture;
            this.width = spriteData.width;
            this.height = spriteData.height;
        }
    }
    
    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.alive) return;
        
        // Update animation
        this.animationTime += deltaTime;
        if (this.animationTime >= this.animationSpeed) {
            this.animationTime = 0;
            this.animationFrame = (this.animationFrame + 1) % 2; // Toggle between 0 and 1
        }
        
        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // Smooth movement toward formation position
        this.x = this.formationX;
        this.y = this.formationY;
    }
    
    /**
     * Set formation position (called by formation manager)
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     */
    setFormationPosition(x, y) {
        this.formationX = x;
        this.formationY = y;
    }
    
    /**
     * Check if enemy can shoot
     * @returns {boolean}
     */
    canFire() {
        return this.alive && this.canShoot && this.shootCooldown <= 0;
    }
    
    /**
     * Fire (resets cooldown)
     */
    fire() {
        this.shootCooldown = 1.0 + Math.random() * 2.0; // 1-3 seconds
    }
    
    /**
     * Destroy this enemy
     */
    destroy() {
        this.alive = false;
        this.visible = false;
    }
}

/**
 * EnemyFormation
 * Manages coordinated movement of all enemies in a formation
 */
class EnemyFormation {
    constructor() {
        this.enemies = [];
        this.direction = 1; // 1 = right, -1 = left
        this.moveTimer = 0;
        this.moveDelay = CONFIG.ENEMY_MOVE_DELAY;
        this.startX = 100;
        this.startY = CONFIG.ENEMY_START_Y;
        
        // Formation boundaries
        this.leftBound = 50;
        this.rightBound = CONFIG.CANVAS_WIDTH - 50;
    }
    
    /**
     * Create enemy formation grid
     * @param {TextureManager} textureManager - For loading textures
     */
    createFormation(textureManager) {
        this.enemies = [];
        
        for (let row = 0; row < CONFIG.ENEMY_ROWS; row++) {
            for (let col = 0; col < CONFIG.ENEMY_COLS; col++) {
                // Determine enemy type based on row
                let type = 0; // sheep
                if (row >= 1 && row <= 2) type = 1; // goat
                if (row >= 3) type = 2; // alpaca
                
                const x = this.startX + col * CONFIG.ENEMY_SPACING_X;
                const y = this.startY + row * CONFIG.ENEMY_SPACING_Y;
                
                const enemy = new Enemy(x, y, type, row, col);
                enemy.loadTexture(textureManager);
                
                this.enemies.push(enemy);
            }
        }
        
        console.log(`✓ Created enemy formation: ${this.enemies.length} enemies`);
    }
    
    /**
     * Update all enemies and formation movement
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update move timer
        this.moveTimer += deltaTime;
        
        // Check if it's time to move
        if (this.moveTimer >= this.moveDelay) {
            this.moveTimer = 0;
            this.moveFormation();
        }
        
        // Update individual enemies
        const aliveEnemies = this.getAliveEnemies();
        aliveEnemies.forEach(enemy => enemy.update(deltaTime));
        
        // Speed up as enemies are destroyed
        const totalEnemies = CONFIG.ENEMY_ROWS * CONFIG.ENEMY_COLS;
        const remainingRatio = aliveEnemies.length / totalEnemies;
        this.moveDelay = CONFIG.ENEMY_MOVE_DELAY * remainingRatio;
        if (this.moveDelay < 0.1) this.moveDelay = 0.1; // Minimum delay
    }
    
    /**
     * Move the entire formation
     */
    moveFormation() {
        const aliveEnemies = this.getAliveEnemies();
        if (aliveEnemies.length === 0) return;
        
        // Calculate formation bounds
        const bounds = this.getFormationBounds();
        
        // Check if we need to drop down and reverse
        let shouldDrop = false;
        
        if (this.direction === 1 && bounds.right >= this.rightBound) {
            shouldDrop = true;
            this.direction = -1;
        } else if (this.direction === -1 && bounds.left <= this.leftBound) {
            shouldDrop = true;
            this.direction = 1;
        }
        
        // Move all enemies
        aliveEnemies.forEach(enemy => {
            if (shouldDrop) {
                enemy.setFormationPosition(
                    enemy.formationX,
                    enemy.formationY + CONFIG.ENEMY_DROP_DISTANCE
                );
            } else {
                enemy.setFormationPosition(
                    enemy.formationX + (this.direction * CONFIG.ENEMY_MOVE_SPEED),
                    enemy.formationY
                );
            }
        });
    }
    
    /**
     * Get bounding box of alive enemies
     * @returns {{left: number, right: number, top: number, bottom: number}}
     */
    getFormationBounds() {
        const aliveEnemies = this.getAliveEnemies();
        if (aliveEnemies.length === 0) {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        }
        
        let left = Infinity, right = -Infinity;
        let top = Infinity, bottom = -Infinity;
        
        aliveEnemies.forEach(enemy => {
            left = Math.min(left, enemy.x);
            right = Math.max(right, enemy.x + enemy.width);
            top = Math.min(top, enemy.y);
            bottom = Math.max(bottom, enemy.y + enemy.height);
        });
        
        return { left, right, top, bottom };
    }
    
    /**
     * Get array of alive enemies
     * @returns {Enemy[]}
     */
    getAliveEnemies() {
        return this.enemies.filter(enemy => enemy.alive);
    }
    
    /**
     * Get all enemies (alive and dead)
     * @returns {Enemy[]}
     */
    getAllEnemies() {
        return this.enemies;
    }
    
    /**
     * Find bottom-most enemy in each column (for shooting)
     * @returns {Enemy[]}
     */
    getShooters() {
        const shooters = [];
        const columnMap = new Map(); // col -> bottom-most enemy
        
        this.getAliveEnemies().forEach(enemy => {
            const existing = columnMap.get(enemy.col);
            if (!existing || enemy.row > existing.row) {
                columnMap.set(enemy.col, enemy);
            }
        });
        
        return Array.from(columnMap.values());
    }
    
    /**
     * Reset formation to starting position
     */
    reset() {
        this.direction = 1;
        this.moveTimer = 0;
        this.enemies = [];
    }
    
    /**
     * Check if all enemies are destroyed
     * @returns {boolean}
     */
    isCleared() {
        return this.getAliveEnemies().length === 0;
    }
}
