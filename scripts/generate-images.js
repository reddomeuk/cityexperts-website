#!/usr/bin/env node

/**
 * Generate Missing Images for CityExperts
 * Creates placeholder images for any missing files before Cloudinary upload
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🎨 Generating Missing CityExperts Images');
console.log('======================================');

// Ensure required directories exist
const imageDirs = [
  'public/assets/images',
  'public/assets/images/team'
];

imageDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Define placeholder images to create
const placeholderImages = [
  // Hero Images (1920x1080)
  {
    path: 'public/assets/images/hero-dubai-skyline.webp',
    width: 1920,
    height: 1080,
    text: 'Dubai Skyline\\nCity Experts',
    bg: '#1e3a8a'
  },
  {
    path: 'public/assets/images/about-hero.webp', 
    width: 1920,
    height: 1080,
    text: 'About Us\\nCity Experts',
    bg: '#059669'
  },
  {
    path: 'public/assets/images/projects-hero.webp',
    width: 1920,
    height: 1080,
    text: 'Our Projects\\nCity Experts',
    bg: '#dc2626'
  },
  {
    path: 'public/assets/images/contact-hero.webp',
    width: 1920,
    height: 1080,
    text: 'Contact Us\\nCity Experts',
    bg: '#7c3aed'
  },

  // Project Images (1200x800)
  {
    path: 'public/assets/images/project-1.webp',
    width: 1200,
    height: 800,
    text: 'Emirates Business Tower\\nProject 1',
    bg: '#0f172a'
  },
  {
    path: 'public/assets/images/project-2.webp',
    width: 1200,
    height: 800,
    text: 'Marina Complex\\nProject 2',
    bg: '#1e293b'
  },
  {
    path: 'public/assets/images/project-3.webp',
    width: 1200,
    height: 800,
    text: 'Residential Tower\\nProject 3',
    bg: '#334155'
  },
  {
    path: 'public/assets/images/project-5.webp',
    width: 1200,
    height: 800,
    text: 'Downtown Complex\\nProject 5',
    bg: '#475569'
  },
  {
    path: 'public/assets/images/project-6.webp',
    width: 1200,
    height: 800,
    text: 'Commercial Center\\nProject 6',
    bg: '#64748b'
  },

  // Gallery Images (800x600)
  {
    path: 'public/assets/images/luxury_interior_1.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 1\\nModern Design',
    bg: '#92400e'
  },
  {
    path: 'public/assets/images/luxury_interior_2.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 2\\nElegant Space',
    bg: '#9333ea'
  },
  {
    path: 'public/assets/images/luxury_interior_3.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 3\\nPremium Finish',
    bg: '#c2410c'
  },
  {
    path: 'public/assets/images/luxury_interior_4.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 4\\nContemporary',
    bg: '#15803d'
  },
  {
    path: 'public/assets/images/luxury_interior_5.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 5\\nSophisticated',
    bg: '#1d4ed8'
  },
  {
    path: 'public/assets/images/luxury_interior_6.png',
    width: 800,
    height: 600,
    text: 'Luxury Interior 6\\nRefined Style',
    bg: '#be123c'
  },
  {
    path: 'public/assets/images/luxury_villa_1.png',
    width: 800,
    height: 600,
    text: 'Luxury Villa 1\\nExclusive Living',
    bg: '#a16207'
  },
  {
    path: 'public/assets/images/luxury_villa_2.png',
    width: 800,
    height: 600,
    text: 'Luxury Villa 2\\nPremium Estate',
    bg: '#166534'
  },

  // Company Images (1200x800)
  {
    path: 'public/assets/images/company-story.webp',
    width: 1200,
    height: 800,
    text: 'Our Story\\nCity Experts Journey',
    bg: '#0f766e'
  },
  {
    path: 'public/assets/images/capabilities-showcase.webp',
    width: 1200,
    height: 800,
    text: 'Our Capabilities\\nExpertise & Innovation',
    bg: '#7c2d12'
  }
];

/**
 * Create a placeholder image using ImageMagick (if available) or Node.js Canvas
 */
function createPlaceholderImage(config) {
  const { path: imagePath, width, height, text, bg } = config;
  
  // Skip if file already exists
  if (fs.existsSync(imagePath)) {
    console.log(`✅ Already exists: ${imagePath}`);
    return;
  }
  
  console.log(`🎨 Creating: ${imagePath} (${width}x${height})`);
  
  try {
    // Try using ImageMagick first (if available)
    const command = `magick -size ${width}x${height} xc:"${bg}" ` +
                   `-font Arial-Bold -pointsize 48 -fill white ` +
                   `-gravity center -annotate +0+0 "${text}" ` +
                   `"${imagePath}"`;
    
    execSync(command, { stdio: 'pipe' });
    console.log(`   ✅ Created with ImageMagick`);
    
  } catch (error) {
    // Fallback: create a simple colored rectangle (requires imagemagick or similar)
    try {
      const simpleCommand = `magick -size ${width}x${height} xc:"${bg}" "${imagePath}"`;
      execSync(simpleCommand, { stdio: 'pipe' });
      console.log(`   ✅ Created simple placeholder`);
    } catch (fallbackError) {
      console.log(`   ⚠️  Could not create ${imagePath} - ImageMagick not available`);
      console.log(`   💡 Please install ImageMagick: brew install imagemagick`);
    }
  }
}

/**
 * Convert existing JPG to WebP if needed
 */
function convertExistingImages() {
  console.log('\n🔄 Converting existing images...');
  
  // Convert city-experts-og.jpg to webp
  const ogJpg = 'public/assets/images/city-experts-og.jpg';
  const ogWebp = 'public/assets/images/city-experts-og.webp';
  
  if (fs.existsSync(ogJpg) && !fs.existsSync(ogWebp)) {
    try {
      execSync(`magick "${ogJpg}" "${ogWebp}"`, { stdio: 'pipe' });
      console.log(`✅ Converted: ${ogJpg} → ${ogWebp}`);
    } catch (error) {
      console.log(`⚠️  Could not convert ${ogJpg} - copying as fallback`);
      fs.copyFileSync(ogJpg, ogWebp.replace('.webp', '.jpg'));
    }
  }
}

/**
 * Main function
 */
function generateImages() {
  console.log(`📊 Total placeholder images to create: ${placeholderImages.length}\n`);
  
  // Check if ImageMagick is available
  try {
    execSync('magick -version', { stdio: 'pipe' });
    console.log('✅ ImageMagick detected\n');
  } catch (error) {
    console.log('⚠️  ImageMagick not found. Install with: brew install imagemagick\n');
  }
  
  // Create placeholder images
  placeholderImages.forEach(config => {
    createPlaceholderImage(config);
  });
  
  // Convert existing images
  convertExistingImages();
  
  console.log('\n🎉 Image generation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run upload:cloudinary');
  console.log('2. Or: node scripts/upload-to-cloudinary.js');
  console.log('3. Make sure to set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
}

// Run the generator
generateImages();