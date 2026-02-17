# Sprite Atlas Format Specification v2.0

This document describes the sprite atlas configuration format for the game engine.

## Overview

The sprite atlas configuration supports two modes:
- **Individual mode**: Each sprite is loaded from a separate PNG file (current implementation)
- **Packed mode**: All sprites are packed into a single texture atlas image (future implementation)

## File Structure

### Meta Section

```json
{
  "meta": {
    "version": "2.0",
    "mode": "individual|packed",
    "format": "RGBA8888",
    "description": "Optional description",
    "spritePath": "sprites/",
    "atlasTexture": "sprite-atlas.png",
    "atlasWidth": 1024,
    "atlasHeight": 1024,
    "padding": 2
  }
}
```

#### Meta Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Format version (currently "2.0") |
| `mode` | string | Yes | Loading mode: "individual" or "packed" |
| `format` | string | Yes | Pixel format (typically "RGBA8888") |
| `description` | string | No | Human-readable description |
| `spritePath` | string | Yes (individual) | Base path for sprite files in individual mode |
| `atlasTexture` | string | Yes (packed) | Filename of packed texture atlas |
| `atlasWidth` | number | Yes (packed) | Width of atlas texture in pixels |
| `atlasHeight` | number | Yes (packed) | Height of atlas texture in pixels |
| `padding` | number | No | Padding between sprites in atlas (default: 0) |

### Sprites Section

Each sprite entry describes a single sprite or animated sprite sequence.

#### Individual Mode Example

```json
{
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

#### Packed Mode Example

```json
{
  "sprites": {
    "player": {
      "file": "player",
      "width": 40,
      "height": 30,
      "uv": {
        "x": 0,
        "y": 0,
        "width": 40,
        "height": 30,
        "u0": 0.0,
        "v0": 0.0,
        "u1": 0.0390625,
        "v1": 0.029296875
      }
    }
  }
}
```

#### Sprite Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | Yes | Filename (individual mode) or sprite name (packed mode) |
| `width` | number | Yes | Sprite width in pixels |
| `height` | number | Yes | Sprite height in pixels |
| `points` | number | No | Game-specific: point value for enemies |
| `uv` | object\|null | No | UV coordinates (null in individual mode, required in packed mode) |
| `animation` | object\|null | No | Animation frame data (see Animation section) |

### UV Coordinates

UV coordinates specify the location of a sprite within the packed texture atlas.

```json
{
  "uv": {
    "x": 0,
    "y": 0,
    "width": 32,
    "height": 32,
    "u0": 0.0,
    "v0": 0.0,
    "u1": 0.03125,
    "v1": 0.03125
  }
}
```

#### UV Fields

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Left position in atlas (pixels) |
| `y` | number | Top position in atlas (pixels) |
| `width` | number | Sprite width in atlas (pixels) |
| `height` | number | Sprite height in atlas (pixels) |
| `u0` | number | Normalized left coordinate (0.0 - 1.0) |
| `v0` | number | Normalized top coordinate (0.0 - 1.0) |
| `u1` | number | Normalized right coordinate (0.0 - 1.0) |
| `v1` | number | Normalized bottom coordinate (0.0 - 1.0) |

**Note**: Normalized coordinates are calculated as:
- `u0 = x / atlasWidth`
- `v0 = y / atlasHeight`
- `u1 = (x + width) / atlasWidth`
- `v1 = (y + height) / atlasHeight`

### Animation

Animated sprites define multiple frames that play in sequence.

```json
{
  "animation": {
    "frameCount": 4,
    "fps": 10,
    "loop": true,
    "frames": [
      {
        "uv": {
          "x": 0, "y": 0, "width": 32, "height": 32,
          "u0": 0.0, "v0": 0.0, "u1": 0.03125, "v1": 0.03125
        },
        "duration": 100
      },
      {
        "uv": {
          "x": 32, "y": 0, "width": 32, "height": 32,
          "u0": 0.03125, "v0": 0.0, "u1": 0.0625, "v1": 0.03125
        },
        "duration": 100
      }
    ]
  }
}
```

#### Animation Fields

| Field | Type | Description |
|-------|------|-------------|
| `frameCount` | number | Total number of frames |
| `fps` | number | Frames per second (alternative to per-frame duration) |
| `loop` | boolean | Whether animation loops (default: true) |
| `frames` | array | Array of frame objects with UV and duration |

#### Frame Fields

| Field | Type | Description |
|-------|------|-------------|
| `uv` | object | UV coordinates for this frame |
| `duration` | number | Frame duration in milliseconds |

## Mode Migration

### From Individual to Packed

1. Run the sprite packer tool to generate the atlas texture
2. Update `mode` from "individual" to "packed"
3. Set `atlasTexture`, `atlasWidth`, `atlasHeight`
4. Update each sprite's `uv` field with coordinates from packer output
5. Clear `spritePath` or set to null

### Backward Compatibility

The texture manager will detect the mode and load sprites accordingly:
- **Individual mode**: Loads each sprite from its own PNG file
- **Packed mode**: Loads the atlas texture once and uses UV coordinates to render sprite regions

## Benefits of Packed Mode

- **Performance**: Single texture bind for all sprites (reduces WebGL state changes)
- **Memory**: Better GPU memory utilization with texture atlasing
- **Loading**: Faster initial load (one HTTP request vs many)
- **Rendering**: More efficient batch rendering

## Tools

- **Packer**: `generate-spritesheet.js` - Packs individual PNGs into atlas
- **Viewer**: `sprite-viewer.html` - Visualizes sprites and atlas
- **Generator**: `generate-sprites.js` - Creates sprite PNG files

## Version History

- **v2.0**: Added packed mode support with UV coordinates and animation frames
- **v1.0**: Initial individual file mode
