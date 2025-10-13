#!/usr/bin/env node

/**
 * Update projects.json to use local images for development
 */

import fs from 'fs';

console.log('🔄 Updating projects.json for local development...');

const projectsFile = 'data/projects.json';
const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));

// Project image mappings
const projectImageMappings = {
  'v1759252878/cityexperts/projects/project-1.webp': '/assets/images/project-1.webp',
  'v1759252879/cityexperts/projects/project-2.webp': '/assets/images/project-2.webp', 
  'v1759252880/cityexperts/projects/project-3.webp': '/assets/images/project-3.webp',
  'v1759252880/cityexperts/projects/project-5.webp': '/assets/images/project-5.webp',
  'v1759252881/cityexperts/projects/project-6.webp': '/assets/images/project-6.webp',
  
  // Gallery images
  'v1759252873/cityexperts/gallery/luxury_interior_1.png': '/assets/images/luxury_interior_1.png',
  'v1759252874/cityexperts/gallery/luxury_interior_2.png': '/assets/images/luxury_interior_2.png',
  'v1759252875/cityexperts/gallery/luxury_interior_3.png': '/assets/images/luxury_interior_3.png',
  'v1759252875/cityexperts/gallery/luxury_interior_4.png': '/assets/images/luxury_interior_4.png',
  'v1759252876/cityexperts/gallery/luxury_interior_5.png': '/assets/images/luxury_interior_5.png',
  'v1759252876/cityexperts/gallery/luxury_villa_1.png': '/assets/images/luxury_villa_1.png',
  'v1759252877/cityexperts/gallery/luxury_villa_2.png': '/assets/images/luxury_villa_2.png'
};

function updateProjectUrls(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const key in obj) {
    if (key === 'url' && typeof obj[key] === 'string' && obj[key].includes('res.cloudinary.com')) {
      // Check if this URL matches any of our local mappings
      Object.entries(projectImageMappings).forEach(([cloudinaryPath, localPath]) => {
        if (obj[key].includes(cloudinaryPath)) {
          obj[key] = localPath;
        }
      });
    } else if (typeof obj[key] === 'object') {
      updateProjectUrls(obj[key]);
    }
  }
}

// Update all project URLs
updateProjectUrls(projects);

// Write back to file
fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2), 'utf8');

console.log('✅ Updated projects.json to use local images');
console.log('🔄 Project images will now load from /assets/images/');