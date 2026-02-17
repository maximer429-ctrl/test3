// Game State Manager - Placeholder
// TODO: Implement in task test3-h3q
class GameStateManager {
    constructor() {
        this.currentState = CONFIG.GAME_STATES.MENU;
    }
    
    setState(newState) {
        console.log('GameStateManager: Not yet implemented');
        this.currentState = newState;
    }
    
    getState() {
        return this.currentState;
    }
}
