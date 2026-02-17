// Shield Entity - Placeholder
// TODO: Implement in task test3-073
class Shield extends Sprite {
    constructor(x, y) {
        super(x, y, CONFIG.SHIELD_WIDTH, CONFIG.SHIELD_HEIGHT, CONFIG.COLORS.SHIELD);
        this.health = 100;
    }
}
