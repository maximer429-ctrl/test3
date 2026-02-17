// UFO Entity - Placeholder
// TODO: Implement in task test3-163
class UFO extends Sprite {
    constructor(x, y) {
        super(x, y, CONFIG.UFO_WIDTH, CONFIG.UFO_HEIGHT, CONFIG.COLORS.UFO);
        this.velocity = CONFIG.UFO_SPEED;
        this.points = CONFIG.UFO_POINTS;
    }
}
