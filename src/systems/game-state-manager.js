/**
 * Game State Manager
 * Manages game state transitions and UI overlay visibility
 * Implemented in: test3-h3q
 */
class GameStateManager {
    constructor() {
        this.currentState = CONFIG.GAME_STATES.MENU;
        this.previousState = null;
        this.stateChangeCallbacks = [];
        
        // Get UI overlay elements
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.pauseOverlay = document.getElementById('pause-overlay');
        
        // Initialize in menu state
        this.updateUI();
        
        console.log('GameStateManager initialized in state:', this.currentState);
    }
    
    /**
     * Get the current game state
     * @returns {string} Current state
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Check if the game is in a specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    isState(state) {
        return this.currentState === state;
    }
    
    /**
     * Check if the game is currently playing (not paused, not in menu)
     * @returns {boolean}
     */
    isPlaying() {
        return this.currentState === CONFIG.GAME_STATES.PLAYING;
    }
    
    /**
     * Check if the game is paused
     * @returns {boolean}
     */
    isPaused() {
        return this.currentState === CONFIG.GAME_STATES.PAUSED;
    }
    
    /**
     * Set a new game state with validation
     * @param {string} newState - New state to transition to
     */
    setState(newState) {
        // Validate state
        const validStates = Object.values(CONFIG.GAME_STATES);
        if (!validStates.includes(newState)) {
            console.error(`Invalid state: ${newState}`);
            return;
        }
        
        // Check if state actually changed
        if (this.currentState === newState) {
            return;
        }
        
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        
        console.log(`State transition: ${oldState} -> ${newState}`);
        
        // Update UI overlays
        this.updateUI();
        
        // Notify callbacks
        this.notifyStateChange(oldState, newState);
    }
    
    /**
     * Start the game (transition from menu to playing)
     */
    startGame() {
        if (this.isState(CONFIG.GAME_STATES.MENU)) {
            this.setState(CONFIG.GAME_STATES.PLAYING);
        }
    }
    
    /**
     * Pause the game
     */
    pause() {
        if (this.isState(CONFIG.GAME_STATES.PLAYING)) {
            this.setState(CONFIG.GAME_STATES.PAUSED);
        }
    }
    
    /**
     * Resume from pause
     */
    resume() {
        if (this.isState(CONFIG.GAME_STATES.PAUSED)) {
            this.setState(CONFIG.GAME_STATES.PLAYING);
        }
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.isState(CONFIG.GAME_STATES.PLAYING)) {
            this.pause();
        } else if (this.isState(CONFIG.GAME_STATES.PAUSED)) {
            this.resume();
        }
    }
    
    /**
     * End the game (transition to game over)
     */
    gameOver() {
        if (this.isState(CONFIG.GAME_STATES.PLAYING)) {
            this.setState(CONFIG.GAME_STATES.GAME_OVER);
        }
    }
    
    /**
     * Return to menu (from game over or pause)
     */
    returnToMenu() {
        this.setState(CONFIG.GAME_STATES.MENU);
    }
    
    /**
     * Update UI overlays based on current state
     */
    updateUI() {
        if (!this.menuOverlay || !this.gameOverOverlay) {
            return;
        }
        
        // Hide all overlays by default
        this.menuOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        if (this.pauseOverlay) {
            this.pauseOverlay.classList.add('hidden');
        }
        
        // Show appropriate overlay based on state
        switch (this.currentState) {
            case CONFIG.GAME_STATES.MENU:
                this.menuOverlay.classList.remove('hidden');
                break;
                
            case CONFIG.GAME_STATES.GAME_OVER:
                this.gameOverOverlay.classList.remove('hidden');
                break;
                
            case CONFIG.GAME_STATES.PAUSED:
                if (this.pauseOverlay) {
                    this.pauseOverlay.classList.remove('hidden');
                }
                break;
                
            case CONFIG.GAME_STATES.PLAYING:
                // All overlays hidden, game visible
                break;
        }
    }
    
    /**
     * Register a callback for state changes
     * @param {Function} callback - Function to call on state change (oldState, newState)
     */
    onStateChange(callback) {
        if (typeof callback === 'function') {
            this.stateChangeCallbacks.push(callback);
        }
    }
    
    /**
     * Notify all registered callbacks of state change
     * @param {string} oldState - Previous state
     * @param {string} newState - New state
     */
    notifyStateChange(oldState, newState) {
        this.stateChangeCallbacks.forEach(callback => {
            try {
                callback(oldState, newState);
            } catch (error) {
                console.error('Error in state change callback:', error);
            }
        });
    }
    
    /**
     * Update method called each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Could handle state-specific updates here
        // For now, state manager is passive and just tracks state
    }
}
