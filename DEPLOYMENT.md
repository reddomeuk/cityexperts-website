# 🚀 Cloudflare Pages Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [ ] All HTML files validate
- [ ] CSS builds without errors
- [ ] JavaScript has no console errors
- [ ] All images are optimized
- [ ] Contact information is up-to-date

### 2. Build Process
- [ ] `npm run build` completes successfully
- [ ] `dist/` directory contains all required files
- [ ] All asset links resolve correctly
- [ ] Functions directory is copied to dist

### 3. Cloudflare Configuration
- [ ] Wrangler CLI installed and authenticated
- [ ] `wrangler.toml` configured correctly
- [ ] `_routes.json` routes API correctly
- [ ] `_headers` security policies set

## 🌐 Deployment Commands

### One-Time Setup
```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create the project (first time only)
wrangler pages create cityexperts-website
```

### Deploy Process
```bash
# 1. Build the project
npm run build

# 2. Deploy to Cloudflare Pages
npm run deploy:cf

# Alternative: Manual deploy
wrangler pages deploy dist --project-name=cityexperts-website
```

### Local Testing
```bash
# Test locally with Cloudflare runtime
npm run preview:cf

# Test build locally
npm run preview
```

## 🔧 Environment Variables

Set these in Cloudflare Pages Dashboard > Settings > Environment Variables:

### Production Variables
```
CLOUDINARY_CLOUD_NAME=dmawj7tmu
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
ENVIRONMENT=production
```

### Development Variables
```
CLOUDINARY_CLOUD_NAME=dmawj7tmu
CLOUDINARY_API_KEY=your-dev-api-key
CLOUDINARY_API_SECRET=your-dev-api-secret
ENVIRONMENT=development
```

## 📋 Post-Deployment Checks

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Contact form submits successfully
- [ ] Images load from Cloudinary
- [ ] Language toggle works
- [ ] Mobile responsiveness

### Performance Testing
- [ ] Lighthouse score 95+
- [ ] Core Web Vitals pass
- [ ] Images load quickly
- [ ] CSS/JS assets cached properly

### Contact Information Verification
- [ ] Phone numbers dial correctly
- [ ] Email links open mail client
- [ ] WhatsApp link opens correctly
- [ ] Instagram link works
- [ ] Address displays properly

## 🔗 Useful Links

- **Cloudflare Pages Dashboard**: https://dash.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Performance Testing**: https://pagespeed.web.dev/
- **Cloudinary Console**: https://cloudinary.com/console

## 🆘 Troubleshooting

### Build Failures
- Check `package.json` scripts
- Verify all dependencies installed
- Check TypeScript errors

### Deployment Issues
- Verify Wrangler authentication
- Check project name matches
- Ensure build output in `dist/`

### Runtime Errors
- Check browser console
- Verify environment variables
- Test API endpoints

---

**Last Updated**: October 2024