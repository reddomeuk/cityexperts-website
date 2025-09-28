# City Experts Website

A premium, bilingual-ready corporate website for City Experts - a UAE-based construction and interior design company with 20+ years of experience.

## 🏗️ Project Overview

**Brand Identity:**
- **Tone:** Confident, trustworthy, world-class, client-centric
- **Personality:** Modern Emirati sophistication; precise engineering meets refined interiors
- **Tagline:** "Engineering Excellence. Interior Elegance."

**Color Palette:**
- Deep Charcoal: `#111315` (primary text/headers)
- Desert Sand: `#CBB79B` (accents, buttons on dark)
- Warm Stone: `#E8E3DB` (background sections)
- Oasis Teal: `#0F8B8D` (links/CTAs, subtle highlights)
- Pure White: `#FFFFFF`

## 🚀 Technology Stack

- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom design system
- **JavaScript:** Vanilla ES6+ modules
- **Fonts:** Playfair Display (headings), Inter (body text), Tajawal (Arabic)
- **Images:** WebP/AVIF with lazy loading
- **Accessibility:** WCAG 2.1 AA compliant

## 📁 Project Structure

```
src/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services overview
├── projects.html           # Projects portfolio
├── contact.html            # Contact page
├── styles/
│   └── main.css           # Global styles and design system
├── js/
│   ├── main.js            # Main application entry
│   ├── navigation.js      # Navigation functionality
│   ├── language.js        # Bilingual support
│   ├── components.js      # Interactive components
│   ├── animations.js      # Scroll animations and effects
│   └── lazyload.js        # Image lazy loading
└── assets/
    └── images/           # Optimized images and graphics
```

## 🌐 Features

### Bilingual Support (EN/AR)
- Complete RTL layout support
- Arabic typography with Tajawal font
- Language toggle in navigation
- Localized content management

### Interactive Components
- Animated statistics counters
- Image carousels/sliders
- Modal system for project details
- Form validation and handling
- Filterable project grid

### Performance Optimizations
- Lazy loading for images and content
- Next-gen image formats (WebP/AVIF)
- Critical resource preloading
- Optimized font loading
- Minified and compressed assets

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimizations
- High contrast mode support
- Focus management for modals

## 🎨 Design System

### Typography Scale
- **H1:** 4xl-7xl (64px-112px)
- **H2:** 3xl-5xl (48px-80px)
- **H3:** 2xl-3xl (32px-48px)
- **Body:** base-lg (16px-18px)

### Spacing System
- **Section:** py-16 to py-32
- **Container:** max-w-7xl with responsive padding
- **Grid gaps:** 6-8 units (24px-32px)

### Component Library
- **Buttons:** Primary, Secondary, Tertiary variants
- **Cards:** Standard, Hover-lift, Glass-effect
- **Forms:** Validated inputs with error states
- **Navigation:** Sticky header with dropdowns

## 📱 Responsive Breakpoints

- **xs:** 475px (small phones)
- **sm:** 640px (phones)
- **md:** 768px (tablets)
- **lg:** 1024px (laptops)
- **xl:** 1280px (desktops)
- **2xl:** 1536px (large screens)

## 🔧 Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📄 Page Structure

### Homepage (`index.html`)
- Hero section with parallax background
- Trust signals and animated statistics
- Focus areas (services overview)
- Featured projects carousel
- Why City Experts section
- Client testimonials
- CTA section

### About Page (`about.html`)
- Company story and mission
- Leadership team grid
- Capabilities and differentiators
- Sustainability and safety
- Company timeline

### Services (`services.html`)
- Service overview cards
- Individual service detail sections
- Process and methodology
- Case studies and examples

### Projects (`projects.html`)
- Filterable portfolio grid
- Project detail modals
- Category and location filters
- Project showcase with galleries

### Contact (`contact.html`)
- Contact form with validation
- Office locations and map
- Contact information
- WhatsApp integration

## 🌟 Key Features Implementation

### Smooth Animations
- Intersection Observer for scroll animations
- CSS transforms and transitions
- Parallax scrolling effects
- Staggered element reveals

### Form Handling
- Real-time validation
- UAE phone number formatting
- Success/error states
- Accessibility considerations

### Image Optimization
- Lazy loading with fade-in
- Responsive image selection
- Error handling and fallbacks
- Progressive enhancement

### SEO Optimization
- Semantic HTML structure
- Meta tags and Open Graph
- Schema.org structured data
- XML sitemap generation

## 🚀 Deployment Checklist

- [ ] Optimize and compress images
- [ ] Generate favicons for all devices
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificate
- [ ] Configure domain and DNS
- [ ] Test all forms and integrations
- [ ] Validate accessibility compliance
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile device testing

## 📧 Contact Information

For technical support or inquiries about this website, please contact the development team.

---

**City Experts** - Building Tomorrow's UAE, Today.