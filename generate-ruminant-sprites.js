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
 * Enhanced cartoon-style fluffy sheep with improved pixel art
 */
function createSheep() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  // Enhanced color palette with shading
  const woolLight = [255, 255, 255];       // Brightest highlights
  const woolMain = [240, 240, 245];        // Main wool color
  const woolMid = [220, 220, 230];         // Mid-tone wool
  const woolDark = [195, 195, 210];        // Shadow wool
  const woolOutline = [170, 170, 190];     // Darker outline
  const faceBlack = [40, 35, 35];          // Very dark face
  const faceMid = [55, 50, 50];            // Face highlight
  const legBlack = [35, 30, 30];           // Legs
  const eyeWhite = [255, 255, 255];        // Eye whites
  const eyeBlue = [200, 220, 255];         // Eye shine
  const pupil = [0, 0, 0];                 // Pupils
  const nosePink = [255, 180, 180];        // Pink nose
  const noseDark = [200, 140, 140];        // Nose shadow
  
  // === FLUFFY WOOL BODY with gradients ===
  // Main body core
  fillRect(pixels, size, 9, 14, 12, 7, ...woolMain);
  
  // Top wool poof (larger, rounder)
  fillRect(pixels, size, 10, 11, 10, 3, ...woolMain);
  fillRect(pixels, size, 11, 9, 8, 2, ...woolMain);
  fillRect(pixels, size, 12, 8, 6, 1, ...woolMid);
  
  // Bottom wool
  fillRect(pixels, size, 10, 21, 10, 1, ...woolMain);
  fillRect(pixels, size, 11, 22, 8, 1, ...woolMid);
  
  // Side fluffs for roundness
  fillRect(pixels, size, 8, 15, 1, 5, ...woolMain);
  fillRect(pixels, size, 21, 15, 1, 5, ...woolMain);
  fillRect(pixels, size, 7, 16, 1, 3, ...woolMid);
  fillRect(pixels, size, 22, 16, 1, 3, ...woolMid);
  
  // === WOOL SHADING (top-left light source) ===
  // Highlights (top-left)
  setPixel(pixels, size, 10, 11, ...woolLight);
  setPixel(pixels, size, 11, 11, ...woolLight);
  setPixel(pixels, size, 11, 9, ...woolLight);
  setPixel(pixels, size, 12, 9, ...woolLight);
  setPixel(pixels, size, 10, 14, ...woolLight);
  setPixel(pixels, size, 11, 14, ...woolLight);
  setPixel(pixels, size, 12, 15, ...woolLight);
  
  // Mid-tones for volume
  fillRect(pixels, size, 13, 12, 4, 2, ...woolMid);
  fillRect(pixels, size, 11, 16, 3, 2, ...woolMid);
  
  // Shadows (bottom-right)
  fillRect(pixels, size, 17, 18, 3, 2, ...woolDark);
  fillRect(pixels, size, 15, 19, 4, 2, ...woolDark);
  setPixel(pixels, size, 19, 17, ...woolDark);
  setPixel(pixels, size, 20, 17, ...woolDark);
  setPixel(pixels, size, 20, 18, ...woolDark);
  
  // Wool outline for definition
  // Top outline
  for (let x = 12; x < 18; x++) {
    setPixel(pixels, size, x, 8, ...woolOutline);
  }
  // Bottom outline
  for (let x = 11; x < 19; x++) {
    setPixel(pixels, size, x, 22, ...woolOutline);
  }
  // Left outline
  setPixel(pixels, size, 7, 16, ...woolOutline);
  setPixel(pixels, size, 7, 17, ...woolOutline);
  setPixel(pixels, size, 8, 15, ...woolOutline);
  setPixel(pixels, size, 8, 19, ...woolOutline);
  // Right outline
  setPixel(pixels, size, 22, 16, ...woolOutline);
  setPixel(pixels, size, 22, 17, ...woolOutline);
  setPixel(pixels, size, 21, 19, ...woolOutline);
  
  // === HEAD & FACE ===
  // Main black face
  fillRect(pixels, size, 11, 6, 8, 7, ...faceBlack);
  
  // Face shading/highlight (left side lighter)
  setPixel(pixels, size, 11, 7, ...faceMid);
  setPixel(pixels, size, 11, 8, ...faceMid);
  setPixel(pixels, size, 12, 6, ...faceMid);
  
  // Cute rounded ears
  fillRect(pixels, size, 9, 7, 2, 4, ...faceBlack);
  fillRect(pixels, size, 19, 7, 2, 4, ...faceBlack);
  // Ear highlights
  setPixel(pixels, size, 9, 8, ...faceMid);
  setPixel(pixels, size, 19, 8, ...faceMid);
  
  // === EXPRESSIVE EYES ===
  // Larger, rounder eyes with sparkle
  fillRect(pixels, size, 12, 8, 3, 3, ...eyeWhite);
  fillRect(pixels, size, 15, 8, 3, 3, ...eyeWhite);
  
  // Eye shine/highlight
  setPixel(pixels, size, 12, 8, ...eyeBlue);
  setPixel(pixels, size, 15, 8, ...eyeBlue);
  
  // Pupils (slightly offset for cuteness)
  fillRect(pixels, size, 13, 9, 2, 2, ...pupil);
  fillRect(pixels, size, 16, 9, 2, 2, ...pupil);
  
  // === CUTE NOSE ===
  // Pink button nose
  fillRect(pixels, size, 13, 11, 4, 2, ...nosePink);
  // Nose highlight
  setPixel(pixels, size, 13, 11, 255, 200, 200);
  // Nose shadow
  setPixel(pixels, size, 15, 12, ...noseDark);
  setPixel(pixels, size, 16, 12, ...noseDark);
  
  // === LEGS ===
  // Front legs (with slight shading)
  fillRect(pixels, size, 11, 23, 2, 4, ...legBlack);
  fillRect(pixels, size, 17, 23, 2, 4, ...legBlack);
  // Leg highlights
  setPixel(pixels, size, 11, 23, ...faceMid);
  setPixel(pixels, size, 17, 23, ...faceMid);
  
  // === FLUFFY TAIL ===
  // Larger, more prominent tail
  fillRect(pixels, size, 22, 16, 3, 3, ...woolMain);
  fillRect(pixels, size, 23, 17, 2, 2, ...woolMid);
  setPixel(pixels, size, 22, 16, ...woolLight);
  setPixel(pixels, size, 24, 18, ...woolDark);
  
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
