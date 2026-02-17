#!/usr/bin/env node

/**
 * Sprite Sheet Packer
 * Combines individual sprite PNGs into a single texture atlas
 * Generates updated sprite-atlas.json with UV coordinates
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration
const CONFIG = {
    inputDir: './assets/sprites',
    outputImage: './assets/sprite-atlas.png',
    outputJson: './assets/sprite-atlas.json',
    padding: 2,
    maxWidth: 2048,
    maxHeight: 2048,
    powerOfTwo: true
};

/**
 * Simple bin packing algorithm (shelf packing)
 */
class ShelfPacker {
    constructor(maxWidth, maxHeight, padding) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.padding = padding;
        this.shelves = [];
        this.currentShelf = null;
        this.usedHeight = 0;
    }

    pack(sprites) {
        // Sort sprites by height (tallest first) for better packing
        sprites.sort((a, b) => b.height - a.height);

        const packed = [];

        for (const sprite of sprites) {
            const w = sprite.width + this.padding * 2;
            const h = sprite.height + this.padding * 2;

            // Try to fit in current shelf
            if (!this.currentShelf || !this.fitInShelf(w, h)) {
                // Create new shelf
                this.currentShelf = {
                    y: this.usedHeight,
                    height: h,
                    x: 0,
                    remainingWidth: this.maxWidth
                };
                this.shelves.push(this.currentShelf);
                this.usedHeight += h;

                if (this.usedHeight > this.maxHeight) {
                    throw new Error('Sprites do not fit in max atlas size');
                }
            }

            // Place sprite in current shelf
            const x = this.currentShelf.x + this.padding;
            const y = this.currentShelf.y + this.padding;

            packed.push({
                ...sprite,
                x,
                y
            });

            // Update shelf
            this.currentShelf.x += w;
            this.currentShelf.remainingWidth -= w;
        }

        return {
            sprites: packed,
            width: this.maxWidth,
            height: this.usedHeight
        };
    }

    fitInShelf(width, height) {
        return this.currentShelf.remainingWidth >= width &&
               this.currentShelf.height >= height;
    }
}

/**
 * Load sprite metadata from sprite-atlas.json
 */
async function loadSpriteMetadata() {
    const atlasPath = './assets/sprite-atlas.json';
    const data = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
    
    const sprites = [];
    for (const [name, spriteData] of Object.entries(data.sprites)) {
        sprites.push({
            name,
            file: spriteData.file,
            width: spriteData.width,
            height: spriteData.height,
            points: spriteData.points,
            animation: spriteData.animation
        });
    }
    
    return { sprites, meta: data.meta };
}

/**
 * Load all sprite images
 */
async function loadSpriteImages(sprites, basePath) {
    const loaded = [];
    
    for (const sprite of sprites) {
        const imagePath = path.join(basePath, sprite.file);
        try {
            const image = await loadImage(imagePath);
            loaded.push({
                ...sprite,
                image
            });
            console.log(`✓ Loaded ${sprite.file}`);
        } catch (error) {
            console.warn(`✗ Failed to load ${sprite.file}:`, error.message);
        }
    }
    
    return loaded;
}

/**
 * Calculate next power of two
 */
function nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Pack sprites into atlas and generate texture
 */
async function packSprites(sprites, config) {
    console.log(`\n📦 Packing ${sprites.length} sprites...`);
    
    const packer = new ShelfPacker(config.maxWidth, config.maxHeight, config.padding);
    const packed = packer.pack(sprites);
    
    // Adjust atlas size
    let atlasWidth = packed.width;
    let atlasHeight = packed.height;
    
    if (config.powerOfTwo) {
        atlasWidth = nextPowerOfTwo(atlasWidth);
        atlasHeight = nextPowerOfTwo(atlasHeight);
    }
    
    console.log(`✓ Atlas size: ${atlasWidth}x${atlasHeight}`);
    
    // Create canvas and draw sprites
    const canvas = createCanvas(atlasWidth, atlasHeight);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, atlasWidth, atlasHeight);
    
    // Draw each sprite
    for (const sprite of packed.sprites) {
        ctx.drawImage(
            sprite.image,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height
        );
    }
    
    return {
        canvas,
        sprites: packed.sprites,
        atlasWidth,
        atlasHeight
    };
}

/**
 * Generate sprite-atlas.json with UV coordinates
 */
function generateAtlasJson(packedSprites, atlasWidth, atlasHeight, originalMeta) {
    const sprites = {};
    
    for (const sprite of packedSprites) {
        // Calculate UV coordinates (normalized 0-1)
        const u0 = sprite.x / atlasWidth;
        const v0 = sprite.y / atlasHeight;
        const u1 = (sprite.x + sprite.width) / atlasWidth;
        const v1 = (sprite.y + sprite.height) / atlasHeight;
        
        sprites[sprite.name] = {
            file: sprite.name,
            width: sprite.width,
            height: sprite.height,
            uv: {
                x: sprite.x,
                y: sprite.y,
                width: sprite.width,
                height: sprite.height,
                u0,
                v0,
                u1,
                v1
            }
        };
        
        // Preserve additional fields
        if (sprite.points !== undefined) {
            sprites[sprite.name].points = sprite.points;
        }
        if (sprite.animation) {
            sprites[sprite.name].animation = sprite.animation;
        }
    }
    
    return {
        meta: {
            version: "2.0",
            mode: "packed",
            format: "RGBA8888",
            description: "Packed sprite atlas for Troup'O Invaders",
            spritePath: null,
            atlasTexture: "sprite-atlas.png",
            atlasWidth,
            atlasHeight,
            padding: CONFIG.padding
        },
        sprites
    };
}

/**
 * Main packing process
 */
async function main() {
    console.log('🎮 Sprite Sheet Packer\n');
    console.log('═'.repeat(50));
    
    try {
        // Load sprite metadata
        console.log('\n📖 Loading sprite metadata...');
        const { sprites: spriteList, meta } = await loadSpriteMetadata();
        console.log(`✓ Found ${spriteList.length} sprites`);
        
        // Load sprite images
        console.log('\n🖼️  Loading sprite images...');
        const spritePath = meta.spritePath || meta.image || 'sprites/';
        const basePath = path.join('./assets', spritePath);
        const loadedSprites = await loadSpriteImages(spriteList, basePath);
        
        if (loadedSprites.length === 0) {
            throw new Error('No sprites loaded');
        }
        
        // Pack sprites
        const { canvas, sprites: packedSprites, atlasWidth, atlasHeight } = 
            await packSprites(loadedSprites, CONFIG);
        
        // Save atlas image
        console.log('\n💾 Saving atlas image...');
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(CONFIG.outputImage, buffer);
        console.log(`✓ Saved to ${CONFIG.outputImage}`);
        
        // Generate and save JSON
        console.log('\n📝 Generating atlas JSON...');
        const atlasJson = generateAtlasJson(packedSprites, atlasWidth, atlasHeight, meta);
        fs.writeFileSync(CONFIG.outputJson, JSON.stringify(atlasJson, null, 2));
        console.log(`✓ Saved to ${CONFIG.outputJson}`);
        
        // Summary
        console.log('\n' + '═'.repeat(50));
        console.log('✅ Packing complete!\n');
        console.log(`   Sprites: ${packedSprites.length}`);
        console.log(`   Atlas size: ${atlasWidth}x${atlasHeight}`);
        console.log(`   File: ${CONFIG.outputImage}`);
        console.log(`   Padding: ${CONFIG.padding}px`);
        
        // Calculate space efficiency
        const usedPixels = packedSprites.reduce((sum, s) => 
            sum + (s.width + CONFIG.padding * 2) * (s.height + CONFIG.padding * 2), 0);
        const totalPixels = atlasWidth * atlasHeight;
        const efficiency = ((usedPixels / totalPixels) * 100).toFixed(1);
        console.log(`   Efficiency: ${efficiency}%`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { packSprites, generateAtlasJson };
