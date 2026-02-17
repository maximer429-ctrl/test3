// Texture Manager with Atlas Support
class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
        this.spriteAtlas = null;
        this.loadedCount = 0;
        this.totalCount = 0;
    }
    
    /**
     * Load a texture from an image file
     * @param {string} name - Texture identifier
     * @param {string} path - Path to image file
     * @returns {Promise<WebGLTexture>}
     */
    async loadTexture(name, path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            
            image.onload = () => {
                const texture = this.createTextureFromImage(image);
                this.textures.set(name, {
                    texture: texture,
                    width: image.width,
                    height: image.height
                });
                this.loadedCount++;
                console.log(`Loaded texture: ${name} (${image.width}x${image.height})`);
                resolve(texture);
            };
            
            image.onerror = () => {
                console.error(`Failed to load texture: ${path}`);
                reject(new Error(`Failed to load texture: ${path}`));
            };
            
            image.src = path;
        });
    }
    
    /**
     * Create a WebGL texture from an Image element
     * @param {HTMLImageElement} image - Image element
     * @returns {WebGLTexture}
     */
    createTextureFromImage(image) {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        // Upload image data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        return texture;
    }
    
    /**
     * Load sprite atlas configuration and all sprite textures
     * @param {string} atlasPath - Path to sprite atlas JSON file
     * @returns {Promise<void>}
     */
    async loadSpriteAtlas(atlasPath) {
        try {
            const response = await fetch(atlasPath);
            if (!response.ok) {
                throw new Error(`Failed to load sprite atlas: ${atlasPath}`);
            }
            
            const atlas = await response.json();
            this.spriteAtlas = atlas;
            
            // Get base path from atlas file location
            const basePath = atlasPath.substring(0, atlasPath.lastIndexOf('/') + 1);
            
            // Determine mode (v2.0+ has explicit mode, v1.0 is always individual)
            const mode = atlas.meta.mode || 'individual';
            
            if (mode === 'packed') {
                // Load single texture atlas (future implementation)
                await this.loadPackedAtlas(basePath, atlas);
            } else {
                // Load individual sprite files (current implementation)
                await this.loadIndividualSprites(basePath, atlas);
            }
            
            console.log(`Sprite atlas loaded: ${this.loadedCount}/${this.totalCount} textures`);
            
        } catch (error) {
            console.error('Error loading sprite atlas:', error);
            throw error;
        }
    }
    
    /**
     * Load sprites from individual PNG files
     * @param {string} basePath - Base directory path
     * @param {Object} atlas - Atlas configuration object
     * @returns {Promise<void>}
     * @private
     */
    async loadIndividualSprites(basePath, atlas) {
        const sprites = atlas.sprites || {};
        
        // Support both v1.0 (meta.image) and v2.0 (meta.spritePath) format
        const spritePath = atlas.meta.spritePath || atlas.meta.image || 'sprites/';
        
        const loadPromises = [];
        
        // Count total textures to load (base sprites + animation frames)
        let totalTextures = Object.keys(sprites).length;
        for (const spriteData of Object.values(sprites)) {
            if (spriteData.animation && spriteData.animation.frames) {
                totalTextures += spriteData.animation.frames.length;
            }
        }
        this.totalCount = totalTextures;
        
        // Load base sprites and animation frames
        for (const [name, spriteData] of Object.entries(sprites)) {
            // Load base sprite
            const fullPath = `${basePath}${spritePath}${spriteData.file}`;
            loadPromises.push(
                this.loadTexture(name, fullPath).catch(err => {
                    console.warn(`Failed to load sprite ${name}:`, err);
                    return null;
                })
            );
            
            // Load animation frames if they exist
            if (spriteData.animation && spriteData.animation.frames) {
                for (let i = 0; i < spriteData.animation.frames.length; i++) {
                    const frameData = spriteData.animation.frames[i];
                    const frameName = frameData.file.replace('.png', '');
                    const frameFullPath = `${basePath}${spritePath}${frameData.file}`;
                    
                    loadPromises.push(
                        this.loadTexture(frameName, frameFullPath).catch(err => {
                            console.warn(`Failed to load animation frame ${frameName}:`, err);
                            return null;
                        })
                    );
                }
            }
        }
        
        await Promise.all(loadPromises);
    }
    
    /**
     * Load sprites from a packed texture atlas
     * @param {string} basePath - Base directory path
     * @param {Object} atlas - Atlas configuration object
     * @returns {Promise<void>}
     * @private
     */
    async loadPackedAtlas(basePath, atlas) {
        const atlasTexturePath = `${basePath}${atlas.meta.atlasTexture}`;
        
        // Load the single atlas texture
        await this.loadTexture('__atlas__', atlasTexturePath);
        
        const sprites = atlas.sprites || {};
        this.totalCount = Object.keys(sprites).length;
        
        // Store sprite UV data for rendering
        // Each sprite will reference the atlas texture but with different UV coordinates
        for (const [name, spriteData] of Object.entries(sprites)) {
            if (spriteData.uv) {
                // Reference the atlas texture with UV coordinates
                const atlasTextureData = this.textures.get('__atlas__');
                this.textures.set(name, {
                    texture: atlasTextureData.texture,
                    width: spriteData.width,
                    height: spriteData.height,
                    uv: spriteData.uv,
                    isAtlasSprite: true
                });
                this.loadedCount++;
            }
        }
    }
    
    /**
     * Get a loaded texture by name
     * @param {string} name - Texture identifier
     * @returns {WebGLTexture|null}
     */
    getTexture(name) {
        const textureData = this.textures.get(name);
        return textureData ? textureData.texture : null;
    }
    
    /**
     * Get texture data including dimensions
     * @param {string} name - Texture identifier
     * @returns {{texture: WebGLTexture, width: number, height: number}|null}
     */
    getTextureData(name) {
        return this.textures.get(name) || null;
    }
    
    /**
     * Get sprite metadata from atlas
     * @param {string} name - Sprite name
     * @returns {Object|null} Sprite metadata
     */
    getSpriteData(name) {
        if (!this.spriteAtlas || !this.spriteAtlas.sprites) {
            return null;
        }
        return this.spriteAtlas.sprites[name] || null;
    }
    
    /**
     * Apply atlas UV coordinates to a Sprite object
     * @param {Sprite} sprite - Sprite instance to configure
     * @param {string} spriteName - Name of sprite in atlas
     * @returns {boolean} Success status
     */
    applySpriteUVs(sprite, spriteName) {
        const spriteData = this.getSpriteData(spriteName);
        if (!spriteData) {
            console.warn(`Sprite ${spriteName} not found in atlas`);
            return false;
        }

        const textureData = this.getTextureData(spriteName);
        if (!textureData) {
            console.warn(`Texture for sprite ${spriteName} not loaded`);
            return false;
        }

        // Set texture
        sprite.texture = textureData.texture;

        // Set size
        sprite.width = spriteData.width;
        sprite.height = spriteData.height;

        // Set UV coordinates
        if (textureData.uv) {
            // Packed atlas mode - use precalculated UVs
            sprite.setTexCoords(
                textureData.uv.u0,
                textureData.uv.v0,
                textureData.uv.u1 - textureData.uv.u0,
                textureData.uv.v1 - textureData.uv.v0
            );
        } else {
            // Individual texture mode - use full texture (0, 0, 1, 1)
            sprite.setTexCoords(0, 0, 1, 1);
        }

        return true;
    }
    
    /**
     * Create a properly configured Sprite object from atlas
     * @param {string} spriteName - Name of sprite in atlas
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @returns {Sprite|null} Configured sprite or null if not found
     */
    createSprite(spriteName, x = 0, y = 0) {
        const spriteData = this.getSpriteData(spriteName);
        if (!spriteData) {
            console.warn(`Sprite ${spriteName} not found in atlas`);
            return null;
        }

        // Create new Sprite instance
        const sprite = new Sprite(x, y, spriteData.width, spriteData.height);
        
        // Apply texture and UVs
        if (this.applySpriteUVs(sprite, spriteName)) {
            return sprite;
        }

        return null;
    }
    
    /**
     * Check if a texture is loaded
     * @param {string} name - Texture identifier
     * @returns {boolean}
     */
    hasTexture(name) {
        return this.textures.has(name);
    }
    
    /**
     * Get loading progress
     * @returns {{loaded: number, total: number, percentage: number}}
     */
    getLoadingProgress() {
        return {
            loaded: this.loadedCount,
            total: this.totalCount,
            percentage: this.totalCount > 0 ? (this.loadedCount / this.totalCount) * 100 : 0
        };
    }
    
    /**
     * Create a 1x1 color texture (useful for untextured sprites)
     * @param {string} name - Texture identifier
     * @param {number[]} color - RGBA color [r, g, b, a] (0-255)
     * @returns {WebGLTexture}
     */
    createColorTexture(name, color) {
        const gl = this.gl;
        const texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        const pixel = new Uint8Array(color);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        this.textures.set(name, {
            texture: texture,
            width: 1,
            height: 1
        });
        
        return texture;
    }
    
    /**
     * Delete a texture and free GPU memory
     * @param {string} name - Texture identifier
     */
    deleteTexture(name) {
        const textureData = this.textures.get(name);
        if (textureData) {
            this.gl.deleteTexture(textureData.texture);
            this.textures.delete(name);
        }
    }
    
    /**
     * Delete all textures and free GPU memory
     */
    clear() {
        for (const [name, textureData] of this.textures) {
            this.gl.deleteTexture(textureData.texture);
        }
        this.textures.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
    }
}
