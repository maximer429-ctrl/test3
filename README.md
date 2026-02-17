# Troup'O Invaders

A Space Invaders-like game built with WebGL.

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
├── src/           # Game source code
├── assets/        # Sprites, textures, sounds
├── shaders/       # WebGL shaders
└── index.html     # Main entry point
```

## Controls

- **Arrow Keys / A/D**: Move left/right
- **Spacebar**: Shoot
- **P**: Pause game
- **R**: Restart (when game over)
