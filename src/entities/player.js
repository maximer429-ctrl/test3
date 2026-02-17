// Player Entity - Placeholder
// TODO: Implement in task test3-03n
class Player extends Sprite {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT, CONFIG.COLORS.PLAYER);
        this.lives = CONFIG.PLAYER_START_LIVES;
        this.canFire = true;
    }
}
