# Sprite Assets - Troup'O Invaders

Complete guide to the sprite workflow, tools, and asset management for Troup'O Invaders.

## 🎯 Quick Reference

```bash
# View all sprites interactively
open http://localhost:8080/sprite-viewer.html

# Generate ruminant enemy sprites
docker-compose exec troupo-invaders node generate-ruminant-sprites.js

# Pack sprites into atlas (production optimization)
docker-compose exec troupo-invaders npm run pack-sprites

# View sprite metadata
cat ../sprite-atlas.json
```

## 📁 Directory Structure

```
assets/sprites/
├── README.md (this file)
├── player.png              # Player ship sprite
├── *-enemy.png            # Enemy sprites (sheep, goat, alpaca)
├── *-enemy-frame*.png     # Animation frames for enemies
├── bullet-*.png           # Projectile sprites
├── explosion*.png         # Explosion animation frames
├── shield.png             # Defensive structure
└── ufo.png               # Bonus enemy
```

## 🎨 Adding New Sprites

### Method 1: Using Generator Scripts (Recommended for Pixel Art)

Perfect for creating detailed pixel art sprites programmatically with precise control over every pixel.

**For Enemy Sprites:**

1. Edit `generate-ruminant-sprites.js` in the project root:

```javascript
function createMyNewEnemy() {
  const size = 30; // Standard enemy size
  const pixels = new Uint8Array(size * size * 4); // RGBA buffer
  
  // Define your color palette
  const bodyLight = [200, 180, 160, 255];
  const bodyMain = [180, 160, 140, 255];
  const bodyDark = [140, 120, 100, 255];
  
  // Draw your sprite using helper functions
  // fillRect(pixels, size, x, y, width, height, r, g, b, a)
  fillRect(pixels, size, 10, 10, 10, 10, ...bodyMain);
  
  // setPixel(pixels, size, x, y, r, g, b, a)
  setPixel(pixels, size, 15, 15, ...bodyLight);
  
  // Save the PNG
  createPNG(size, size, pixels, 'my-enemy.png');
  return { name: 'my-enemy', width: size, height: size, points: 40 };
}
```

2. Add your function to the `main()` function:
```javascript
function main() {
  const sprites = [
    createSheep(),
    createGoat(),
    createAlpaca(),
    createMyNewEnemy(), // Add your sprite here
  ];
  // ...
}
```

3. Generate the sprite:
```bash
docker-compose exec troupo-invaders node generate-ruminant-sprites.js
```

4. **Register in Atlas** - Add to `assets/sprite-atlas.json`:
```json
{
  "sprites": {
    "my-enemy": {
      "file": "my-enemy.png",
      "width": 30,
      "height": 30,
      "points": 40
    }
  }
}
```

**Pixel Art Tips:**
- Use `fillRect()` for solid areas (bodies, heads, blocks)
- Use `setPixel()` for details (eyes, highlights, texture dots)
- Work with a defined color palette (8-16 colors typical)
- Apply shading with top-left light source convention
- Create multi-tone gradients (light → main → mid → dark → outline)
- Test at actual size (30x30px) and zoomed in viewer

### Method 2: External Pixel Art Tools

Use your favorite pixel art editor for more artistic control.

**Recommended Tools:**
- **Aseprite** - Professional pixel art tool with animation support
- **Piskel** - Free browser-based pixel art editor
- **GIMP** - Full-featured image editor
- **GraphicsGale** - Traditional pixel art tool

**Workflow:**

1. **Create** your sprite in the tool:
   - Use appropriate dimensions (see Size Guidelines below)
   - Enable transparency where needed
   - Work at 1x scale (no upscaling)
   - Save as PNG with alpha channel

2. **Export** to `assets/sprites/`:
   ```bash
   # Copy from your editor's export location
   cp ~/my-sprite.png ./assets/sprites/my-sprite.png
   ```

3. **Register** in `assets/sprite-atlas.json`:
   ```json
   {
     "sprites": {
       "my-sprite": {
         "file": "my-sprite.png",
         "width": 32,
         "height": 32
       }
     }
   }
   ```

4. **Verify** in sprite viewer at http://localhost:8080/sprite-viewer.html

### Size Guidelines

| Type | Dimensions | Example |
|------|-----------|---------|
| Enemies | 30×30 | sheep-enemy.png |
| Player | 40×30 | player.png |
| UFO/Bonus | 40×20 | ufo.png |
| Bullets | 4×12 | bullet-player.png |
| Power-ups | 20×20 | (future) |
| Explosions | 32×32 | explosion1.png |
| Shields | 60×40 | shield.png |

**Why these sizes?**
- **30×30 for enemies**: Consistent sizing for formation grid alignment
- **40×30 for player**: Wider profile but same row height as enemies
- **Small bullets**: Fast movement, minimal screen clutter
- **Larger explosions**: Visual impact, readable animation

## 🔍 Sprite Viewer Tool

Interactive tool for inspecting, testing, and exporting sprites.

**Access:** http://localhost:8080/sprite-viewer.html

### Features

#### Gallery View (Default)
- Browse all sprites in a grid layout
- Search by name (filters in real-time)
- Click any sprite to view details
- Zoom controls (1x, 2x, 4x, 8x, 16x)
- Custom background color picker
- Pixel grid overlay toggle (shows individual pixels)

#### Atlas View
Toggle to see the packed sprite atlas visualization:
- **Full Atlas Canvas**: View entire packed texture with all sprites
- **Individual Sprite Highlight**: Click any sprite to highlight its bounds
- **UV Coordinate Display**: See texture coordinates for selected sprite
- **Atlas Metadata**: Dimensions, sprite count, memory usage

#### Detail Panel
When a sprite is selected:
- High-resolution preview with zoom
- Sprite dimensions and file path
- UV coordinates (if in packed mode)
- Export buttons:
  - **Export Sprite**: Download current sprite as PNG
  - **Export Atlas**: Download full packed atlas texture
  - **Export JSON**: Download sprite-atlas.json metadata

#### Keyboard Controls
- **Arrow Keys**: Navigate between sprites
- **+/-**: Zoom in/out
- **G**: Toggle pixel grid
- **Space**: Toggle atlas view

### Common Viewer Workflows

**Check transparency:**
1. Open sprite viewer
2. Set background to bright color (pink/green)
3. Look for unwanted opaque pixels

**Inspect pixel details:**
1. Select sprite
2. Set zoom to 16x
3. Enable pixel grid (G key)
4. Examine individual pixel placement

**Compare animations:**
1. Search for sprite name (e.g., "sheep")
2. View all frames side-by-side
3. Check frame consistency

## 📦 Sprite Atlas System

The sprite atlas system supports two modes for optimal development and production workflows.

### Individual Mode (Development)

**When to use:**
- ✅ Active sprite development
- ✅ Frequent sprite changes
- ✅ Testing new designs
- ✅ Easy to update single sprite without repacking

**How it works:**
- Each sprite stored as separate PNG file
- `sprite-atlas.json` references individual files
- WebGL loads each texture separately
- Slower (multiple HTTP requests + texture binds)

**Configuration in sprite-atlas.json:**
```json
{
  "version": "2.0",
  "mode": "individual",
  "sprites": {
    "player": {
      "file": "player.png",
      "width": 40,
      "height": 30,
      "uv": null
    }
  }
}
```

### Packed Mode (Production)

**When to use:**
- ✅ Production builds
- ✅ Performance optimization needed
- ✅ Sprites are finalized
- ✅ Reducing network requests

**Benefits:**
- **Single HTTP request**: One texture file vs. many
- **Single GPU texture**: One texture bind for all sprites
- **Better GPU cache**: Spatial locality of sprite data
- **Reduced draw calls**: Batch rendering optimization
- **Lower memory overhead**: One texture unit vs. many

**Performance Impact:**
```
Individual Mode:  16 sprites = 16 HTTP requests + 16 texture binds
Packed Mode:      16 sprites = 1 HTTP request + 1 texture bind

Typical improvement: 60% reduction in sprite render time
```

**How to pack:**

1. Run the sprite packer:
```bash
docker-compose exec troupo-invaders npm run pack-sprites
```

2. The packer will:
   - Load all sprites listed in `sprite-atlas.json`
   - Arrange them efficiently in a texture atlas
   - Generate `sprite-atlas.png` with all sprites
   - Update `sprite-atlas.json` with UV coordinates
   - Set mode to "packed" automatically

3. Verify the atlas:
   - Open sprite-viewer.html
   - Toggle Atlas View
   - Check all sprites are visible and correctly positioned

**Atlas with UV coordinates:**
```json
{
  "version": "2.0",
  "mode": "packed",
  "atlasFile": "sprite-atlas.png",
  "atlasWidth": 256,
  "atlasHeight": 256,
  "sprites": {
    "player": {
      "file": "player.png",
      "width": 40,
      "height": 30,
      "uv": {
        "u": 0.0,
        "v": 0.0,
        "u2": 0.15625,
        "v2": 0.1171875
      }
    }
  }
}
```

**Switching back to Individual Mode:**

Simply edit `sprite-atlas.json` and change mode:
```json
{
  "mode": "individual"
}
```

No need to delete the packed atlas - it will be ignored.

## 📐 Atlas Format Specification

For complete technical details, see: [../SPRITE-ATLAS-SPEC.md](../SPRITE-ATLAS-SPEC.md)

**Quick Reference:**

```json
{
  "version": "2.0",              // Format version
  "mode": "individual|packed",   // Rendering mode
  "atlasFile": "sprite-atlas.png", // (packed mode only)
  "atlasWidth": 256,             // (packed mode only)
  "atlasHeight": 256,            // (packed mode only)
  "sprites": {
    "sprite-name": {
      "file": "sprite.png",      // Individual file path
      "width": 32,               // Sprite width in pixels
      "height": 32,              // Sprite height in pixels
      "frames": 1,               // Animation frames (default: 1)
      "uv": {                    // (packed mode only)
        "u": 0.0,                // Left UV coordinate
        "v": 0.0,                // Top UV coordinate
        "u2": 0.125,             // Right UV coordinate
        "v2": 0.125              // Bottom UV coordinate
      }
    }
  }
}
```

## 🎬 Animation Support

Multi-frame animations for dynamic sprites.

**Current Frame Convention:**
```
sprite-name.png         # Base/single frame
sprite-name-frame1.png  # Animation frame 1
sprite-name-frame2.png  # Animation frame 2
sprite-name-frame3.png  # Animation frame 3 (etc.)
```

**Example: Sheep with 2-frame animation**

Files:
- `sheep-enemy.png` (base frame)
- `sheep-enemy-frame1.png`
- `sheep-enemy-frame2.png`

Atlas configuration:
```json
{
  "sheep-enemy": {
    "file": "sheep-enemy.png",
    "width": 30,
    "height": 30,
    "frames": 2
  }
}
```

**Creating animations in generator script:**

```javascript
function createAnimatedSprite() {
  const frames = [];
  
  // Frame 1
  const frame1 = new Uint8Array(30 * 30 * 4);
  // ... draw frame 1 ...
  createPNG(30, 30, frame1, 'my-sprite-frame1.png');
  
  // Frame 2
  const frame2 = new Uint8Array(30 * 30 * 4);
  // ... draw frame 2 ...
  createPNG(30, 30, frame2, 'my-sprite-frame2.png');
  
  return {
    name: 'my-sprite',
    width: 30,
    height: 30,
    frames: 2
  };
}
```

**Animation playback** (in game code):
- Frame timing controlled by game logic
- Typical rate: 2-8 FPS for deliberate pixel art animation
- See `src/entities/sprite.js` for animation system

## 🎨 Sprite Style Guide

### Ruminant Theme

**Concept:** Pastoral farm animals as space invaders

**Current Roster:**
- �양 **Sheep** (10 points) - Fluffy wool, gentle eyes, pink nose
- 🐐 **Goat** (20 points) - Curved horns, horizontal pupils, beard
- 🦙 **Alpaca** (30 points) - Long neck, large ears, fuzzy texture

**Visual Style:**
- Cute, approachable, NOT menacing
- Earth tones: creams, browns, tans, grays
- Cartoon proportions with expressive features
- Multi-tone shading for depth (5-7 shades per color)
- Top-left light source (consistent across all sprites)

### Technical Standards

**Color Palette:**
- 8-16 colors per sprite (including shading)
- Use hex colors in generator: `const cream = [240, 230, 210, 255]`
- Define palette at function start for consistency
- Reuse colors across related sprites (theme cohesion)

**Shading System:**
- **Light**: Top-left highlights, brightest areas
- **Main**: Base color, largest area coverage
- **Mid**: Transition between light and shadow
- **Dark**: Shadows on bottom-right
- **Outline**: Darkest color for definition

**Details:**
- Eyes: Large, expressive, with shine/sparkle pixels
- Outlines: 1-2px dark pixels around forms
- Texture: Strategic light/dark pixels for fur/wool
- Features: Prominent characteristics (horns, ears, noses)

## 🔧 Troubleshooting

### Sprite not appearing in game

1. Check sprite-atlas.json has correct entry
2. Verify PNG file exists in assets/sprites/
3. Check browser console for loading errors
4. Verify dimensions match atlas metadata
5. Clear browser cache and reload

### Sprite appears corrupted

1. Regenerate sprite: `node generate-ruminant-sprites.js`
2. Check PNG is valid: `file assets/sprites/your-sprite.png`
3. Open in image viewer to verify manually
4. Check for RGB vs RGBA issues (must be RGBA)

### Atlas packer fails

1. Ensure running in Docker container (required for canvas dep)
2. Check all sprites in atlas.json exist as files
3. Verify dimensions don't exceed atlas size (default 256×256)
4. Review console output for specific error

### Animation frames not loading

1. Verify file naming: `sprite-name-frame1.png`, not `sprite-name-1.png`
2. Check `frames` property in sprite-atlas.json
3. Ensure all frames have identical dimensions
4. Base sprite (`sprite-name.png`) should exist

### Docker container issues

```bash
# Restart container
docker-compose down
docker-compose up -d

# Check container status
docker-compose ps

# View container logs
docker-compose logs troupo-invaders
```

## 📚 Additional Resources

- **Main Assets README**: [../README.md](../README.md) - Overview of asset system
- **Atlas Specification**: [../SPRITE-ATLAS-SPEC.md](../SPRITE-ATLAS-SPEC.md) - Complete format docs
- **Contributing Guide**: [../../CONTRIBUTING.md](../../CONTRIBUTING.md) - For sprite artists
- **Sprite Viewer Tool**: `../../sprite-viewer.html` - Interactive inspection
- **Generator Script**: `../../generate-ruminant-sprites.js` - Reference implementation
- **Project Issues**: Run `bd list` to see sprite-related tasks

## 🚀 Best Practices

**Development Workflow:**
1. ✅ Work in individual mode during development
2. ✅ Use sprite viewer constantly to verify changes
3. ✅ Test at multiple zoom levels (1x for real size, 8x+ for pixels)
4. ✅ Verify transparency with different backgrounds
5. ✅ Commit sprites with descriptive messages
6. ✅ Run packer before production builds

**Sprite Creation:**
1. ✅ Start with size guidelines (30×30 for enemies)
2. ✅ Define complete color palette upfront
3. ✅ Block in main shapes first, details second
4. ✅ Apply consistent lighting (top-left source)
5. ✅ Add texture last with strategic pixels
6. ✅ Test at actual size frequently
7. ✅ Create animation frames if sprite will move/change

**File Management:**
1. ✅ Use kebab-case naming (e.g., `power-up-shield.png`)
2. ✅ Keep sprites under 5KB each
3. ✅ Always use RGBA PNG format (not RGB)
4. ✅ Update sprite-atlas.json immediately after adding sprite
5. ✅ Delete unused sprites and remove from atlas.json

**Performance:**
1. ✅ Pack sprites for production
2. ✅ Keep atlas under 512×512 if possible
3. ✅ Use power-of-2 dimensions for atlas (256, 512, 1024)
4. ✅ Minimize individual sprite count (reuse where possible)
5. ✅ Consider sprite sheets for complex animations

---

**Questions?** Check the [issues tracker](../../.beads/issues.jsonl) or create a sprite-related issue with `bd create`.
