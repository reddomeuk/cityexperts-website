// /api/contact.js
import nodemailer from "nodemailer";

export async function post(req, res) {
  try {
    const body = await readJson(req);
    // Basic sanity & honeypot
    if (!body || body.company_site) return res.status(204).end();

    const { name, email, phone, company, projectType, budget, city, message, recaptchaToken } = body;

    // Basic validation
    if (!name || !email || !phone || !projectType || !message) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    // UAE phone validation server-side
    const uaePhoneRegex = /^\+971\s?(?:[2-9]\d|5[0-9])(?:\s?\d{3}){2,3}$/;
    if (!uaePhoneRegex.test(phone.trim())) {
      return res.status(400).json({ error: "invalid_phone" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "invalid_email" });
    }

    // Optional: validate reCAPTCHA v3
    if (process.env.RECAPTCHA_SECRET && recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(process.env.RECAPTCHA_SECRET, recaptchaToken);
      if (!recaptchaValid) {
        return res.status(400).json({ error: "recaptcha_failed" });
      }
    }

    // Configure email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify transporter configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({ error: "email_configuration_error" });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF8000, #0F8B8D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Request</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">City Experts Website</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="color: #111315; margin-top: 0; border-bottom: 2px solid #FF8000; padding-bottom: 10px;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name:</td>
              <td style="padding: 8px 0; color: #111315;">${escape(name)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 8px 0; color: #111315;"><a href="mailto:${escape(email)}" style="color: #0F8B8D;">${escape(email)}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
              <td style="padding: 8px 0; color: #111315;"><a href="tel:${escape(phone)}" style="color: #0F8B8D;">${escape(phone)}</a></td>
            </tr>
            ${company ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Company:</td>
              <td style="padding: 8px 0; color: #111315;">${escape(company)}</td>
            </tr>
            ` : ''}
          </table>

          <h2 style="color: #111315; margin-top: 30px; border-bottom: 2px solid #0F8B8D; padding-bottom: 10px;">Project Information</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Type:</td>
              <td style="padding: 8px 0; color: #111315;">${escape(projectType)}</td>
            </tr>
            ${budget ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Budget:</td>
              <td style="padding: 8px 0; color: #111315;">${escape(budget)} AED</td>
            </tr>
            ` : ''}
            ${city ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; font-weight: bold; color: #555;">City:</td>
              <td style="padding: 8px 0; color: #111315;">${escape(city)}</td>
            </tr>
            ` : ''}
          </table>

          <h2 style="color: #111315; margin-top: 30px; border-bottom: 2px solid #FF8000; padding-bottom: 10px;">Project Brief</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #FF8000;">
            <p style="margin: 0; line-height: 1.6; color: #111315; white-space: pre-line;">${escape(message)}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; border: 1px solid #0F8B8D;">
            <p style="margin: 0; color: #0F8B8D; font-weight: bold;">📧 Response required within 1 business day</p>
            <p style="margin: 5px 0 0; color: #555; font-size: 14px;">Submitted on ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })} UAE time</p>
          </div>
        </div>
      </div>
    `;

    const plainText = `
New Contact Request - City Experts Website

CONTACT DETAILS:
Name: ${name}
Email: ${email}
Phone: ${phone}
${company ? `Company: ${company}` : ''}

PROJECT INFORMATION:
Type: ${projectType}
${budget ? `Budget: ${budget} AED` : ''}
${city ? `City: ${city}` : ''}

PROJECT BRIEF:
${message}

---
Submitted on ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })} UAE time
Response required within 1 business day
    `;

    await transporter.sendMail({
      from: `"City Experts Website" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      subject: `🏗️ New enquiry: ${projectType} — ${name}`,
      html,
      text: plainText,
      replyTo: email
    });

    console.log(`✅ Contact form submitted by ${name} (${email}) for ${projectType}`);
    res.status(200).json({ success: true, message: "Message sent successfully" });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: "server_error", message: "Failed to send message" });
  }
}

// ---- Helper Functions ----

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ""; 
    req.on("data", (chunk) => data += chunk);
    req.on("end", () => { 
      try { 
        resolve(JSON.parse(data || "{}")); 
      } catch (e) { 
        reject(e); 
      }
    });
    req.on("error", reject);
  });
}

function escape(str = "") {
  return String(str).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char];
  });
}

async function verifyRecaptcha(secret, token) {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token })
    });
    
    const result = await response.json();
    return result.success && (result.score ?? 0) > 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}