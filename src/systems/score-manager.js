// Score Manager - Placeholder
// TODO: Implement in task test3-8sm
class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('troupo-highscore')) || 0;
    }
    
    addScore(points) {
        console.log('ScoreManager: Not yet implemented');
    }
}
