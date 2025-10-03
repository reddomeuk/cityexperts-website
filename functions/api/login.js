// functions/api/login.js - Cloudflare Pages format
import bcrypt from "bcryptjs";

// Rate limiting helper
const rateLimit = (key, limit, windowMs) => {
  // Simple rate limiting for demo - in production use KV or D1
  return true; // Allow for now
};

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        error: "validation_failed",
        message: "Email and password are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check against environment variables
    const adminEmail = env.ADMIN_EMAIL || "admin@cityexperts.ae";
    const adminPasswordHash = env.ADMIN_PASSWORD_HASH;
    
    console.log(`[DEBUG] Login attempt for: ${email}`);
    console.log(`[DEBUG] Expected admin email: ${adminEmail}`);
    console.log(`[DEBUG] Has password hash: ${!!adminPasswordHash}`);
    
    if (email !== adminEmail) {
      return new Response(JSON.stringify({ 
        error: "invalid_credentials",
        message: "Invalid email or password"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Verify password
    let ok = false;
    if (adminPasswordHash) {
      try {
        ok = await bcrypt.compare(password, adminPasswordHash);
      } catch (err) {
        console.error('[ERROR] Password comparison failed:', err);
        return new Response(JSON.stringify({ 
          error: "auth_error",
          message: "Authentication system error"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      // Fallback for development - remove this in production
      console.log('[DEBUG] Using fallback password check');
      ok = password === "TestPassword123";
    }
    
    if (!ok) {
      return new Response(JSON.stringify({ 
        error: "invalid_credentials",
        message: "Invalid email or password"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create session token
    const sessionData = {
      sub: email,
      iat: Date.now(),
      exp: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
    };
    
    const sessionToken = btoa(JSON.stringify(sessionData));
    
    // Set cookie
    const isProd = env.ENVIRONMENT === "production";
    const cookie = `session=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${8 * 60 * 60}${isProd ? '; Secure' : ''}`;

    return new Response(JSON.stringify({ 
      ok: true,
      message: "Login successful"
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    });
    
  } catch (err) {
    console.error('[ERROR] Login failed:', err);
    return new Response(JSON.stringify({ 
      error: "server_error",
      message: "Login system error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}