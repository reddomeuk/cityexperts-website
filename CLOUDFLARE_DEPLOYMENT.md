# City Experts Website - Cloudflare Pages Deployment Guide

This guide will help you deploy the City Experts website to Cloudflare Pages with Cloudflare Workers for API functionality.

## 📋 Prerequisites

- Cloudflare account
- GitHub repository (already created at `reddomeuk/cityexperts-website`)
- Node.js 18+ installed locally
- Wrangler CLI installed (`npm install -g wrangler`)

## 🚀 Quick Start Deployment

### 1. Connect Repository to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select **GitHub** and authorize Cloudflare
6. Choose `reddomeuk/cityexperts-website` repository
7. Click **Begin setup**

### 2. Configure Build Settings

In the Cloudflare Pages setup:

```
Project name: cityexperts-website
Production branch: main
Build command: npm run build:cf
Build output directory: dist
Root directory: /
```

### 3. Environment Variables

Add these environment variables in **Pages** > **Settings** > **Environment variables**:

#### Required Variables
```
ENVIRONMENT=production
CONTACT_EMAIL=info@cityexperts.ae
FROM_EMAIL=noreply@cityexperts.ae
```

#### Email Service (Choose ONE)

**Option A: SendGrid (Recommended)**
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

**Option B: Mailgun**
```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
```

**Option C: EmailJS**
```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

#### Optional Variables
```
RECAPTCHA_SECRET=your_recaptcha_secret
ANALYTICS_ENDPOINT=your_analytics_url
```

### 4. Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repository
2. Install dependencies
3. Build the project
4. Deploy to a `.pages.dev` domain

## 🔧 Local Development with Cloudflare

### 1. Install Dependencies
```bash
cd /path/to/cityexperts-website
npm install
```

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
# or
npm install wrangler --save-dev
```

### 3. Login to Cloudflare
```bash
wrangler login
```

### 4. Local Development
```bash
# Build the project
npm run build:cf

# Run with Cloudflare Pages dev server
npm run preview:cf
```

This will start a local server at `http://localhost:8787` with Cloudflare Workers functionality.

## 📁 Project Structure for Cloudflare

```
cityexperts-website/
├── functions/              # Cloudflare Pages Functions
│   └── api/
│       ├── contact.js      # Contact form handler
│       └── projects.js     # Projects API
├── dist/                   # Build output (auto-generated)
├── src/                    # Source files
├── public/                 # Static assets
├── _routes.json           # Cloudflare routing config
├── wrangler.toml          # Cloudflare Workers config
├── cloudflare-pages.md    # Build configuration
└── .env.cloudflare        # Environment variables template
```

## 🌐 Custom Domain Setup

### 1. Add Custom Domain
1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `cityexperts.ae`)
4. Follow DNS setup instructions

### 2. SSL Certificate
Cloudflare automatically provisions SSL certificates for custom domains.

### 3. DNS Configuration
Add these DNS records in your domain registrar or Cloudflare DNS:

```
Type: CNAME
Name: www
Content: cityexperts-website.pages.dev

Type: CNAME  
Name: @
Content: cityexperts-website.pages.dev
```

## 🔒 Security Configuration

### Headers Configuration
Create `public/_headers` file:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

### Rate Limiting
The API endpoints include basic rate limiting. For production, consider:
- Cloudflare Rate Limiting rules
- Bot Fight Mode
- DDoS protection

## 📊 Monitoring & Analytics

### 1. Cloudflare Analytics
- Built-in analytics in Cloudflare Dashboard
- Real-time traffic monitoring
- Performance metrics

### 2. Custom Analytics
The contact form API can send events to your analytics service via the `ANALYTICS_ENDPOINT` environment variable.

### 3. Error Monitoring
Function logs are available in:
- **Pages** > **Functions** > **Real-time logs**
- Wrangler CLI: `wrangler pages deployment tail`

## 🚀 Performance Features

### Automatic Optimizations
- **Auto Minify**: CSS, JS, HTML
- **Brotli Compression**: Automatic compression
- **HTTP/2**: Enabled by default
- **Global CDN**: 300+ edge locations

### Image Optimization
- WebP images already optimized
- Cloudflare Image Resizing available
- Responsive images with proper sizing

### Caching Strategy
- Static assets: Long-term caching
- HTML: Short-term caching with revalidation
- API responses: No caching (dynamic content)

## 🔄 CI/CD Pipeline

### Automatic Deployments
- Pushes to `main` branch trigger production deployment
- Preview deployments for pull requests
- Rollback capability to previous deployments

### Manual Deployment
```bash
# Build and deploy manually
npm run build:cf
wrangler pages deploy dist --project-name=cityexperts-website
```

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check build logs in Cloudflare Dashboard

**API Functions Not Working**
- Verify `_routes.json` is in root directory
- Check function syntax (must export `onRequest*` functions)
- Review function logs for errors

**Email Not Sending**
- Verify email service API keys
- Check environment variables
- Test with curl/Postman

**Images Not Loading**
- Verify image paths are correct
- Check case sensitivity in filenames
- Ensure images are in `public/` directory

### Getting Help
- Check function logs: `wrangler pages deployment tail`
- Review build logs in Cloudflare Dashboard
- Test locally with `npm run preview:cf`

## 📱 Testing Checklist

Before going live:

- [ ] Contact form submissions work
- [ ] All images load correctly
- [ ] Counter animations function
- [ ] Navigation works on all pages
- [ ] Mobile responsiveness
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Email notifications working
- [ ] Performance metrics acceptable

## 🔧 Advanced Configuration

### Database Integration (D1)
If you need persistent data storage:

1. Create D1 database: `wrangler d1 create cityexperts-db`
2. Update `wrangler.toml` with database ID
3. Create tables with migration scripts
4. Use in functions: `context.env.DB.prepare("SELECT * FROM projects")`

### KV Storage
For caching and session storage:

1. Create KV namespace: `wrangler kv:namespace create "PROJECTS_KV"`
2. Update `wrangler.toml` with namespace ID
3. Use in functions: `await context.env.PROJECTS_KV.get("key")`

### R2 Storage
For file uploads:

1. Create R2 bucket: `wrangler r2 bucket create cityexperts-uploads`
2. Update `wrangler.toml` with bucket name
3. Use in functions: `await context.env.UPLOADS.put("file.jpg", fileData)`

## 📈 Scaling Considerations

- **Traffic**: Cloudflare can handle high traffic automatically
- **Functions**: 100,000 requests/day on free plan
- **Bandwidth**: Unlimited on Cloudflare
- **Storage**: 20GB assets on free plan

For enterprise needs, consider Cloudflare Pro/Business plans for additional features and higher limits.

---

## 🆘 Support

For deployment issues:
- Cloudflare Community: https://community.cloudflare.com/
- Documentation: https://developers.cloudflare.com/pages/
- Discord: https://discord.gg/cloudflaredev

For City Experts website specific issues:
- Repository: https://github.com/reddomeuk/cityexperts-website
- Issues: Create GitHub issue for bugs/feature requests