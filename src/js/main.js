// City Experts Website - Main JavaScript Module
import '../styles/main.css';
import { initializeComponents } from './components.js';
import { initializeLanguageToggle } from './language.js';
import { initNavigation } from './navigation.js';
import { initLanguageFromStorage, applyLanguage } from './i18n-dir.js';
import { initializeErrorHandling } from './error-handling.js';
import { initializePerformanceMonitoring } from './performance.js';
import { initializeStateManager } from './state-manager.js';
import { autoBindState } from './state-hooks.js';
import { loadHeroImage, loadLogo, initializeCriticalImages, ImagePaths } from './utils/image-loader.js';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize error handling and logging first
    const { logger, errorHandler } = initializeErrorHandling();
    
    // Initialize performance monitoring
    const performanceMonitor = initializePerformanceMonitoring({
      enableReporting: false, // Enable in production
      enableWebVitals: true,
      enableResourceTiming: true
    });
    
    // Initialize state management system
    const stateManager = initializeStateManager({
      enableLogging: true,
      enableValidation: true
    });
    
    // Log page load start
    logger.info('Page initialization started', {
      page: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
    
    const initStart = performance.now();
    
    // Initialize language/direction first
    const bootLang = initLanguageFromStorage();
    
    // Initialize critical images early for performance
    initializeCriticalImages();
    
    // Initialize hero images based on current page
    initializeHeroImages();
    
    // Update state with initial language
    stateManager.dispatch({
      type: 'SET_LANGUAGE',
      payload: bootLang
    });
    
    // Load translations for the boot language
    const { setLanguage } = await import('./language.js');
    await setLanguage(bootLang);
    
    initializeComponents();
    initializeLanguageToggle();
    
    // Auto-bind state to elements
    autoBindState();
    
    // Initialize new unified navigation with i18n support
    initNavigation({ 
      i18n: { setLocale: setLanguage } 
    });
    
    initializeFeaturedCarousel();
    
    const initEnd = performance.now();
    
    // Dispatch component load event for performance monitoring
    document.dispatchEvent(new CustomEvent('component:loaded', {
      detail: {
        component: 'main_app',
        loadTime: initEnd - initStart
      }
    }));
    
    // Update state to indicate app is ready
    stateManager.dispatch({
      type: 'SET_LOADING',
      payload: false
    });
    
    // Log successful initialization
    logger.info('Page initialization completed successfully', {
      loadTime: initEnd - initStart,
      componentsLoaded: true
    });
  } catch (error) {
    // Log initialization error
    const { logger } = initializeErrorHandling();
    logger.error('Page initialization failed', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    console.error('❌ City Experts Website initialization failed:', error);
    
    // Show user-friendly error message
    showInitializationError();
  }
});

// Show error message to users if initialization fails
function showInitializationError() {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc3545;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    ">
      ⚠️ Some features may not work properly. Please refresh the page or try again later.
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: 1px solid white;
        color: white;
        padding: 4px 8px;
        margin-left: 10px;
        cursor: pointer;
        border-radius: 4px;
      ">Dismiss</button>
    </div>
  `;
  document.body.appendChild(errorDiv);
}

// FEATURED CAROUSEL INIT
async function initializeFeaturedCarousel(){
  const root = document.getElementById("featured-carousel");
  if (!root) return;

  // Load featured projects first
  await loadFeaturedProjects(root);

  const track = root.querySelector("[data-carousel-track]");
  const slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dots = Array.from(root.querySelectorAll("[data-carousel-to]"));

  if (!track || slides.length === 0) return;

  let index = 0;

  function getDir() { 
    return document.documentElement.getAttribute('dir') || 'ltr'; 
  }

  function translateForIndex(viewport, index) {
    const w = viewport.clientWidth;
    const isRTL = getDir() === 'rtl';
    // Flip direction in RTL
    const offset = isRTL ? index * w : -index * w;
    return `translateX(${offset}px)`;
  }

  function go(i){
    index = (i + slides.length) % slides.length;
    const viewport = root.querySelector(".carousel-viewport");
    
    track.style.transform = translateForIndex(viewport, index);
    
    dots.forEach((d, n) => d.setAttribute("aria-current", n === index ? "true" : "false"));
  }

  // Recompute on resize so widths stay correct
  const ro = new ResizeObserver(() => go(index));
  ro.observe(root.querySelector(".carousel-viewport"));
  
  // Re-calculate on language change (RTL/LTR switch)
  window.addEventListener('i18n:dir-changed', () => go(index));
  document.addEventListener('i18n:updated', () => {
    setTimeout(() => go(index), 10);
  });

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  dots.forEach(d => d.addEventListener("click", () => go(Number(d.dataset.carouselTo || 0))));

  // Autoplay (optional)
  let timer = setInterval(() => go(index + 1), 5000);
  root.addEventListener("pointerenter", () => clearInterval(timer));
  root.addEventListener("pointerleave", () => timer = setInterval(() => go(index + 1), 5000));

  go(0);
}

// Handle smooth scrolling for anchor links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// ---------- PROJECTS FILTER PERSISTENCE ----------
const filterChips = document.querySelectorAll('.filter-chip');
if (filterChips.length > 0) {
  // Read filter from URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  const activeFilter = urlParams.get('sector') || 'all';
  
  // Apply active filter on load
  filterChips.forEach(chip => {
    const isActive = chip.dataset.filter === activeFilter;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', isActive.toString());
  });
  
  // Handle filter clicks
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      
      // Update URL without page reload
      const newUrl = new URL(window.location);
      if (filter === 'all') {
        newUrl.searchParams.delete('sector');
      } else {
        newUrl.searchParams.set('sector', filter);
      }
      window.history.pushState({}, '', newUrl);
      
      // Update chip states
      filterChips.forEach(c => {
        const isActive = c === chip;
        c.classList.toggle('active', isActive);
        c.setAttribute('aria-pressed', isActive.toString());
        
        // Add validation feedback for proper accessibility
        if (isActive) {
          c.setAttribute('aria-current', 'true');
        } else {
          c.removeAttribute('aria-current');
        }
      });
      
      // Trigger any existing filter functionality
      const filterEvent = new CustomEvent('filterChange', { 
        detail: { filter }
      });
      document.dispatchEvent(filterEvent);
    });
  });
}

// ---------- ACCESSIBILITY ENHANCEMENTS ----------
// Add aria-invalid support for form validation
document.addEventListener('input', (e) => {
  if (e.target.matches('.input')) {
    const isValid = e.target.checkValidity();
    e.target.setAttribute('aria-invalid', (!isValid).toString());
  }
});

// ---------- CONTACT FORM ----------
const form = document.getElementById("contactForm");
if (form) {
  const submitBtn = document.getElementById("submitBtn");
  const statusEl  = document.getElementById("formStatus");
  const phoneEl   = document.getElementById("phone");

  // UAE phone quick pattern: +971 5x xxx xxxx or +971 4 xxx xxxx etc.
  const uaePhoneRegex = /^\+971\s?(?:[2-9]\d|5[0-9])(?:\s?\d{3}){2,3}$/;

  const toggleBtn = () => {
    const isValid = form.checkValidity();
    submitBtn.disabled = !isValid;
    
    // Clear previous status when form becomes invalid
    if (!isValid && statusEl.textContent && !statusEl.textContent.includes('Sending')) {
      statusEl.textContent = '';
    }
  };

  // Real-time validation feedback
  const addValidationFeedback = (input, isValid, message = '') => {
    if (isValid) {
      input.classList.remove('input-error');
      input.removeAttribute('aria-invalid');
    } else {
      input.classList.add('input-error');
      input.setAttribute('aria-invalid', 'true');
    }
  };

  // Phone validation on input
  phoneEl.addEventListener('input', () => {
    const value = phoneEl.value.trim();
    if (value && !uaePhoneRegex.test(value)) {
      addValidationFeedback(phoneEl, false, 'Please enter a valid UAE phone');
    } else {
      addValidationFeedback(phoneEl, true);
    }
    toggleBtn();
  });

  // Email validation on input
  const emailEl = document.getElementById('email');
  emailEl.addEventListener('input', () => {
    const value = emailEl.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      addValidationFeedback(emailEl, false, 'Please enter a valid email');
    } else {
      addValidationFeedback(emailEl, true);
    }
    toggleBtn();
  });

  // Generic validation for required fields
  ['name', 'projectType', 'message'].forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field) {
      field.addEventListener('input', () => {
        const value = field.value.trim();
        addValidationFeedback(field, !field.required || value.length > 0);
        toggleBtn();
      });
    }
  });

  // Consent checkbox
  const consentEl = document.getElementById('consent');
  consentEl.addEventListener('change', toggleBtn);

  form.addEventListener("input", toggleBtn);
  form.addEventListener("change", toggleBtn);
  toggleBtn();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot check
    if (form.company_site && form.company_site.value) {
      return; // silently drop bots
    }

    // Final phone validation
    if (!uaePhoneRegex.test(phoneEl.value.trim())) {
      statusEl.textContent = "Please enter a valid UAE phone (e.g., +971 5x xxx xxxx).";
      phoneEl.focus();
      addValidationFeedback(phoneEl, false);
      return;
    }

    // Check consent
    if (!consentEl.checked) {
      statusEl.textContent = "Please accept the privacy policy to continue.";
      consentEl.focus();
      return;
    }

    submitBtn.disabled = true;
    statusEl.textContent = "Sending…";

    // Optional reCAPTCHA v3 (if site key set)
    let recaptchaToken = "";
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "submit" });
        document.getElementById("recaptchaToken").value = recaptchaToken;
      } catch (recaptchaError) {
        // Continue without reCAPTCHA if it fails
      }
    }

    // Build payload
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      statusEl.textContent = "Thanks! We'll reach out within 1 business day.";
      statusEl.style.color = "#0F8B8D"; // Success color
      form.reset();
      toggleBtn(); // Reset button state
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        statusEl.textContent = "";
        statusEl.style.color = "";
      }, 10000);
      
    } catch (err) {
      console.error('Contact form error:', err);
      statusEl.textContent = "Sorry—couldn't send right now. Try again or use WhatsApp.";
      statusEl.style.color = "#DC2626"; // Error color
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Featured Projects Loading
async function loadFeaturedProjects(carouselRoot) {
  try {
    // Load exactly 6 featured projects from API
    let projects = [];
    
    try {
      const response = await fetch('/api/projects?featured=true&status=published&limit=6&sort=order');
      if (response.ok) {
        const data = await response.json();
        projects = data.data || [];
      } else {
        throw new Error('API Error: ' + response.status);
      }
    } catch (apiError) {
      console.error('Failed to load featured projects:', apiError);
      const track = carouselRoot.querySelector("[data-carousel-track]");
      track.innerHTML = '<div class="w-full text-center py-12"><p class="text-deep-charcoal/60">No featured projects available.</p></div>';
      return;
    }
    
    const track = carouselRoot.querySelector("[data-carousel-track]");
    const currentLang = document.documentElement.lang || 'en';
    
    if (projects.length === 0) {
      track.innerHTML = '<div class="w-full text-center py-12"><p class="text-deep-charcoal/60">No featured projects available.</p></div>';
      return;
    }
    
    // Create 2 slides with 3 projects each (total 6 featured projects)
    const slidesHtml = [];
    for (let i = 0; i < 2; i++) {
      const slideProjects = projects.slice(i * 3, (i * 3) + 3);
      
      // Only render slides that have projects (no placeholders)
      if (slideProjects.length > 0) {
        const cardsHtml = slideProjects.map(project => createProjectCard(project, currentLang)).join('');
        
        slidesHtml.push(
          '<div class="carousel-slide w-full flex-shrink-0" data-carousel-slide>' +
          '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">' +
          cardsHtml +
          '</div>' +
          '</div>'
        );
      }
    }
    
    track.innerHTML = slidesHtml.join('');
    
    // Update indicators for multiple slides
    const indicators = carouselRoot.querySelector('.carousel-indicators');
    if (indicators) {
      const indicatorsHtml = slidesHtml.map((_, index) => 
        '<button data-carousel-to="' + index + '" aria-label="Go to slide ' + (index + 1) + '"' + (index === 0 ? ' aria-current="true"' : '') + '></button>'
      ).join('');
      indicators.innerHTML = indicatorsHtml;
    }
    
    // Show navigation controls for multiple slides
    const prevBtn = carouselRoot.querySelector('[data-carousel-prev]');
    const nextBtn = carouselRoot.querySelector('[data-carousel-next]');
    if (prevBtn) prevBtn.style.display = slidesHtml.length > 1 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = slidesHtml.length > 1 ? 'block' : 'none';
    
  } catch (error) {
    console.error('💥 Failed to load featured projects:', error);
    const track = carouselRoot.querySelector("[data-carousel-track]");
    track.innerHTML = '<div class="w-full text-center py-12"><p class="text-deep-charcoal/60">Failed to load projects.</p></div>';
  }
}

function createProjectCard(project, lang) {
  const content = project.i18n?.[lang] || project.i18n?.en || { title: project.id, excerpt: '' };

  const imageName = project.media?.heroWide?.url || project.media?.hero?.url || project.media?.thumb?.url || '';
  if (!imageName) {
    // Skip projects without images
    return '';
  }

  // Convert to local path - assume images are in public/assets/images/
  const imagePath = imageName.startsWith('/assets/') ? imageName : `/assets/images/${imageName}`;

  const altText = project.media?.heroWide?.alt?.[lang]
               || project.media?.hero?.alt?.[lang]
               || project.media?.thumb?.alt?.[lang]
               || content.title;

  return `
  <article class="project-card w-full relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div class="relative">
      <img src="${imagePath}"
           loading="lazy" decoding="async" alt="${altText}"
           width="1600" height="900"
           class="w-full h-96 md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700">
      <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-transparent to-transparent"></div>
    </div>
    <div class="absolute bottom-8 left-8 right-8 text-white">
      <div class="flex items-center space-x-4 mb-4">
        <span class="px-3 py-1 bg-oasis-teal rounded-full text-sm capitalize">${project.category || ''}</span>
        <span class="px-3 py-1 bg-brand-orange text-pure-white rounded-full text-sm">${project.city || ''}</span>
      </div>
      <h3 class="text-2xl md:text-3xl font-playfair font-medium mb-2">${content.title}</h3>
      <p class="text-white/90 mb-4 max-w-2xl">${content.excerpt || ''}</p>
      <a class="btn btn-secondary" href="/projects.html#${project.id}" aria-label="Learn more about ${content.title}">Learn More</a>
    </div>
  </article>`;
}

/**
 * Set hero image with direct asset reference and fallback
 * @param {string} selector - CSS selector for hero container
 * @param {string} fileName - Image filename relative to /assets/images/
 */
function setHeroImage(selector, fileName) {
  const el = document.querySelector(selector);
  if (!el) return;

  const img = document.createElement("img");
  img.src = `/assets/images/${fileName}`;
  img.alt = "Hero Image";
  img.className = "w-full h-[700px] object-cover";
  img.loading = "lazy";
  img.onerror = () => {
    img.src = "/assets/images/placeholder.webp";
  };

  // Clear container and add image
  el.innerHTML = '';
  el.appendChild(img);
}

/**
 * Initialize hero images based on current page
 */
function initializeHeroImages() {
  const currentPage = window.location.pathname;
  
  // Set hero images based on page
  if (currentPage === '/' || currentPage.includes('index')) {
    setHeroImage("#hero-image-container", "home/hero-dubai-skyline.webp");
    setHeroImage("[data-hero-image]", "home/hero-dubai-skyline.webp");
    setHeroImage("#hero-section img", "home/hero-dubai-skyline.webp");
  } else if (currentPage.includes('about')) {
    setHeroImage("#hero-image-container", "about/about-hero.webp");
    setHeroImage("[data-hero-image]", "about/about-hero.webp");
    setHeroImage("#hero-section img", "about/about-hero.webp");
  } else if (currentPage.includes('projects')) {
    setHeroImage("#hero-image-container", "projects/projects-hero.webp");
    setHeroImage("[data-hero-image]", "projects/projects-hero.webp");
    setHeroImage("#hero-section img", "projects/projects-hero.webp");
  } else if (currentPage.includes('services')) {
    setHeroImage("#hero-image-container", "services/services-hero.webp");
    setHeroImage("[data-hero-image]", "services/services-hero.webp");
    setHeroImage("#hero-section img", "services/services-hero.webp");
  } else if (currentPage.includes('contact')) {
    setHeroImage("#hero-image-container", "contact/contact-hero.webp");
    setHeroImage("[data-hero-image]", "contact/contact-hero.webp");
    setHeroImage("#hero-section img", "contact/contact-hero.webp");
  } else {
    // Default fallback
    setHeroImage("#hero-image-container", "home/hero-dubai-skyline.webp");
    setHeroImage("[data-hero-image]", "home/hero-dubai-skyline.webp");
    setHeroImage("#hero-section img", "home/hero-dubai-skyline.webp");
  }
  
  // Initialize logos
  initializeLogos();
}

/**
 * Initialize logo images across the page
 */
function initializeLogos() {
  const logoSelectors = [
    '#main-logo',
    '#mobile-logo', 
    '#footer-logo',
    '[data-logo]',
    'img[alt*="logo"]',
    'img[alt*="Logo"]'
  ];
  
  logoSelectors.forEach(selector => {
    const logos = document.querySelectorAll(selector);
    logos.forEach(logo => {
      const logoImg = loadLogo(logo.alt || "CityExperts Logo", logo.className);
      logo.src = logoImg.src;
      logo.onerror = () => {
        logo.src = ImagePaths.logo; // Direct fallback
      };
    });
  });
  
  console.log(`✅ Logos initialized across page`);
}