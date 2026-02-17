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
            
            // Load all sprites from atlas
            const sprites = atlas.sprites || {};
            this.totalCount = Object.keys(sprites).length;
            
            const loadPromises = [];
            for (const [name, spriteData] of Object.entries(sprites)) {
                const spritePath = `${basePath}${atlas.meta.image}${spriteData.file}`;
                loadPromises.push(
                    this.loadTexture(name, spritePath).catch(err => {
                        console.warn(`Failed to load sprite ${name}:`, err);
                        return null;
                    })
                );
            }
            
            await Promise.all(loadPromises);
            console.log(`Sprite atlas loaded: ${this.loadedCount}/${this.totalCount} textures`);
            
        } catch (error) {
            console.error('Error loading sprite atlas:', error);
            throw error;
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
