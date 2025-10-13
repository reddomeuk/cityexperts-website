#!/usr/bin/env node

/**
 * Complete Local Images Setup for CityExperts
 * Ensures all files use local image paths for development
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 CityExperts Local Images Setup');
console.log('==================================');

// Files to process
const filesToProcess = [
  'src/index.html',
  'src/about.html',
  'src/services.html', 
  'src/projects.html',
  'src/admin.html',
  'data/projects.json',
  'data/team.json',
  'data/headers.json'
];

// Comprehensive Cloudinary to Local mappings
const cloudinaryMappings = [
  // Hero images - all variants
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/hero\/hero-dubai-skyline\.webp/g,
    replacement: '/assets/images/hero-dubai-skyline.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/hero\/about-hero\.webp/g,
    replacement: '/assets/images/about-hero.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/hero\/projects-hero\.webp/g,
    replacement: '/assets/images/projects-hero.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/hero\/contact-hero\.webp/g,
    replacement: '/assets/images/contact-hero.webp'
  },

  // Logo
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/logos\/city-experts-logo\.svg/g,
    replacement: '/assets/images/city-experts-logo.svg'
  },

  // Meta/OG images
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/meta\/city-experts-og\.webp/g,
    replacement: '/assets/images/city-experts-og.webp'
  },

  // Project images
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/projects\/project-1\.webp/g,
    replacement: '/assets/images/project-1.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/projects\/project-2\.webp/g,
    replacement: '/assets/images/project-2.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/projects\/project-3\.webp/g,
    replacement: '/assets/images/project-3.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/projects\/project-5\.webp/g,
    replacement: '/assets/images/project-5.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/projects\/project-6\.webp/g,
    replacement: '/assets/images/project-6.webp'
  },

  // Gallery images
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_interior_1\.png/g,
    replacement: '/assets/images/luxury_interior_1.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_interior_2\.png/g,
    replacement: '/assets/images/luxury_interior_2.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_interior_3\.png/g,
    replacement: '/assets/images/luxury_interior_3.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_interior_4\.png/g,
    replacement: '/assets/images/luxury_interior_4.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_interior_5\.png/g,
    replacement: '/assets/images/luxury_interior_5.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_villa_1\.png/g,
    replacement: '/assets/images/luxury_villa_1.png'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/gallery\/luxury_villa_2\.png/g,
    replacement: '/assets/images/luxury_villa_2.png'
  },

  // Team images
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/team\/ceo-portrait\.webp/g,
    replacement: '/assets/images/team/ceo-portrait.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/team\/coo-portrait\.webp/g,
    replacement: '/assets/images/team/coo-portrait.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/team\/design-head-portrait\.webp/g,
    replacement: '/assets/images/team/design-head-portrait.webp'
  },

  // Company images
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/general\/company-story\.webp/g,
    replacement: '/assets/images/company-story.webp'
  },
  {
    pattern: /https:\/\/res\.cloudinary\.com\/dmawj7tmu\/image\/upload\/[^"']*\/cityexperts\/general\/capabilities-showcase\.webp/g,
    replacement: '/assets/images/capabilities-showcase.webp'
  }
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`📝 Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let totalReplacements = 0;

  cloudinaryMappings.forEach(mapping => {
    const matches = content.match(mapping.pattern);
    if (matches) {
      content = content.replace(mapping.pattern, mapping.replacement);
      totalReplacements += matches.length;
      console.log(`   ✅ Replaced ${matches.length} ${mapping.replacement.split('/').pop()} URLs`);
    }
  });

  if (totalReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   📝 Saved with ${totalReplacements} total replacements`);
  } else {
    console.log(`   ✨ No Cloudinary URLs found`);
  }
}

// Check if all required images exist locally
function verifyLocalImages() {
  console.log('\n🔍 Verifying local images...');
  
  const requiredImages = [
    'public/assets/images/hero-dubai-skyline.webp',
    'public/assets/images/about-hero.webp',
    'public/assets/images/projects-hero.webp',
    'public/assets/images/contact-hero.webp',
    'public/assets/images/city-experts-logo.svg',
    'public/assets/images/city-experts-og.webp',
    'public/assets/images/project-1.webp',
    'public/assets/images/project-2.webp',
    'public/assets/images/project-3.webp',
    'public/assets/images/project-5.webp',
    'public/assets/images/project-6.webp',
    'public/assets/images/team/ceo-portrait.webp',
    'public/assets/images/team/coo-portrait.webp',
    'public/assets/images/team/design-head-portrait.webp'
  ];

  let missing = 0;
  let found = 0;

  requiredImages.forEach(imagePath => {
    if (fs.existsSync(imagePath)) {
      found++;
    } else {
      console.log(`   ❌ Missing: ${imagePath}`);
      missing++;
    }
  });

  console.log(`📊 Images status: ${found} found, ${missing} missing`);
  return missing === 0;
}

// Main execution
function setupLocalImages() {
  console.log(`📊 Processing ${filesToProcess.length} files...\n`);
  
  filesToProcess.forEach(processFile);
  
  const allImagesFound = verifyLocalImages();
  
  console.log('\n🎉 Local images setup completed!');
  
  if (allImagesFound) {
    console.log('\n✅ All required images are available locally');
    console.log('\n📋 Next steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. All images should load from local files');
    console.log('4. No internet connection needed for images!');
  } else {
    console.log('\n⚠️  Some images are missing. Run the download script first:');
    console.log('   node scripts/download-cloudinary-images.js');
  }
}

setupLocalImages();