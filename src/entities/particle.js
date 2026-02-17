// Particle Entity - Placeholder
// TODO: Implement in task test3-13u
class Particle extends Sprite {
    constructor(x, y, velocity) {
        super(x, y, 2, 2, CONFIG.COLORS.PARTICLE);
        this.velocity = velocity;
        this.lifetime = CONFIG.PARTICLE_LIFETIME;
        this.age = 0;
    }
}
