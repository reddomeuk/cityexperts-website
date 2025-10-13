/**
 * Local Image Loader for CityExperts website
 * Simple, fast image loading from local assets
 */

/**
 * Load image from local path with error handling
 * @param {string} localPath - Local path to image
 * @param {Object} options - Image options
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadLocalImage(localPath, options = {}) {
  const {
    alt = '',
    width = null,
    height = null,
    cssClasses = '',
    loading = 'lazy',
    priority = false
  } = options;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.alt = alt;
    img.loading = priority ? 'eager' : loading;
    
    if (width) img.width = width;
    if (height) img.height = height;
    if (cssClasses) img.className = cssClasses;

    img.onload = () => {
      console.log(`✅ Loaded from local: ${localPath}`);
      resolve(img);
    };

    img.onerror = () => {
      console.error(`❌ Failed to load image: ${localPath}`);
      reject(new Error(`Image not found: ${localPath}`));
    };

    img.src = localPath;
  });
}
/**
 * Create responsive image element with local srcset
 */
export function createResponsiveImage(imagePath, options = {}) {
  const {
    alt = '',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    cssClasses = '',
    priority = false
  } = options;

  const img = document.createElement('img');
  img.alt = alt;
  img.loading = priority ? 'eager' : 'lazy';
  if (cssClasses) img.className = cssClasses;

  // For local images, we just use the single source
  img.src = imagePath;
  img.sizes = sizes;

  return img;
}

/**
 * Preload critical images
 */
export function preloadImage(imagePath, priority = true) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imagePath;
  
  document.head.appendChild(link);
  return link;
}

/**
 * Image path mappings for CityExperts
 */
export const IMAGE_PATHS = {
  // Logos
  logo: '/assets/images/logo.png',
  
  // Hero images
  homeHero: '/assets/images/hero-dubai-skyline.webp',
  aboutHero: '/assets/images/about-hero.webp',
  projectsHero: '/assets/images/projects-hero.webp',
  contactHero: '/assets/images/contact-hero.webp',
  
  // Gallery images
  luxury1: '/assets/images/luxury_interior_1.png',
  luxury2: '/assets/images/luxury_interior_2.png',
  luxury3: '/assets/images/luxury_interior_3.png',
  luxury4: '/assets/images/luxury_interior_4.png',
  luxury5: '/assets/images/luxury_interior_5.png',
  luxury6: '/assets/images/luxury_interior_6.png',
  villa1: '/assets/images/luxury_villa_1.png',
  villa2: '/assets/images/luxury_villa_2.png'
};

/**
 * Easy-to-use functions for common image loading
 */
export const ImageLoader = {
  // Load home hero image
  homeHero: (options = {}) => loadLocalImage(
    IMAGE_PATHS.homeHero,
    { alt: 'Dubai skyline at dusk - CityExperts', priority: true, ...options }
  ),
  
  // Load about hero image
  aboutHero: (options = {}) => loadLocalImage(
    IMAGE_PATHS.aboutHero,
    { alt: 'About CityExperts', priority: true, ...options }
  ),
  
  // Load projects hero image
  projectsHero: (options = {}) => loadLocalImage(
    IMAGE_PATHS.projectsHero,
    { alt: 'Our Projects - CityExperts', priority: true, ...options }
  ),
  
  // Load contact hero image
  contactHero: (options = {}) => loadLocalImage(
    IMAGE_PATHS.contactHero,
    { alt: 'Contact CityExperts', priority: true, ...options }
  ),
  
  // Load logo
  logo: (options = {}) => loadLocalImage(
    IMAGE_PATHS.logo,
    { alt: 'CityExperts Logo', ...options }
  ),
  
  // Load gallery image
  gallery: (imageName, options = {}) => {
    const imagePath = IMAGE_PATHS[imageName];
    if (!imagePath) {
      console.warn(`⚠️ Gallery image not found: ${imageName}`);
      return Promise.reject(new Error(`Gallery image not found: ${imageName}`));
    }
    return loadLocalImage(imagePath, { alt: `Gallery image - ${imageName}`, ...options });
  }
};