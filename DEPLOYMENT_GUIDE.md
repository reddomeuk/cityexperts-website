# City Experts - Production Deployment Guide

## Overview
This guide covers the complete deployment process for the City Experts CMS-driven website to Cloudflare Pages with Functions.

## Prerequisites
- Cloudflare account with Pages enabled
- GitHub repository access
- Cloudinary account for image management
- Domain name configured in Cloudflare

## 1. Environment Variables

### Required Environment Variables for Cloudflare Pages:

```bash
# Session Management
SESSION_SECRET=your-secure-random-session-secret-here

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### How to Set Environment Variables:
1. Go to Cloudflare Dashboard > Pages
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable for "Production" environment

## 2. Cloudflare Pages Configuration

### Build Settings:
- **Framework preset**: None
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

### Compatibility Settings:
- **Compatibility Date**: `2024-01-01`
- **Node.js version**: `18` or higher

## 3. File Structure Verification

Ensure these key files are in your repository:

```
/
├── functions/
│   └── api/
│       ├── _csrf.js          # CSRF protection
│       ├── _rate.js          # Rate limiting
│       ├── contact.js        # Contact form
│       ├── delete.js         # File deletion
│       ├── login.js          # Admin login
│       ├── logout.js         # Admin logout
│       ├── projects.js       # Projects CRUD API
│       ├── session.js        # Session management
│       ├── team.js           # Team management API
│       └── upload.js         # File upload
├── data/
│   ├── projects.json         # Projects data
│   └── team.json             # Team members data
├── public/
│   ├── locales/
│   │   ├── en.json           # English translations
│   │   └── ar.json           # Arabic translations
│   └── assets/
└── src/
    ├── *.html                # All HTML pages
    ├── js/
    │   ├── main.js           # Core JavaScript
    │   ├── admin.js          # Admin portal
    │   ├── projects.js       # Projects page
    │   ├── team.js           # Team rendering
    │   └── language.js       # i18n system
    └── styles/
        └── main.css          # Compiled CSS
```

## 4. Admin Portal Access

### Initial Admin Setup:
1. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables
2. Access: `https://yourdomain.com/admin.html`
3. Login with configured credentials

### Admin Features Available:
- ✅ **Projects Management**: Full CRUD with image upload
- ✅ **Featured Projects**: Hero image validation (1920×1080, ≤2MB)
- ✅ **Team Management**: CRUD with portrait validation (800×800, ≤1MB)
- ✅ **Page Headers**: Dynamic header image management
- ✅ **File Upload**: Cloudinary integration with validation

## 5. Image Management

### Cloudinary Configuration:
- **Upload folder structure**: `cityexperts/{type}/`
- **Supported formats**: WebP, JPEG, PNG
- **Image validation**: 
  - Hero images: 1920×1080, ≤2MB
  - Thumbnails: 600×400, ≤500KB
  - Team portraits: 800×800, ≤1MB

### Image Optimization:
- Automatic format optimization (f_auto)
- Quality optimization (q_auto)
- Responsive delivery with srcset
- CLS prevention with proper dimensions

## 6. Content Management

### Projects:
- Managed via `/admin.html` → Projects section
- Support for English content (Arabic ready)
- Featured projects require valid hero images
- Categories: commercial, residential, hospitality, public, mixed-use

### Team Members:
- Managed via `/admin.html` → Team Management
- Dynamic rendering on About Us page
- Cloudinary portrait integration
- i18n ready for Arabic content

### Page Headers:
- All pages except Contact Us have manageable headers
- Upload via admin portal
- Automatic Cloudinary optimization

## 7. Multi-language Support

### Current Status:
- ✅ **English**: Fully implemented
- ✅ **Arabic**: Translations ready, RTL support
- ✅ **Language switching**: JavaScript-based
- ✅ **Content structure**: i18n ready in data files

### Adding New Languages:
1. Create `/public/locales/{lang}.json`
2. Add language option to navigation
3. Update `language.js` if needed

## 8. Performance Features

### Implemented Optimizations:
- ✅ **Image lazy loading**: Native and intersection observer
- ✅ **Responsive images**: Cloudinary transformations
- ✅ **Critical CSS**: Inlined for above-the-fold content
- ✅ **Font optimization**: Preload critical fonts
- ✅ **Resource hints**: Preload hero images
- ✅ **Progressive enhancement**: Works without JavaScript

## 9. Security Features

### Implemented Security:
- ✅ **CSRF Protection**: Token-based for admin actions
- ✅ **Rate Limiting**: API endpoint protection
- ✅ **Session Management**: Secure admin sessions
- ✅ **Input Validation**: File upload restrictions
- ✅ **XSS Prevention**: Proper content escaping

## 10. SEO & Accessibility

### SEO Features:
- ✅ **Meta tags**: Comprehensive for all pages
- ✅ **Structured data**: JSON-LD implementation
- ✅ **Sitemap**: Static sitemap.xml
- ✅ **OpenGraph**: Social media optimization
- ✅ **Performance**: Optimized for Core Web Vitals

### Accessibility Features:
- ✅ **ARIA labels**: Proper labeling
- ✅ **Keyboard navigation**: Full support
- ✅ **Screen readers**: Semantic HTML
- ✅ **Color contrast**: WCAG compliant
- ✅ **Focus management**: Visible focus indicators

## 11. Deployment Checklist

### Pre-deployment:
- [ ] Environment variables configured
- [ ] Admin credentials set
- [ ] Cloudinary account configured
- [ ] Domain DNS pointed to Cloudflare

### Post-deployment Testing:
- [ ] Admin login functionality
- [ ] Project CRUD operations
- [ ] Team management
- [ ] Image uploads to Cloudinary
- [ ] Featured projects carousel (3×3 layout)
- [ ] Language switching (EN/AR)
- [ ] Contact form submission
- [ ] Mobile responsiveness
- [ ] Page load performance

### Go-Live Verification:
- [ ] Homepage featured carousel displays 9 projects
- [ ] Admin portal accessible and functional
- [ ] About Us page loads team dynamically
- [ ] Projects page mirrors admin data
- [ ] All images load from Cloudinary
- [ ] Language switching works properly
- [ ] Contact form delivers emails

## 12. Maintenance & Updates

### Regular Tasks:
- **Content Updates**: Via admin portal
- **Image Management**: Through Cloudinary dashboard
- **Performance Monitoring**: Cloudflare Analytics
- **Security Updates**: Review admin access logs

### Data Backups:
- Projects data: `/data/projects.json`
- Team data: `/data/team.json`
- Images: Stored in Cloudinary (auto-backup)

## 13. Troubleshooting

### Common Issues:

**Admin Login Issues:**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables
- Check browser network tab for session errors

**Image Upload Failures:**
- Verify Cloudinary credentials in environment variables
- Check file size and format restrictions

**Featured Projects Not Showing:**
- Ensure projects have valid hero images
- Check browser console for API errors

**Language Switching Issues:**
- Verify locale files in `/public/locales/`
- Check browser console for loading errors

## 14. Support Contacts

### Development Team:
- **Frontend**: Issues with UI/UX, responsive design
- **Backend**: API endpoints, admin functionality  
- **DevOps**: Deployment, environment configuration

### Third-party Services:
- **Cloudflare**: Hosting, DNS, performance
- **Cloudinary**: Image management, optimization

---

## Quick Start Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages (automated via GitHub)
git push origin main
```

**Note**: This deployment guide assumes Cloudflare Pages automatic deployment is configured with your GitHub repository. Updates will automatically deploy when pushing to the main branch.