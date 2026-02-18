/**
 * InputManager - Handles keyboard input with state tracking
 * Provides key state queries and action buffering for game input
 */
class InputManager {
    constructor() {
        // Key states: true = pressed, false/undefined = not pressed
        this.keys = new Map();
        
        // Previous frame key states for detecting key presses (not just held)
        this.prevKeys = new Map();
        
        // Action buffer for single-frame actions (like shooting)
        this.actionBuffer = new Set();
        
        // Key mapping for convenience
        this.KEY_CODES = {
            LEFT: ['ArrowLeft', 'KeyA'],
            RIGHT: ['ArrowRight', 'KeyD'],
            UP: ['ArrowUp', 'KeyW'],
            DOWN: ['ArrowDown', 'KeyS'],
            SHOOT: ['Space'],
            PAUSE: ['KeyP', 'Escape'],
            RESTART: ['KeyR'],
            ENTER: ['Enter'],
        };
        
        // Bound event handlers for cleanup
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Track if initialized to prevent multiple listeners
        this.initialized = false;
        
        console.log('InputManager created');
    }
    
    /**
     * Initialize input listeners
     */
    initialize() {
        if (this.initialized) {
            console.warn('InputManager already initialized');
            return;
        }
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Prevent default behavior for game keys
        window.addEventListener('keydown', (e) => {
            if (this.isGameKey(e.code)) {
                e.preventDefault();
            }
        });
        
        this.initialized = true;
        console.log('✓ InputManager initialized');
    }
    
    /**
     * Cleanup event listeners
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keys.clear();
        this.prevKeys.clear();
        this.actionBuffer.clear();
        this.initialized = false;
        console.log('InputManager destroyed');
    }
    
    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        const code = event.code;
        
        // Only register if not already pressed (prevent key repeat)
        if (!this.keys.get(code)) {
            this.keys.set(code, true);
            
            // Add to action buffer for single-frame actions
            this.actionBuffer.add(code);
        }
    }
    
    /**
     * Handle keyup events
     */
    handleKeyUp(event) {
        const code = event.code;
        this.keys.set(code, false);
    }
    
    /**
     * Update at end of frame - manages action buffer and previous states
     * Call this at the end of your game loop update
     */
    update() {
        // Clear action buffer after each frame
        this.actionBuffer.clear();
        
        // Update previous key states for next frame
        this.prevKeys = new Map(this.keys);
    }
    
    /**
     * Check if a specific key code is currently pressed
     * @param {string} code - Key code (e.g., 'ArrowLeft', 'Space')
     * @returns {boolean}
     */
    isKeyDown(code) {
        return this.keys.get(code) === true;
    }
    
    /**
     * Check if key was just pressed this frame (not held from previous frame)
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isKeyPressed(code) {
        return this.keys.get(code) === true && this.prevKeys.get(code) !== true;
    }
    
    /**
     * Check if key was just released this frame
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isKeyReleased(code) {
        return this.keys.get(code) === false && this.prevKeys.get(code) === true;
    }
    
    /**
     * Check if an action was triggered this frame (from action buffer)
     * Useful for actions that should only fire once per key press
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isActionTriggered(code) {
        return this.actionBuffer.has(code);
    }
    
    /**
     * Check if any key in a mapped action is pressed
     * @param {string} action - Action name from KEY_CODES
     * @returns {boolean}
     */
    isActionDown(action) {
        const codes = this.KEY_CODES[action];
        if (!codes) return false;
        
        return codes.some(code => this.isKeyDown(code));
    }
    
    /**
     * Check if any key in a mapped action was just pressed
     * @param {string} action - Action name from KEY_CODES
     * @returns {boolean}
     */
    isActionPressed(action) {
        const codes = this.KEY_CODES[action];
        if (!codes) return false;
        
        return codes.some(code => this.isKeyPressed(code));
    }
    
    /**
     * Check if any key in a mapped action was triggered this frame
     * @param {string} action - Action name from KEY_CODES
     * @returns {boolean}
     */
    isActionTriggeredByName(action) {
        const codes = this.KEY_CODES[action];
        if (!codes) return false;
        
        return codes.some(code => this.isActionTriggered(code));
    }
    
    /**
     * Get horizontal movement input (-1 for left, 0 for none, 1 for right)
     * @returns {number}
     */
    getHorizontalAxis() {
        let axis = 0;
        
        if (this.isActionDown('LEFT')) {
            axis -= 1;
        }
        if (this.isActionDown('RIGHT')) {
            axis += 1;
        }
        
        return axis;
    }
    
    /**
     * Get vertical movement input (-1 for up, 0 for none, 1 for down)
     * @returns {number}
     */
    getVerticalAxis() {
        let axis = 0;
        
        if (this.isActionDown('UP')) {
            axis -= 1;
        }
        if (this.isActionDown('DOWN')) {
            axis += 1;
        }
        
        return axis;
    }
    
    /**
     * Check if this is a game-related key (for preventing default behavior)
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isGameKey(code) {
        const allGameKeys = Object.values(this.KEY_CODES).flat();
        return allGameKeys.includes(code);
    }
    
    /**
     * Clear all key states (useful for state transitions)
     */
    clearAll() {
        this.keys.clear();
        this.prevKeys.clear();
        this.actionBuffer.clear();
    }
    
    /**
     * Get debug info about current input state
     * @returns {object}
     */
    getDebugInfo() {
        const pressedKeys = [];
        this.keys.forEach((value, key) => {
            if (value) pressedKeys.push(key);
        });
        
        return {
            pressedKeys,
            actionBufferSize: this.actionBuffer.size,
            horizontal: this.getHorizontalAxis(),
            vertical: this.getVerticalAxis()
        };
    }
}
