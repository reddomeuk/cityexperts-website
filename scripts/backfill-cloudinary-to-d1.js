// scripts/backfill-cloudinary-to-d1.js
// One-time script to scan Cloudinary and populate D1 database
// Run with: node scripts/backfill-cloudinary-to-d1.js

import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const D1_API_ENDPOINT = process.env.D1_API_ENDPOINT || 'https://your-site.pages.dev/api/projects';
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN; // Set this to your admin session token

// Helper to extract project info from Cloudinary folder structure
function parseCloudinaryPath(publicId) {
  // Expected structure: cityexperts/projects/{project-id}/{type}/{filename}
  // Example: cityexperts/projects/marina-tower/hero-wide/main-view
  const parts = publicId.split('/');
  
  if (parts.length < 4 || parts[0] !== 'cityexperts' || parts[1] !== 'projects') {
    return null;
  }
  
  const projectId = parts[2];
  const type = parts[3];
  const filename = parts.slice(4).join('/');
  
  // Map folder names to media types
  const typeMapping = {
    'hero-wide': 'heroWide',
    'hero': 'hero', 
    'thumb': 'thumb',
    'thumbnail': 'thumb',
    'gallery': 'gallery',
    'video': 'video'
  };
  
  return {
    projectId,
    mediaType: typeMapping[type] || 'gallery',
    filename,
    isMainImage: filename.includes('main') || filename.includes('hero') || !filename.includes('-')
  };
}

// Generate project metadata from filename/path
function generateProjectMetadata(projectId, resources) {
  // Try to infer project details from the first resource or filename
  const firstResource = resources[0];
  const pathParts = firstResource.public_id.split('/');
  
  // Basic project data
  const project = {
    id: projectId,
    status: 'published', // Default to published
    category: 'commercial', // Default category
    city: 'Dubai', // Default city
    featured: false, // Will be set to true if heroWide exists
    order: 0,
    i18n: {
      en: {
        title: projectId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        excerpt: `Professional ${projectId.includes('tower') ? 'tower' : 'project'} development`,
        description: `A premium development project showcasing excellence in construction and design.`
      },
      ar: {
        title: `مشروع ${projectId}`,
        excerpt: 'مشروع تطوير احترافي',
        description: 'مشروع تطوير متميز يعكس التميز في البناء والتصميم.'
      }
    },
    media: {}
  };
  
  // Categorize based on project name
  if (projectId.includes('tower') || projectId.includes('commercial') || projectId.includes('office')) {
    project.category = 'commercial';
  } else if (projectId.includes('villa') || projectId.includes('residential') || projectId.includes('home')) {
    project.category = 'residential';
  } else if (projectId.includes('hotel') || projectId.includes('resort')) {
    project.category = 'hospitality';
  } else if (projectId.includes('interior') || projectId.includes('fitout') || projectId.includes('design')) {
    project.category = 'interiors';
  }
  
  return project;
}

// Convert Cloudinary resource to media object
function createMediaObject(resource, mediaType) {
  return {
    url: resource.secure_url,
    public_id: resource.public_id,
    alt: {
      en: resource.public_id.split('/').pop().replace(/[-_]/g, ' ').replace(/\.(jpg|jpeg|png|webp)$/i, ''),
      ar: ''
    },
    width: resource.width,
    height: resource.height
  };
}

async function scanCloudinaryFolder() {
  console.log('🔍 Scanning Cloudinary for project assets...');
  
  try {
    // Scan the projects folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'cityexperts/projects/',
      max_results: 500,
      resource_type: 'image'
    });
    
    console.log(`📁 Found ${result.resources.length} images in Cloudinary`);
    
    // Group resources by project
    const projectsMap = new Map();
    
    for (const resource of result.resources) {
      const parsed = parseCloudinaryPath(resource.public_id);
      if (!parsed) continue;
      
      if (!projectsMap.has(parsed.projectId)) {
        projectsMap.set(parsed.projectId, []);
      }
      
      projectsMap.get(parsed.projectId).push({
        ...resource,
        mediaType: parsed.mediaType,
        isMainImage: parsed.isMainImage
      });
    }
    
    console.log(`📊 Found ${projectsMap.size} unique projects`);
    
    // Convert to project objects
    const projects = [];
    
    for (const [projectId, resources] of projectsMap) {
      const project = generateProjectMetadata(projectId, resources);
      
      // Sort resources by type and main image preference
      resources.sort((a, b) => {
        if (a.mediaType !== b.mediaType) {
          const typeOrder = ['heroWide', 'hero', 'thumb', 'gallery'];
          return typeOrder.indexOf(a.mediaType) - typeOrder.indexOf(b.mediaType);
        }
        return b.isMainImage - a.isMainImage; // Main images first
      });
      
      // Assign media based on type
      for (const resource of resources) {
        const mediaObj = createMediaObject(resource, resource.mediaType);
        
        if (resource.mediaType === 'gallery') {
          if (!project.media.gallery) project.media.gallery = [];
          project.media.gallery.push(mediaObj);
        } else {
          // For heroWide, hero, thumb - only keep the first (main) image
          if (!project.media[resource.mediaType]) {
            project.media[resource.mediaType] = mediaObj;
          }
        }
      }
      
      // Mark as featured if has heroWide image
      if (project.media.heroWide) {
        project.featured = true;
      }
      
      projects.push(project);
    }
    
    return projects;
    
  } catch (error) {
    console.error('❌ Error scanning Cloudinary:', error);
    throw error;
  }
}

async function saveProjectToD1(project) {
  if (!ADMIN_SESSION_TOKEN) {
    throw new Error('ADMIN_SESSION_TOKEN environment variable required');
  }
  
  try {
    const response = await fetch(D1_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${ADMIN_SESSION_TOKEN}`,
        'x-csrf-token': ADMIN_SESSION_TOKEN.slice(0, 24)
      },
      body: JSON.stringify(project)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to save project ${project.id}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Cloudinary to D1 backfill...');
  
  // Validate environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  try {
    // Scan Cloudinary
    const projects = await scanCloudinaryFolder();
    
    if (projects.length === 0) {
      console.log('📭 No projects found in Cloudinary');
      return;
    }
    
    console.log(`📦 Preparing to migrate ${projects.length} projects to D1...`);
    
    // Save each project to D1
    let successful = 0;
    let failed = 0;
    
    for (const project of projects) {
      try {
        console.log(`💾 Saving project: ${project.id}`);
        await saveProjectToD1(project);
        console.log(`✅ Saved: ${project.id}`);
        successful++;
      } catch (error) {
        console.error(`❌ Failed: ${project.id} - ${error.message}`);
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${projects.length}`);
    
    if (successful > 0) {
      console.log('\n🎉 Migration completed! Projects are now available in D1 database.');
      console.log('   You can now use the D1-backed API for your frontend.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanCloudinaryFolder, saveProjectToD1 };