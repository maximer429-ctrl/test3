// Base Sprite Class - Placeholder
// TODO: Implement in task test3-3gx
class Sprite {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    render(renderer) {
        // Override in subclasses
    }
}
