// cloudinary-utils.js - Cloudinary URL transformation utilities

/**
 * Generate Cloudinary URLs with consistent transformations
 */
class CloudinaryUtils {
  constructor(cloudName = 'dmawj7tmu') {
    this.cloudName = cloudName;
    this.baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  }

  /**
   * Generate a responsive image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} Cloudinary URL
   */
  getImageUrl(publicId, options = {}) {
    if (!publicId) return '';
    
    const {
      width = 'auto',
      height = 'auto', 
      crop = 'fill',
      gravity = 'auto',
      quality = 'auto:good',
      format = 'auto',
      dpr = 'auto',
      flags = [],
      effects = []
    } = options;

    const transformations = [];
    
    // Basic transformations
    if (width !== 'auto' || height !== 'auto') {
      transformations.push(`w_${width},h_${height}`);
    }
    
    if (crop !== 'fill') {
      transformations.push(`c_${crop}`);
    }
    
    if (gravity !== 'auto') {
      transformations.push(`g_${gravity}`);
    }
    
    // Quality and format
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    transformations.push(`dpr_${dpr}`);
    
    // Flags
    if (flags.length > 0) {
      transformations.push(`fl_${flags.join('.')}`);
    }
    
    // Effects
    if (effects.length > 0) {
      transformations.push(effects.join(','));
    }
    
    const transformString = transformations.join(',');
    return `${this.baseUrl}/${transformString}/${publicId}`;
  }

  /**
   * Get hero image URL (1920x1080)
   */
  getHeroUrl(publicId, options = {}) {
    return this.getImageUrl(publicId, {
      width: 1920,
      height: 1080,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'webp',
      ...options
    });
  }

  /**
   * Get thumbnail URL (800x600)
   */
  getThumbnailUrl(publicId, options = {}) {
    return this.getImageUrl(publicId, {
      width: 800,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'webp',
      ...options
    });
  }

  /**
   * Get gallery image URL (1600x1200)
   */
  getGalleryUrl(publicId, options = {}) {
    return this.getImageUrl(publicId, {
      width: 1600,
      height: 1200,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      format: 'webp',
      ...options
    });
  }

  /**
   * Get responsive image URL with srcset
   */
  getResponsiveUrls(publicId, baseOptions = {}) {
    const sizes = [400, 800, 1200, 1600, 1920];
    const srcset = sizes.map(size => {
      const url = this.getImageUrl(publicId, {
        width: size,
        ...baseOptions
      });
      return `${url} ${size}w`;
    }).join(', ');

    return {
      src: this.getImageUrl(publicId, { width: 800, ...baseOptions }),
      srcset
    };
  }

  /**
   * Get optimized video poster URL
   */
  getVideoPosterUrl(publicId, options = {}) {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/w_1600,h_900,c_fill,g_auto,q_auto:good,f_webp/${publicId}.webp`;
  }

  /**
   * Get optimized video URL
   */
  getVideoUrl(publicId, options = {}) {
    const {
      width = 1920,
      height = 1080,
      quality = 'auto',
      format = 'auto'
    } = options;

    return `https://res.cloudinary.com/${this.cloudName}/video/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
  }
}

// Create a global instance
window.cloudinary = new CloudinaryUtils();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudinaryUtils;
}