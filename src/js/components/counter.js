// Counter Component - Animated statistics counters
export class Counter {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseInt(element.getAttribute('data-counter'));
    this.duration = parseInt(element.getAttribute('data-duration')) || options.duration || 2000;
    this.suffix = element.getAttribute('data-suffix') || options.suffix || '';
    this.prefix = element.getAttribute('data-prefix') || options.prefix || '';
    this.hasStarted = false;
    
    this.init();
  }
  
  init() {
    // Set up intersection observer for animation trigger
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasStarted) {
          this.animate();
          this.observer.unobserve(this.element);
        }
      });
    }, observerOptions);
    
    this.observer.observe(this.element);
  }
  
  animate() {
    this.hasStarted = true;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = this.target;
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = this.easeOutCubic(progress);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
      
      this.element.textContent = this.formatValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.element.textContent = this.formatValue(endValue);
        this.element.dispatchEvent(new CustomEvent('counter:complete', {
          detail: { value: endValue, element: this.element }
        }));
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  formatValue(value) {
    return `${this.prefix}${value.toLocaleString()}${this.suffix}`;
  }
  
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize all counters on page
export function initializeCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const instances = [];
  
  counters.forEach(element => {
    const counter = new Counter(element);
    instances.push(counter);
    
    // Store instance on element for later access
    element._counterInstance = counter;
  });
  
  return instances;
}

// Utility to manually trigger counter animation
export function triggerCounter(element) {
  if (element._counterInstance && !element._counterInstance.hasStarted) {
    element._counterInstance.animate();
  }
}

// Clean up all counter instances
export function destroyCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  counters.forEach(element => {
    if (element._counterInstance) {
      element._counterInstance.destroy();
      delete element._counterInstance;
    }
  });
}