// City Experts Website - Main JavaScript Module
import '../styles/main.css';
import { initializeComponents } from './components.js';
import { initializeLanguageToggle } from './language.js';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeComponents();
  initializeLanguageToggle();
  initializeFeaturedCarousel();
  console.log('✅ City Experts Website Ready');
});

// FEATURED CAROUSEL INIT
function initializeFeaturedCarousel(){
  const root = document.getElementById("featured-carousel");
  if (!root) return;

  const track = root.querySelector("[data-carousel-track]");
  const slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dots = Array.from(root.querySelectorAll("[data-carousel-to]"));

  if (!track || slides.length === 0) return;

  let index = 0;

  function go(i){
    index = (i + slides.length) % slides.length;
    const viewport = root.querySelector(".carousel-viewport");
    const offset = -index * viewport.clientWidth;
    track.style.transform = `translateX(${offset}px)`;
    dots.forEach((d, n) => d.setAttribute("aria-current", n === index ? "true" : "false"));
  }

  // Recompute on resize so widths stay correct
  const ro = new ResizeObserver(() => go(index));
  ro.observe(root.querySelector(".carousel-viewport"));

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  dots.forEach(d => d.addEventListener("click", () => go(Number(d.dataset.carouselTo || 0))));

  // Autoplay (optional)
  let timer = setInterval(() => go(index + 1), 5000);
  root.addEventListener("pointerenter", () => clearInterval(timer));
  root.addEventListener("pointerleave", () => timer = setInterval(() => go(index + 1), 5000));

  go(0);
}

// Handle smooth scrolling for anchor links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// ---------- PROJECTS FILTER PERSISTENCE ----------
const filterChips = document.querySelectorAll('.filter-chip');
if (filterChips.length > 0) {
  // Read filter from URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  const activeFilter = urlParams.get('sector') || 'all';
  
  // Apply active filter on load
  filterChips.forEach(chip => {
    const isActive = chip.dataset.filter === activeFilter;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', isActive.toString());
  });
  
  // Handle filter clicks
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      
      // Update URL without page reload
      const newUrl = new URL(window.location);
      if (filter === 'all') {
        newUrl.searchParams.delete('sector');
      } else {
        newUrl.searchParams.set('sector', filter);
      }
      window.history.pushState({}, '', newUrl);
      
      // Update chip states
      filterChips.forEach(c => {
        const isActive = c === chip;
        c.classList.toggle('active', isActive);
        c.setAttribute('aria-pressed', isActive.toString());
        
        // Add validation feedback for proper accessibility
        if (isActive) {
          c.setAttribute('aria-current', 'true');
        } else {
          c.removeAttribute('aria-current');
        }
      });
      
      // Trigger any existing filter functionality
      const filterEvent = new CustomEvent('filterChange', { 
        detail: { filter }
      });
      document.dispatchEvent(filterEvent);
    });
  });
}

// ---------- ACCESSIBILITY ENHANCEMENTS ----------
// Add aria-invalid support for form validation
document.addEventListener('input', (e) => {
  if (e.target.matches('.input')) {
    const isValid = e.target.checkValidity();
    e.target.setAttribute('aria-invalid', (!isValid).toString());
  }
});

// ---------- CONTACT FORM ----------
const form = document.getElementById("contactForm");
if (form) {
  const submitBtn = document.getElementById("submitBtn");
  const statusEl  = document.getElementById("formStatus");
  const phoneEl   = document.getElementById("phone");

  // UAE phone quick pattern: +971 5x xxx xxxx or +971 4 xxx xxxx etc.
  const uaePhoneRegex = /^\+971\s?(?:[2-9]\d|5[0-9])(?:\s?\d{3}){2,3}$/;

  const toggleBtn = () => {
    const isValid = form.checkValidity();
    submitBtn.disabled = !isValid;
    
    // Clear previous status when form becomes invalid
    if (!isValid && statusEl.textContent && !statusEl.textContent.includes('Sending')) {
      statusEl.textContent = '';
    }
  };

  // Real-time validation feedback
  const addValidationFeedback = (input, isValid, message = '') => {
    if (isValid) {
      input.classList.remove('input-error');
      input.removeAttribute('aria-invalid');
    } else {
      input.classList.add('input-error');
      input.setAttribute('aria-invalid', 'true');
    }
  };

  // Phone validation on input
  phoneEl.addEventListener('input', () => {
    const value = phoneEl.value.trim();
    if (value && !uaePhoneRegex.test(value)) {
      addValidationFeedback(phoneEl, false, 'Please enter a valid UAE phone');
    } else {
      addValidationFeedback(phoneEl, true);
    }
    toggleBtn();
  });

  // Email validation on input
  const emailEl = document.getElementById('email');
  emailEl.addEventListener('input', () => {
    const value = emailEl.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      addValidationFeedback(emailEl, false, 'Please enter a valid email');
    } else {
      addValidationFeedback(emailEl, true);
    }
    toggleBtn();
  });

  // Generic validation for required fields
  ['name', 'projectType', 'message'].forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field) {
      field.addEventListener('input', () => {
        const value = field.value.trim();
        addValidationFeedback(field, !field.required || value.length > 0);
        toggleBtn();
      });
    }
  });

  // Consent checkbox
  const consentEl = document.getElementById('consent');
  consentEl.addEventListener('change', toggleBtn);

  form.addEventListener("input", toggleBtn);
  form.addEventListener("change", toggleBtn);
  toggleBtn();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot check
    if (form.company_site && form.company_site.value) {
      return; // silently drop bots
    }

    // Final phone validation
    if (!uaePhoneRegex.test(phoneEl.value.trim())) {
      statusEl.textContent = "Please enter a valid UAE phone (e.g., +971 5x xxx xxxx).";
      phoneEl.focus();
      addValidationFeedback(phoneEl, false);
      return;
    }

    // Check consent
    if (!consentEl.checked) {
      statusEl.textContent = "Please accept the privacy policy to continue.";
      consentEl.focus();
      return;
    }

    submitBtn.disabled = true;
    statusEl.textContent = "Sending…";

    // Optional reCAPTCHA v3 (if site key set)
    let recaptchaToken = "";
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey && window.grecaptcha) {
      try {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: "submit" });
        document.getElementById("recaptchaToken").value = recaptchaToken;
      } catch (recaptchaError) {
        console.warn('reCAPTCHA failed:', recaptchaError);
        // Continue without reCAPTCHA if it fails
      }
    }

    // Build payload
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      statusEl.textContent = "Thanks! We'll reach out within 1 business day.";
      statusEl.style.color = "#0F8B8D"; // Success color
      form.reset();
      toggleBtn(); // Reset button state
      
      // Clear success message after 10 seconds
      setTimeout(() => {
        statusEl.textContent = "";
        statusEl.style.color = "";
      }, 10000);
      
    } catch (err) {
      console.error('Contact form error:', err);
      statusEl.textContent = "Sorry—couldn't send right now. Try again or use WhatsApp.";
      statusEl.style.color = "#DC2626"; // Error color
    } finally {
      submitBtn.disabled = false;
    }
  });
}