// Shader Program Manager
class ShaderProgram {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.attributes = {};
        this.uniforms = {};
    }
    
    /**
     * Create shader program from vertex and fragment shader source code
     * @param {string} vertexSource - Vertex shader GLSL source
     * @param {string} fragmentSource - Fragment shader GLSL source
     * @returns {boolean} Success status
     */
    create(vertexSource, fragmentSource) {
        const gl = this.gl;
        
        // Compile vertex shader
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        if (!vertexShader) {
            console.error('Failed to compile vertex shader');
            return false;
        }
        
        // Compile fragment shader
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
        if (!fragmentShader) {
            console.error('Failed to compile fragment shader');
            gl.deleteShader(vertexShader);
            return false;
        }
        
        // Link program
        this.program = this.linkProgram(vertexShader, fragmentShader);
        
        // Clean up shaders (no longer needed after linking)
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        if (!this.program) {
            console.error('Failed to link shader program');
            return false;
        }
        
        // Get attribute and uniform locations
        this.getLocations();
        
        console.log('Shader program created successfully');
        return true;
    }
    
    /**
     * Compile a shader
     * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     * @param {string} source - GLSL source code
     * @returns {WebGLShader|null} Compiled shader or null on error
     */
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        // Check compilation status
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            console.error('Shader compilation error:', info);
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Link vertex and fragment shaders into a program
     * @param {WebGLShader} vertexShader - Compiled vertex shader
     * @param {WebGLShader} fragmentShader - Compiled fragment shader
     * @returns {WebGLProgram|null} Linked program or null on error
     */
    linkProgram(vertexShader, fragmentShader) {
        const gl = this.gl;
        const program = gl.createProgram();
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        // Check link status
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            console.error('Program linking error:', info);
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    /**
     * Get and cache attribute and uniform locations
     */
    getLocations() {
        const gl = this.gl;
        
        // Get attribute locations
        this.attributes.position = gl.getAttribLocation(this.program, 'a_position');
        this.attributes.texCoord = gl.getAttribLocation(this.program, 'a_texCoord');
        this.attributes.color = gl.getAttribLocation(this.program, 'a_color');
        
        // Get uniform locations
        this.uniforms.projection = gl.getUniformLocation(this.program, 'u_projection');
        this.uniforms.texture = gl.getUniformLocation(this.program, 'u_texture');
        this.uniforms.useTexture = gl.getUniformLocation(this.program, 'u_useTexture');
    }
    
    /**
     * Use this shader program
     */
    use() {
        if (this.program) {
            this.gl.useProgram(this.program);
        }
    }
    
    /**
     * Get attribute location
     * @param {string} name - Attribute name
     * @returns {number} Attribute location
     */
    getAttributeLocation(name) {
        return this.attributes[name];
    }
    
    /**
     * Get uniform location
     * @param {string} name - Uniform name
     * @returns {WebGLUniformLocation} Uniform location
     */
    getUniformLocation(name) {
        return this.uniforms[name];
    }
    
    /**
     * Create orthographic projection matrix for 2D rendering
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @returns {Float32Array} Projection matrix
     */
    static createProjectionMatrix(width, height) {
        // Orthographic projection: (0,0) at top-left, (width,height) at bottom-right
        return new Float32Array([
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1
        ]);
    }
    
    /**
     * Load shader program from shader files (async)
     * @param {string} vertexPath - Path to vertex shader file
     * @param {string} fragmentPath - Path to fragment shader file
     * @returns {Promise<boolean>} Success status
     */
    async loadFromFiles(vertexPath, fragmentPath) {
        try {
            const [vertexResponse, fragmentResponse] = await Promise.all([
                fetch(vertexPath),
                fetch(fragmentPath)
            ]);
            
            if (!vertexResponse.ok || !fragmentResponse.ok) {
                console.error('Failed to load shader files');
                return false;
            }
            
            const vertexSource = await vertexResponse.text();
            const fragmentSource = await fragmentResponse.text();
            
            return this.create(vertexSource, fragmentSource);
        } catch (error) {
            console.error('Error loading shaders:', error);
            return false;
        }
    }
}
