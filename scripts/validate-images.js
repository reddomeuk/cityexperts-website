#!/usr/bin/env node

/**
 * Validate image system integration
 * Check if all required images exist and paths are correct
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating image system integration...\n');

// Check if key files exist
const requiredFiles = [
  'src/js/image-loader.js',
  'src/js/cloudinary-sync.js',
  'functions/api/cloudinary-upload.js',
  'public/assets/images/index.json'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Check critical images
const criticalImages = [
  'public/assets/images/home/hero-dubai-skyline.webp',
  'public/assets/images/logo/logo.png',
  'public/assets/images/city-experts-logo.svg',
  'public/assets/images/projects-hero.webp'
];

console.log('\n🖼️ Checking critical images:');
criticalImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ✅ ${path.basename(imagePath)} (${sizeKB}KB)`);
  } else {
    console.log(`   ❌ ${path.basename(imagePath)} - MISSING`);
  }
});

// Check HTML pages for image loader integration
const pages = [
  'src/index.html',
  'src/about.html', 
  'src/projects.html',
  'src/contact.html'
];

console.log('\n📄 Checking pages for image loader:');
pages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    const hasImageLoader = content.includes('image-loader.js');
    const hasLogoIds = content.includes('id="main-logo"') && content.includes('id="mobile-logo"');
    
    console.log(`   ${hasImageLoader ? '✅' : '❌'} ${path.basename(pagePath)} - Image loader: ${hasImageLoader ? 'YES' : 'NO'}`);
    console.log(`      Logo IDs: ${hasLogoIds ? 'YES' : 'NO'}`);
  } else {
    console.log(`   ❌ ${pagePath} - FILE MISSING`);
  }
});

// Check project structure
console.log('\n🏗️ Project image structure:');
if (fs.existsSync('public/assets/images/projects')) {
  const categories = fs.readdirSync('public/assets/images/projects');
  categories.forEach(category => {
    const categoryPath = `public/assets/images/projects/${category}`;
    if (fs.statSync(categoryPath).isDirectory()) {
      const projects = fs.readdirSync(categoryPath);
      console.log(`   📁 ${category}: ${projects.length} projects`);
      
      projects.forEach(project => {
        const projectPath = `${categoryPath}/${project}`;
        if (fs.statSync(projectPath).isDirectory()) {
          const images = fs.readdirSync(projectPath).filter(f => 
            f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')
          );
          console.log(`      • ${project}: ${images.length} images`);
        }
      });
    }
  });
} else {
  console.log('   ❌ Projects directory missing');
}

console.log('\n🧪 Testing URLs (when server is running):');
console.log('   • Home: http://localhost:3000/');
console.log('   • About: http://localhost:3000/about.html');
console.log('   • Projects: http://localhost:3000/projects.html');
console.log('   • Contact: http://localhost:3000/contact.html');
console.log('   • Test page: http://localhost:3000/test-images.html');

console.log('\n🎯 Expected behavior:');
console.log('   ✅ All logos should display on every page');
console.log('   ✅ Hero images should load on home/about/projects pages');
console.log('   ✅ Console should show "Image loading system initialized successfully"');
console.log('   ✅ No 404 errors in browser network tab');
console.log('   ✅ Images fallback gracefully if Cloudinary fails');

console.log('\n🚀 System validation complete!');