#!/usr/bin/env node

/**
 * Switch between Cloudinary and local images for development
 * Usage: node scripts/toggle-images.js [local|cloudinary]
 */

import fs from 'fs';
import path from 'path';

const mode = process.argv[2] || 'local';

console.log(`🔄 Switching images to ${mode} mode...`);

// Files to update
const htmlFiles = [
  'src/index.html',
  'src/about.html', 
  'src/services.html',
  'src/projects.html',
  'src/admin.html'
];

// Image mappings: Cloudinary URL → Local path
const imageMappings = {
  // Hero images
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080,q_auto,f_auto/v1759252864/cityexperts/hero/hero-dubai-skyline.webp': '/assets/images/hero-dubai-skyline.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/v1759252864/cityexperts/hero/hero-dubai-skyline.webp': '/assets/images/hero-dubai-skyline.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_800,h_600,q_auto,f_auto/v1759252864/cityexperts/hero/hero-dubai-skyline.webp': '/assets/images/hero-dubai-skyline.webp',
  
  // About hero
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080,q_auto,f_auto/v1759252854/cityexperts/hero/about-hero.webp': '/assets/images/about-hero.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/v1759252854/cityexperts/hero/about-hero.webp': '/assets/images/about-hero.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_800,h_600,q_auto,f_auto/v1759252854/cityexperts/hero/about-hero.webp': '/assets/images/about-hero.webp',
  
  // Projects hero
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080,q_auto,f_auto/v1759252888/cityexperts/hero/projects-hero.webp': '/assets/images/projects-hero.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/v1759252888/cityexperts/hero/projects-hero.webp': '/assets/images/projects-hero.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_800,h_600,q_auto,f_auto/v1759252888/cityexperts/hero/projects-hero.webp': '/assets/images/projects-hero.webp',
  
  // Logos
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252857/cityexperts/logos/city-experts-logo.svg': '/assets/images/city-experts-logo.svg',
  
  // Meta images
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252860/cityexperts/meta/city-experts-og.webp': '/assets/images/city-experts-og.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252864/cityexperts/hero/hero-dubai-skyline.webp': '/assets/images/hero-dubai-skyline.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252854/cityexperts/hero/about-hero.webp': '/assets/images/about-hero.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252888/cityexperts/hero/projects-hero.webp': '/assets/images/projects-hero.webp',
  
  // Company images
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252861/cityexperts/general/company-story.webp': '/assets/images/company-story.webp',
  'https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252855/cityexperts/general/capabilities-showcase.webp': '/assets/images/capabilities-showcase.webp'
};

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  console.log(`📝 Updating: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let replacements = 0;
  
  if (mode === 'local') {
    // Replace Cloudinary URLs with local paths
    Object.entries(imageMappings).forEach(([cloudinaryUrl, localPath]) => {
      const regex = new RegExp(cloudinaryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, localPath);
        replacements += matches.length;
      }
    });
  } else {
    // Replace local paths with Cloudinary URLs
    Object.entries(imageMappings).forEach(([cloudinaryUrl, localPath]) => {
      const regex = new RegExp(localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, cloudinaryUrl);
        replacements += matches.length;
      }
    });
  }
  
  if (replacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Made ${replacements} replacements`);
  } else {
    console.log(`   ✨ No changes needed`);
  }
}

// Update all HTML files
htmlFiles.forEach(updateFile);

console.log(`\n🎉 Image switching completed!`);
console.log(`Images are now set to ${mode} mode.`);

if (mode === 'local') {
  console.log('\n📋 Next steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. All images should now load from local files');
  console.log('\n💡 To switch back: node scripts/toggle-images.js cloudinary');
}