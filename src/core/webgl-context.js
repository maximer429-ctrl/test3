// WebGL Context Manager
class WebGLContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.viewportWidth = canvas.width;
        this.viewportHeight = canvas.height;
    }
    
    /**
     * Initialize WebGL context with proper settings for 2D sprite rendering
     * @returns {WebGLRenderingContext|null} The WebGL context or null if failed
     */
    initialize() {
        // Try to get WebGL context
        const gl = this.canvas.getContext('webgl', {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false
        }) || this.canvas.getContext('experimental-webgl', {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false
        });
        
        if (!gl) {
            console.error('WebGL not supported');
            return null;
        }
        
        this.gl = gl;
        
        // Set viewport
        gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        
        // Enable blending for sprites with transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Disable depth testing (we're doing 2D)
        gl.disable(gl.DEPTH_TEST);
        
        // Set clear color (black)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        console.log('WebGL initialized successfully');
        console.log('WebGL Version:', gl.getParameter(gl.VERSION));
        console.log('WebGL Vendor:', gl.getParameter(gl.VENDOR));
        console.log('WebGL Renderer:', gl.getParameter(gl.RENDERER));
        
        return gl;
    }
    
    /**
     * Clear the screen
     */
    clear() {
        if (this.gl) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
    }
    
    /**
     * Set the clear color
     * @param {number} r - Red component (0-1)
     * @param {number} g - Green component (0-1)
     * @param {number} b - Blue component (0-1)
     * @param {number} a - Alpha component (0-1)
     */
    setClearColor(r, g, b, a) {
        if (this.gl) {
            this.gl.clearColor(r, g, b, a);
        }
    }
    
    /**
     * Resize the viewport (call when canvas size changes)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }
    
    /**
     * Get the WebGL context
     * @returns {WebGLRenderingContext}
     */
    getContext() {
        return this.gl;
    }
    
    /**
     * Check if WebGL is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.gl !== null;
    }
}
