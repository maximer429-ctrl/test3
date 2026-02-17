# Assets Directory

This directory contains game assets for Troup'O Invaders.

## Structure

- `sprites/` - Sprite images (PNG format)
- `sprite-atlas.json` - Sprite metadata and configuration
- `sounds/` - Sound effects and music (TODO)
- `fonts/` - Custom fonts for UI (if needed)

## Generated Sprites

All sprites have been generated as solid-color PNG files:

### Player
- `player.png` (40x30) - Green player ship

### Enemies
- `enemy1.png` (30x30) - Red enemy (10 points)
- `enemy2.png` (30x30) - Orange enemy (20 points)
- `enemy3.png` (30x30) - Purple enemy (30 points)

### Weapons
- `bullet-player.png` (4x12) - Green player bullet
- `bullet-enemy.png` (4x12) - Red enemy bullet

### Objects
- `shield.png` (60x40) - Blue destructible shield
- `ufo.png` (40x20) - Yellow bonus UFO (100 points)

### Effects
- `explosion1.png` (32x32) - Orange explosion frame 1
- `explosion2.png` (32x32) - Red explosion frame 2

## Sprite Atlas

The `sprite-atlas.json` file contains metadata for all sprites including dimensions and point values. Load this file to get sprite information programmatically.

## Future Enhancements

- Replace solid colors with pixel art designs
- Add animation frames for enemies
- Add more explosion frames
- Add particle textures
- Add sound effects (shoot, explosion, movement, UFO)
