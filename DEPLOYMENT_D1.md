# Cloudflare Pages Configuration
# Production deployment setup for City Experts

## Environment Variables (Set in Pages Dashboard: Settings → Environment Variables)

### Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dmawj7tmu
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here (encrypt this!)

### Database Configuration  
# D1 database will be bound as "DB" in the Pages dashboard

## Build Configuration

### Build Command
npm run build

### Build Output Directory
dist

### Node.js Version
18

## Functions Configuration

### Compatibility Date
2023-10-30

### D1 Database Binding
# In Pages Dashboard:
# 1. Go to Settings → Functions
# 2. Add D1 database binding:
#    - Variable name: DB
#    - D1 database: city-experts-db

## Security Headers (_headers file)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' https://res.cloudinary.com data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.cloudinary.com; frame-ancestors 'none'; base-uri 'self'

## Deployment Steps

1. **Setup D1 Database:**
   ```bash
   # Create database
   npx wrangler d1 create city-experts-db
   
   # Apply schema
   npx wrangler d1 execute city-experts-db --file=schema.sql
   
   # Verify setup
   npx wrangler d1 execute city-experts-db --command="SELECT COUNT(*) FROM projects"
   ```

2. **Configure Pages Project:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set build output directory: `dist`
   - Set Node.js version: 18

3. **Add Environment Variables:**
   ```
   CLOUDINARY_CLOUD_NAME=dmawj7tmu
   CLOUDINARY_API_KEY=[your-api-key]
   CLOUDINARY_API_SECRET=[your-api-secret] (encrypted)
   ```

4. **Bind D1 Database:**
   - Go to Settings → Functions
   - Add D1 database binding:
     - Variable name: DB
     - D1 database: city-experts-db

5. **Deploy and Test:**
   ```bash
   # Test endpoints
   curl https://your-site.pages.dev/api/projects?status=published&limit=5
   curl https://your-site.pages.dev/api/projects?featured=true&status=published
   ```

6. **Migrate Data (Optional):**
   ```bash
   # Set environment variables for migration script
   export CLOUDINARY_CLOUD_NAME=dmawj7tmu
   export CLOUDINARY_API_KEY=your_api_key
   export CLOUDINARY_API_SECRET=your_api_secret
   export D1_API_ENDPOINT=https://your-site.pages.dev/api/projects
   export ADMIN_SESSION_TOKEN=your_admin_session_token
   
   # Run migration
   node scripts/backfill-cloudinary-to-d1.js
   ```

## Post-Deployment Checklist

- [ ] D1 database is accessible
- [ ] Environment variables are set correctly
- [ ] API endpoints return data
- [ ] Featured projects carousel loads 6 items
- [ ] Projects page displays all published projects
- [ ] Admin panel can save projects
- [ ] Cloudinary images load correctly
- [ ] CSP headers allow Cloudinary domain
- [ ] Cache invalidation works after deployments

## Monitoring & Maintenance

### Performance
- Monitor Core Web Vitals in Cloudflare Analytics
- Check image loading times from Cloudinary
- Monitor D1 query performance

### Security
- Regular rotation of Cloudinary API keys
- Monitor for unauthorized API access
- Review CSP violations in browser console

### Database
- Monitor D1 storage usage
- Regular backups via wrangler d1 export
- Monitor query performance and optimize indexes

## Troubleshooting

### Common Issues

1. **D1 Database Not Found**
   - Verify database binding in Pages Functions settings
   - Check database name matches in wrangler.toml

2. **Cloudinary Validation Errors**
   - Verify API credentials are correct
   - Check image URLs match expected format
   - Ensure images meet minimum size requirements (1920×1080 for heroWide)

3. **CSRF Token Errors**
   - Verify admin session token is valid
   - Check CSRF token extraction logic
   - Ensure session cookie is properly set

4. **Rate Limiting**
   - Check rate limit settings in _rate.js
   - Monitor excessive API calls
   - Implement client-side caching if needed

### Useful Commands

```bash
# Check D1 database status
npx wrangler d1 execute city-experts-db --command="SELECT COUNT(*) FROM projects"

# Export D1 data for backup
npx wrangler d1 export city-experts-db --output=backup.sql

# View D1 database contents
npx wrangler d1 execute city-experts-db --command="SELECT id, status, featured FROM projects LIMIT 10"

# Test Cloudinary connection
curl "https://api.cloudinary.com/v1_1/dmawj7tmu/resources/image?prefix=cityexperts/projects"
```