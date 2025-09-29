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
  applyTranslations(document);
  // Notify components that render dynamically
  document.dispatchEvent(new CustomEvent('i18n:updated', { detail: { lang } }));
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
    await setLanguage(lang);
    updateLanguageDisplay();
  }
  
  // Initialize with current language
  setLanguage(currentLanguage);
  updateLanguageDisplay();
  
  // Desktop language toggle (index.html)
  if (languageToggle) {
    languageToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
      await applyLanguage(newLanguage);
    });
  }
  
  // Individual language buttons (about.htmlh, projects.html)
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
  
  console.log('🌐 Language toggle initialized');
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
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.request-proposal': 'Request a Proposal',
      
      // Services submenu
      'nav.commercial': 'Commercial Construction',
      'nav.residential': 'Residential Construction',
      'nav.interior': 'Interior Design & Fit-Out',
      'nav.design-build': 'Design & Build (EPC)',
      
      // Hero section
      'hero.headline': 'Engineering Excellence. Interior Elegance.',
      'hero.subheadline': '20+ years delivering landmark commercial and residential projects across the UAE.',
      'hero.cta-primary': 'Request a Proposal',
      'hero.cta-secondary': 'View Our Projects',
      
      // Stats
      'stats.years': 'Years in UAE',
      'stats.staff': 'Staff',
      'stats.projects': 'Completed Projects',
      'stats.delivery': 'On-time Delivery',
      
      // Common
      'common.learn-more': 'Learn More',
      'common.view-details': 'View Details',
      'common.contact-us': 'Contact Us',
      'common.get-quote': 'Get Quote',
      
      // Footer
      'footer.about-text': 'City Experts is a UAE-born construction and interiors company delivering complex commercial landmarks and elegant residential spaces.',
      'footer.quick-links': 'Quick Links',
      'footer.services': 'Services',
      'footer.contact': 'Contact Info',
      'footer.follow': 'Follow Us',
      'footer.newsletter': 'Newsletter',
      'footer.newsletter-text': 'Stay updated with our latest projects and insights.',
      'footer.subscribe': 'Subscribe',
      'footer.rights': 'All rights reserved.',
      
      // Contact
      'contact.office': 'Office',
      'contact.phone': 'Phone',
      'contact.email': 'Email',
      'contact.whatsapp': 'WhatsApp'
    },
    ar: {
      // Navigation (Arabic translations)
      'nav.home': 'الرئيسية',
      'nav.about': 'من نحن',
      'nav.services': 'خدماتنا',
      'nav.projects': 'مشاريعنا',
      'nav.contact': 'اتصل بنا',
      'nav.request-proposal': 'طلب عرض أسعار',
      
      // Services submenu
      'nav.commercial': 'البناء التجاري',
      'nav.residential': 'البناء السكني',
      'nav.interior': 'التصميم الداخلي والتأثيث',
      'nav.design-build': 'التصميم والبناء',
      
      // Hero section
      'hero.headline': 'التميز الهندسي. الأناقة الداخلية.',
      'hero.subheadline': 'أكثر من 20 عاماً في تسليم المشاريع التجارية والسكنية المميزة عبر دولة الإمارات.',
      'hero.cta-primary': 'طلب عرض أسعار',
      'hero.cta-secondary': 'اعرض مشاريعنا',
      
      // Stats
      'stats.years': 'سنة في الإمارات',
      'stats.staff': 'موظف',
      'stats.projects': 'مشروع مكتمل',
      'stats.delivery': 'تسليم في الوقت المحدد',
      
      // Common
      'common.learn-more': 'اعرف المزيد',
      'common.view-details': 'عرض التفاصيل',
      'common.contact-us': 'اتصل بنا',
      'common.get-quote': 'احصل على عرض أسعار',
      
      // Footer
      'footer.about-text': 'سيتي إكسبرتس شركة إماراتية للبناء والتصميم الداخلي تقدم المعالم التجارية المعقدة والمساحات السكنية الأنيقة.',
      'footer.quick-links': 'روابط سريعة',
      'footer.services': 'الخدمات',
      'footer.contact': 'معلومات الاتصال',
      'footer.follow': 'تابعنا',
      'footer.newsletter': 'النشرة الإخبارية',
      'footer.newsletter-text': 'ابق محدثاً بأحدث مشاريعنا ورؤانا.',
      'footer.subscribe': 'اشترك',
      'footer.rights': 'جميع الحقوق محفوظة.',
      
      // Contact
      'contact.office': 'المكتب',
      'contact.phone': 'الهاتف',
      'contact.email': 'البريد الإلكتروني',
      'contact.whatsapp': 'واتساب'
    }
  };
  
  // Apply language to page
  function applyLanguage(lang) {
    currentLanguage = lang;
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update direction for RTL
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = translations[lang]?.[key];
      
      if (translation) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Update language display
    if (currentLangDisplay) {
      currentLangDisplay.textContent = lang.toUpperCase();
    }
    
    // Update mobile language display
    if (mobileCurrentLang) {
      mobileCurrentLang.textContent = lang === 'en' ? 'English' : 'العربية';
    }
    
    // Update language button states
    if (langEnBtn && langArBtn) {
      langEnBtn.classList.toggle('active', lang === 'en');
      langArBtn.classList.toggle('active', lang === 'ar');
    }
    
    // Save preference
    localStorage.setItem('preferred-language', lang);
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: lang, translations: translations[lang] }
    }));
    
    console.log(`🌐 Language changed to: ${lang}`);
  }
  
  // Initialize with saved or default language
  applyLanguage(currentLanguage);
  
  // Language toggle functionality - Main toggle button (index.html)
  if (languageToggle) {
    languageToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
      applyLanguage(newLanguage);
    });
    
    // Keyboard support for language toggle
    languageToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
        applyLanguage(newLanguage);
      }
    });
  }
  
  // Individual language buttons (about.html, projects.html)
  if (langEnBtn) {
    langEnBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('en');
    });
  }
  
  if (langArBtn) {
    langArBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage('ar');
    });
  }
  
  // Mobile language toggle
  if (mobileLanguageToggle) {
    mobileLanguageToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
      applyLanguage(newLanguage);
    });
  }
  
  console.log('🌐 Language toggle initialized');
}

// Utility function to get current language
export function getCurrentLanguage() {
  return localStorage.getItem('preferred-language') || 'en';
}

// Utility function to get translation
export function getTranslation(key, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  const translations = {
    en: {
      // Add English translations here
    },
    ar: {
      // Add Arabic translations here
    }
  };
  
  return translations[currentLang]?.[key] || key;
}

// Format numbers for different locales
export function formatNumber(number, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  const locale = currentLang === 'ar' ? 'ar-AE' : 'en-AE';
  
  return new Intl.NumberFormat(locale).format(number);
}

// Format dates for different locales
export function formatDate(date, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  const locale = currentLang === 'ar' ? 'ar-AE' : 'en-AE';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}