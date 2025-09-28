# Cloudflare Pages Deployment - Troubleshooting Guide

## Issue: npm ci Package Lock Sync Error ✅ **RESOLVED**

### **Problem**
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: wrangler@3.114.14 from lock file
```

### **Root Cause**
The `package-lock.json` file was out of sync with `package.json` after adding Wrangler and Cloudflare dependencies.

### **Solution Applied** ✅
1. **Updated package-lock.json**: 
   ```bash
   npm install
   ```
2. **Committed and pushed changes**:
   ```bash
   git add package-lock.json
   git commit -m "Update package-lock.json to sync with package.json dependencies"
   git push origin main
   ```

## Current Status ✅
- **package-lock.json**: Updated and synced
- **Dependencies**: All Wrangler and Sharp dependencies resolved
- **Repository**: Latest changes pushed to GitHub
- **Ready for deployment**: ✅ Yes

---

## Cloudflare Pages Deployment Settings

### **Build Configuration**
```
Build command: npm run build:cf
Build output directory: dist
Root directory: (leave empty)
Environment variables: (see below)
```

### **Environment Variables** (Add in Cloudflare Pages Settings)
```
NODE_VERSION=18
CONTACT_EMAIL=info@cityexperts.ae
FROM_EMAIL=noreply@cityexperts.ae
```

### **Alternative Build Commands** (if needed)
If `npm run build:cf` fails, try:
```
# Simple build
npm run build

# Or manual commands
npm install && npx vite build && cp _routes.json dist/ && cp -r functions dist/
```

---

## Deployment Steps (Updated)

### 1. **GitHub Repository** ✅
- Repository: `reddomeuk/cityexperts-website`  
- Branch: `main`
- Status: Up to date with latest fixes

### 2. **Cloudflare Pages Setup**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project" → "Connect to Git"  
3. Select `reddomeuk/cityexperts-website`
4. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### 3. **Environment Variables Setup**
In Cloudflare Pages → Settings → Environment variables:
```
NODE_VERSION = 18
CONTACT_EMAIL = info@cityexperts.ae
FROM_EMAIL = noreply@cityexperts.ae
```

### 4. **Deploy**
- Click "Save and Deploy"
- Monitor build logs for any issues
- First deployment should now succeed ✅

---

## Alternative Configurations

### **If Advanced Features Cause Issues**
Use the simplified `wrangler.minimal.toml`:
```toml
name = "cityexperts-website"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"
```

### **If Functions Don't Work Initially**
1. Deploy without functions first (comment out functions folder copy)
2. Get basic site working
3. Add functions in a subsequent deployment

### **Build Command Alternatives**
```bash
# Simple build (no functions)
npm run build

# Manual build with error handling
npm install && npx vite build || exit 1 && cp _routes.json dist/ && cp -r functions dist/ || true

# Build without functions copy
npm install && npx vite build && cp _routes.json dist/
```

---

## Troubleshooting Common Issues

### **Build Fails: "Command not found"**
- Ensure `NODE_VERSION=18` is set in environment variables
- Try changing build command to: `npm install && npm run build:cf`

### **Build Fails: "Cannot find module"**
- Usually resolved by our package-lock.json fix ✅
- If persists, try: `npm ci --legacy-peer-deps`

### **Functions Not Working**
- Check `_routes.json` is copied to dist folder
- Verify functions folder exists in dist after build
- Test functions locally with `wrangler pages dev dist`

### **Assets Not Loading**
- Check `public/_headers` file is present
- Verify asset paths in HTML files
- Ensure WebP images are in the correct locations

---

## Expected Build Output

### **Successful Build Log Should Show**:
```
✓ 14 modules transformed.
../dist/index.html                47.84 kB │ gzip:  9.50 kB
../dist/about.html                50.67 kB │ gzip: 10.33 kB
../dist/projects.html             35.81 kB │ gzip:  6.46 kB
../dist/contact.html              12.12 kB │ gzip:  3.80 kB
../dist/admin.html                 3.75 kB │ gzip:  1.31 kB
✓ built in XXXms

> city-experts-website@1.0.0 copy-routes
> cp _routes.json dist/

> city-experts-website@1.0.0 copy-functions  
> cp -r functions dist/
```

### **Deployment Should Include**:
- ✅ 5 HTML files (index, about, projects, contact, admin)
- ✅ Optimized CSS and JS bundles
- ✅ WebP images in assets folder
- ✅ `_routes.json` for API routing
- ✅ `_headers` for security headers
- ✅ `functions/` folder with API endpoints

---

## Next Steps After Successful Deployment

1. **Test the live site**:
   - Verify all pages load
   - Test language switching functionality
   - Check navigation and animations

2. **Configure custom domain** (if needed):
   - Add custom domain in Cloudflare Pages settings
   - Update DNS records as instructed

3. **Test API endpoints**:
   - Contact form submission
   - Projects API functionality

4. **Monitor performance**:
   - Check Core Web Vitals
   - Verify image optimization
   - Test mobile responsiveness

---

## Current Repository Status

- **Latest Commit**: `819faa1` - "Update package-lock.json to sync with package.json dependencies"
- **Files Status**: All dependencies synced ✅
- **Build Status**: Ready for deployment ✅
- **Language Toggle**: Fixed and functional ✅

**The repository is now ready for successful Cloudflare Pages deployment!** 🚀