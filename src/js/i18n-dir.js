// Minimal RTL controller that plays nice with existing i18n
export function applyLanguage(lang) {
  const isRTL = lang === 'ar';
  const html = document.documentElement;

  // 1) Language + direction
  html.setAttribute('lang', isRTL ? 'ar' : 'en');
  html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // 2) Mirror class for CSS fallbacks if needed
  html.classList.toggle('rtl', isRTL);

  // 3) Let components know
  window.dispatchEvent(new CustomEvent('i18n:dir-changed', { detail: { lang, isRTL }}));
}

// Helper used on boot
export function initLanguageFromStorage() {
  const lang = localStorage.getItem('lang') === 'ar' ? 'ar' : 'en';
  applyLanguage(lang);
  return lang;
}