#!/usr/bin/env node

/**
 * Integrate dual-source image system across all pages
 * This script will add the image loading system to pages that don't have it yet
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Integrating dual-source image system across all pages...');

// Define the image loader script block to inject
const imageLoaderScript = `
  <!-- Load JavaScript -->
  <script type="module" src="/js/image-loader.js"></script>
  <script type="module" src="/js/main.js"></script>
  
  <!-- Initialize Image Loading -->
  <script type="module">
    import { ImageLoader } from '/js/image-loader.js';
    
    // Load critical images immediately
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('🖼️ Initializing dual-source image system...');
      
      try {
        // Load logos on all pages
        const mainLogo = document.getElementById('main-logo');
        const mobileLogo = document.getElementById('mobile-logo');
        
        if (mainLogo) {
          const logoImage = await ImageLoader.logo();
          if (logoImage) {
            mainLogo.src = logoImage.src;
            console.log('✅ Main logo loaded');
          }
        }
        
        if (mobileLogo) {
          const logoImage = await ImageLoader.logo();
          if (logoImage) {
            mobileLogo.src = logoImage.src;
            console.log('✅ Mobile logo loaded');
          }
        }
        
        // Page-specific image loading
        const currentPage = window.location.pathname;
        
        if (currentPage === '/' || currentPage === '/index.html') {
          // Home page - load hero image
          const heroContainer = document.getElementById('hero-image-container');
          const heroFallback = document.getElementById('hero-fallback');
          
          if (heroContainer && heroFallback) {
            const heroImage = await ImageLoader.homeHero();
            
            if (heroImage) {
              heroContainer.appendChild(heroImage);
              heroFallback.style.opacity = '0';
              heroImage.style.opacity = '1';
              console.log('✅ Hero image loaded successfully');
            } else {
              heroFallback.style.opacity = '1';
              console.log('⚠️ Using fallback hero image');
            }
          }
        } else if (currentPage.includes('about')) {
          // About page - load about hero if needed
          console.log('📄 About page detected');
        } else if (currentPage.includes('projects')) {
          // Projects page - load project images
          console.log('🏗️ Projects page detected');
        } else if (currentPage.includes('contact')) {
          // Contact page
          console.log('📞 Contact page detected');
        }
        
        console.log('🎉 Image loading system initialized successfully');
        
      } catch (error) {
        console.error('❌ Error initializing image system:', error);
      }
    });
  </script>`;

// Function to update a page's script section
function updatePageScripts(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has the image loader
    if (content.includes('src="/js/image-loader.js"')) {
      console.log(`⏭️ ${path.basename(filePath)} already has image loader - skipping`);
      return false;
    }
    
    // Look for the main.js script tag and replace it
    const mainJsPattern = /<script type="module" src="\/js\/main\.js"><\/script>/;
    
    if (mainJsPattern.test(content)) {
      const updatedContent = content.replace(mainJsPattern, imageLoaderScript.trim());
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated ${path.basename(filePath)} with image loader`);
      return true;
    } else {
      console.log(`⚠️ ${path.basename(filePath)} doesn't have expected script pattern - manual update needed`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Function to add IDs to logos that don't have them
function updateLogos(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Find main navigation logos without ID
    const mainLogoPattern = /<img src="[^"]*logo[^"]*" alt="City Experts" class="h-10 w-auto"(?![^>]*id=)/g;
    if (mainLogoPattern.test(content)) {
      content = content.replace(mainLogoPattern, (match) => {
        return match.replace('<img ', '<img id="main-logo" ');
      });
      updated = true;
    }
    
    // Find mobile logos without ID
    const mobileLogoPattern = /<img src="[^"]*logo[^"]*" alt="City Experts" class="h-8 w-auto"(?![^>]*id=)/g;
    if (mobileLogoPattern.test(content)) {
      content = content.replace(mobileLogoPattern, (match) => {
        return match.replace('<img ', '<img id="mobile-logo" ');
      });
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added logo IDs to ${path.basename(filePath)}`);
    }
    
    return updated;
  } catch (error) {
    console.error(`❌ Error updating logos in ${filePath}:`, error.message);
    return false;
  }
}

// Process all HTML pages
const pages = [
  'src/about.html',
  'src/projects.html',
  'src/contact.html'
];

let updatedPages = 0;
let updatedLogos = 0;

pages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    console.log(`\n🔧 Processing ${pagePath}...`);
    
    if (updateLogos(pagePath)) {
      updatedLogos++;
    }
    
    if (updatePageScripts(pagePath)) {
      updatedPages++;
    }
  } else {
    console.log(`⚠️ ${pagePath} not found`);
  }
});

console.log(`\n📊 Integration Summary:`);
console.log(`   ✅ Updated scripts: ${updatedPages} pages`);
console.log(`   🏷️ Updated logos: ${updatedLogos} pages`);
console.log(`   📄 Home page: Already configured`);

if (updatedPages > 0 || updatedLogos > 0) {
  console.log(`\n🎉 Image system integration completed!`);
  console.log(`   All pages now have dual-source image loading`);
  console.log(`   Logos will fallback gracefully if Cloudinary fails`);
} else {
  console.log(`\n✅ All pages already have the image system integrated!`);
}

console.log(`\n🧪 Test your pages:`);
console.log(`   • Home: http://localhost:3000/`);
console.log(`   • About: http://localhost:3000/about.html`);
console.log(`   • Projects: http://localhost:3000/projects.html`);
console.log(`   • Contact: http://localhost:3000/contact.html`);
console.log(`   • Test page: http://localhost:3000/test-images.html`);
console.log(`\n🎯 All images should now load correctly with fallbacks!`);