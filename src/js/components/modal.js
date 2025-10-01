// Modal Component - Accessible modal dialogs
export class Modal {
  constructor(element, options = {}) {
    this.modal = element;
    this.options = {
      closeOnOverlay: true,
      closeOnEscape: true,
      autoFocus: true,
      restoreFocus: true,
      animationDuration: 300,
      ...options
    };
    
    this.isOpen = false;
    this.previouslyFocused = null;
    this.focusableElements = [];
    
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    // Find modal elements
    this.overlay = this.modal.querySelector('[data-modal-overlay]') || this.modal;
    this.content = this.modal.querySelector('[data-modal-content]');
    this.closeButtons = this.modal.querySelectorAll('[data-modal-close]');
    
    // Set initial state
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    
    // Hide modal initially
    this.hide(false);
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Close button clicks
    this.closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    });
    
    // Overlay click
    if (this.options.closeOnOverlay && this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
    
    // Escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
    
    // Trap focus within modal
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isOpen) {
        this.trapFocus(e);
      }
    });
  }
  
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.previouslyFocused = document.activeElement;
    
    // Show modal
    this.show();
    
    // Update ARIA
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    if (this.options.autoFocus) {
      this.setInitialFocus();
    }
    
    // Update focusable elements
    this.updateFocusableElements();
    
    // Dispatch event
    this.modal.dispatchEvent(new CustomEvent('modal:open', {
      detail: { modal: this.modal }
    }));
    
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // Hide modal
    this.hide();
    
    // Update ARIA
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Restore focus
    if (this.options.restoreFocus && this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
    
    // Dispatch event
    this.modal.dispatchEvent(new CustomEvent('modal:close', {
      detail: { modal: this.modal }
    }));
    
  }
  
  show(animate = true) {
    this.modal.style.display = 'flex';
    
    if (animate) {
      // Trigger reflow for animation
      this.modal.offsetHeight;
      this.modal.classList.add('modal-open');
    } else {
      this.modal.classList.add('modal-open');
    }
  }
  
  hide(animate = true) {
    if (animate) {
      this.modal.classList.remove('modal-open');
      
      // Wait for animation before hiding
      setTimeout(() => {
        if (!this.isOpen) {
          this.modal.style.display = 'none';
        }
      }, this.options.animationDuration);
    } else {
      this.modal.classList.remove('modal-open');
      this.modal.style.display = 'none';
    }
  }
  
  setInitialFocus() {
    // Try to focus first input, then first focusable element, then modal itself
    const firstInput = this.modal.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
    const firstFocusable = this.getFocusableElements()[0];
    
    if (firstInput) {
      firstInput.focus();
    } else if (firstFocusable) {
      firstFocusable.focus();
    } else {
      this.modal.focus();
    }
  }
  
  updateFocusableElements() {
    this.focusableElements = this.getFocusableElements();
  }
  
  getFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(this.modal.querySelectorAll(focusableSelectors))
      .filter(el => {
        return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.disabled;
      });
  }
  
  trapFocus(e) {
    if (this.focusableElements.length === 0) {
      e.preventDefault();
      return;
    }
    
    const firstFocusable = this.focusableElements[0];
    const lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  destroy() {
    // Close modal if open
    if (this.isOpen) {
      this.close();
    }
    
    // Clean up
    this.modal.style.display = '';
    this.modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

// Initialize modal system
export function initializeModalSystem() {
  const modals = document.querySelectorAll('[data-modal]');
  const triggers = document.querySelectorAll('[data-modal-trigger]');
  const instances = new Map();
  
  // Create modal instances
  modals.forEach(modal => {
    const modalId = modal.getAttribute('data-modal') || modal.id;
    if (modalId) {
      const instance = new Modal(modal);
      instances.set(modalId, instance);
      modal._modalInstance = instance;
    }
  });
  
  // Bind trigger events
  triggers.forEach(trigger => {
    const targetId = trigger.getAttribute('data-modal-trigger');
    const instance = instances.get(targetId);
    
    if (instance) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        instance.open();
      });
      
      // Set ARIA attributes
      trigger.setAttribute('aria-controls', targetId);
      trigger.setAttribute('aria-expanded', 'false');
      
      // Update aria-expanded when modal opens/closes
      const modal = instance.modal;
      modal.addEventListener('modal:open', () => {
        trigger.setAttribute('aria-expanded', 'true');
      });
      modal.addEventListener('modal:close', () => {
        trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });
  
  return instances;
}

// Utility functions
export function openModal(modalId) {
  const modal = document.querySelector(`[data-modal="${modalId}"], #${modalId}`);
  if (modal && modal._modalInstance) {
    modal._modalInstance.open();
  }
}

export function closeModal(modalId) {
  const modal = document.querySelector(`[data-modal="${modalId}"], #${modalId}`);
  if (modal && modal._modalInstance) {
    modal._modalInstance.close();
  }
}

export function closeAllModals() {
  const modals = document.querySelectorAll('[data-modal]');
  modals.forEach(modal => {
    if (modal._modalInstance && modal._modalInstance.isOpen) {
      modal._modalInstance.close();
    }
  });
}