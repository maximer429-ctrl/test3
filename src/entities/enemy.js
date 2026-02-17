// Enemy Entity - Placeholder
// TODO: Implement in task test3-noz
class Enemy extends Sprite {
    constructor(x, y, type) {
        super(x, y, CONFIG.ENEMY_WIDTH, CONFIG.ENEMY_HEIGHT, CONFIG.COLORS.ENEMY_1);
        this.type = type;
        this.points = CONFIG.ENEMY_POINTS[type] || 10;
    }
}
