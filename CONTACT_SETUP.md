# City Experts Website - Contact System Setup

## 🎯 Contact Flow Implementation

This implementation provides a robust contact form with validation, spam protection, and email relay functionality.

## 📁 Files Added/Modified

### Frontend Files
- **`src/contact.html`** - Complete contact form with accessibility and RTL support
- **`src/js/main.js`** - Client-side validation, spam protection, and form submission
- **`src/styles/main.css`** - Input styles with focus states and validation feedback

### Backend Files
- **`api/contact.js`** - Serverless email relay with nodemailer
- **`.env.example`** - Environment variables template
- **`.env`** - Local development environment (configure with your SMTP details)

### Enhanced Features
- **About/Projects pages** - Already contain contact CTAs (confirmed existing)
- **SEO improvements** - Added robots meta tags to all pages
- **Accessibility** - aria-invalid support and keyboard navigation
- **Projects filtering** - URL persistence with `?sector=commercial` support

## 🚀 Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure your SMTP settings:

```bash
cp .env.example .env
```

**For Gmail SMTP:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
MAIL_FROM=web@cityexperts.ae
MAIL_TO=sales@cityexperts.ae
```

> **Note:** For Gmail, enable 2FA and generate an App Password instead of using your regular password.

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

The contact form will be available at `http://localhost:3000/contact.html`

## 🌐 Deployment Options

### Option A: Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. The `/api/contact.js` will automatically work as a serverless function

### Option B: Netlify
1. Rename `/api/contact.js` to `/netlify/functions/contact.js`
2. Update the fetch URL in `main.js` to `/.netlify/functions/contact`
3. Deploy to Netlify with environment variables

### Option C: Traditional Hosting + External Form Service
If serverless functions aren't available, use a service like:
- Formspark (https://formspark.io)
- Basin (https://usebasin.com)
- Formspree (https://formspree.io)

Simply update the fetch URL in `main.js` to the service endpoint.

## ✅ QA Checklist

### Form Validation
- [x] Required fields validation
- [x] UAE phone number validation (`+971 5x xxx xxxx`)
- [x] Email format validation
- [x] Consent checkbox requirement
- [x] Real-time validation feedback
- [x] Submit button disabled until valid

### Spam Protection
- [x] Honeypot field (hidden `company_site`)
- [x] Server-side validation
- [x] Optional reCAPTCHA v3 support
- [x] Rate limiting ready (server-side)

### Accessibility
- [x] Proper ARIA labels and states
- [x] Keyboard navigation support
- [x] Screen reader announcements
- [x] Focus management
- [x] Error messaging with `aria-live`

### User Experience
- [x] Loading states ("Sending...")
- [x] Success/error feedback
- [x] Form reset after success
- [x] WhatsApp fallback option
- [x] Responsive design

### Email Features
- [x] Professional HTML email template
- [x] Plain text fallback
- [x] All form fields included
- [x] Reply-to set to user's email
- [x] UAE timezone timestamps
- [x] Proper error handling

## 🎨 Features Implemented

### 1. Contact Form
- ✅ Accessible, RTL-ready markup
- ✅ Honeypot spam protection
- ✅ UAE phone validation
- ✅ Real-time feedback
- ✅ Professional styling

### 2. Backend API
- ✅ Nodemailer integration
- ✅ Input validation & sanitization
- ✅ Beautiful HTML email templates
- ✅ Error handling & logging
- ✅ Optional reCAPTCHA support

### 3. Polish Features
- ✅ SEO meta tags on all pages
- ✅ Projects filter URL persistence
- ✅ Lazy loading (already implemented)
- ✅ Accessibility enhancements
- ✅ Contact CTAs on About/Projects

### 4. Integration
- ✅ Vite module system maintained
- ✅ Existing design system integration
- ✅ No modifications to index.html
- ✅ Consistent header/navigation
- ✅ Professional error handling

## 🧪 Testing

### Manual Testing
1. Visit `/contact.html`
2. Try invalid phone numbers
3. Test without consent checkbox
4. Submit valid form
5. Check email delivery
6. Test honeypot (inspect element, fill hidden field)

### Filter Persistence Testing
1. Visit `/projects.html`
2. Click filter buttons
3. Check URL updates (`?sector=commercial`)
4. Refresh page - filter should persist

## 📧 Email Configuration

The system supports any SMTP provider:

- **Gmail** - Use App Password with 2FA
- **SendGrid** - SMTP relay
- **AWS SES** - SMTP interface
- **Mailgun** - SMTP sending
- **Custom SMTP** - Any provider

## 🔒 Security Features

- Server-side input validation
- HTML escaping in emails
- Honeypot spam detection
- Optional reCAPTCHA v3
- Environment variable protection
- Request sanitization

## 📱 Mobile & Accessibility

- Responsive form layout
- Touch-friendly inputs
- Proper input types (`tel`, `email`)
- Screen reader support
- High contrast focus states
- RTL language support

The contact system is now ready for production use! 🚀