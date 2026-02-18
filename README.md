# 🐑 Troup'O Invaders 🦙

A Space Invaders-like game built with WebGL, featuring adorable ruminant invaders (sheep, goats, and alpacas)!

## Quick Links

- **Game**: http://localhost:8080 (main game)
- **Sprite Viewer**: http://localhost:8080/sprite-viewer.html (sprite development tool)
- **Input Tester**: http://localhost:8080/input-test.html (input debugging tool)
- **Issue Tracking**: Use `bd` commands (see AGENTS.md)

## Development Setup

This project uses Docker for a containerized development environment.

### Prerequisites

- Docker
- Docker Compose

### Getting Started

1. **Build and start the container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the game:**
   Open your browser to http://localhost:8080

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Development Workflow

The container mounts the current directory, so any changes you make to the source files will be immediately available. Just refresh your browser to see updates.

**⚠️ Important: Always run npm commands inside Docker**

Run ALL npm commands inside the Docker container, not on your host machine:

```bash
# Run commands inside container
docker-compose exec troupo-invaders npm install
docker-compose exec troupo-invaders npm run <script-name>
docker-compose exec troupo-invaders node <script.js>

# NOT on your host machine
```

**Why?** The project uses packages with native C++ dependencies that require system libraries. The Docker container has all necessary dependencies pre-installed, ensuring consistent behavior across all development environments.

### Manual Docker Commands

If you prefer not to use docker-compose:

```bash
# Build the image
docker build -t troupo-invaders .

# Run the container
docker run -p 8080:8080 -v $(pwd):/app troupo-invaders
```

## Project Structure

```
.
├── src/                    # Game source code
│   ├── core/              # Core engine (WebGL, rendering, textures)
│   ├── entities/          # Game objects (player, enemies, bullets)
│   ├── systems/           # Game systems (collision, input, particles)
│   └── utils/             # Utilities and constants
├── assets/                 # Game assets
│   ├── sprites/           # PNG sprite files
│   └── sprite-atlas.json  # Sprite metadata
├── shaders/               # GLSL shader programs
├── index.html             # Main game entry point
├── sprite-viewer.html     # Sprite development tool
└── generate-ruminant-sprites.js  # Sprite generation script
```

## Collaborative Development

This project is organized for parallel work across different areas:

### 🎨 Sprite Development Team

**Tools:**
- **Sprite Viewer**: Open http://localhost:8080/sprite-viewer.html to see all sprites
  - Real-time preview with zoom controls (1x-8x)
  - Background options (dark/light/transparent/checkerboard)
  - Sprite metadata display (dimensions, points, file paths)
  - Statistics overview

**Workflow:**
1. View current sprites in sprite-viewer.html
2. Create/modify sprites using `generate-ruminant-sprites.js` or your preferred tool
3. Update `assets/sprite-atlas.json` with sprite metadata
4. Refresh sprite viewer to preview changes
5. Sprites are automatically used by the game once atlas is updated

**Sprite Issues (use `bd list --type=task` to see all):**
- ✅ test3-hqh: Initial sprite assets (DONE)
- ✅ test3-eim: Ruminant enemy designs (DONE)
- ✅ test3-dhr: Ruminant sprite generation (DONE)
- 🔲 test3-qw2: Theme updates and flavor text (P4)
- 🔲 test3-cnf: Animated sprites system (P4)
- 🔲 test3-vf9: Power-up sprites (P4)

**Current Sprites:**
- Player ship: 40x30px
- Sheep enemy: 30x30px (10 points)
- Goat enemy: 30x30px (20 points)
- Alpaca enemy: 30x30px (30 points)
- UFO bonus: 40x20px (100 points)
- Bullets, shields, explosions

### 🎮 Gameplay Development Team

**Focus Areas:**
- Player movement and shooting (test3-03n)
- Enemy formation and AI (test3-noz)
- Collision detection (test3-5ag)
- Input handling (test3-724)
- Game state management (test3-h3q)

**High Priority Issues** (use `bd ready` to see available work):
- test3-03n: Player entity (P1)
- test3-noz: Enemy system (P1)
- test3-966: Bullet mechanics (P1)
- test3-724: Input system (P1)
- test3-5ag: Collision detection (P1)
- test3-8sm: Score tracking (P1)
- test3-h3q: Game states (P1)

### 🎨 Visual Polish Team

**Focus Areas:**
- Particle effects (test3-13u)
- Screen shake and effects (test3-cro)
- UI polish (test3-k63)
- Menu system (test3-omo)

### 📱 Cross-cutting Work

- Audio system (test3-1ko)
- Mobile controls (test3-gia)
- Performance optimization (test3-0in)
- Wave progression (test3-5pr)

## Issue Tracking with bd

```bash
# See available work
bd ready

# View all issues
bd list

# Filter by priority
bd list --priority=1

# Work on an issue
bd update test3-xxx --status in_progress

# Complete an issue
bd close test3-xxx

# Sync with git
bd sync
```

See AGENTS.md for detailed workflow.

## Controls

- **Arrow Keys / A/D**: Move left/right
- **Spacebar**: Shoot
- **P**: Pause game
- **R**: Restart (when game over)
