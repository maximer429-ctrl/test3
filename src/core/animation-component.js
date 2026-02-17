/**
 * Animation Component
 * Manages sprite animation by tracking frame timing and providing current frame texture
 * Implemented in: test3-5bx
 */
class AnimationComponent {
    /**
     * @param {string} baseName - Base sprite name (e.g., 'sheep-enemy')
     * @param {Object} animationData - Animation configuration from sprite atlas
     * @param {TextureManager} textureManager - Texture manager for loading frames
     */
    constructor(baseName, animationData, textureManager) {
        this.baseName = baseName;
        this.animationData = animationData;
        this.textureManager = textureManager;
        
        // Animation state
        this.currentFrame = 0;
        this.frameTime = 0;
        this.isPlaying = true;
        
        // Animation properties from data
        this.frameCount = animationData.frameCount || animationData.frames.length;
        this.fps = animationData.fps || 1;
        this.loop = animationData.loop !== undefined ? animationData.loop : true;
        this.frameDuration = 1.0 / this.fps; // seconds per frame
        
        // Frame textures
        this.frameTextures = [];
        this.frameNames = [];
        
        // Build frame texture references
        this.initializeFrames();
    }
    
    /**
     * Initialize frame texture names and references
     */
    initializeFrames() {
        if (!this.animationData.frames || this.animationData.frames.length === 0) {
            console.warn(`No animation frames for ${this.baseName}`);
            return;
        }
        
        // Get frame names from animation data
        this.animationData.frames.forEach((frameData, index) => {
            // Frame file is like "sheep-enemy-frame1.png"
            const frameName = frameData.file ? 
                frameData.file.replace('.png', '') : 
                `${this.baseName}-frame${index + 1}`;
            
            this.frameNames.push(frameName);
        });
        
        console.log(`AnimationComponent: Initialized ${this.frameNames.length} frames for ${this.baseName}`);
    }
    
    /**
     * Update animation state
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.isPlaying || this.frameCount <= 1) {
            return;
        }
        
        this.frameTime += deltaTime;
        
        // Check if it's time to advance to next frame
        if (this.frameTime >= this.frameDuration) {
            this.frameTime -= this.frameDuration;
            this.currentFrame++;
            
            // Handle loop or stop
            if (this.currentFrame >= this.frameCount) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frameCount - 1;
                    this.isPlaying = false;
                }
            }
        }
    }
    
    /**
     * Get the texture for the current animation frame
     * @returns {WebGLTexture|null}
     */
    getCurrentTexture() {
        if (this.frameNames.length === 0) {
            return null;
        }
        
        const frameName = this.frameNames[this.currentFrame];
        return this.textureManager.getTexture(frameName);
    }
    
    /**
     * Get the texture data (including dimensions) for current frame
     * @returns {Object|null}
     */
    getCurrentTextureData() {
        if (this.frameNames.length === 0) {
            return null;
        }
        
        const frameName = this.frameNames[this.currentFrame];
        return this.textureManager.getTextureData(frameName);
    }
    
    /**
     * Reset animation to first frame
     */
    reset() {
        this.currentFrame = 0;
        this.frameTime = 0;
        this.isPlaying = true;
    }
    
    /**
     * Set animation to specific frame
     * @param {number} frame - Frame index
     */
    setFrame(frame) {
        this.currentFrame = Math.max(0, Math.min(frame, this.frameCount - 1));
        this.frameTime = 0;
    }
    
    /**
     * Play animation
     */
    play() {
        this.isPlaying = true;
    }
    
    /**
     * Pause animation
     */
    pause() {
        this.isPlaying = false;
    }
    
    /**
     * Stop animation and reset to first frame
     */
    stop() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.frameTime = 0;
    }
}
