// Accessibility Enhancement Module
export class AccessibilityEnhancer {
  constructor() {
    this.init();
  }
  
  init() {
    
    this.enhanceNavigation();
    this.enhanceCarousels();
    this.enhanceForms();
    this.enhanceImages();
    this.addSkipLinks();
    this.enhanceKeyboardNavigation();
    this.setupFocusManagement();
    this.addLiveRegions();
    
  }
  
  enhanceNavigation() {
    // Enhance main navigation
    const nav = document.querySelector('#site-header nav, [role="navigation"]');
    if (nav) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Main navigation');
      
      // Enhance menu items
      const menuItems = nav.querySelectorAll('a');
      menuItems.forEach((item, index) => {
        if (!item.getAttribute('aria-label')) {
          item.setAttribute('aria-label', item.textContent.trim());
        }
      });
    }
    
    // Enhance mobile menu button
    const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
    if (mobileMenuButton) {
      mobileMenuButton.setAttribute('aria-label', 'Toggle navigation menu');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');
      
      // Update aria-expanded on click
      mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
      });
    }
    
    // Enhance breadcrumbs
    const breadcrumbs = document.querySelector('[data-breadcrumbs], .breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.setAttribute('role', 'navigation');
      breadcrumbs.setAttribute('aria-label', 'Breadcrumb navigation');
      
      const links = breadcrumbs.querySelectorAll('a');
      links.forEach((link, index) => {
        if (index === links.length - 1) {
          link.setAttribute('aria-current', 'page');
        }
      });
    }
    
  }
  
  enhanceCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
      // Add carousel role and label
      carousel.setAttribute('role', 'region');
      carousel.setAttribute('aria-roledescription', 'carousel');
      
      const carouselLabel = carousel.getAttribute('data-carousel-label') || 'Image carousel';
      carousel.setAttribute('aria-label', carouselLabel);
      
      // Enhance slides
      const slides = carousel.querySelectorAll('[data-carousel-slide]');
      slides.forEach((slide, index) => {
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
        slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      });
      
      // Enhance navigation buttons
      const prevButton = carousel.querySelector('[data-carousel-prev]');
      const nextButton = carousel.querySelector('[data-carousel-next]');
      
      if (prevButton) {
        prevButton.setAttribute('aria-label', 'Previous slide');
      }
      
      if (nextButton) {
        nextButton.setAttribute('aria-label', 'Next slide');
      }
      
      // Enhance dots/indicators
      const dots = carousel.querySelectorAll('[data-carousel-dot]');
      dots.forEach((dot, index) => {
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      });
      
      // Add live region for slide announcements
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = `carousel-${Math.random().toString(36).substr(2, 9)}-live`;
      carousel.appendChild(liveRegion);
      
      // Update live region on slide change
      carousel.addEventListener('carousel:change', (e) => {
        const { currentIndex } = e.detail;
        liveRegion.textContent = `Slide ${currentIndex + 1} of ${slides.length}`;
      });
    });
    
  }
  
  enhanceForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Enhance form labels
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const label = form.querySelector(`label[for="${input.id}"]`);
        
        if (!label && input.id) {
          // Create label if missing
          const newLabel = document.createElement('label');
          newLabel.setAttribute('for', input.id);
          newLabel.textContent = this.generateLabelText(input);
          input.parentNode.insertBefore(newLabel, input);
        }
        
        // Add required field indicators
        if (input.hasAttribute('required') && label) {
          if (!label.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.textContent = ' *';
            indicator.setAttribute('aria-label', 'required');
            label.appendChild(indicator);
          }
        }
        
        // Enhance error messaging
        this.enhanceFieldErrorMessaging(input);
      });
      
      // Add form description if missing
      if (!form.getAttribute('aria-describedby')) {
        const description = this.createFormDescription(form);
        if (description) {
          form.setAttribute('aria-describedby', description.id);
        }
      }
    });
    
  }
  
  enhanceImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add alt text if missing
      if (!img.hasAttribute('alt')) {
        if (img.hasAttribute('data-decorative') || img.closest('[data-decorative]')) {
          img.setAttribute('alt', '');
          img.setAttribute('role', 'presentation');
        } else {
          // Generate descriptive alt text
          const altText = this.generateAltText(img);
          img.setAttribute('alt', altText);
        }
      }
      
      // Handle loading states
      if (img.hasAttribute('data-lazy') || img.classList.contains('lazy')) {
        img.setAttribute('aria-busy', 'true');
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.setAttribute('aria-busy', 'false');
              observer.unobserve(entry.target);
            }
          });
        });
        
        observer.observe(img);
      }
    });
    
  }
  
  addSkipLinks() {
    // Check if skip links already exist
    if (document.querySelector('.skip-links')) return;
    
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#site-header" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;
    
    // Insert at the beginning of body
    document.body.insertBefore(skipLinks, document.body.firstChild);
    
    // Add CSS for skip links if not present
    if (!document.querySelector('#skip-links-styles')) {
      const styles = document.createElement('style');
      styles.id = 'skip-links-styles';
      styles.textContent = `
        .skip-links {
          position: absolute;
          top: -100px;
          left: 0;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          top: -100px;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 0 0 4px 0;
          transition: top 0.3s;
        }
        
        .skip-link:focus {
          top: 0;
        }
      `;
      document.head.appendChild(styles);
    }
    
  }
  
  enhanceKeyboardNavigation() {
    // Enhance focus indicators
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', (e) => {
        e.target.classList.add('keyboard-focus');
      });
      
      element.addEventListener('blur', (e) => {
        e.target.classList.remove('keyboard-focus');
      });
      
      element.addEventListener('mousedown', (e) => {
        e.target.classList.remove('keyboard-focus');
      });
    });
    
    // Add keyboard navigation for custom components
    this.addCustomKeyboardHandlers();
    
  }
  
  addCustomKeyboardHandlers() {
    // Dropdown menus
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('[data-dropdown-menu]');
      
      if (trigger && menu) {
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger.click();
          }
          
          if (e.key === 'ArrowDown' && menu.style.display !== 'none') {
            e.preventDefault();
            const firstItem = menu.querySelector('a, button');
            if (firstItem) firstItem.focus();
          }
        });
      }
    });
    
    // Tab groups
    const tabGroups = document.querySelectorAll('[role="tablist"]');
    tabGroups.forEach(tablist => {
      const tabs = tablist.querySelectorAll('[role="tab"]');
      let selectedIndex = 0;
      
      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              e.preventDefault();
              selectedIndex = index > 0 ? index - 1 : tabs.length - 1;
              tabs[selectedIndex].focus();
              tabs[selectedIndex].click();
              break;
              
            case 'ArrowRight':
            case 'ArrowDown':
              e.preventDefault();
              selectedIndex = index < tabs.length - 1 ? index + 1 : 0;
              tabs[selectedIndex].focus();
              tabs[selectedIndex].click();
              break;
              
            case 'Home':
              e.preventDefault();
              tabs[0].focus();
              tabs[0].click();
              break;
              
            case 'End':
              e.preventDefault();
              tabs[tabs.length - 1].focus();
              tabs[tabs.length - 1].click();
              break;
          }
        });
      });
    });
  }
  
  setupFocusManagement() {
    // Focus trap for modals
    document.addEventListener('modal:open', (e) => {
      const modal = e.detail.modal;
      this.trapFocus(modal);
    });
    
    // Focus restoration
    document.addEventListener('modal:close', (e) => {
      // Focus will be restored by the modal component
    });
    
  }
  
  addLiveRegions() {
    // Add global live regions if they don't exist
    if (!document.querySelector('#announcements')) {
      const announcements = document.createElement('div');
      announcements.id = 'announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.className = 'sr-only';
      document.body.appendChild(announcements);
    }
    
    if (!document.querySelector('#status')) {
      const status = document.createElement('div');
      status.id = 'status';
      status.setAttribute('aria-live', 'assertive');
      status.setAttribute('aria-atomic', 'true');
      status.className = 'sr-only';
      document.body.appendChild(status);
    }
    
  }
  
  // Utility methods
  generateLabelText(input) {
    const placeholder = input.getAttribute('placeholder');
    const name = input.getAttribute('name');
    const type = input.getAttribute('type');
    
    if (placeholder) return placeholder;
    if (name) return name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (type) return type.replace(/\b\w/g, l => l.toUpperCase());
    
    return 'Input field';
  }
  
  generateAltText(img) {
    const src = img.getAttribute('src') || '';
    const className = img.getAttribute('class') || '';
    
    // Extract meaningful info from filename or class
    const filename = src.split('/').pop().split('.')[0];
    const cleanName = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (className.includes('logo')) return 'Company logo';
    if (className.includes('hero')) return 'Hero image';
    if (filename.includes('project')) return 'Project image';
    
    return cleanName || 'Image';
  }
  
  enhanceFieldErrorMessaging(input) {
    const fieldId = input.id || input.name;
    if (!fieldId) return;
    
    // Create error container if it doesn't exist
    let errorContainer = document.querySelector(`#${fieldId}-error`);
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = `${fieldId}-error`;
      errorContainer.className = 'field-error';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.style.display = 'none';
      
      input.parentNode.appendChild(errorContainer);
    }
    
    // Update aria-describedby
    const existingDescribedBy = input.getAttribute('aria-describedby') || '';
    const errorId = `${fieldId}-error`;
    
    if (!existingDescribedBy.includes(errorId)) {
      const newDescribedBy = existingDescribedBy ? `${existingDescribedBy} ${errorId}` : errorId;
      input.setAttribute('aria-describedby', newDescribedBy);
    }
  }
  
  createFormDescription(form) {
    const formTitle = form.querySelector('h1, h2, h3, .form-title')?.textContent;
    if (!formTitle) return null;
    
    const description = document.createElement('p');
    description.id = `form-description-${Math.random().toString(36).substr(2, 9)}`;
    description.className = 'form-description sr-only';
    description.textContent = `Form: ${formTitle}`;
    
    form.insertBefore(description, form.firstChild);
    return description;
  }
  
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }
  
  // Public methods for announcing messages
  announce(message, priority = 'polite') {
    const liveRegion = document.querySelector(priority === 'assertive' ? '#status' : '#announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
}

// Initialize accessibility enhancements
export function initializeAccessibilityEnhancements() {
  const enhancer = new AccessibilityEnhancer();
  
  // Add screen reader only styles if not present
  if (!document.querySelector('#sr-only-styles')) {
    const styles = document.createElement('style');
    styles.id = 'sr-only-styles';
    styles.textContent = `
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .keyboard-focus {
        outline: 2px solid #0F8B8D !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(styles);
  }
  
  return enhancer;
}