// Lazy loading implementation for images and content
export function initializeLazyLoading() {
  initializeImageLazyLoading();
  initializeContentLazyLoading();
  
  console.log('📸 Lazy loading initialized');
}

// Lazy loading for images
export function initializeImageLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
  
  if (lazyImages.length === 0) return;
  
  // Check if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before image enters viewport
      threshold: 0.01
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(loadImage);
  }
}

function loadImage(img) {
  // Handle data-src attribute (manual lazy loading)
  if (img.hasAttribute('data-src')) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    
    // Create new image to preload
    const newImg = new Image();
    
    newImg.onload = () => {
      // Add fade-in effect
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      // Update src attributes
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }
      
      // Remove data attributes
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      
      // Fade in
      setTimeout(() => {
        img.style.opacity = '1';
      }, 50);
      
      // Add loaded class for styling
      img.classList.add('loaded');
    };
    
    newImg.onerror = () => {
      // Handle loading error
      img.classList.add('error');
      console.error('Failed to load image:', src);
    };
    
    // Start loading
    newImg.src = src;
    if (srcset) {
      newImg.srcset = srcset;
    }
  }
  
  // Handle native lazy loading
  if (img.loading === 'lazy') {
    img.classList.add('loaded');
  }
}

// Lazy loading for content sections
export function initializeContentLazyLoading() {
  const lazyContent = document.querySelectorAll('[data-lazy-content]');
  
  if (lazyContent.length === 0) return;
  
  const contentObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        loadContent(element);
        contentObserver.unobserve(element);
      }
    });
  }, {
    rootMargin: '100px 0px', // Start loading 100px before entering viewport
    threshold: 0.1
  });
  
  lazyContent.forEach(element => {
    contentObserver.observe(element);
  });
}

async function loadContent(element) {
  const contentUrl = element.getAttribute('data-lazy-content');
  const loadingText = element.getAttribute('data-loading-text') || 'Loading...';
  
  if (!contentUrl) return;
  
  // Show loading state
  element.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>${loadingText}</p>
    </div>
  `;
  
  try {
    const response = await fetch(contentUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
    
    // Fade out loading, fade in content
    const loadingElement = element.querySelector('.loading-content');
    if (loadingElement) {
      loadingElement.style.opacity = '0';
      
      setTimeout(() => {
        element.innerHTML = content;
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          element.style.opacity = '1';
        }, 50);
      }, 300);
    }
    
  } catch (error) {
    console.error('Failed to load content:', error);
    element.innerHTML = `
      <div class="error-content">
        <p>Failed to load content. Please try again later.</p>
      </div>
    `;
  }
}

// Preload critical images
export function preloadCriticalImages() {
  const criticalImages = document.querySelectorAll('img[data-critical]');
  
  criticalImages.forEach(img => {
    const src = img.getAttribute('data-src') || img.src;
    if (src) {
      const preloadImg = new Image();
      preloadImg.src = src;
    }
  });
}

// Load next/prev images for carousels
export function preloadCarouselImages(carousel, currentIndex = 0) {
  const slides = carousel.querySelectorAll('[data-carousel-slide]');
  const totalSlides = slides.length;
  
  // Preload current, next, and previous images
  const indicesToPreload = [
    currentIndex,
    (currentIndex + 1) % totalSlides,
    (currentIndex - 1 + totalSlides) % totalSlides
  ];
  
  indicesToPreload.forEach(index => {
    const slide = slides[index];
    const img = slide?.querySelector('img[data-src]');
    
    if (img) {
      loadImage(img);
    }
  });
}

// Responsive image loading based on viewport
export function loadResponsiveImages() {
  const responsiveImages = document.querySelectorAll('img[data-responsive]');
  
  responsiveImages.forEach(img => {
    const breakpoints = JSON.parse(img.getAttribute('data-responsive') || '{}');
    const viewportWidth = window.innerWidth;
    
    let selectedSrc = img.getAttribute('data-src');
    
    // Find appropriate image for current viewport
    Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(breakpoint => {
        if (viewportWidth >= breakpoint) {
          selectedSrc = breakpoints[breakpoint];
        }
      });
    
    if (selectedSrc && selectedSrc !== img.src) {
      img.setAttribute('data-src', selectedSrc);
      loadImage(img);
    }
  });
}

// Initialize responsive image loading on resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(loadResponsiveImages, 250);
});

// Image error handling
export function handleImageErrors() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.addEventListener('error', (e) => {
      const fallbackSrc = img.getAttribute('data-fallback');
      
      if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
      } else {
        // Create placeholder if no fallback
        img.style.display = 'none';
        
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
          <div class="placeholder-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <p>Image not available</p>
          </div>
        `;
        
        img.parentNode.insertBefore(placeholder, img.nextSibling);
      }
    });
  });
}

// Progressive image enhancement
export function enhanceImageQuality() {
  const enhanceableImages = document.querySelectorAll('img[data-enhance]');
  
  enhanceableImages.forEach(img => {
    if (img.complete) {
      const highQualitySrc = img.getAttribute('data-enhance');
      
      if (highQualitySrc) {
        const highQualityImg = new Image();
        
        highQualityImg.onload = () => {
          img.style.transition = 'opacity 0.5s ease';
          img.style.opacity = '0.5';
          
          setTimeout(() => {
            img.src = highQualitySrc;
            img.style.opacity = '1';
            img.removeAttribute('data-enhance');
          }, 250);
        };
        
        highQualityImg.src = highQualitySrc;
      }
    }
  });
}