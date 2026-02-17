# Assets Directory

This directory contains game assets for Troup'O Invaders.

## Sprite System

The game uses a flexible sprite atlas system that supports two modes:

### Individual Mode (Current)
- Each sprite is stored as a separate PNG file in `sprites/`
- `sprite-atlas.json` references individual files
- Best for development and easy sprite updates

### Packed Mode (Available)
- All sprites combined into a single texture atlas (`sprite-atlas.png`)
- Improved performance (single texture bind)
- Better GPU memory utilization
- See [SPRITE-ATLAS-SPEC.md](SPRITE-ATLAS-SPEC.md) for format details

## Workflow

### Adding New Sprites

1. Create your sprite PNG and save to `sprites/`
2. Update `sprite-atlas.json` with sprite data:
   ```json
   "my-sprite": {
     "file": "my-sprite.png",
     "width": 32,
     "height": 32,
     "uv": null
   }
   ```

### Packing Sprites

To generate a packed sprite atlas:

```bash
npm install          # Install canvas dependency if needed
npm run pack-sprites # Run the packer tool
```

This will:
- Read all sprites from `sprite-atlas.json`
- Pack them into `sprite-atlas.png`
- Update `sprite-atlas.json` with UV coordinates
- Switch to packed mode automatically

### Viewing Sprites

Open `sprite-viewer.html` in a browser to:
- Browse all sprites with search/filtering
- Inspect individual sprite details
- View UV coordinates (packed mode)
- Test different zoom levels and backgrounds

## Structure

- `sprites/` - Individual sprite PNG files
- `sprite-atlas.json` - Sprite metadata and configuration (v2.0)
- `sprite-atlas.packed.example.json` - Example of packed format
- `SPRITE-ATLAS-SPEC.md` - Complete format specification

## Current Sprites

### Player
- `player.png` (40x30) - Player ship

### Enemies (Ruminant Theme)
- `sheep-enemy.png` (30x30) - Sheep enemy (10 points)
- `goat-enemy.png` (30x30) - Goat enemy (20 points)
- `alpaca-enemy.png` (30x30) - Alpaca enemy (30 points)
- `ufo.png` (40x20) - Bonus UFO (100 points)

### Weapons
- `bullet-player.png` (4x12) - Player bullet
- `bullet-enemy.png` (4x12) - Enemy bullet

### Objects
- `shield.png` (60x40) - Destructible shield

### Effects
- `explosion1.png` (32x32) - Explosion frame 1
- `explosion2.png` (32x32) - Explosion frame 2

## Tools

- `../generate-spritesheet.js` - Sprite packer tool
- `../sprite-viewer.html` - Interactive sprite inspector
- `../sprite-generator.html` - Sprite creation tool

## Future Enhancements

- Add animation frames for enemies
- Add more explosion frames
- Add particle textures
- Add sound effects directory
