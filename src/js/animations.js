// Animation and scroll effects for City Experts website
export function initializeAnimations() {
  initializeScrollAnimations();
  initializeParallaxEffects();
  initializeHoverEffects();
  
  console.log('✨ Animations initialized');
}

// Scroll-based animations using Intersection Observer
export function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (animatedElements.length === 0) return;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Still add the 'animated' class for elements that need it, but skip transitions
    animatedElements.forEach(element => {
      element.classList.add('animated');
    });
    return;
  }
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.getAttribute('data-animate');
        const delay = element.getAttribute('data-animate-delay') || '0';
        
        // Add delay if specified
        setTimeout(() => {
          element.classList.add('animated', `animate-${animationType}`);
        }, parseInt(delay));
        
        // Stop observing once animated
        observer.unobserve(element);
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// Parallax scrolling effects
export function initializeParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  if (parallaxElements.length === 0) return;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  let ticking = false;
  
  function updateParallax() {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
      const yPos = -(scrollTop * speed);
      const elementTop = element.getBoundingClientRect().top + scrollTop;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax if element is in viewport
      if (elementTop < scrollTop + windowHeight && elementTop + elementHeight > scrollTop) {
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    });
    
    ticking = false;
  }
  
  function requestParallaxUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  // Throttled scroll event
  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  
  // Initial update
  updateParallax();
}

// Hover and interaction effects
export function initializeHoverEffects() {
  // Card hover effects
  const hoverCards = document.querySelectorAll('.card-hover, [data-hover="lift"]');
  
  hoverCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 20px 40px rgba(17, 19, 21, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
  
  // Button hover effects
  const hoverButtons = document.querySelectorAll('[data-hover="button"]');
  
  hoverButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
  
  // Image hover effects
  const hoverImages = document.querySelectorAll('[data-hover="zoom"]');
  
  hoverImages.forEach(container => {
    const image = container.querySelector('img');
    if (!image) return;
    
    container.addEventListener('mouseenter', () => {
      image.style.transform = 'scale(1.1)';
    });
    
    container.addEventListener('mouseleave', () => {
      image.style.transform = '';
    });
  });
}

// Smooth scroll to element
export function smoothScrollTo(target, offset = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// Reveal elements on scroll with stagger effect
export function revealOnScroll(selector, staggerDelay = 100) {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * staggerDelay);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(element => {
    element.classList.add('reveal-element');
    observer.observe(element);
  });
}

// Text typing animation
export function typeWriter(element, text, speed = 50) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  
  if (!element) return;
  
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Number counting animation
export function animateNumber(element, start, end, duration = 2000, suffix = '') {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    
    element.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 16);
}

// Fade elements in sequence
export function fadeInSequence(selector, delay = 200) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * delay);
  });
}

// Loading animation
export function showLoading(element, text = 'Loading...') {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  
  if (!element) return;
  
  const loadingHTML = `
    <div class="loading-spinner" role="status" aria-label="${text}">
      <div class="spinner"></div>
      <span class="loading-text">${text}</span>
    </div>
  `;
  
  element.innerHTML = loadingHTML;
}

// Hide loading animation
export function hideLoading(element, content = '') {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  
  if (!element) return;
  
  const spinner = element.querySelector('.loading-spinner');
  if (spinner) {
    spinner.style.opacity = '0';
    setTimeout(() => {
      element.innerHTML = content;
    }, 300);
  }
}

// Pulse animation for call-to-action elements
export function addPulseAnimation(selector) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.classList.add('animate-pulse-soft');
    
    // Remove animation after interaction
    element.addEventListener('click', () => {
      element.classList.remove('animate-pulse-soft');
    });
  });
}

// Create floating animation for hero elements  
export function addFloatingAnimation(selector) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.5}s`;
    element.classList.add('animate-float');
  });
}