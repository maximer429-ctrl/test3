// Bullet Entity - Placeholder
// TODO: Implement in task test3-966
class Bullet extends Sprite {
    constructor(x, y, velocity, isPlayerBullet) {
        const color = isPlayerBullet ? CONFIG.COLORS.BULLET_PLAYER : CONFIG.COLORS.BULLET_ENEMY;
        super(x, y, CONFIG.BULLET_WIDTH, CONFIG.BULLET_HEIGHT, color);
        this.velocity = velocity;
        this.isPlayerBullet = isPlayerBullet;
        this.active = true;
    }
}
