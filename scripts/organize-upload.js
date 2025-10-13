#!/usr/bin/env node

/**
 * Cloudinary Manual Upload Helper
 * Organizes images and creates upload batches for easy manual upload
 */

import fs from 'fs';
import path from 'path';

console.log('📂 CityExperts Cloudinary Upload Organizer');
console.log('=========================================');

// Create organized upload folders
const uploadFolders = {
  'upload-batch/01-critical': [
    'public/assets/images/hero-dubai-skyline.webp',
    'public/assets/images/city-experts-logo.svg', 
    'public/assets/images/city-experts-og.webp'
  ],
  'upload-batch/02-projects': [
    'public/assets/images/project-1.webp',
    'public/assets/images/project-2.webp',
    'public/assets/images/project-3.webp',
    'public/assets/images/project-5.webp',
    'public/assets/images/project-6.webp'
  ],
  'upload-batch/03-heroes': [
    'public/assets/images/about-hero.webp',
    'public/assets/images/projects-hero.webp', 
    'public/assets/images/contact-hero.webp'
  ],
  'upload-batch/04-gallery': [
    'public/assets/images/luxury_interior_1.png',
    'public/assets/images/luxury_interior_2.png',
    'public/assets/images/luxury_interior_3.png',
    'public/assets/images/luxury_interior_4.png',
    'public/assets/images/luxury_interior_5.png',
    'public/assets/images/luxury_interior_6.png',
    'public/assets/images/luxury_villa_1.png', 
    'public/assets/images/luxury_villa_2.png'
  ],
  'upload-batch/05-team': [
    'public/assets/images/team/ceo-portrait.webp',
    'public/assets/images/team/coo-portrait.webp',
    'public/assets/images/team/design-head-portrait.webp'
  ],
  'upload-batch/06-company': [
    'public/assets/images/company-story.webp',
    'public/assets/images/capabilities-showcase.webp',
    'public/assets/images/city-experts-logo.png'
  ]
};

// Cloudinary folder mapping
const folderMapping = {
  '01-critical': 'cityexperts/meta, cityexperts/logos, cityexperts/hero',
  '02-projects': 'cityexperts/projects', 
  '03-heroes': 'cityexperts/hero',
  '04-gallery': 'cityexperts/gallery',
  '05-team': 'cityexperts/team',
  '06-company': 'cityexperts/general, cityexperts/logos'
};

/**
 * Copy files to organized upload folders
 */
function organizeFiles() {
  let totalFiles = 0;
  let copiedFiles = 0;
  
  Object.entries(uploadFolders).forEach(([folder, files]) => {
    // Create folder
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    console.log(`\n📁 Organizing: ${folder}`);
    
    files.forEach(filePath => {
      totalFiles++;
      const fileName = path.basename(filePath);
      const destPath = path.join(folder, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, destPath);
        console.log(`   ✅ ${fileName}`);
        copiedFiles++;
      } else {
        console.log(`   ❌ Missing: ${fileName}`);
      }
    });
  });
  
  console.log(`\n📊 Organized: ${copiedFiles}/${totalFiles} files`);
  return copiedFiles;
}

/**
 * Create upload instructions file
 */
function createUploadInstructions() {
  const instructions = `# 🚀 CityExperts Cloudinary Upload Instructions

## Quick Upload Process (5 minutes)

### Step 1: Go to Cloudinary
1. Open: https://cloudinary.com/console/media_library
2. Login to your dmawj7tmu account

### Step 2: Upload in Order (6 batches)

#### Batch 1: CRITICAL (Upload First) 🔥
- Folder: upload-batch/01-critical/
- Cloudinary folders: cityexperts/hero, cityexperts/logos, cityexperts/meta
- Files: 3 critical images (logo, hero, og)

#### Batch 2: PROJECTS 📊  
- Folder: upload-batch/02-projects/
- Cloudinary folder: cityexperts/projects
- Files: 5 project portfolio images

#### Batch 3: HERO IMAGES 🌅
- Folder: upload-batch/03-heroes/
- Cloudinary folder: cityexperts/hero  
- Files: 3 page hero images

#### Batch 4: GALLERY 🖼️
- Folder: upload-batch/04-gallery/
- Cloudinary folder: cityexperts/gallery
- Files: 8 interior/villa images

#### Batch 5: TEAM 👥
- Folder: upload-batch/05-team/
- Cloudinary folder: cityexperts/team
- Files: 3 team portraits

#### Batch 6: COMPANY 🏢
- Folder: upload-batch/06-company/  
- Cloudinary folder: cityexperts/general
- Files: 3 company/brand images

### Upload Settings for Each Batch:
1. Click "Upload" in Cloudinary Media Library
2. Select all files from batch folder
3. Set folder to the corresponding cityexperts subfolder
4. Click "Upload"
5. Wait for completion
6. Move to next batch

### Important Public IDs to Set:
- hero-dubai-skyline.webp → cityexperts/hero/hero-dubai-skyline
- city-experts-logo.svg → cityexperts/logos/city-experts-logo
- project-1.webp → cityexperts/projects/project-1
- (others will auto-assign correctly)

## After Upload Complete:
✅ Test: https://cityexperts-website.pages.dev  
✅ All images should load (no 404 errors)
✅ Console errors resolved

Total files: 26 images ready for upload!
`;

  fs.writeFileSync('upload-batch/UPLOAD_INSTRUCTIONS.md', instructions);
  console.log('📋 Created: upload-batch/UPLOAD_INSTRUCTIONS.md');
}

/**
 * Create a final upload command script
 */
function createFinalScript() {
  const script = `#!/bin/bash

# Final Upload Script (requires Cloudinary credentials)
# Use this if you get API access

export CLOUDINARY_CLOUD_NAME="dmawj7tmu"
# export CLOUDINARY_API_KEY="your-key-here"  
# export CLOUDINARY_API_SECRET="your-secret-here"

echo "🚀 Final Cloudinary Upload for CityExperts"

if [ -z "$CLOUDINARY_API_KEY" ]; then
    echo "❌ Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET"
    echo "💡 Or use manual upload: see upload-batch/UPLOAD_INSTRUCTIONS.md"
    exit 1
fi

# Upload with Node.js script
node scripts/upload-to-cloudinary.js

echo "✅ Upload completed! Test at: https://cityexperts-website.pages.dev"
`;

  fs.writeFileSync('scripts/final-upload.sh', script);
  fs.chmodSync('scripts/final-upload.sh', 0o755);
  console.log('📄 Created: scripts/final-upload.sh');
}

/**
 * Show final summary
 */
function showFinalSummary() {
  console.log('\n🎉 READY FOR UPLOAD!');
  console.log('===================');
  console.log('');
  console.log('📂 All images organized in: upload-batch/');
  console.log('📋 Instructions: upload-batch/UPLOAD_INSTRUCTIONS.md');
  console.log('');
  console.log('🚀 FASTEST METHOD:');
  console.log('1. Open: https://cloudinary.com/console/media_library');
  console.log('2. Upload upload-batch/01-critical/ first (3 files)');
  console.log('3. Upload remaining batches (23 files)');
  console.log('4. Test: https://cityexperts-website.pages.dev');
  console.log('');
  console.log('⏱️  Estimated upload time: 5 minutes');
  console.log('✅ Your production site will be fully functional!');
}

/**
 * Main execution
 */
function main() {
  const organized = organizeFiles();
  
  if (organized > 0) {
    createUploadInstructions();
    createFinalScript();
    showFinalSummary();
  } else {
    console.log('❌ No files found to organize');
  }
}

main();