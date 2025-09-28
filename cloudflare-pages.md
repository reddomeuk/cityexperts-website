# Cloudflare Pages Build Configuration

## Build Settings
- **Build command**: `npm run build:cf`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node.js version**: `18` or `20`

## Environment Variables

### Required for Production
```
ENVIRONMENT=production
CONTACT_EMAIL=info@cityexperts.ae
FROM_EMAIL=noreply@cityexperts.ae
```

### Email Service Configuration (Choose one)

#### Option 1: SendGrid
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### Option 2: Mailgun
```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

#### Option 3: EmailJS
```
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Optional Services
```
RECAPTCHA_SECRET=your_recaptcha_secret_key
ANALYTICS_ENDPOINT=your_analytics_endpoint
```

## Build Process

1. **Vite Build**: Builds the static site
2. **Copy Routes**: Copies `_routes.json` for function routing
3. **Copy Functions**: Copies Cloudflare Pages Functions

## Functions

Located in `/functions/api/`:
- `contact.js` - Contact form submission
- `projects.js` - Projects API endpoint

## Routing

Static files are served directly from the build output.
API routes (`/api/*`) are handled by Cloudflare Pages Functions.