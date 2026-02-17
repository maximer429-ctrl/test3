# Contributing to Troup'O Invaders

## For Sprite Artists 🎨

### Quick Start

1. **View current sprites:**
   ```bash
   # Make sure the container is running
   docker-compose up
   
   # Open in browser
   http://localhost:8080/sprite-viewer.html
   ```

2. **Check sprite issues:**
   ```bash
   bd list | grep -E "sprite|theme|ruminant|power-up|animated"
   ```

3. **Claim an issue:**
   ```bash
   bd update test3-xxx --status in_progress
   ```

### Creating New Sprites

#### Method 1: Extend the Generator Script

Edit `generate-ruminant-sprites.js` to add new sprites:

```javascript
function createMyNewSprite() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  // Use fillRect() and setPixel() to draw
  fillRect(pixels, size, x, y, width, height, r, g, b, a);
  
  createPNG(size, size, pixels, 'my-sprite.png');
  return { name: 'my-sprite', width: size, height: size };
}
```

Then run:
```bash
node generate-ruminant-sprites.js
```

#### Method 2: Use External Tools

Create sprites in your favorite pixel art tool (Aseprite, Piskel, GIMP, etc.):

1. Export as PNG to `assets/sprites/`
2. Keep pixel dimensions small (16x16, 20x20, 30x30, 40x40)
3. Use transparency where needed
4. Export at 1x scale (no upscaling)

### Updating the Sprite Atlas

After creating sprites, update `assets/sprite-atlas.json`:

```json
{
  "sprites": {
    "your-sprite-name": {
      "file": "your-sprite.png",
      "width": 30,
      "height": 30,
      "points": 50  // Optional: for enemies
    }
  }
}
```

### Sprite Guidelines

#### Dimensions
- **Enemies**: 30x30px (consistent size for formations)
- **Player**: 40x30px (wider but same row height)
- **Bullets**: 4x12px (small projectiles)
- **Power-ups**: 20x20px (medium sized)
- **UFO**: 40x20px (wide bonus enemy)
- **Explosions**: 32x32px (larger for visual impact)

#### Theme: Ruminant Invaders
- **Enemies**: Sheep, goats, alpacas (currently implemented)
- **Possible additions**: More farm animals, pastoral elements
- **Colors**: Natural earth tones, creams, browns, greens
- **Style**: Cute pixel art, not menacing

#### Technical Requirements
- **Format**: PNG with transparency
- **Color depth**: RGBA (8-bit per channel)
- **File size**: Keep small (<5KB per sprite ideal)
- **Naming**: kebab-case (e.g., `sheep-enemy.png`, `power-up-shield.png`)

### Testing Your Sprites

1. **In Sprite Viewer** (recommended):
   - http://localhost:8080/sprite-viewer.html
   - Use zoom to inspect pixels
   - Toggle backgrounds to check transparency
   - Click refresh after changes

2. **In Game**:
   - Sprites automatically load from atlas
   - Check `src/game.js` for test sprite placement
   - Refresh browser to see changes

### Common Tasks

#### Adding Animated Sprites

For multi-frame animations (see issue test3-cnf):

```json
{
  "animated-sprite": {
    "file": "animation-base.png",
    "width": 32,
    "height": 32,
    "frames": 4,
    "frameWidth": 32,
    "frameDuration": 100
  }
}
```

#### Creating Variations

For enemy variations (different colors, slight changes):

1. Copy base sprite function in generator
2. Modify colors or details
3. Give unique name
4. Add to sprite-atlas.json

#### Batch Processing

When creating many sprites:

```bash
# Run generator
node generate-ruminant-sprites.js

# Check output
ls -lh assets/sprites/

# Verify in viewer
# (refresh sprite-viewer.html)
```

### Sprite Development Workflow

```
1. Check bd for sprite issues
   └─> bd list | grep sprite

2. Claim an issue
   └─> bd update test3-xxx --status in_progress

3. Design sprite (paper sketch, digital tool, or code)

4. Create sprite PNG
   ├─> Option A: Modify generator script → node script.js
   └─> Option B: External tool → export to assets/sprites/

5. Update sprite-atlas.json
   └─> Add entry with file, dimensions, optional metadata

6. Test in sprite viewer
   └─> http://localhost:8080/sprite-viewer.html
   └─> Check zoom, transparency, dimensions

7. Test in game (optional)
   └─> Add test sprite to src/game.js
   └─> Verify in gameplay

8. Commit and close issue
   └─> git add assets/sprites/ assets/sprite-atlas.json
   └─> git commit -m "feat: add [sprite description] (#test3-xxx)"
   └─> bd close test3-xxx
```

### Getting Help

- **Sprite not showing?** Check:
  - File path in sprite-atlas.json matches actual file
  - PNG is valid (try opening in image viewer)
  - Browser console for errors (F12)
  - Refresh sprite viewer

- **Wrong size?** 
  - Check dimensions in sprite-atlas.json match actual PNG
  - Use sprite viewer's zoom to see actual pixels

- **Colors look wrong?**
  - PNG might be indexed color instead of RGBA
  - Check alpha channel (transparency)
  - Try background toggle in sprite viewer

## For Gameplay Developers 💻

See main README.md for gameplay development workflow.

Key points:
- Sprites are loaded via `TextureManager` from sprite-atlas.json
- Use `textureManager.getSpriteData(name)` to get sprite info
- Rendering happens in `SpriteRenderer`
- Don't hardcode sprite dimensions - get from atlas

## For Everyone

### Before Pushing

```bash
# Ensure container works
docker-compose up

# Check for errors
bd list --status=open

# Sync with bd
bd sync

# Push to remote
git push
```

### Communication

- Use bd issue comments for technical details
- Keep issue descriptions updated
- Close issues promptly after completion
- Create new issues for discovered work

---

**Happy creating!** 🐑🎨🦙
