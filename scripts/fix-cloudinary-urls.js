#!/usr/bin/env node

/**
 * Script to fix duplicated Cloudinary URL paths in CityExperts project
 * Fixes paths like:
 * - cityexperts/hero/cityexperts/hero/image.webp → cityexperts/hero/image.webp
 * - cityexperts/projects/cityexperts/projects/image.webp → cityexperts/projects/image.webp
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 CityExperts Cloudinary URL Path Fix');
console.log('======================================');

// Files to process
const filesToProcess = [
  'data/projects.json',
  'src/index.html',
  'src/admin.html', 
  'src/services.html',
  'src/js/cloudinary-images.js'
];

// Pattern to match duplicated paths in Cloudinary URLs
const urlPatterns = [
  {
    // Fix cityexperts/hero/cityexperts/hero/ → cityexperts/hero/
    find: /cityexperts\/hero\/cityexperts\/hero\//g,
    replace: 'cityexperts/hero/'
  },
  {
    // Fix cityexperts/projects/cityexperts/projects/ → cityexperts/projects/
    find: /cityexperts\/projects\/cityexperts\/projects\//g,
    replace: 'cityexperts/projects/'
  }
];

let totalReplacements = 0;

filesToProcess.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  console.log(`\n📁 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  urlPatterns.forEach(pattern => {
    const matches = content.match(pattern.find);
    if (matches) {
      content = content.replace(pattern.find, pattern.replace);
      fileReplacements += matches.length;
      console.log(`   ✅ Fixed ${matches.length} occurrences of '${pattern.find.source}'`);
    }
  });
  
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   📝 Updated file with ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`   ✨ No duplicated paths found`);
  }
});

console.log(`\n🎉 Fix completed! Total replacements: ${totalReplacements}`);

if (totalReplacements > 0) {
  console.log('\n📋 Next steps:');
  console.log('1. Test the website locally');
  console.log('2. Commit and deploy the changes');
  console.log('3. Verify all images load correctly');
}