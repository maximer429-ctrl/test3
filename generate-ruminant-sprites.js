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
  const size = 40;
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
 * Enhanced cartoon-style goat with distinctive features and improved pixel art
 */
function createGoat() {
  const size = 40;
  const pixels = new Uint8Array(size * size * 4);
  
  // Enhanced color palette with shading
  const bodyDark = [65, 50, 35];           // Dark brown body shadow
  const bodyMain = [90, 70, 50];           // Main body brown
  const bodyLight = [110, 85, 60];         // Body highlight
  const headDark = [75, 60, 45];           // Head shadow
  const headMain = [95, 75, 55];           // Main head color
  const headLight = [115, 90, 65];         // Head highlight
  const hornBase = [180, 170, 150];        // Horn base color
  const hornLight = [220, 210, 190];       // Horn highlight
  const hornDark = [140, 130, 110];        // Horn shadow
  const eyeAmber = [255, 200, 50];         // Amber/yellow eyes
  const eyeGlow = [255, 230, 120];         // Eye highlight
  const pupilBlack = [0, 0, 0];            // Horizontal pupils
  const beardDark = [50, 40, 30];          // Dark beard
  const beardMid = [65, 50, 35];           // Mid beard
  const legDark = [60, 45, 35];            // Leg shadow
  const legMain = [75, 60, 45];            // Leg color
  const noseDark = [50, 40, 30];           // Dark nose
  
  // === BODY with shading ===
  // Main body mass
  fillRect(pixels, size, 8, 15, 14, 8, ...bodyMain);
  
  // Body highlights (top-left light source)
  fillRect(pixels, size, 8, 15, 6, 2, ...bodyLight);
  setPixel(pixels, size, 8, 17, ...bodyLight);
  setPixel(pixels, size, 9, 17, ...bodyLight);
  setPixel(pixels, size, 10, 18, ...bodyLight);
  
  // Body shadows (bottom-right)
  fillRect(pixels, size, 18, 20, 4, 3, ...bodyDark);
  fillRect(pixels, size, 15, 21, 3, 2, ...bodyDark);
  setPixel(pixels, size, 21, 19, ...bodyDark);
  setPixel(pixels, size, 21, 18, ...bodyDark);
  
  // === HEAD with shading ===
  // Main head
  fillRect(pixels, size, 11, 9, 8, 7, ...headMain);
  
  // Head highlights (forehead and left side)
  fillRect(pixels, size, 11, 9, 3, 2, ...headLight);
  setPixel(pixels, size, 11, 11, ...headLight);
  setPixel(pixels, size, 12, 11, ...headLight);
  
  // Head shadows (under chin, right side)
  fillRect(pixels, size, 16, 14, 3, 2, ...headDark);
  setPixel(pixels, size, 17, 13, ...headDark);
  setPixel(pixels, size, 18, 13, ...headDark);
  
  // === HORNS (curved upward, 3D effect) ===
  // Left horn base and curve
  fillRect(pixels, size, 10, 5, 2, 5, ...hornBase);
  fillRect(pixels, size, 9, 6, 2, 3, ...hornBase);
  fillRect(pixels, size, 8, 7, 1, 2, ...hornLight); // Curve tip
  // Left horn shading
  setPixel(pixels, size, 11, 5, ...hornLight);      // Inner highlight
  setPixel(pixels, size, 11, 6, ...hornLight);
  setPixel(pixels, size, 10, 8, ...hornDark);      // Shadow
  setPixel(pixels, size, 9, 8, ...hornDark);
  
  // Right horn base and curve
  fillRect(pixels, size, 18, 5, 2, 5, ...hornBase);
  fillRect(pixels, size, 19, 6, 2, 3, ...hornBase);
  fillRect(pixels, size, 21, 7, 1, 2, ...hornLight); // Curve tip
  // Right horn shading
  setPixel(pixels, size, 18, 5, ...hornLight);      // Inner highlight
  setPixel(pixels, size, 18, 6, ...hornLight);
  setPixel(pixels, size, 19, 8, ...hornDark);      // Shadow
  setPixel(pixels, size, 20, 8, ...hornDark);
  
  // === DISTINCTIVE GOAT EYES (amber with horizontal pupils) ===
  // Left eye
  fillRect(pixels, size, 12, 11, 3, 3, ...eyeAmber);
  // Eye glow/shine
  setPixel(pixels, size, 12, 11, ...eyeGlow);
  // Horizontal rectangular pupil (distinctive goat feature)
  fillRect(pixels, size, 12, 12, 3, 1, ...pupilBlack);
  
  // Right eye
  fillRect(pixels, size, 16, 11, 3, 3, ...eyeAmber);
  // Eye glow/shine
  setPixel(pixels, size, 16, 11, ...eyeGlow);
  // Horizontal rectangular pupil
  fillRect(pixels, size, 16, 12, 3, 1, ...pupilBlack);
  
  // === NOSE/SNOUT ===
  fillRect(pixels, size, 13, 14, 4, 2, ...noseDark);
  // Nostrils
  setPixel(pixels, size, 13, 14, 0, 0, 0);
  setPixel(pixels, size, 16, 14, 0, 0, 0);
  
  // === CHARACTERISTIC GOAT BEARD (enhanced with texture) ===
  // Upper beard (wider at top)
  fillRect(pixels, size, 12, 16, 6, 2, ...beardDark);
  fillRect(pixels, size, 13, 18, 4, 2, ...beardDark);
  // Beard tip (pointed)
  fillRect(pixels, size, 14, 20, 2, 2, ...beardMid);
  setPixel(pixels, size, 14, 22, ...beardDark);
  setPixel(pixels, size, 15, 22, ...beardDark);
  // Beard texture/strands
  setPixel(pixels, size, 13, 17, ...beardMid);
  setPixel(pixels, size, 15, 18, ...beardMid);
  setPixel(pixels, size, 16, 17, ...beardMid);
  
  // === EARS (pointed, alert) ===
  fillRect(pixels, size, 9, 9, 2, 3, ...headMain);
  fillRect(pixels, size, 19, 9, 2, 3, ...headMain);
  // Ear highlights
  setPixel(pixels, size, 9, 9, ...headLight);
  setPixel(pixels, size, 19, 9, ...headLight);
  // Ear shadows
  setPixel(pixels, size, 10, 11, ...headDark);
  setPixel(pixels, size, 20, 11, ...headDark);
  
  // === LEGS (sturdy goat legs) ===
  // Front legs
  fillRect(pixels, size, 10, 23, 2, 5, ...legMain);
  fillRect(pixels, size, 18, 23, 2, 5, ...legMain);
  // Leg highlights
  setPixel(pixels, size, 10, 23, ...bodyLight);
  setPixel(pixels, size, 18, 23, ...bodyLight);
  // Leg shadows
  setPixel(pixels, size, 11, 26, ...legDark);
  setPixel(pixels, size, 11, 27, ...legDark);
  setPixel(pixels, size, 19, 26, ...legDark);
  setPixel(pixels, size, 19, 27, ...legDark);
  // Hooves (darker)
  fillRect(pixels, size, 10, 27, 2, 1, 30, 25, 20);
  fillRect(pixels, size, 18, 27, 2, 1, 30, 25, 20);
  
  // === TAIL (short, pointed upward - goat characteristic) ===
  fillRect(pixels, size, 21, 16, 2, 5, ...bodyMain);
  setPixel(pixels, size, 22, 17, ...bodyLight);
  setPixel(pixels, size, 21, 20, ...bodyDark);
  // Tail tuft
  setPixel(pixels, size, 23, 16, ...beardDark);
  
  createPNG(size, size, pixels, 'goat-enemy.png');
  return { name: 'goat-enemy', width: size, height: size, points: 20 };
}

/**
 * Create alpaca enemy sprite (Enemy 3 - 30 points)
 * Enhanced cartoon-style elegant alpaca with fluffy texture and long neck
 */
function createAlpaca() {
  const size = 40;
  const pixels = new Uint8Array(size * size * 4);
  
  // Enhanced color palette with shading
  const fluffLight = [220, 190, 160];      // Brightest fluff highlights
  const fluffMain = [200, 170, 140];       // Main fluffy fur
  const fluffMid = [180, 150, 120];        // Mid-tone fur
  const fluffDark = [160, 130, 100];       // Shadow fur
  const fluffOutline = [140, 110, 80];     // Dark outline
  const neckLight = [190, 160, 130];       // Neck highlight
  const neckMain = [170, 140, 110];        // Main neck color
  const neckDark = [150, 120, 90];         // Neck shadow
  const faceLight = [180, 150, 120];       // Face highlight
  const faceMain = [170, 140, 110];        // Main face
  const faceDark = [150, 120, 90];         // Face shadow
  const eyeBlack = [40, 30, 20];           // Gentle eyes
  const eyeShine = [100, 80, 60];          // Eye highlight
  const noseDark = [100, 80, 60];          // Nose
  const legMain = [160, 130, 100];         // Leg color
  const legDark = [140, 110, 80];          // Leg shadow
  
  // === FLUFFY BODY with enhanced texture ===
  // Main body mass
  fillRect(pixels, size, 8, 17, 14, 7, ...fluffMain);
  
  // Body highlights (top-left)
  fillRect(pixels, size, 8, 17, 6, 2, ...fluffLight);
  setPixel(pixels, size, 8, 19, ...fluffLight);
  setPixel(pixels, size, 9, 19, ...fluffLight);
  setPixel(pixels, size, 10, 20, ...fluffLight);
  
  // Body shadows (bottom-right)
  fillRect(pixels, size, 18, 21, 4, 3, ...fluffDark);
  fillRect(pixels, size, 15, 22, 3, 2, ...fluffDark);
  setPixel(pixels, size, 21, 20, ...fluffDark);
  
  // Enhanced fuzzy texture with varied tones
  // Light fluff patches
  setPixel(pixels, size, 10, 18, ...fluffLight);
  setPixel(pixels, size, 12, 18, ...fluffLight);
  setPixel(pixels, size, 9, 20, ...fluffLight);
  setPixel(pixels, size, 11, 21, ...fluffLight);
  // Mid-tone texture
  setPixel(pixels, size, 14, 19, ...fluffMid);
  setPixel(pixels, size, 16, 18, ...fluffMid);
  setPixel(pixels, size, 13, 22, ...fluffMid);
  setPixel(pixels, size, 17, 20, ...fluffMid);
  // Dark texture for depth
  setPixel(pixels, size, 18, 19, ...fluffDark);
  setPixel(pixels, size, 19, 21, ...fluffDark);
  setPixel(pixels, size, 20, 22, ...fluffDark);
  
  // === ELEGANT LONG NECK (signature alpaca feature) ===
  // Main neck column
  fillRect(pixels, size, 13, 9, 4, 9, ...neckMain);
  
  // Neck highlights (left side, light source)
  fillRect(pixels, size, 13, 9, 1, 8, ...neckLight);
  setPixel(pixels, size, 14, 9, ...neckLight);
  setPixel(pixels, size, 14, 10, ...neckLight);
  
  // Neck shadows (right side)
  fillRect(pixels, size, 16, 12, 1, 5, ...neckDark);
  setPixel(pixels, size, 15, 16, ...neckDark);
  setPixel(pixels, size, 15, 17, ...neckDark);
  
  // Neck-body connection (smooth transition)
  setPixel(pixels, size, 12, 17, ...neckMain);
  setPixel(pixels, size, 17, 17, ...neckMain);
  
  // === HEAD (small, elongated alpaca head) ===
  // Main head
  fillRect(pixels, size, 12, 5, 6, 5, ...faceMain);
  
  // Head highlights (forehead)
  fillRect(pixels, size, 12, 5, 3, 2, ...faceLight);
  setPixel(pixels, size, 13, 7, ...faceLight);
  
  // Head shadows (chin and right side)
  fillRect(pixels, size, 16, 8, 2, 2, ...faceDark);
  setPixel(pixels, size, 17, 7, ...faceDark);
  
  // === FLUFFY TOP OF HEAD ===
  fillRect(pixels, size, 11, 3, 7, 2, ...fluffMain);
  // Head fluff highlights
  setPixel(pixels, size, 11, 3, ...fluffLight);
  setPixel(pixels, size, 12, 3, ...fluffLight);
  setPixel(pixels, size, 13, 3, ...fluffLight);
  // Head fluff texture
  setPixel(pixels, size, 15, 4, ...fluffLight);
  setPixel(pixels, size, 17, 4, ...fluffLight);
  setPixel(pixels, size, 16, 3, ...fluffDark);
  
  // === LARGE POINTED EARS (prominent alpaca feature) ===
  // Left ear
  fillRect(pixels, size, 10, 2, 2, 4, ...faceMain);
  setPixel(pixels, size, 10, 1, ...faceLight);
  setPixel(pixels, size, 10, 2, ...faceLight);
  setPixel(pixels, size, 11, 4, ...faceDark);
  setPixel(pixels, size, 11, 5, ...faceDark);
  // Left ear inner/fluff
  setPixel(pixels, size, 11, 3, ...fluffLight);
  
  // Right ear
  fillRect(pixels, size, 18, 2, 2, 4, ...faceMain);
  setPixel(pixels, size, 19, 1, ...faceLight);
  setPixel(pixels, size, 19, 2, ...faceLight);
  setPixel(pixels, size, 18, 4, ...faceDark);
  setPixel(pixels, size, 18, 5, ...faceDark);
  // Right ear inner/fluff
  setPixel(pixels, size, 18, 3, ...fluffLight);
  
  // === LARGE GENTLE EYES (expressive and kind) ===
  // Left eye (larger, more expressive)
  fillRect(pixels, size, 13, 7, 2, 2, ...eyeBlack);
  // Eye shine for gentleness
  setPixel(pixels, size, 13, 7, ...eyeShine);
  
  // Right eye
  fillRect(pixels, size, 16, 7, 2, 2, ...eyeBlack);
  // Eye shine
  setPixel(pixels, size, 16, 7, ...eyeShine);
  
  // === SNOUT/MUZZLE ===
  fillRect(pixels, size, 13, 8, 4, 2, ...faceDark);
  // Nose
  setPixel(pixels, size, 14, 8, ...noseDark);
  setPixel(pixels, size, 15, 8, ...noseDark);
  // Nostrils
  setPixel(pixels, size, 14, 9, 60, 45, 30);
  setPixel(pixels, size, 15, 9, 60, 45, 30);
  
  // === LONG SLENDER LEGS (elegant alpaca legs) ===
  // Front left leg
  fillRect(pixels, size, 10, 24, 2, 5, ...legMain);
  setPixel(pixels, size, 10, 24, ...neckLight);
  setPixel(pixels, size, 10, 25, ...neckLight);
  setPixel(pixels, size, 11, 27, ...legDark);
  setPixel(pixels, size, 11, 28, ...legDark);
  
  // Front right leg
  fillRect(pixels, size, 18, 24, 2, 5, ...legMain);
  setPixel(pixels, size, 18, 24, ...neckLight);
  setPixel(pixels, size, 18, 25, ...neckLight);
  setPixel(pixels, size, 19, 27, ...legDark);
  setPixel(pixels, size, 19, 28, ...legDark);
  
  // Feet/hooves (small and neat)
  fillRect(pixels, size, 10, 28, 2, 1, ...fluffOutline);
  fillRect(pixels, size, 18, 28, 2, 1, ...fluffOutline);
  
  // === FLUFFY TAIL (enhanced prominence) ===
  // Main tail mass
  fillRect(pixels, size, 22, 18, 3, 5, ...fluffMain);
  fillRect(pixels, size, 23, 19, 2, 3, ...fluffMid);
  // Tail highlights
  setPixel(pixels, size, 22, 18, ...fluffLight);
  setPixel(pixels, size, 23, 19, ...fluffLight);
  setPixel(pixels, size, 22, 19, ...fluffLight);
  // Tail shadows
  setPixel(pixels, size, 24, 21, ...fluffDark);
  setPixel(pixels, size, 24, 22, ...fluffDark);
  setPixel(pixels, size, 23, 22, ...fluffDark);
  // Tail tuft
  setPixel(pixels, size, 25, 19, ...fluffLight);
  setPixel(pixels, size, 25, 20, ...fluffMid);
  
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
