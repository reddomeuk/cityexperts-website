// Navigation functionality for City Experts website
export function initializeNavigation() {
  const nav = document.querySelector('#main-nav');
  const mobileMenuBtn = document.querySelector('#mobile-menu-btn');
  const mobileMenu = document.querySelector('#mobile-menu');
  const mobileMenuClose = document.querySelector('#mobile-menu-close');
  
  if (!nav) return;
  
  // Sticky navigation on scroll
  let lastScrollY = window.scrollY;
  let navHeight = nav.offsetHeight;
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Add/remove background on scroll
    if (currentScrollY > 100) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    
    // Hide/show navigation based on scroll direction
    if (currentScrollY > navHeight && currentScrollY > lastScrollY) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    
    lastScrollY = currentScrollY;
  }
  
  // Throttled scroll handler
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleScroll, 10);
  });
  
  // Mobile menu functionality
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      // Remove translate-x-full to show menu
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      document.body.classList.add('menu-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      
      // Focus first menu item for accessibility
      const firstMenuItem = mobileMenu.querySelector('a');
      if (firstMenuItem) {
        firstMenuItem.focus();
      }
    });
  }
  
  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', () => {
      // Add translate-x-full to hide menu
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.classList.remove('translate-x-0');
      document.body.classList.remove('menu-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      
      // Return focus to menu button
      if (mobileMenuBtn) {
        mobileMenuBtn.focus();
      }
    });
  }
  
  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.classList.remove('translate-x-0');
      document.body.classList.remove('menu-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      if (mobileMenuBtn) {
        mobileMenuBtn.focus();
      }
    }
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
        mobileMenu.classList.add('translate-x-full');
        mobileMenu.classList.remove('translate-x-0');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
  
  // Active nav item highlighting
  function updateActiveNavItem() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], .mobile-nav-link[href^="#"]');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 50;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
  
  // Update active nav item on scroll
  window.addEventListener('scroll', updateActiveNavItem);
  updateActiveNavItem(); // Initial call
  
  console.log('✅ Navigation initialized');
}

// Dropdown functionality for services menu
export function initializeDropdowns() {
  const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
  
  dropdownTriggers.forEach(trigger => {
    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
    const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
    
    if (!dropdown) return;
    
    let showTimeout, hideTimeout;
    
    // Show dropdown on hover/focus
    const showDropdown = () => {
      clearTimeout(hideTimeout);
      showTimeout = setTimeout(() => {
        dropdown.classList.add('dropdown-visible');
        trigger.setAttribute('aria-expanded', 'true');
      }, 100);
    };
    
    // Hide dropdown with delay
    const hideDropdown = () => {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        dropdown.classList.remove('dropdown-visible');
        trigger.setAttribute('aria-expanded', 'false');
      }, 200);
    };
    
    // Mouse events
    trigger.addEventListener('mouseenter', showDropdown);
    trigger.addEventListener('mouseleave', hideDropdown);
    dropdown.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    dropdown.addEventListener('mouseleave', hideDropdown);
    
    // Keyboard events
    trigger.addEventListener('focus', showDropdown);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideDropdown();
        trigger.focus();
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        hideDropdown();
      }
    });
  });
}