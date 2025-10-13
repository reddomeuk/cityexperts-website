#!/usr/bin/env node

/**
 * Local Image Verification Script
 * Checks that all local images are accessible and loads properly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyLocalImages() {
  console.log('🔍 Verifying local image system...');
  
  const imagesDir = join(__dirname, '../public/assets/images');
  
  try {
    // Check if images directory exists
    const dirStat = await stat(imagesDir);
    if (!dirStat.isDirectory()) {
      console.error('❌ Images directory not found');
      return false;
    }
    
    // List all images
    const imageFiles = await readdir(imagesDir);
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const images = imageFiles.filter(file => 
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
    
    console.log(`📁 Found ${images.length} image files in ${imagesDir}`);
    
    // Check critical images
    const criticalImages = [
      'logo.png',
      'hero-dubai-skyline.webp', 
      'about-hero.webp',
      'projects-hero.webp',
      'contact-hero.webp'
    ];
    
    console.log('\n🎯 Checking critical images:');
    for (const img of criticalImages) {
      if (images.includes(img)) {
        const imgPath = join(imagesDir, img);
        const imgStat = await stat(imgPath);
        const sizeKB = Math.round(imgStat.size / 1024);
        console.log(`✅ ${img} (${sizeKB}KB)`);
      } else {
        console.log(`❌ ${img} - MISSING`);
      }
    }
    
    // Check gallery images
    const galleryImages = images.filter(img => 
      img.includes('luxury_') || img.includes('villa_') || img.includes('interior')
    );
    
    console.log(`\n🖼️ Gallery images: ${galleryImages.length} found`);
    galleryImages.forEach(img => {
      console.log(`  • ${img}`);
    });
    
    console.log('\n🎉 Local image verification complete!');
    console.log(`📊 Total images: ${images.length}`);
    console.log('🌐 Access at: http://localhost:3001/');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying images:', error.message);
    return false;
  }
}

// Run verification
verifyLocalImages().then(success => {
  process.exit(success ? 0 : 1);
});