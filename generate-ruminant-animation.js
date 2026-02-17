#!/usr/bin/env node
/**
 * Generate animation frames for ruminant enemies
 * Creates frame variations for sheep, goat, and alpaca
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'assets', 'sprites');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createPNG(width, height, pixels, filename) {
  const png = [];
  
  png.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  png.push(createChunk('IHDR', ihdr));
  
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
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
  crc.writeUInt32BE(calculateCRC(crcData) >>> 0, 0);
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
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function setPixel(pixels, width, x, y, r, g, b, a = 255) {
  const idx = (y * width + x) * 4;
  pixels[idx] = r;
  pixels[idx + 1] = g;
  pixels[idx + 2] = b;
  pixels[idx + 3] = a;
}

function fillRect(pixels, width, x, y, w, h, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, width, x + dx, y + dy, r, g, b, a);
    }
  }
}

/**
 * Sheep animation frame 1 (bounced up slightly)
 */
function createSheepFrame1() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  const bodyColor = [245, 245, 250];
  const faceColor = [50, 45, 45];
  const legColor = [50, 45, 45];
  const outlineColor = [200, 200, 210];
  const eyeColor = [255, 255, 255];
  const pupilColor = [0, 0, 0];
  
  // Body - slightly higher (bounce up)
  fillRect(pixels, size, 9, 12, 12, 8, ...bodyColor);
  fillRect(pixels, size, 10, 10, 10, 2, ...bodyColor);
  fillRect(pixels, size, 11, 9, 8, 1, ...bodyColor);
  fillRect(pixels, size, 10, 20, 10, 1, ...bodyColor);
  fillRect(pixels, size, 8, 13, 1, 6, ...bodyColor);
  fillRect(pixels, size, 21, 13, 1, 6, ...bodyColor);
  fillRect(pixels, size, 7, 14, 1, 4, ...bodyColor);
  fillRect(pixels, size, 22, 14, 1, 4, ...bodyColor);
  
  // Texture
  setPixel(pixels, size, 11, 12, 255, 255, 255);
  setPixel(pixels, size, 13, 14, 255, 255, 255);
  setPixel(pixels, size, 17, 13, 255, 255, 255);
  setPixel(pixels, size, 15, 17, 255, 255, 255);
  setPixel(pixels, size, 19, 16, 255, 255, 255);
  
  // Outline
  for (let x = 11; x < 19; x++) setPixel(pixels, size, x, 9, ...outlineColor);
  for (let x = 10; x < 20; x++) setPixel(pixels, size, x, 20, ...outlineColor);
  
  // Face
  fillRect(pixels, size, 11, 6, 8, 6, ...faceColor);
  fillRect(pixels, size, 9, 7, 2, 3, ...faceColor);
  fillRect(pixels, size, 19, 7, 2, 3, ...faceColor);
  fillRect(pixels, size, 13, 8, 2, 2, ...eyeColor);
  fillRect(pixels, size, 16, 8, 2, 2, ...eyeColor);
  setPixel(pixels, size, 13, 9, ...pupilColor);
  setPixel(pixels, size, 16, 9, ...pupilColor);
  setPixel(pixels, size, 14, 10, 100, 90, 90);
  setPixel(pixels, size, 15, 10, 100, 90, 90);
  
  // Legs - shorter (bounced up)
  fillRect(pixels, size, 11, 21, 2, 3, ...legColor);
  fillRect(pixels, size, 17, 21, 2, 3, ...legColor);
  
  // Tail
  fillRect(pixels, size, 22, 16, 2, 2, ...bodyColor);
  fillRect(pixels, size, 23, 17, 1, 1, ...bodyColor);
  
  createPNG(size, size, pixels, 'sheep-enemy-frame1.png');
}

/**
 * Sheep animation frame 2 (normal/down position)
 */
function createSheepFrame2() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  const bodyColor = [245, 245, 250];
  const faceColor = [50, 45, 45];
  const legColor = [50, 45, 45];
  const outlineColor = [200, 200, 210];
  const eyeColor = [255, 255, 255];
  const pupilColor = [0, 0, 0];
  
  // Body - normal position (same as base sprite)
  fillRect(pixels, size, 9, 13, 12, 8, ...bodyColor);
  fillRect(pixels, size, 10, 11, 10, 2, ...bodyColor);
  fillRect(pixels, size, 11, 10, 8, 1, ...bodyColor);
  fillRect(pixels, size, 10, 21, 10, 1, ...bodyColor);
  fillRect(pixels, size, 8, 14, 1, 6, ...bodyColor);
  fillRect(pixels, size, 21, 14, 1, 6, ...bodyColor);
  fillRect(pixels, size, 7, 15, 1, 4, ...bodyColor);
  fillRect(pixels, size, 22, 15, 1, 4, ...bodyColor);
  
  // Texture
  setPixel(pixels, size, 11, 13, 255, 255, 255);
  setPixel(pixels, size, 13, 15, 255, 255, 255);
  setPixel(pixels, size, 17, 14, 255, 255, 255);
  setPixel(pixels, size, 15, 18, 255, 255, 255);
  setPixel(pixels, size, 19, 17, 255, 255, 255);
  
  // Outline
  for (let x = 11; x < 19; x++) setPixel(pixels, size, x, 10, ...outlineColor);
  for (let x = 10; x < 20; x++) setPixel(pixels, size, x, 21, ...outlineColor);
  
  // Face
  fillRect(pixels, size, 11, 7, 8, 6, ...faceColor);
  fillRect(pixels, size, 9, 8, 2, 3, ...faceColor);
  fillRect(pixels, size, 19, 8, 2, 3, ...faceColor);
  fillRect(pixels, size, 13, 9, 2, 2, ...eyeColor);
  fillRect(pixels, size, 16, 9, 2, 2, ...eyeColor);
  setPixel(pixels, size, 13, 10, ...pupilColor);
  setPixel(pixels, size, 16, 10, ...pupilColor);
  setPixel(pixels, size, 14, 11, 100, 90, 90);
  setPixel(pixels, size, 15, 11, 100, 90, 90);
  
  // Legs - full length
  fillRect(pixels, size, 11, 22, 2, 4, ...legColor);
  fillRect(pixels, size, 17, 22, 2, 4, ...legColor);
  
  // Tail
  fillRect(pixels, size, 22, 17, 2, 2, ...bodyColor);
  fillRect(pixels, size, 23, 18, 1, 1, ...bodyColor);
  
  createPNG(size, size, pixels, 'sheep-enemy-frame2.png');
}

/**
 * Goat frame 1 (head tilt left)
 */
function createGoatFrame1() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  const bodyColor = [80, 60, 40];
  const headColor = [90, 70, 50];
  const hornColor = [200, 190, 170];
  const eyeColor = [255, 200, 0];
  const pupilColor = [0, 0, 0];
  
  // Body
  fillRect(pixels, size, 8, 14, 14, 8, ...bodyColor);
  
  // Head (slightly left)
  fillRect(pixels, size, 10, 9, 8, 7, ...headColor);
  
  // Horns
  fillRect(pixels, size, 9, 5, 2, 5, ...hornColor);
  fillRect(pixels, size, 17, 5, 2, 5, ...hornColor);
  fillRect(pixels, size, 8, 6, 2, 2, ...hornColor);
  fillRect(pixels, size, 18, 6, 2, 2, ...hornColor);
  
  // Eyes
  fillRect(pixels, size, 11, 11, 2, 2, ...eyeColor);
  fillRect(pixels, size, 15, 11, 2, 2, ...eyeColor);
  setPixel(pixels, size, 11, 11, ...pupilColor);
  setPixel(pixels, size, 12, 11, ...pupilColor);
  setPixel(pixels, size, 15, 11, ...pupilColor);
  setPixel(pixels, size, 16, 11, ...pupilColor);
  
  //Beard
  fillRect(pixels, size, 13, 15, 2, 2, 60, 50, 40);
  
  // Legs
  fillRect(pixels, size, 10, 22, 2, 4, ...bodyColor);
  fillRect(pixels, size, 18, 22, 2, 4, ...bodyColor);
  
   // Tail
  fillRect(pixels, size, 22, 18, 2, 3, ...bodyColor);
  
  createPNG(size, size, pixels, 'goat-enemy-frame1.png');
}

/**
 * Goat frame 2 (head tilt right)
 */
function createGoatFrame2() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  const bodyColor = [80, 60, 40];
  const headColor = [90, 70, 50];
  const hornColor = [200, 190, 170];
  const eyeColor = [255, 200, 0];
  const pupilColor = [0, 0, 0];
  
  // Body
  fillRect(pixels, size, 8, 14, 14, 8, ...bodyColor);
  
  // Head (slightly right)
  fillRect(pixels, size, 12, 9, 8, 7, ...headColor);
  
  // Horns
  fillRect(pixels, size, 11, 5, 2, 5, ...hornColor);
  fillRect(pixels, size, 19, 5, 2, 5, ...hornColor);
  fillRect(pixels, size, 10, 6, 2, 2, ...hornColor);
  fillRect(pixels, size, 20, 6, 2, 2, ...hornColor);
  
  // Eyes
  fillRect(pixels, size, 13, 11, 2, 2, ...eyeColor);
  fillRect(pixels, size, 17, 11, 2, 2, ...eyeColor);
  setPixel(pixels, size, 13, 11, ...pupilColor);
  setPixel(pixels, size, 14, 11, ...pupilColor);
  setPixel(pixels, size, 17, 11, ...pupilColor);
  setPixel(pixels, size, 18, 11, ...pupilColor);
  
  // Beard
  fillRect(pixels, size, 15, 15, 2, 2, 60, 50, 40);
  
  // Legs
  fillRect(pixels, size, 10, 22, 2, 4, ...bodyColor);
  fillRect(pixels, size, 18, 22, 2, 4, ...bodyColor);
  
  // Tail
  fillRect(pixels, size, 22, 18, 2, 3, ...bodyColor);
  
  createPNG(size, size, pixels, 'goat-enemy-frame2.png');
}

/**
 * Alpaca frame 1 (neck slightly up)
 */
function createAlpacaFrame1() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  const bodyColor = [200, 160, 120];
  const neckColor = [210, 170, 130];
  const faceColor = [190, 150, 110];
  const earColor = [180, 140, 100];
  const eyeColor = [50, 40, 35];
  const fluffColor = [220, 180, 140];
  
  // Body
  fillRect(pixels, size, 8, 16, 14, 8, ...bodyColor);
  
  // Fluffy chest
  fillRect(pixels, size, 10, 14, 10, 3, ...fluffColor);
  
  // Long neck (raised)
  fillRect(pixels, size, 12, 7, 6, 8, ...neckColor);
  
  // Head (small oval)
  fillRect(pixels, size, 11, 4, 8, 5, ...faceColor);
  
  // Long ears
  fillRect(pixels, size, 11, 2, 2, 3, ...earColor);
  fillRect(pixels, size, 17, 2, 2, 3, ...earColor);
  
  // Eyes
  setPixel(pixels, size, 13, 6, ...eyeColor);
  setPixel(pixels, size, 16, 6, ...eyeColor);
  
  // Snout
  fillRect(pixels, size, 14, 7, 2, 2, 170, 130, 90);
  
  // Legs
  fillRect(pixels, size, 10, 24, 2, 2, ...bodyColor);
  fillRect(pixels, size, 18, 24, 2, 2, ...bodyColor);
  
  // Fluffy tail
  fillRect(pixels, size, 22, 19, 3, 3, ...fluffColor);
  
  createPNG(size, size, pixels, 'alpaca-enemy-frame1.png');
}

/**
 * Alpaca frame 2 (neck normal)
 */
function createAlpacaFrame2() {
  const size = 30;
  const pixels = new Uint8Array(size * size * 4);
  
  const bodyColor = [200, 160, 120];
  const neckColor = [210, 170, 130];
  const faceColor = [190, 150, 110];
  const earColor = [180, 140, 100];
  const eyeColor = [50, 40, 35];
  const fluffColor = [220, 180, 140];
  
  // Body
  fillRect(pixels, size, 8, 16, 14, 8, ...bodyColor);
  
  // Fluffy chest
  fillRect(pixels, size, 10, 14, 10, 3, ...fluffColor);
  
  // Long neck (normal)
  fillRect(pixels, size, 12, 8, 6, 8, ...neckColor);
  
  // Head
  fillRect(pixels, size, 11, 5, 8, 5, ...faceColor);
  
  // Ears
  fillRect(pixels, size, 11, 3, 2, 3, ...earColor);
  fillRect(pixels, size, 17, 3, 2, 3, ...earColor);
  
  // Eyes
  setPixel(pixels, size, 13, 7, ...eyeColor);
  setPixel(pixels, size, 16, 7, ...eyeColor);
  
  // Snout
  fillRect(pixels, size, 14, 8, 2, 2, 170, 130, 90);
  
  // Legs
  fillRect(pixels, size, 10, 24, 2, 2, ...bodyColor);
  fillRect(pixels, size, 18, 24, 2, 2, ...bodyColor);
  
  // Tail
  fillRect(pixels, size, 22, 19, 3, 3, ...fluffColor);
  
  createPNG(size, size, pixels, 'alpaca-enemy-frame2.png');
}

console.log('Generating ruminant animation frames...\n');

createSheepFrame1();
createSheepFrame2();
createGoatFrame1();
createGoatFrame2();
createAlpacaFrame1();
createAlpacaFrame2();

console.log('\n✓ All animation frames generated!');
console.log('\nFrames created:');
console.log('- sheep-enemy-frame1.png (bounce up)');
console.log('- sheep-enemy-frame2.png (bounce down)');
console.log('- goat-enemy-frame1.png (head tilt left)');
console.log('- goat-enemy-frame2.png (head tilt right)');
console.log('- alpaca-enemy-frame1.png (neck raised)');
console.log('- alpaca-enemy-frame2.png (neck normal)');
