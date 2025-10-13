# 🏗️ City Experts - Premium Construction & Interior Design Website

> Professional corporate website for City Experts UAE - Construction and Interior Design Excellence

## 🚀 Quick Deploy to Cloudflare Pages

### Prerequisites
- Node.js 18+ installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

### Deployment Steps

1. **Clone and Build**
   ```bash
   git clone <repository-url>
   cd CityExperts
   npm install
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npm run cf:login
   npm run deploy:cf
   ```

3. **Environment Variables** (Set in Cloudflare Pages Dashboard)
   ```
   CLOUDINARY_CLOUD_NAME=dmawj7tmu
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## 📁 Project Structure

```
CityExperts/
├── src/                    # Source files
│   ├── index.html         # Homepage
│   ├── about.html         # About page with team & timeline
│   ├── projects.html      # Projects portfolio
│   ├── services.html      # Services showcase
│   ├── contact.html       # Contact form & info
│   ├── admin.html         # Admin panel
│   ├── js/               # JavaScript modules
│   ├── styles/           # CSS files
│   └── types/            # TypeScript definitions
├── public/               # Static assets
│   └── assets/          # Optimized images & media
├── functions/           # Cloudflare Functions (API)
├── dist/               # Production build output
├── scripts/            # Build & utility scripts
└── data/              # JSON data files
```

## �️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare
npm run deploy:cf
```

## ✨ Features

- **🌐 Multi-language** support (EN/AR)
- **📱 Fully responsive** design
- **⚡ Optimized** for Cloudflare Pages
- **🖼️ Cloudinary** image optimization
- **🔒 Security** headers & CSP
- **📊 Analytics** ready
- **♿ Accessible** WCAG compliant
- **🎨 Modern** Tailwind CSS styling

## 📞 Contact Information

- **Address**: V28V+JR2 - 2 طريق شاحنات الفاية - سيح شعيب - near Round About 1 - Saih Shuaib 2, Dubai, UAE
- **Phone**: 600 500508 (+971555581631)
- **Email**: enquiry@cityexpertsdubai.com
- **WhatsApp**: https://wa.me/971555581631
- **Instagram**: https://www.instagram.com/cityexpertsgroup

## 🌟 Tech Stack

- **Frontend**: Vanilla JS, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Hosting**: Cloudflare Pages
- **Functions**: Cloudflare Workers
- **Images**: Cloudinary CDN
- **Database**: Cloudflare D1 (optional)

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized
- **Image Optimization**: WebP/AVIF with Cloudinary
- **Asset Compression**: Gzip/Brotli
- **CDN**: Global Cloudflare network

---

**© 2024 City Experts UAE. All rights reserved.**