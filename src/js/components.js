// Interactive components for City Experts website
export function initializeComponents() {
  initializeCounters();
  initializeCarousels();
  initializeTestimonialsCarousel(); // Specialized testimonials carousel
  initializeModalSystem();
  initializeForms();
  initializeFilterSystem();
  initializei18nUpdates();
  
  console.log('🎛️ Components initialized');
}

// Listen for i18n updates to re-translate dynamic content
function initializei18nUpdates() {
  document.addEventListener('i18n:updated', (event) => {
    // Import translation functions dynamically to avoid circular dependencies
    import('./language.js').then(({ applyTranslations }) => {
      // Re-translate any dynamically created content
      applyTranslations(document);
    });
  });
}

// Animated counter for statistics
export function initializeCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  if (counters.length === 0) return;
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-counter'));
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        
        animateCounter(counter, target, duration, prefix, suffix);
        observer.unobserve(counter);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, duration, prefix, suffix) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    
    element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
  }, 16);
}

// Carousel/Slider functionality
export function initializeCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');
  
  carousels.forEach(carousel => {
    const slides = carousel.querySelector('[data-carousel-slides]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const indicators = carousel.querySelectorAll('[data-carousel-indicator]');
    
    if (!slides) return;
    
    const slideElements = slides.children;
    const totalSlides = slideElements.length;
    let currentSlide = 0;
    let autoPlayInterval;
    
    // Configuration
    const autoPlay = carousel.getAttribute('data-autoplay') === 'true';
    const autoPlayDelay = parseInt(carousel.getAttribute('data-autoplay-delay')) || 5000;
    const loop = carousel.getAttribute('data-loop') !== 'false';
    
    // Update carousel position
    function updateCarousel() {
      // RTL-aware translation
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      const translateX = currentSlide * 100;
      slides.style.transform = `translateX(${isRTL ? translateX : -translateX}%)`;
      
      // Update indicators
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
        indicator.setAttribute('aria-selected', index === currentSlide);
      });
      
      // Update navigation buttons
      if (prevBtn) {
        prevBtn.disabled = !loop && currentSlide === 0;
      }
      if (nextBtn) {
        nextBtn.disabled = !loop && currentSlide === totalSlides - 1;
      }
      
      // Announce slide change for screen readers
      const slideContent = slideElements[currentSlide];
      const slideAnnouncement = slideContent.getAttribute('aria-label') || 
                               `Slide ${currentSlide + 1} of ${totalSlides}`;
      
      // Create temporary announcement element
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = slideAnnouncement;
      
      carousel.appendChild(announcement);
      setTimeout(() => carousel.removeChild(announcement), 1000);
    }
    
    // Next slide
    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
      } else if (loop) {
        currentSlide = 0;
      }
      updateCarousel();
    }
    
    // Previous slide
    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
      } else if (loop) {
        currentSlide = totalSlides - 1;
      }
      updateCarousel();
    }
    
    // Go to specific slide
    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
      updateCarousel();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
      if (autoPlay) {
        autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
      }
    }
    
    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }
    
    // Event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
      });
    }
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goToSlide(index);
        stopAutoPlay();
      });
    });
    
    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          stopAutoPlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          stopAutoPlay();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          stopAutoPlay();
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          stopAutoPlay();
          break;
      }
    });
    
    // Pause auto-play on hover/focus
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('focusin', stopAutoPlay);
    carousel.addEventListener('focusout', startAutoPlay);
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide(); // Swipe left - next slide
        } else {
          prevSlide(); // Swipe right - previous slide
        }
        stopAutoPlay();
      }
    }
    
    // Re-calculate on language change (RTL/LTR switch)
    window.addEventListener('i18n:dir-changed', () => updateCarousel());
    document.addEventListener('i18n:updated', () => {
      // Small delay to ensure DOM dir attribute is updated
      setTimeout(() => updateCarousel(), 10);
    });

    // Initialize
    updateCarousel();
    startAutoPlay();
  });
}

// Modal system for project details, images, etc.
export function initializeModalSystem() {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const modals = document.querySelectorAll('[data-modal]');
  const modalCloses = document.querySelectorAll('[data-modal-close]');
  
  let currentModal = null;
  let previousFocus = null;
  
  // Open modal
  function openModal(modalId) {
    const modal = document.querySelector(`[data-modal="${modalId}"]`);
    if (!modal) return;
    
    previousFocus = document.activeElement;
    currentModal = modal;
    
    modal.classList.add('modal-active');
    document.body.classList.add('modal-open');
    
    // Focus first focusable element in modal
    const focusableElements = modal.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Trap focus within modal
    modal.addEventListener('keydown', trapFocus);
  }
  
  // Close modal
  function closeModal() {
    if (!currentModal) return;
    
    currentModal.classList.remove('modal-active');
    document.body.classList.remove('modal-open');
    
    currentModal.removeEventListener('keydown', trapFocus);
    
    // Return focus to trigger element
    if (previousFocus) {
      previousFocus.focus();
    }
    
    currentModal = null;
    previousFocus = null;
  }
  
  // Focus trapping
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    
    const focusableElements = currentModal.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
  
  // Event listeners
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-trigger');
      openModal(modalId);
    });
  });
  
  modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModal);
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
      closeModal();
    }
  });
  
  // Close on backdrop click
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  });
}

// Form validation and handling
export function initializeForms() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Real-time validation
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });
      
      if (isValid) {
        handleFormSubmission(form);
      } else {
        // Focus first invalid field
        const firstInvalid = form.querySelector('.field-error input, .field-error textarea, .field-error select');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldContainer = field.closest('.field-group') || field.parentElement;
  const errorElement = fieldContainer.querySelector('.form-error');
  
  let isValid = true;
  let errorMessage = '';
  
  // Required validation
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Phone validation (UAE format)
  if (field.type === 'tel' && value) {
    const phoneRegex = /^(\+971|00971|971)?[0-9]{8,9}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
      isValid = false;
      errorMessage = 'Please enter a valid UAE phone number';
    }
  }
  
  // Update UI
  if (isValid) {
    fieldContainer.classList.remove('field-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  } else {
    fieldContainer.classList.add('field-error');
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }
  }
  
  return isValid;
}

function clearFieldError(field) {
  const fieldContainer = field.closest('.field-group') || field.parentElement;
  const errorElement = fieldContainer.querySelector('.form-error');
  
  fieldContainer.classList.remove('field-error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

async function handleFormSubmission(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  try {
    // Simulate form submission (replace with actual endpoint)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    showFormSuccess(form);
    form.reset();
    
  } catch (error) {
    console.error('Form submission error:', error);
    showFormError(form, 'An error occurred. Please try again.');
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function showFormSuccess(form) {
  const successElement = form.querySelector('.form-success') || 
                         createMessageElement('form-success', 'Thank you! We\'ll be in touch soon.');
  successElement.style.display = 'block';
  setTimeout(() => {
    successElement.style.display = 'none';
  }, 5000);
}

function showFormError(form, message) {
  const errorElement = form.querySelector('.form-error-general') || 
                       createMessageElement('form-error-general', message);
  errorElement.style.display = 'block';
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function createMessageElement(className, message) {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = message;
  element.style.display = 'none';
  return element;
}

// Filter system for projects
export function initializeFilterSystem() {
  const filterContainers = document.querySelectorAll('[data-filter-container]');
  
  filterContainers.forEach(container => {
    const filterButtons = container.querySelectorAll('[data-filter]');
    const filterableItems = container.querySelectorAll('[data-filterable]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filterValue = button.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter items
        filterableItems.forEach(item => {
          const itemCategories = item.getAttribute('data-filterable').split(' ');
          
          if (filterValue === 'all' || itemCategories.includes(filterValue)) {
            item.style.display = 'block';
            item.classList.add('fade-in');
          } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
          }
        });
      });
    });
  });
}

// Specialized testimonials carousel with viewport-based calculations
export function initializeTestimonialsCarousel() {
  const root = document.querySelector('#testimonials [data-carousel]');
  if (!root) return;

  const viewport = root.querySelector('.tc-viewport');
  const track = root.querySelector('[data-carousel-track]');
  const slides = [...root.querySelectorAll('.testimonial-slide')];
  const dots = [...root.querySelectorAll('[data-carousel-indicator]')];
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');

  let i = 0;
  
  function width() { 
    return Math.round(viewport.getBoundingClientRect().width); 
  }
  
  function getDir() { 
    return document.documentElement.getAttribute('dir') || 'ltr'; 
  }

  function translateForIndex(viewport, index) {
    const w = viewport.getBoundingClientRect().width;
    const isRTL = getDir() === 'rtl';
    // Flip direction in RTL
    const offset = isRTL ? index * w : -index * w;
    return `translateX(${offset}px)`;
  }

  function go(n) {
    i = (n + slides.length) % slides.length;
    
    track.style.transform = translateForIndex(viewport, i);
    
    dots.forEach((d, k) => {
      d.setAttribute('aria-current', k === i ? 'true' : 'false');
      d.classList.toggle('bg-oasis-teal', k === i);
      d.classList.toggle('bg-warm-stone', k !== i);
    });
  }

  // Event listeners
  prev?.addEventListener('click', () => go(i - 1));
  next?.addEventListener('click', () => go(i + 1));
  
  // Dots navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => go(index));
  });

  // Recompute on resize and language change so the transform stays perfect
  new ResizeObserver(() => go(i)).observe(viewport);
  
  // Re-calculate on language change (RTL/LTR switch)
  window.addEventListener('i18n:dir-changed', () => go(i));
  document.addEventListener('i18n:updated', () => {
    // Small delay to ensure DOM dir attribute is updated
    setTimeout(() => go(i), 10);
  });

  // Auto-play functionality
  const autoPlay = root.getAttribute('data-autoplay') === 'true';
  const autoPlayDelay = parseInt(root.getAttribute('data-autoplay-delay')) || 6000;
  
  let autoPlayInterval;
  
  function startAutoPlay() {
    if (autoPlay) {
      autoPlayInterval = setInterval(() => go(i + 1), autoPlayDelay);
    }
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }
  
  // Stop autoplay on user interaction
  prev?.addEventListener('click', stopAutoPlay);
  next?.addEventListener('click', stopAutoPlay);
  dots.forEach(dot => dot.addEventListener('click', stopAutoPlay));

  // Initialize
  go(0);
  startAutoPlay();
}