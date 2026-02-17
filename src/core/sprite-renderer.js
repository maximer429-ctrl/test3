// Sprite Renderer with Batch Rendering
class SpriteRenderer {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        
        // Batch rendering settings
        this.maxSprites = 1000;
        this.verticesPerSprite = 6; // 2 triangles
        this.floatsPerVertex = 8; // x, y, u, v, r, g, b, a
        
        // Vertex buffer
        this.vertexBuffer = null;
        this.vertices = new Float32Array(
            this.maxSprites * this.verticesPerSprite * this.floatsPerVertex
        );
        this.vertexCount = 0;
        
        // Current batch state
        this.currentTexture = null;
        this.spriteCount = 0;
        
        this.initialize();
    }
    
    /**
     * Initialize rendering buffers
     */
    initialize() {
        const gl = this.gl;
        
        // Create vertex buffer
        this.vertexBuffer = gl.createBuffer();
        
        console.log('SpriteRenderer initialized');
    }
    
    /**
     * Begin a new rendering batch
     */
    begin() {
        this.vertexCount = 0;
        this.spriteCount = 0;
        this.currentTexture = null;
    }
    
    /**
     * Render a sprite
     * @param {Sprite} sprite - Sprite to render
     */
    drawSprite(sprite) {
        if (!sprite.visible) return;
        
        // Check if we need to flush (texture change or batch full)
        if (this.spriteCount >= this.maxSprites ||
            (this.currentTexture && sprite.texture !== this.currentTexture)) {
            this.flush();
        }
        
        this.currentTexture = sprite.texture;
        
        // Calculate sprite vertices
        const x1 = sprite.x;
        const y1 = sprite.y;
        const x2 = sprite.x + sprite.width;
        const y2 = sprite.y + sprite.height;
        
        // Texture coordinates
        const u1 = sprite.texCoordX;
        const v1 = sprite.texCoordY;
        const u2 = sprite.texCoordX + sprite.texCoordWidth;
        const v2 = sprite.texCoordY + sprite.texCoordHeight;
        
        // Color with alpha
        const r = sprite.color[0];
        const g = sprite.color[1];
        const b = sprite.color[2];
        const a = sprite.color[3] * sprite.alpha;
        
        // Add vertices for two triangles (quad)
        const idx = this.vertexCount * this.floatsPerVertex;
        
        // Triangle 1
        // Top-left
        this.vertices[idx + 0] = x1;
        this.vertices[idx + 1] = y1;
        this.vertices[idx + 2] = u1;
        this.vertices[idx + 3] = v1;
        this.vertices[idx + 4] = r;
        this.vertices[idx + 5] = g;
        this.vertices[idx + 6] = b;
        this.vertices[idx + 7] = a;
        
        // Top-right
        this.vertices[idx + 8] = x2;
        this.vertices[idx + 9] = y1;
        this.vertices[idx + 10] = u2;
        this.vertices[idx + 11] = v1;
        this.vertices[idx + 12] = r;
        this.vertices[idx + 13] = g;
        this.vertices[idx + 14] = b;
        this.vertices[idx + 15] = a;
        
        // Bottom-left
        this.vertices[idx + 16] = x1;
        this.vertices[idx + 17] = y2;
        this.vertices[idx + 18] = u1;
        this.vertices[idx + 19] = v2;
        this.vertices[idx + 20] = r;
        this.vertices[idx + 21] = g;
        this.vertices[idx + 22] = b;
        this.vertices[idx + 23] = a;
        
        // Triangle 2
        // Top-right
        this.vertices[idx + 24] = x2;
        this.vertices[idx + 25] = y1;
        this.vertices[idx + 26] = u2;
        this.vertices[idx + 27] = v1;
        this.vertices[idx + 28] = r;
        this.vertices[idx + 29] = g;
        this.vertices[idx + 30] = b;
        this.vertices[idx + 31] = a;
        
        // Bottom-right
        this.vertices[idx + 32] = x2;
        this.vertices[idx + 33] = y2;
        this.vertices[idx + 34] = u2;
        this.vertices[idx + 35] = v2;
        this.vertices[idx + 36] = r;
        this.vertices[idx + 37] = g;
        this.vertices[idx + 38] = b;
        this.vertices[idx + 39] = a;
        
        // Bottom-left
        this.vertices[idx + 40] = x1;
        this.vertices[idx + 41] = y2;
        this.vertices[idx + 42] = u1;
        this.vertices[idx + 43] = v2;
        this.vertices[idx + 44] = r;
        this.vertices[idx + 45] = g;
        this.vertices[idx + 46] = b;
        this.vertices[idx + 47] = a;
        
        this.vertexCount += 6;
        this.spriteCount++;
    }
    
    /**
     * End rendering batch and flush remaining sprites
     */
    end() {
        this.flush();
    }
    
    /**
     * Flush current batch to GPU
     */
    flush() {
        if (this.vertexCount === 0) return;
        
        const gl = this.gl;
        
        // Use shader program
        this.shaderProgram.use();
        
        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        
        // Setup vertex attributes
        const stride = this.floatsPerVertex * 4; // 4 bytes per float
        
        const posLoc = this.shaderProgram.getAttributeLocation('position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
        
        const texLoc = this.shaderProgram.getAttributeLocation('texCoord');
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, stride, 8);
        
        const colorLoc = this.shaderProgram.getAttributeLocation('color');
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, stride, 16);
        
        // Set texture uniform
        const useTexture = this.currentTexture !== null;
        gl.uniform1i(this.shaderProgram.getUniformLocation('useTexture'), useTexture ? 1 : 0);
        
        if (useTexture && this.currentTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);
            gl.uniform1i(this.shaderProgram.getUniformLocation('texture'), 0);
        }
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
        
        // Reset batch
        this.vertexCount = 0;
        this.spriteCount = 0;
    }
    
    /**
     * Render multiple sprites
     * @param {Sprite[]} sprites - Array of sprites to render
     */
    render(sprites) {
        this.begin();
        
        for (const sprite of sprites) {
            this.drawSprite(sprite);
        }
        
        this.end();
    }
}
