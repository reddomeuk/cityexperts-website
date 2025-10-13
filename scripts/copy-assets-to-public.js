#!/usr/bin/env node

/**
 * Copy images from src/assets to public/assets for web serving
 * Organizes them according to the new structure
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📁 Copying images from src/assets to public/assets...');

// Ensure directories exist
const directories = [
  'public/assets/images/home',
  'public/assets/images/about',
  'public/assets/images/projects/commercial',
  'public/assets/images/projects/interior', 
  'public/assets/images/projects/villa',
  'public/assets/images/logo',
  'public/assets/images/team'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

// Copy operations
const copyOperations = [
  // Home page
  {
    src: 'src/assets/Main Page/hero-dubai-skyline.webp',
    dest: 'public/assets/images/home/hero-dubai-skyline.webp'
  },
  
  // Logo
  {
    src: 'src/assets/Logo/LOGO PNG.png',
    dest: 'public/assets/images/logo/logo.png'
  }
];

// Check About Us page
if (fs.existsSync('src/assets/About Us Page')) {
  // Check for office images
  if (fs.existsSync('src/assets/About Us Page/Office')) {
    const officeFiles = fs.readdirSync('src/assets/About Us Page/Office');
    officeFiles.forEach(file => {
      if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
        copyOperations.push({
          src: `src/assets/About Us Page/Office/${file}`,
          dest: `public/assets/images/about/${file}`
        });
      }
    });
  }
  
  // Check for team images
  if (fs.existsSync('src/assets/About Us Page/Team')) {
    const teamFiles = fs.readdirSync('src/assets/About Us Page/Team');
    teamFiles.forEach(file => {
      if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
        copyOperations.push({
          src: `src/assets/About Us Page/Team/${file}`,
          dest: `public/assets/images/team/${file}`
        });
      }
    });
  }
}

// Check project folders
if (fs.existsSync('src/assets/Project Page')) {
  const projectCategories = fs.readdirSync('src/assets/Project Page');
  
  projectCategories.forEach(category => {
    const categoryPath = `src/assets/Project Page/${category}`;
    if (fs.statSync(categoryPath).isDirectory() && category !== '.DS_Store') {
      
      // Determine target folder based on category name
      let targetCategory = 'commercial'; // default
      if (category.toLowerCase().includes('interior')) {
        targetCategory = 'interior';
      } else if (category.toLowerCase().includes('villa')) {
        targetCategory = 'villa';
      }
      
      // Get projects in this category
      const projects = fs.readdirSync(categoryPath);
      projects.forEach(project => {
        const projectPath = `${categoryPath}/${project}`;
        if (fs.statSync(projectPath).isDirectory() && project !== '.DS_Store') {
          
          // Copy all images from this project
          const projectFiles = fs.readdirSync(projectPath);
          projectFiles.forEach(file => {
            if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
              const projectId = project.toLowerCase().replace(/\s+/g, '-');
              const targetDir = `public/assets/images/projects/${targetCategory}/${projectId}`;
              
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              
              copyOperations.push({
                src: `${projectPath}/${file}`,
                dest: `${targetDir}/${file}`
              });
            }
          });
        }
      });
    }
  });
}

// Perform copy operations
let copied = 0;
let skipped = 0;
let errors = 0;

copyOperations.forEach(op => {
  try {
    if (fs.existsSync(op.src)) {
      fs.copyFileSync(op.src, op.dest);
      console.log(`✅ Copied: ${op.src} → ${op.dest}`);
      copied++;
    } else {
      console.log(`⚠️  Source not found: ${op.src}`);
      skipped++;
    }
  } catch (error) {
    console.error(`❌ Error copying ${op.src}:`, error.message);
    errors++;
  }
});

console.log(`\n📊 Copy Summary:`);
console.log(`   ✅ Copied: ${copied}`);
console.log(`   ⚠️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);

if (copied > 0) {
  console.log(`\n🎉 Images copied successfully!`);
  console.log(`📁 Images are now available in public/assets/images/`);
  console.log(`🌐 They can be accessed at /assets/images/ in the browser`);
}

// Create an index of available images
const imageIndex = {
  home: fs.existsSync('public/assets/images/home') ? fs.readdirSync('public/assets/images/home') : [],
  about: fs.existsSync('public/assets/images/about') ? fs.readdirSync('public/assets/images/about') : [],
  logo: fs.existsSync('public/assets/images/logo') ? fs.readdirSync('public/assets/images/logo') : [],
  team: fs.existsSync('public/assets/images/team') ? fs.readdirSync('public/assets/images/team') : [],
  projects: {}
};

// Index project images
['commercial', 'interior', 'villa'].forEach(category => {
  const categoryPath = `public/assets/images/projects/${category}`;
  if (fs.existsSync(categoryPath)) {
    imageIndex.projects[category] = fs.readdirSync(categoryPath);
  }
});

fs.writeFileSync('public/assets/images/index.json', JSON.stringify(imageIndex, null, 2));
console.log(`📋 Created image index: public/assets/images/index.json`);