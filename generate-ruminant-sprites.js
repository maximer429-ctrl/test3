#!/usr/bin/env node
/**
 * Generates pixel art sprites for ruminant enemies
 * Creates sheep, goat, and alpaca sprites for Troup'O invaders
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'assets', 'sprites');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Create a PNG file from pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Uint8Array} pixels - RGBA pixel data
 * @param {string} filename - Output filename
 */
function createPNG(width, height, pixels, filename) {
  const png = [];
  
  // PNG signature
  png.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  png.push(createChunk('IHDR', ihdr));
  
  // IDAT chunk - image data
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      scanlines[dstIdx] = pixels[srcIdx];
      scanlines[dstIdx + 1] = pixels[srcIdx + 1];
      scanlines[dstIdx + 2] = pixels[srcIdx + 2];
      scanlines[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }
  
  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  png.push(createChunk('IDAT', compressed));
  
  // IEND chunk
  png.push(createChunk('IEND', Buffer.alloc(0)));
  
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, Buffer.concat(png));
  console.log(`Created ${filename}`);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcData = Buffer.concat([typeBuffer, data]);
  crc.writeUInt32BE(calculateCRC(crcData) >>> 0, 0); // >>> 0 converts to unsigned
  
  return Buffer.concat([len, typeBuffer, data, crc]);
}

function calculateCRC(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0; // >>> 0 keeps it as unsigned 32-bit
}

/**
 * Set a pixel in the pixel buffer
 */
function setPixel(pixels, width, x, y, r, g, b, a = 255) {
  const idx = (y * width + x) * 4;
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

/**
 * Fill a rectangle
 */
function fillRect(pixels, width, x, y, w, h, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, width, x + dx, y + dy, r, g, b, a);
    }
  }
}

/**
 * Create sheep enemy sprite (Enemy 1 - 10 points)
 * White/cream fluffy sheep
 */
function createSheep() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  // Fluffy body (cloud-like)
  fillRect(pixels, size, 8, 12, 14, 10, 245, 240, 235); // Main body
  fillRect(pixels, size, 6, 13, 4, 8, 245, 240, 235);   // Left fluff
  fillRect(pixels, size, 20, 13, 4, 8, 245, 240, 235);  // Right fluff
  fillRect(pixels, size, 10, 10, 10, 4, 245, 240, 235); // Top fluff
  
  // Head (darker wool)
  fillRect(pixels, size, 10, 8, 10, 6, 220, 215, 210);
  
  // Eyes
  setPixel(pixels, size, 12, 10, 30, 30, 30);
  setPixel(pixels, size, 17, 10, 30, 30, 30);
  
  // Ears
  fillRect(pixels, size, 9, 7, 2, 3, 220, 215, 210);
  fillRect(pixels, size, 19, 7, 2, 3, 220, 215, 210);
  
  // Legs
  fillRect(pixels, size, 10, 22, 2, 4, 60, 50, 45);
  fillRect(pixels, size, 18, 22, 2, 4, 60, 50, 45);
  
  // Fluffy tail
  fillRect(pixels, size, 22, 16, 3, 3, 245, 240, 235);
  
  // Outline for definition (optional - adds pixel art charm)
  // Top of head
  for (let x = 10; x < 20; x++) {
    setPixel(pixels, size, x, 7, 180, 180, 175);
  }
  
  createPNG(size, size, pixels, 'sheep-enemy.png');
  return { name: 'sheep-enemy', width: size, height: size, points: 10 };
}

/**
 * Create goat enemy sprite (Enemy 2 - 20 points)
 * Brown/black goat with horns
 */
function createGoat() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  // Body (dark brown)
  fillRect(pixels, size, 8, 14, 14, 8, 80, 60, 40);
  
  // Head
  fillRect(pixels, size, 11, 9, 8, 7, 90, 70, 50);
  
  // Horns (curved upward)
  fillRect(pixels, size, 10, 5, 2, 5, 200, 190, 170);
  fillRect(pixels, size, 18, 5, 2, 5, 200, 190, 170);
  fillRect(pixels, size, 9, 6, 2, 2, 200, 190, 170);   // Horn curve left
  fillRect(pixels, size, 19, 6, 2, 2, 200, 190, 170);  // Horn curve right
  
  // Eyes (goat eyes are distinctive)
  fillRect(pixels, size, 12, 11, 2, 2, 255, 200, 0);   // Yellow/amber
  fillRect(pixels, size, 16, 11, 2, 2, 255, 200, 0);
  setPixel(pixels, size, 12, 11, 0, 0, 0);             // Horizontal pupils
  setPixel(pixels, size, 13, 11, 0, 0, 0);
  setPixel(pixels, size, 16, 11, 0, 0, 0);
  setPixel(pixels, size, 17, 11, 0, 0, 0);
  
  // Beard (distinctive goat feature)
  fillRect(pixels, size, 13, 15, 4, 3, 60, 50, 40);
  fillRect(pixels, size, 14, 18, 2, 2, 60, 50, 40);
  
  // Legs
  fillRect(pixels, size, 10, 22, 2, 4, 70, 55, 40);
  fillRect(pixels, size, 18, 22, 2, 4, 70, 55, 40);
  
  // Tail (short and pointed up)
  fillRect(pixels, size, 21, 16, 2, 4, 80, 60, 40);
  
  createPNG(size, size, pixels, 'goat-enemy.png');
  return { name: 'goat-enemy', width: size, height: size, points: 20 };
}

/**
 * Create alpaca enemy sprite (Enemy 3 - 30 points)
 * Tall, fuzzy alpaca with long neck
 */
function createAlpaca() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  // Body (fuzzy, light brown)
  fillRect(pixels, size, 8, 16, 14, 8, 190, 160, 130);
  
  // Fuzzy texture on body
  for (let y = 16; y < 24; y += 2) {
    for (let x = 8; x < 22; x += 2) {
      setPixel(pixels, size, x, y, 210, 180, 150);
    }
  }
  
  // Long neck (distinctive alpaca feature)
  fillRect(pixels, size, 13, 8, 4, 10, 180, 150, 120);
  
  // Head (small, elongated)
  fillRect(pixels, size, 12, 5, 6, 5, 180, 150, 120);
  
  // Fuzzy top of head
  fillRect(pixels, size, 12, 4, 6, 2, 200, 170, 140);
  
  // Ears (large, pointed)
  fillRect(pixels, size, 11, 3, 2, 3, 180, 150, 120);
  fillRect(pixels, size, 17, 3, 2, 3, 180, 150, 120);
  setPixel(pixels, size, 11, 2, 200, 170, 140);
  setPixel(pixels, size, 18, 2, 200, 170, 140);
  
  // Eyes (large, gentle)
  setPixel(pixels, size, 13, 7, 40, 30, 20);
  setPixel(pixels, size, 16, 7, 40, 30, 20);
  
  // Snout/muzzle
  fillRect(pixels, size, 13, 8, 4, 2, 160, 130, 100);
  
  // Legs (long and slender)
  fillRect(pixels, size, 10, 24, 2, 5, 160, 130, 100);
  fillRect(pixels, size, 18, 24, 2, 5, 160, 130, 100);
  
  // Fluffy tail
  fillRect(pixels, size, 22, 18, 3, 4, 200, 170, 140);
  
  createPNG(size, size, pixels, 'alpaca-enemy.png');
  return { name: 'alpaca-enemy', width: size, height: size, points: 30 };
}

// Generate all ruminant sprites
console.log('Generating ruminant enemy sprites...\n');

const sheep = createSheep();
const goat = createGoat();
const alpaca = createAlpaca();

console.log('\n✓ All ruminant sprites generated!');
console.log('\nSprite details:');
console.log(`- ${sheep.name}: ${sheep.width}x${sheep.height}, ${sheep.points} points`);
console.log(`- ${goat.name}: ${goat.width}x${goat.height}, ${goat.points} points`);
console.log(`- ${alpaca.name}: ${alpaca.width}x${alpaca.height}, ${alpaca.points} points`);
