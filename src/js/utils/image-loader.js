/**
 * Local Image Loader with Graceful Fallback Logic
 * Pure local image system for CityExperts website
 */

/**
 * Get enexport function loadTeamImage(memberName, alt = "", classList = "w-24 h-24 rounded-full object-cover") {
  const fallbackPaths = [
    createImagePath(`team/${memberName}.webp`),
    createImagePath(`team/${memberName}.png`),
    createImagePath(`team/${memberName}.jpg`),
    createImagePath("team/placeholder-member.webp"),
    createImagePath("placeholder.webp")
  ];
  
  return loadLocalImage(fallbackPaths, alt, classList);
}ware image base path
 * @returns {string} Base path for images
 */
function getImageBasePath() {
  // In production, all assets are served from /assets/
  // In development with Vite, they're also served from /assets/ due to publicDir config
  return '/assets/images';
}

/**
 * Create full image path with environment awareness
 * @param {string} relativePath - Relative path from /assets/images/
 * @returns {string} Full image path
 */
function createImagePath(relativePath) {
  const basePath = getImageBasePath();
  return `${basePath}/${relativePath}`.replace(/\/+/g, '/');
}

/**
 * Load local image with graceful fallback logic.
 * Priority: project hero > thumb > placeholder.
 * @param {string[]} pathList - Array of image paths to try in order
 * @param {string} alt - Alt text for the image
 * @param {string} classList - CSS classes to apply to the image
 * @returns {HTMLImageElement} Image element with fallback logic
 */
export function loadLocalImage(pathList = [], alt = "", classList = "") {
  const img = document.createElement("img");
  img.alt = alt;
  img.className = classList;
  img.loading = "lazy";

  let loaded = false;
  let currentIndex = 0;

  const tryNextImage = () => {
    if (loaded || currentIndex >= pathList.length) {
      if (!loaded) {
        // Use placeholder if all paths fail
        img.src = "/assets/images/placeholder.webp";
        console.warn(`⚠️ All image paths failed, using placeholder. Tried: ${pathList.join(', ')}`);
      }
      return;
    }

    const path = pathList[currentIndex];
    const testImage = new Image();
    
    testImage.onload = () => {
      if (!loaded) {
        img.src = path;
        loaded = true;
        console.log(`✅ Loaded image: ${path}`);
      }
    };
    
    testImage.onerror = () => {
      console.warn(`⚠️ Failed to load: ${path}`);
      currentIndex++;
      tryNextImage();
    };
    
    testImage.src = path;
  };

  // Start loading the first image
  tryNextImage();

  return img;
}

/**
 * Load hero image with multiple fallback options
 * @param {string} heroPath - Primary hero image path
 * @param {string} alt - Alt text
 * @param {string} classList - CSS classes
 * @returns {HTMLImageElement} Hero image element
 */
export function loadHeroImage(heroPath, alt = "", classList = "w-full h-[700px] object-cover") {
  const fallbackPaths = [
    heroPath,
    createImagePath("home/hero-dubai-skyline.webp"), // Default hero fallback
    createImagePath("placeholder.webp")
  ];
  
  return loadLocalImage(fallbackPaths, alt, classList);
}

/**
 * Load project image with category-based fallbacks
 * @param {string} category - Project category (commercial, residential, interior, etc.)
 * @param {string} slug - Project slug/identifier
 * @param {string} alt - Alt text
 * @param {string} classList - CSS classes
 * @returns {HTMLImageElement} Project image element
 */
export function loadProjectImage(category, slug, alt = "", classList = "w-full h-64 object-cover rounded-lg") {
  const categoryFolder = category.toLowerCase();
  const fallbackPaths = [
    createImagePath(`projects/${categoryFolder}/${slug}/hero.webp`),
    createImagePath(`projects/${categoryFolder}/${slug}/hero.png`),
    createImagePath(`projects/${categoryFolder}/${slug}/thumb.webp`),
    createImagePath(`projects/${categoryFolder}/${slug}/thumb.png`),
    createImagePath(`projects/placeholder-${categoryFolder}.webp`),
    createImagePath("placeholder.webp")
  ];
  
  return loadLocalImage(fallbackPaths, alt, classList);
}

/**
 * Load team member portrait with fallbacks
 * @param {string} memberName - Team member identifier
 * @param {string} alt - Alt text
 * @param {string} classList - CSS classes
 * @returns {HTMLImageElement} Team portrait element
 */
export function loadTeamImage(memberName, alt = "", classList = "w-full h-full object-cover rounded-full") {
  const fallbackPaths = [
    `/assets/images/team/${memberName}.webp`,
    `/assets/images/team/${memberName}.png`,
    `/assets/images/team/${memberName}.jpg`,
    "/assets/images/team/placeholder-avatar.webp",
    "/assets/images/placeholder.webp"
  ];
  
  return loadLocalImage(fallbackPaths, alt, classList);
}

/**
 * Load logo with SVG/PNG fallbacks
 * @param {string} alt - Alt text
 * @param {string} classList - CSS classes
 * @returns {HTMLImageElement} Logo element
 */
export function loadLogo(alt = "City Experts", classList = "") {
  const fallbackPaths = [
    createImagePath("logo/logo.png"),
    createImagePath("city-experts-logo.svg")
  ];
  
  return loadLocalImage(fallbackPaths, alt, classList);
}

/**
 * Preload critical images for performance
 * @param {string[]} imagePaths - Array of image paths to preload
 */
export function preloadImages(imagePaths = []) {
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
    console.log(`🚀 Preloading: ${path}`);
  });
}

/**
 * Image path helper functions
 */
export const ImagePaths = {
  // Hero images
  homeHero: createImagePath("home/hero-dubai-skyline.webp"),
  aboutHero: createImagePath("about/about-hero.webp"), 
  projectsHero: createImagePath("projects/projects-hero.webp"),
  servicesHero: createImagePath("services/services-hero.webp"),
  contactHero: createImagePath("contact/contact-hero.webp"),
  
  // Logo variations
  logo: createImagePath("logo.png"),
  
  // Placeholder
  placeholder: createImagePath("placeholder.webp"),
  
  // Gallery images
  luxury1: createImagePath("luxury_interior_1.png"),
  luxury2: createImagePath("luxury_interior_2.png"),
  luxury3: createImagePath("luxury_interior_3.png"),
  luxury4: createImagePath("luxury_interior_4.png"),
  luxury5: createImagePath("luxury_interior_5.png"),
  luxury6: createImagePath("luxury_interior_6.png"),
  villa1: createImagePath("luxury_villa_1.png"),
  villa2: createImagePath("luxury_villa_2.png")
};

/**
 * Initialize critical images for immediate loading
 */
export function initializeCriticalImages() {
  const criticalImages = [
    ImagePaths.logo,
    ImagePaths.homeHero,
    ImagePaths.aboutHero,
    ImagePaths.projectsHero,
    ImagePaths.contactHero
  ];
  
  preloadImages(criticalImages);
}