# City Experts Website - Cloudinary Integration

## 🎯 Image Management Overview

This website is now fully integrated with Cloudinary for optimal image delivery and management. All images are served from Cloudinary with automatic optimization, responsive delivery, and CDN caching.

## 📦 Cloudinary Setup

### Environment Variables (Cloudflare Pages)
Set these environment variables in your Cloudflare Pages dashboard:

```bash
CLOUDINARY_CLOUD_NAME=dmawj7tmu
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Image Categories & Requirements

| Category | Dimensions | Max Size | Use Case |
|----------|------------|----------|----------|
| **hero** | 1920×1080 | 2MB | Page header backgrounds |
| **thumb** | 800×600 | 1MB | Project thumbnails |
| **gallery** | 1600×1200 | 1.5MB | Project gallery images |
| **team** | 600×600 | 1MB | Team member photos |
| **logo** | 400×200 | 200KB | Logo files |

## 🖼️ Image Delivery Features

### Automatic Optimizations
- **Format**: Auto WebP/AVIF conversion (`f_auto`)
- **Quality**: Adaptive quality optimization (`q_auto`)
- **Compression**: Intelligent compression for best size/quality ratio

### Responsive Delivery
All images include:
- `srcset` for multiple resolutions
- `sizes` attribute for optimal loading
- `width` & `height` attributes to prevent CLS
- Progressive loading with `loading="lazy"`

### Example URLs
```
Original: https://res.cloudinary.com/dmawj7tmu/image/upload/v1759252864/hero.webp
Optimized: https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080,q_auto,f_auto/v1759252864/hero.webp
```

## 🏠 Page Structure

### Homepage Featured Projects
- **Layout**: 3 carousels × 3 cards each = 9 total featured projects
- **Data Source**: `featured: true` projects from `data/projects.json`
- **API Endpoint**: `/api/projects?featured=true&status=published&limit=9`

### Header Images
Managed via `data/headers.json`:
- **Index**: Dubai skyline hero
- **About**: Team/construction hero
- **Services**: Dubai skyline (customizable)
- **Projects**: Projects showcase hero
- **Contact**: No hero header (background only)

## 🔧 Admin Portal Features

### Page Header Management
Located at `/admin.html` under "Page Headers" section:
- Upload replacement headers for any page
- Automatic validation (1920×1080, ≤2MB)
- Updates both `headers.json` and Cloudinary
- Instant preview updates

### Project Management
- **Featured Toggle**: Control homepage carousel content
- **Image Upload**: Hero, thumb, and gallery images
- **Validation**: Enforced dimensions and file sizes
- **Cloudinary Integration**: Direct upload with public_id tracking

## 📁 File Structure

```
data/
├── headers.json          # Page header configurations
└── projects.json         # Project data with Cloudinary URLs

functions/api/
├── headers.js           # Header management API
├── projects.js          # Projects CRUD API
└── upload.js            # Cloudinary upload handler

src/js/
├── main.js              # Featured projects carousel
├── projects.js          # Projects page rendering
└── admin.js             # Admin portal functionality
```

## 🚀 Production Deployment

### Cloudflare Pages Configuration
1. **Environment Variables**: Set all Cloudinary credentials
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Functions**: Automatically deployed from `/functions`

### Pre-Launch Checklist
- [ ] All environment variables configured
- [ ] Featured projects showing correctly (9 total)
- [ ] Page headers loading from Cloudinary
- [ ] Admin portal accessible and functional
- [ ] RTL/Arabic support working
- [ ] All API endpoints responding
- [ ] CSP allows Cloudinary domain

## 🛡️ Security & Performance

### Content Security Policy
Current CSP allows:
```
img-src 'self' https://res.cloudinary.com data:;
```

### Caching
- **Cloudinary CDN**: Global edge caching
- **Browser Cache**: Optimized headers for long-term caching
- **Preloading**: Critical hero images preloaded

### Upload Security
- File type validation
- Dimension requirements enforced
- File size limits
- CSRF protection
- Rate limiting
- Session authentication required

## 🔍 Monitoring & Maintenance

### Image Optimization Check
Use browser dev tools to verify:
- Images served as WebP/AVIF when supported
- Correct dimensions loaded for viewport
- No layout shifts (CLS)
- Fast loading times

### Admin Tasks
- Monitor Cloudinary usage/bandwidth
- Review featured projects quarterly
- Update headers seasonally
- Backup `data/` directory regularly

## 📈 Performance Metrics

Target Lighthouse scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

Key optimizations applied:
- Responsive images with optimal sizes
- WebP/AVIF format delivery
- Preloading critical resources
- Proper width/height attributes
- Efficient carousel implementation