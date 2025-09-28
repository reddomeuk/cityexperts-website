# City Experts Website - Deployment Guide

## Overview
This guide covers deploying the City Experts website to Cloudflare Pages with Workers Functions.

## Prerequisites
- GitHub repository: `reddomeuk/cityexperts-website`
- Cloudflare account with domain access
- Node.js 18+ installed
- Wrangler CLI installed globally

## Build Status ✅
- **Build Test**: Passed (npm run build:cf)
- **Output Size**: ~160KB compressed
- **Pages**: 5 HTML files (index, about, projects, contact, admin)
- **Assets**: Optimized images, CSS, JavaScript
- **Functions**: 2 API endpoints (contact, projects)

## Deployment Steps

### 1. Connect GitHub Repository to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   ```bash
   # Login with Wrangler (optional for CLI deployment)
   wrangler login
   ```

2. **Go to Cloudflare Pages**
   - Navigate to Pages section in Cloudflare Dashboard
   - Click "Create a project"
   - Select "Connect to Git"

3. **Connect Repository**
   - Choose GitHub as provider
   - Select `reddomeuk/cityexperts-website`
   - Authorize Cloudflare access

### 2. Configure Build Settings

**Framework preset**: None (Custom)
**Build command**: `npm run build:cf`
**Build output directory**: `dist`
**Root directory**: `/` (leave empty)

**Environment Variables** (Add in Pages settings):
```
NODE_VERSION=18
CONTACT_EMAIL=your-email@cityexperts.ae
SENDGRID_API_KEY=your-sendgrid-key (optional)
MAILGUN_API_KEY=your-mailgun-key (optional)
```

### 3. Domain Configuration

1. **Custom Domain Setup**
   - Go to Pages project > Custom domains
   - Add `cityexperts.ae` and `www.cityexperts.ae`
   - Update DNS records as instructed

2. **SSL/TLS Settings**
   - Ensure SSL/TLS is set to "Full (strict)"
   - Enable "Always Use HTTPS"

### 4. Security Headers Verification

The `_headers` file includes:
- Content Security Policy
- XSS Protection
- Cache controls for assets
- Security headers for API endpoints

### 5. Functions Configuration

**API Endpoints Available**:
- `/api/contact` - Contact form submission
- `/api/projects` - Project data retrieval

**Features**:
- CORS handling for cross-origin requests
- Rate limiting ready for implementation
- Environment variable support

### 6. Testing Deployment

1. **Local Testing** (Optional)
   ```bash
   # Test Pages Functions locally
   cd dist
   wrangler pages dev . --port 8788
   ```

2. **Production Testing**
   - Verify all pages load correctly
   - Test contact form functionality
   - Check image loading and optimization
   - Validate navigation and animations

## Post-Deployment Checklist

### DNS & SSL
- [ ] Custom domain resolves correctly
- [ ] SSL certificate is active
- [ ] www redirect works
- [ ] HTTPS enforced

### Functionality
- [ ] All pages accessible
- [ ] Navigation works across all pages
- [ ] Counter animations trigger on scroll
- [ ] Project carousel functions properly
- [ ] Contact form submits successfully
- [ ] Admin page loads (if needed)

### Performance
- [ ] Page load times < 3 seconds
- [ ] Images load properly (WebP format)
- [ ] CSS and JS assets cached
- [ ] Mobile responsiveness verified

### SEO & Analytics
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Google Analytics installed (if required)
- [ ] XML sitemap generated

## Environment Variables Setup

### Required for Contact Form
```bash
# In Cloudflare Pages Settings > Environment Variables
CONTACT_EMAIL=info@cityexperts.ae

# Choose one email service:
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.cityexperts.ae
# OR
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

## Troubleshooting

### Build Failures
- **Missing dependencies**: Run `npm install` in project root
- **Asset not found**: Check file paths are correct
- **Build timeout**: Optimize images or split builds

### Runtime Issues
- **Function errors**: Check environment variables are set
- **CORS issues**: Verify API endpoints return proper headers
- **Image loading**: Ensure WebP format is supported

### Performance Issues
- **Slow loading**: Enable Cloudflare caching and minification
- **Large bundle**: Use code splitting or lazy loading
- **Memory issues**: Optimize image sizes

## Monitoring & Maintenance

### Analytics
- Monitor page views in Cloudflare Analytics
- Track Core Web Vitals
- Monitor function invocations and errors

### Updates
- Deploy updates via GitHub pushes
- Test staging branches before merging
- Monitor deployment logs for issues

### Backup
- Repository serves as primary backup
- Export Cloudflare settings periodically
- Document configuration changes

## Cost Optimization

### Cloudflare Pages (Free Tier)
- **Bandwidth**: 100GB/month
- **Builds**: 500 builds/month
- **Functions**: 100,000 requests/day

### Monitoring Usage
- Check Pages analytics for bandwidth usage
- Monitor function invocations
- Optimize images and assets for better performance

## Support Contacts

- **Technical Issues**: Cloudflare Support
- **Domain Issues**: Domain registrar
- **Code Issues**: Check GitHub repository
- **Email Issues**: Email service provider (SendGrid/Mailgun/EmailJS)

---

## Quick Commands Reference

```bash
# Build for production
npm run build:cf

# Test locally with Wrangler
wrangler pages dev dist --port 8788

# Deploy directly (alternative to GitHub)
wrangler pages deploy dist

# Check deployment status
wrangler pages deployment list

# View logs
wrangler tail
```

## Final Notes

✅ **Ready for Deployment**: All configuration files are prepared
✅ **Build Tested**: Production build works successfully  
✅ **Functions Ready**: API endpoints configured for Cloudflare Workers
✅ **Security Configured**: Headers and CORS policies in place
✅ **Documentation Complete**: Comprehensive guides provided

The website is now ready for deployment to Cloudflare Pages!