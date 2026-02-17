const fs = require('fs');
const path = require('path');

// Simple PNG generator without external dependencies
// Creates solid color rectangles for now - can be replaced with actual pixel art

function createSimplePNG(width, height, r, g, b, a = 255) {
    // PNG file structure
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR chunk
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8); // bit depth
    ihdr.writeUInt8(6, 9); // color type (RGBA)
    ihdr.writeUInt8(0, 10); // compression
    ihdr.writeUInt8(0, 11); // filter
    ihdr.writeUInt8(0, 12); // interlace
    
    const ihdrChunk = createChunk('IHDR', ihdr);
    
    // IDAT chunk - image data
    const pixelData = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        const rowStart = y * (1 + width * 4);
        pixelData.writeUInt8(0, rowStart); // filter type
        for (let x = 0; x < width; x++) {
            const pixelStart = rowStart + 1 + x * 4;
            pixelData.writeUInt8(r, pixelStart);
            pixelData.writeUInt8(g, pixelStart + 1);
            pixelData.writeUInt8(b, pixelStart + 2);
            pixelData.writeUInt8(a, pixelStart + 3);
        }
    }
    
    // Compress with zlib
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(pixelData);
    const idatChunk = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iendChunk = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Sprite definitions (width, height, r, g, b)
const sprites = {
    'player.png': [40, 30, 0, 255, 50],
    'enemy1.png': [30, 30, 255, 0, 0],
    'enemy2.png': [30, 30, 255, 136, 0],
    'enemy3.png': [30, 30, 204, 0, 204],
    'bullet-player.png': [4, 12, 0, 255, 0],
    'bullet-enemy.png': [4, 12, 255, 0, 0],
    'shield.png': [60, 40, 0, 136, 255],
    'ufo.png': [40, 20, 255, 255, 0],
    'explosion1.png': [32, 32, 255, 136, 0],
    'explosion2.png': [32, 32, 255, 68, 0]
};

// Create sprites directory
const spritesDir = path.join(__dirname, 'assets', 'sprites');
if (!fs.existsSync(spritesDir)) {
    fs.mkdirSync(spritesDir, { recursive: true });
}

// Generate all sprites
console.log('Generating sprite PNGs...');
for (const [filename, [width, height, r, g, b]] of Object.entries(sprites)) {
    const png = createSimplePNG(width, height, r, g, b);
    const filepath = path.join(spritesDir, filename);
    fs.writeFileSync(filepath, png);
    console.log(`  ✓ ${filename} (${width}x${height})`);
}

console.log(`\nGenerated ${Object.keys(sprites).length} sprites in ${spritesDir}`);
