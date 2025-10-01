// Navigation functionality for City Experts website
export function initNavigation({ i18n }) {
  const header = document.getElementById('site-header');
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closers = drawer?.querySelectorAll('[data-close-drawer]');
  const langBtn = document.getElementById('lang-toggle');
  const mobileLangBtn = document.getElementById('mobile-lang-toggle');
  const mobileLangLabel = document.getElementById('mobile-lang-label');

  // Sticky on scroll
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('is-sticky');
    else header.classList.remove('is-sticky');
  };
  onScroll(); 
  window.addEventListener('scroll', onScroll, { passive: true });

  // Drawer
  const open = () => {
    if (!drawer) return;
    drawer.classList.remove('hidden');
    requestAnimationFrame(() => drawer.classList.remove('translate-x-full'));
    document.body.classList.add('no-scroll');
    btn?.setAttribute('aria-expanded', 'true');
  };
  
  const close = () => {
    if (!drawer) return;
    drawer.classList.add('translate-x-full');
    document.body.classList.remove('no-scroll');
    btn?.setAttribute('aria-expanded', 'false');
    setTimeout(() => drawer.classList.add('hidden'), 300);
  };
  
  btn?.addEventListener('click', open);
  closers?.forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape' && drawer && !drawer.classList.contains('hidden')) close(); 
  });

  // Close drawer when navigating
  drawer?.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (a) close();
  });

  // Active link state
  const markActive = () => {
    const path = location.pathname.replace(/\/index\.html$/, '/');
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
      const href = a.getAttribute('href');
      const match = (href === '/' && path === '/') || (href !== '/' && path.includes(href));
      a.classList.toggle('active', !!match);
      a.setAttribute('aria-current', match ? 'page' : 'false');
    });
  };
  markActive();

  // Language toggle (integrates with your i18n system)
  const toggleLang = () => {
    const current = document.documentElement.getAttribute('lang') || 'en';
    const next = current === 'en' ? 'ar' : 'en';
    
    // If i18n system is available, use it
    if (i18n && i18n.setLocale) {
      i18n.setLocale(next);
    }
    
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
    
    if (mobileLangLabel) {
      mobileLangLabel.textContent = next === 'ar' ? 'العربية' : 'English';
    }
  };
  
  langBtn?.addEventListener('click', toggleLang);
  mobileLangBtn?.addEventListener('click', toggleLang);

  // Update label on init
  const currentLang = document.documentElement.getAttribute('lang') || 'en';
  if (mobileLangLabel) {
    mobileLangLabel.textContent = currentLang === 'ar' ? 'العربية' : 'English';
  }

}

// Legacy initialization function for backwards compatibility
export function initializeNavigation() {
  return initNavigation({ i18n: null });
}