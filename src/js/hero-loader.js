/**
 * Hero Image Loader with Smooth Fade-in Transitions
 * Optimized for Core Web Vitals and perfect user experience
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log('🎬 Hero loader initialized');
  
  // Define hero mappings for each page
  const heroes = [
    { 
      id: "hero-home", 
      file: "/assets/images/home/hero-dubai-skyline.webp",
      alt: "Dubai skyline at dusk showcasing modern architecture"
    },
    { 
      id: "hero-about", 
      file: "/assets/images/about/about-hero.webp",
      alt: "City Experts team and company story"
    },
    { 
      id: "hero-ourstory", 
      file: "/assets/images/about/city-expert-office.webp",
      alt: "City Experts office and workplace culture"
    },
    { 
      id: "hero-projects", 
      file: "/assets/images/projects/projects-hero.webp",
      alt: "Showcase of City Experts construction and design projects"
    },
    { 
      id: "hero-services", 
      file: "/assets/images/services/services-hero.webp",
      alt: "City Experts comprehensive construction and design services"
    },
    { 
      id: "hero-contact", 
      file: "/assets/images/contact/contact-hero.webp",
      alt: "Get in touch with City Experts team"
    }
  ];

  // Enhanced image loading with intersection observer for performance
  const loadHeroImage = (hero) => {
    const container = document.getElementById(hero.id);
    if (!container) return;

    console.log(`🖼️ Loading hero: ${hero.id}`);

    // Create optimized image element
    const img = new Image();
    img.src = hero.file;
    img.alt = hero.alt;
    img.loading = "eager"; // Heroes are critical, load immediately
    img.className = "hero-image absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-1000 ease-out";
    img.decoding = "async";

    // Add responsive srcset for different screen sizes
    img.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px";

    // Success handler with smooth fade-in
    img.onload = () => {
      console.log(`✅ Hero loaded: ${hero.id}`);
      
      // Replace placeholder with image
      container.innerHTML = "";
      container.appendChild(img);
      
      // Trigger fade-in animation on next frame
      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      // Add loaded class for additional styling hooks
      container.classList.add('hero-loaded');
    };

    // Error handler with graceful fallback
    img.onerror = () => {
      console.error(`❌ Failed to load ${hero.file}`);
      
      // Show elegant error state
      container.innerHTML = `
        <div class="hero-fallback bg-gradient-to-br from-gray-200 to-gray-300 w-full h-[700px] flex items-center justify-center">
          <div class="text-center text-gray-600">
            <div class="text-4xl mb-4">🏗️</div>
            <p class="text-lg font-medium">Image Loading...</p>
            <p class="text-sm opacity-75">Please check your connection</p>
          </div>
        </div>
      `;
      
      container.classList.add('hero-error');
    };

    // Start loading
    img.decode().then(() => {
      // Image is ready to display
    }).catch(() => {
      console.warn(`⚠️ Decode failed for ${hero.file}, falling back to standard load`);
    });
  };

  // Initialize Intersection Observer for performance
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const heroId = entry.target.id;
        const hero = heroes.find(h => h.id === heroId);
        
        if (hero) {
          loadHeroImage(hero);
          heroObserver.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  // Find and observe hero containers
  heroes.forEach(hero => {
    const container = document.getElementById(hero.id);
    if (container) {
      console.log(`👁️ Observing hero container: ${hero.id}`);
      
      // Add loading placeholder if not already present
      if (!container.querySelector('.hero-placeholder') && !container.querySelector('.hero-image')) {
        container.innerHTML = `
          <div class="hero-placeholder bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 absolute inset-0 w-full h-full animate-pulse overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div class="absolute bottom-8 left-8 text-white/80">
              <div class="w-32 h-6 bg-white/30 rounded mb-2 animate-pulse"></div>
              <div class="w-48 h-4 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        `;
      }
      
      // For services page, load immediately
      const currentPage = window.location.pathname;
      if (currentPage.includes('services') && hero.id === 'hero-services') {
        console.log('🚀 Loading services hero immediately');
        loadHeroImage(hero);
      } else {
        heroObserver.observe(container);
      }
    } else {
      console.log(`❌ Hero container not found: ${hero.id}`);
    }
  });

  // Preload critical hero images for instant display
  const preloadCriticalHeroes = () => {
    const currentPage = window.location.pathname;
    console.log(`🔍 Current page: ${currentPage}`);
    let criticalHero = null;

    if (currentPage === '/' || currentPage.includes('index')) {
      criticalHero = heroes.find(h => h.id === 'hero-home');
    } else if (currentPage.includes('about')) {
      criticalHero = heroes.find(h => h.id === 'hero-about');
    } else if (currentPage.includes('projects')) {
      criticalHero = heroes.find(h => h.id === 'hero-projects');
    } else if (currentPage.includes('services')) {
      criticalHero = heroes.find(h => h.id === 'hero-services');
    } else if (currentPage.includes('contact')) {
      criticalHero = heroes.find(h => h.id === 'hero-contact');
    }

    if (criticalHero) {
      console.log(`🚀 Preloading critical hero: ${criticalHero.id}`);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = criticalHero.file;
      document.head.appendChild(link);
    } else {
      console.log(`❌ No critical hero found for page: ${currentPage}`);
    }
  };

  // Initialize preloading
  preloadCriticalHeroes();

  console.log('🎬 Hero loader ready');
});

// Export for module use if needed
window.HeroLoader = {
  init: () => {
    console.log('🔄 Hero loader manually initialized');
  }
};