// Component Index - Centralized component initialization
import { initializeCounters } from './counter.js';
import { initializeCarousels } from './carousel.js';
import { initializeModalSystem } from './modal.js';
import { initializeForms } from './form.js';
import { initializeAccessibilityEnhancements } from '../accessibility.js';

// Initialize all components
export function initializeComponents() {
  const startTime = performance.now();
  
  try {
    // Initialize core components
    const counters = initializeCounters();
    const carousels = initializeCarousels();
    const modals = initializeModalSystem();
    const forms = initializeForms();
    
    // Initialize accessibility enhancements
    const accessibility = initializeAccessibilityEnhancements();
    
    // Initialize legacy components (will be refactored later)
    initializeTestimonialsCarousel();
    initializeFilterSystem();
    initializei18nUpdates();
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    
    return {
      counters,
      carousels,
      modals,
      forms,
      accessibility
    };
  } catch (error) {
    console.error('❌ Component initialization failed:', error);
    throw error;
  }
}

// Legacy functions (to be refactored)
function initializeTestimonialsCarousel() {
  // Placeholder for existing testimonials carousel
}

function initializeFilterSystem() {
  // Placeholder for existing filter system
}

function initializei18nUpdates() {
  // Listen for i18n updates to re-translate dynamic content
  document.addEventListener('i18n:updated', (event) => {
    // Import translation functions dynamically to avoid circular dependencies
    import('../language.js').then(({ applyTranslations }) => {
      // Re-translate any dynamically created content
      applyTranslations(document);
    });
  });
  
}

// Cleanup function for page unload
export function destroyComponents() {
  // Destroy counter instances
  const counters = document.querySelectorAll('[data-counter]');
  counters.forEach(element => {
    if (element._counterInstance) {
      element._counterInstance.destroy();
      delete element._counterInstance;
    }
  });
  
  // Destroy carousel instances
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(element => {
    if (element._carouselInstance) {
      element._carouselInstance.destroy();
      delete element._carouselInstance;
    }
  });
  
  // Destroy modal instances
  const modals = document.querySelectorAll('[data-modal]');
  modals.forEach(element => {
    if (element._modalInstance) {
      element._modalInstance.destroy();
      delete element._modalInstance;
    }
  });
  
  // Destroy form instances
  const forms = document.querySelectorAll('form[data-enhanced]');
  forms.forEach(element => {
    if (element._formInstance) {
      element._formInstance.destroy();
      delete element._formInstance;
    }
  });
  
}

// Add cleanup on page unload
window.addEventListener('beforeunload', destroyComponents);