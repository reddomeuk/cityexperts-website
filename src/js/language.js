// Comprehensive internationalization system
const I18N = {
  lang: 'en',
  dict: { en: null, ar: null },
  
  async load(lang) {
    if (!this.dict[lang]) {
      try {
        const res = await fetch(`/locales/${lang}.json`);
        this.dict[lang] = await res.json();
      } catch (error) {
        console.error(`Failed to load locale ${lang}:`, error);
        // Fallback to English if loading fails
        if (lang !== 'en') {
          await this.load('en');
        }
        return;
      }
    }
    this.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  },
  
  t(path) {
    const obj = this.dict[this.lang] || {};
    return path.split('.').reduce((a, k) => (a && a[k] != null ? a[k] : null), obj);
  }
};

function applyTranslations(root = document) {
  // Translate text content
  root.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    const val = I18N.t(key);
    if (val != null) el.textContent = val;
  });
  
  // Translate attributes (comma-separated list: attr:key)
  root.querySelectorAll('[data-translate-attr]').forEach(el => {
    const pairs = el.getAttribute('data-translate-attr').split(',').map(s => s.trim());
    pairs.forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      const val = I18N.t(key);
      if (val != null) el.setAttribute(attr, val);
    });
  });
}

// Set language and apply translations
async function setLanguage(lang) {
  await I18N.load(lang);
  
  // Apply HTML lang and dir attributes
  const isRTL = lang === 'ar';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  
  applyTranslations(document);
  // Notify components that render dynamically
  document.dispatchEvent(new CustomEvent('i18n:updated', { detail: { lang } }));
  
  // Re-translate carousel sections specifically
  const featuredCarousel = document.querySelector('#featured-carousel');
  const testimonialsCarousel = document.querySelector('#testimonials');
  if (featuredCarousel) applyTranslations(featuredCarousel);
  if (testimonialsCarousel) applyTranslations(testimonialsCarousel);
}

// Language toggle functionality for bilingual support
export function initializeLanguageToggle() {
  const languageToggle = document.querySelector('#language-toggle');
  const currentLangDisplay = document.querySelector('#current-language');
  const langEnBtn = document.querySelector('#lang-en');
  const langArBtn = document.querySelector('#lang-ar');
  const mobileLanguageToggle = document.querySelector('#mobile-language-toggle');
  const mobileCurrentLang = document.querySelector('#mobile-current-language');
  
  // Check if any language toggle exists
  if (!languageToggle && !langEnBtn && !langArBtn && !mobileLanguageToggle) return;
  
  // Get current language from localStorage or default to 'en'
  let currentLanguage = localStorage.getItem('preferred-language') || 'en';
  
  // Update display language
  function updateLanguageDisplay() {
    if (currentLangDisplay) {
      currentLangDisplay.textContent = currentLanguage.toUpperCase();
    }
    if (mobileCurrentLang) {
      mobileCurrentLang.textContent = currentLanguage.toUpperCase();
    }
  }
  
  // Apply language and update storage
  async function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferred-language', lang);
    localStorage.setItem('lang', lang); // Also set for RTL system
    await setLanguage(lang);
    updateLanguageDisplay();
    
    // Trigger RTL system update
    window.dispatchEvent(new CustomEvent('i18n:dir-changed', { detail: { lang, isRTL: lang === 'ar' }}));
  }
  
  // Initialize with current language
  (async () => {
    await applyLanguage(currentLanguage);
    // Initialize RTL state for existing system compatibility
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLanguage);
  })();
  
  // Desktop language toggle (index.html)
  if (languageToggle) {
    languageToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
      await applyLanguage(newLanguage);
    });
  }
  
  // Individual language buttons (about.html, projects.html)
  if (langEnBtn) {
    langEnBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await applyLanguage('en');
    });
  }
  
  if (langArBtn) {
    langArBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await applyLanguage('ar');
    });
  }
  
  // Mobile language toggle
  if (mobileLanguageToggle) {
    mobileLanguageToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
      await applyLanguage(newLanguage);
    });
  }
  
}

// Export the I18N system for use in other modules
export { I18N, applyTranslations, setLanguage };

// Utility functions
export function getCurrentLanguage() {
  return localStorage.getItem('preferred-language') || 'en';
}

export function getTranslation(key, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  return I18N.t(key);
}