// Base Sprite Class
class Sprite {
    constructor(x, y, width, height, color = [1, 1, 1, 1]) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; // RGBA array [r, g, b, a] normalized 0-1
        
        // Transform properties
        this.rotation = 0;
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        this.originX = 0.5; // Rotation origin (0-1, default center)
        this.originY = 0.5;
        
        // Texture properties
        this.texture = null;
        this.texCoordX = 0; // Top-left UV coordinate
        this.texCoordY = 0;
        this.texCoordWidth = 1; // UV dimensions
        this.texCoordHeight = 1;
        
        // Visibility
        this.visible = true;
        this.alpha = 1.0;
    }
    
    /**
     * Update sprite logic (override in subclasses)
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Override in subclasses
    }
    
    /**
     * Set sprite position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Set sprite size
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * Set sprite color
     * @param {number[]} color - RGBA array [r, g, b, a] (0-1)
     */
    setColor(color) {
        this.color = color;
    }
    
    /**
     * Set texture coordinates for sprite atlas
     * @param {number} x - UV X coordinate (0-1)
     * @param {number} y - UV Y coordinate (0-1)
     * @param {number} width - UV width (0-1)
     * @param {number} height - UV height (0-1)
     */
    setTexCoords(x, y, width, height) {
        this.texCoordX = x;
        this.texCoordY = y;
        this.texCoordWidth = width;
        this.texCoordHeight = height;
    }
    
    /**
     * Get bounding box for collision detection
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width * this.scaleX,
            height: this.height * this.scaleY
        };
    }
    
    /**
     * Check if point is inside sprite
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @returns {boolean}
     */
    containsPoint(px, py) {
        const bounds = this.getBounds();
        return px >= bounds.x && px <= bounds.x + bounds.width &&
               py >= bounds.y && py <= bounds.y + bounds.height;
    }
}
