#!/usr/bin/env node

/**
 * Verify logo placement across all pages
 * Check that all pages use the correct logo paths
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying logo placement across all pages...\n');

// Check if the logo files exist
const logoFiles = [
  'public/assets/images/logo/logo.png',
  'public/assets/images/city-experts-logo.svg'
];

console.log('📁 Logo files:');
logoFiles.forEach(logoPath => {
  if (fs.existsSync(logoPath)) {
    const stats = fs.statSync(logoPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ✅ ${path.basename(logoPath)} (${sizeKB}KB)`);
  } else {
    console.log(`   ❌ ${path.basename(logoPath)} - MISSING`);
  }
});

// Check pages for correct logo usage
const pages = [
  'src/index.html',
  'src/about.html',
  'src/projects.html',
  'src/services.html',
  'src/contact.html'
];

console.log('\n📄 Page logo verification:');
pages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Count logo references
    const pngLogoCount = (content.match(/\/assets\/images\/logo\/logo\.png/g) || []).length;
    const svgLogoCount = (content.match(/\/assets\/images\/city-experts-logo\.svg/g) || []).length;
    const hasMainLogo = content.includes('id="main-logo"');
    const hasMobileLogo = content.includes('id="mobile-logo"');
    const hasOnerror = content.includes('onerror="this.src=');
    
    console.log(`   📋 ${path.basename(pagePath)}:`);
    console.log(`      PNG references: ${pngLogoCount}`);
    console.log(`      SVG references: ${svgLogoCount}`);
    console.log(`      Main logo ID: ${hasMainLogo ? 'YES' : 'NO'}`);
    console.log(`      Mobile logo ID: ${hasMobileLogo ? 'YES' : 'NO'}`);
    console.log(`      Fallback error handler: ${hasOnerror ? 'YES' : 'NO'}`);
    
    // Check if primary reference is PNG
    const firstLogoMatch = content.match(/src="([^"]*logo[^"]*)"/);
    if (firstLogoMatch) {
      const isPngFirst = firstLogoMatch[1].includes('logo.png');
      console.log(`      Primary logo: ${isPngFirst ? 'PNG ✅' : 'SVG ⚠️'}`);
    }
    
    console.log('');
  } else {
    console.log(`   ❌ ${pagePath} - FILE MISSING\n`);
  }
});

console.log('🎯 Expected behavior:');
console.log('   ✅ All pages should load PNG logo first');
console.log('   ✅ SVG should be fallback only (in onerror)');
console.log('   ✅ Main navigation should have id="main-logo"');
console.log('   ✅ Mobile menu should have id="mobile-logo"');

console.log('\n🌐 Test URLs:');
console.log('   • Home: http://localhost:3000/');
console.log('   • About: http://localhost:3000/about.html');
console.log('   • Projects: http://localhost:3000/projects.html');
console.log('   • Services: http://localhost:3000/services.html');
console.log('   • Contact: http://localhost:3000/contact.html');

console.log('\n🚀 Logo verification complete!');