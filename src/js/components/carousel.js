// Carousel Component - Generic carousel with RTL support
export class Carousel {
  constructor(element, options = {}) {
    this.root = element;
    this.options = {
      autoplay: true,
      autoplayDelay: 5000,
      loop: true,
      swipeThreshold: 50,
      animationDuration: 300,
      pauseOnHover: true,
      ...options
    };
    
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.autoplayTimer = null;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    if (!this.root) return;
    
    // Find carousel elements
    this.track = this.root.querySelector('[data-carousel-track]');
    this.slides = Array.from(this.root.querySelectorAll('[data-carousel-slide]'));
    this.prevButton = this.root.querySelector('[data-carousel-prev]');
    this.nextButton = this.root.querySelector('[data-carousel-next]');
    this.dots = Array.from(this.root.querySelectorAll('[data-carousel-dot]'));
    
    if (!this.track || this.slides.length === 0) {
      return;
    }
    
    this.setupSlides();
    this.bindEvents();
    this.updateUI();
    
    if (this.options.autoplay) {
      this.startAutoplay();
    }
    
  }
  
  setupSlides() {
    // Set initial slide positions
    this.slides.forEach((slide, index) => {
      slide.style.position = 'absolute';
      slide.style.width = '100%';
      slide.style.height = '100%';
      slide.style.top = '0';
      slide.style.transition = `transform ${this.options.animationDuration}ms ease-in-out`;
      
      // Position slides
      const translateX = this.getDirection() === 'rtl' ? -100 * index : 100 * index;
      slide.style.transform = `translateX(${translateX}%)`;
    });
  }
  
  bindEvents() {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previous());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.next());
    }
    
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Touch/swipe support
    this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    
    // Mouse drag support
    this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.track.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.track.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    
    // Pause on hover
    if (this.options.pauseOnHover) {
      this.root.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.root.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Keyboard navigation
    this.root.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  getDirection() {
    return document.documentElement.getAttribute('dir') || 'ltr';
  }
  
  goToSlide(index, animate = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    const previousIndex = this.currentIndex;
    this.currentIndex = index;
    
    // Ensure index is within bounds
    if (this.currentIndex < 0) {
      this.currentIndex = this.options.loop ? this.slides.length - 1 : 0;
    } else if (this.currentIndex >= this.slides.length) {
      this.currentIndex = this.options.loop ? 0 : this.slides.length - 1;
    }
    
    if (animate) {
      this.animateToSlide(previousIndex, this.currentIndex);
    } else {
      this.setSlidePosition(this.currentIndex);
      this.isTransitioning = false;
    }
    
    this.updateUI();
    
    // Dispatch custom event
    this.root.dispatchEvent(new CustomEvent('carousel:change', {
      detail: { 
        currentIndex: this.currentIndex, 
        previousIndex, 
        slide: this.slides[this.currentIndex] 
      }
    }));
  }
  
  animateToSlide(fromIndex, toIndex) {
    const isRTL = this.getDirection() === 'rtl';
    const direction = toIndex > fromIndex ? 1 : -1;
    
    this.slides.forEach((slide, index) => {
      let translateX;
      
      if (index === toIndex) {
        translateX = 0;
      } else if (index === fromIndex) {
        translateX = isRTL ? direction * 100 : -direction * 100;
      } else {
        translateX = isRTL ? -100 * (index - toIndex) : 100 * (index - toIndex);
      }
      
      slide.style.transform = `translateX(${translateX}%)`;
    });
    
    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.options.animationDuration);
  }
  
  setSlidePosition(activeIndex) {
    const isRTL = this.getDirection() === 'rtl';
    
    this.slides.forEach((slide, index) => {
      const translateX = isRTL ? -100 * (index - activeIndex) : 100 * (index - activeIndex);
      slide.style.transform = `translateX(${translateX}%)`;
    });
  }
  
  next() {
    this.goToSlide(this.currentIndex + 1);
  }
  
  previous() {
    this.goToSlide(this.currentIndex - 1);
  }
  
  updateUI() {
    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
      dot.setAttribute('aria-pressed', index === this.currentIndex ? 'true' : 'false');
    });
    
    // Update buttons
    if (this.prevButton) {
      this.prevButton.disabled = !this.options.loop && this.currentIndex === 0;
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = !this.options.loop && this.currentIndex === this.slides.length - 1;
    }
    
    // Update ARIA attributes
    this.slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== this.currentIndex ? 'true' : 'false');
      if (index === this.currentIndex) {
        slide.setAttribute('tabindex', '0');
      } else {
        slide.removeAttribute('tabindex');
      }
    });
  }
  
  startAutoplay() {
    if (!this.options.autoplay || this.slides.length <= 1) return;
    
    this.pauseAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplayDelay);
  }
  
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  // Touch and mouse event handlers
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.pauseAutoplay();
  }
  
  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
  }
  
  handleTouchEnd(e) {
    if (!this.isDragging) return;
    
    const diffX = this.startX - this.currentX;
    const isRTL = this.getDirection() === 'rtl';
    
    if (Math.abs(diffX) > this.options.swipeThreshold) {
      if ((diffX > 0 && !isRTL) || (diffX < 0 && isRTL)) {
        this.next();
      } else {
        this.previous();
      }
    }
    
    this.isDragging = false;
    this.startAutoplay();
  }
  
  handleMouseDown(e) {
    e.preventDefault();
    this.startX = e.clientX;
    this.isDragging = true;
    this.pauseAutoplay();
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentX = e.clientX;
  }
  
  handleMouseUp(e) {
    if (!this.isDragging) return;
    
    const diffX = this.startX - this.currentX;
    const isRTL = this.getDirection() === 'rtl';
    
    if (Math.abs(diffX) > this.options.swipeThreshold) {
      if ((diffX > 0 && !isRTL) || (diffX < 0 && isRTL)) {
        this.next();
      } else {
        this.previous();
      }
    }
    
    this.isDragging = false;
    this.startAutoplay();
  }
  
  handleKeydown(e) {
    const isRTL = this.getDirection() === 'rtl';
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        isRTL ? this.next() : this.previous();
        break;
      case 'ArrowRight':
        e.preventDefault();
        isRTL ? this.previous() : this.next();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.slides.length - 1);
        break;
    }
  }
  
  handleResize() {
    // Recalculate positions on window resize
    this.setSlidePosition(this.currentIndex);
  }
  
  destroy() {
    this.pauseAutoplay();
    
    // Remove event listeners
    window.removeEventListener('resize', () => this.handleResize());
    
    // Clean up
    this.slides.forEach(slide => {
      slide.style.position = '';
      slide.style.width = '';
      slide.style.height = '';
      slide.style.top = '';
      slide.style.transform = '';
      slide.style.transition = '';
    });
  }
}

// Initialize all carousels on page
export function initializeCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');
  const instances = [];
  
  carousels.forEach(element => {
    const options = {
      autoplay: element.dataset.autoplay !== 'false',
      autoplayDelay: parseInt(element.dataset.autoplayDelay) || 5000,
      loop: element.dataset.loop !== 'false',
      swipeThreshold: parseInt(element.dataset.swipeThreshold) || 50
    };
    
    const carousel = new Carousel(element, options);
    instances.push(carousel);
    
    // Store instance on element
    element._carouselInstance = carousel;
  });
  
  return instances;
}