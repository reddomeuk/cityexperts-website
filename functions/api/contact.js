// /functions/api/contact.js
// Cloudflare Workers compatible contact form handler

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Honeypot check
    if (body.company_site) {
      return new Response(null, { status: 204 });
    }

    const { name, email, phone, company, projectType, budget, city, message, recaptchaToken } = body;

    // Basic validation
    if (!name || !email || !phone || !projectType || !message) {
      return new Response(
        JSON.stringify({ error: "missing_required_fields" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // UAE phone validation
    const uaePhoneRegex = /^\+971\s?(?:[2-9]\d|5[0-9])(?:\s?\d{3}){2,3}$/;
    if (!uaePhoneRegex.test(phone.trim())) {
      return new Response(
        JSON.stringify({ error: "invalid_phone" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "invalid_email" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Optional: Verify reCAPTCHA
    if (env.RECAPTCHA_SECRET && recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(env.RECAPTCHA_SECRET, recaptchaToken);
      if (!recaptchaValid) {
        return new Response(
          JSON.stringify({ error: "recaptcha_failed" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // Send email using Cloudflare Email Workers or external service
    const emailSent = await sendContactEmail(env, {
      name,
      email,
      phone,
      company: company || "Not specified",
      projectType,
      budget: budget || "Not specified",
      city: city || "Not specified",
      message
    });

    if (!emailSent) {
      return new Response(
        JSON.stringify({ error: "email_send_failed" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Log to analytics (optional)
    if (env.ANALYTICS_ENDPOINT) {
      fetch(env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'contact_form_submission',
          projectType,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error); // Fire and forget
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Thank you for your inquiry. We'll get back to you within 24 hours."
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: "internal_server_error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Email sending function using external service (like EmailJS, SendGrid, or Mailgun)
async function sendContactEmail(env, data) {
  try {
    // Option 1: Using SendGrid API
    if (env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: env.CONTACT_EMAIL || 'info@cityexperts.ae' }],
            subject: `New Contact Form Submission - ${data.projectType}`
          }],
          from: { email: env.FROM_EMAIL || 'noreply@cityexperts.ae' },
          content: [{
            type: 'text/html',
            value: generateEmailHTML(data)
          }]
        })
      });
      return response.ok;
    }
    
    // Option 2: Using Mailgun API
    if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
      const formData = new FormData();
      formData.append('from', `City Experts Website <noreply@${env.MAILGUN_DOMAIN}>`);
      formData.append('to', env.CONTACT_EMAIL || 'info@cityexperts.ae');
      formData.append('subject', `New Contact Form Submission - ${data.projectType}`);
      formData.append('html', generateEmailHTML(data));

      const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`
        },
        body: formData
      });
      return response.ok;
    }

    // Option 3: Using EmailJS (client-side service, but can be used server-side)
    if (env.EMAILJS_SERVICE_ID && env.EMAILJS_TEMPLATE_ID && env.EMAILJS_PUBLIC_KEY) {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: env.EMAILJS_SERVICE_ID,
          template_id: env.EMAILJS_TEMPLATE_ID,
          user_id: env.EMAILJS_PUBLIC_KEY,
          template_params: data
        })
      });
      return response.ok;
    }

    console.error('No email service configured');
    return false;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Generate HTML email content
function generateEmailHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF8000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #111315; }
          .value { margin-left: 10px; }
          .footer { background: #111315; color: white; padding: 15px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>City Experts Website</p>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${data.phone}</span>
            </div>
            <div class="field">
              <span class="label">Company:</span>
              <span class="value">${data.company}</span>
            </div>
            <div class="field">
              <span class="label">Project Type:</span>
              <span class="value">${data.projectType}</span>
            </div>
            <div class="field">
              <span class="label">Budget:</span>
              <span class="value">${data.budget}</span>
            </div>
            <div class="field">
              <span class="label">City:</span>
              <span class="value">${data.city}</span>
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <div class="value" style="margin-top: 10px; padding: 15px; background: white; border-left: 4px solid #FF8000;">
                ${data.message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} City Experts. All rights reserved.</p>
            <p>Engineering Excellence. Interior Elegance.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// reCAPTCHA verification
async function verifyRecaptcha(secret, token) {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });
    const data = await response.json();
    return data.success && data.score > 0.5; // Adjust threshold as needed
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}