// /api/login.js
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";
import { loginSchema, validateRequest } from "./_schemas.js";

export default async function handler(req, res){
  if (req.method !== "POST") return res.status(405).end();
  
  // Skip rate limiting in development
  if (process.env.NODE_ENV !== "production") {
    // Development mode - allow unlimited attempts
  } else {
    const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString();
    if (!rateLimit(`login:${ip}`, 5, 60_000)) return res.status(429).json({ error: "rate_limited" });
  }
  // Skip CSRF check for login - we don't have a session cookie yet
  
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "invalid_json" });
  }
  
  // Validate input using Zod schema
  const validation = validateRequest(loginSchema, body);
  if (!validation.success) {
    return res.status(400).json({
      error: "validation_failed",
      message: validation.error,
      details: validation.details
    });
  }
  
  const { email, password } = validation.data;

  // Check against environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cityexperts.ae";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  if (email !== adminEmail) {
    return res.status(401).json({ error: "invalid_credentials" });
  }
  
  // Verify password against bcrypt hash
  let ok = false;
  if (adminPasswordHash) {
    try {
      ok = await bcrypt.compare(password, adminPasswordHash);
    } catch (err) {
      return res.status(500).json({ error: "auth_error" });
    }
  } else {
    // Fallback for development - remove this in production
    ok = password === "TestPassword123";
  }
  
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const value = Buffer.from(JSON.stringify({ sub: email, iat: Date.now() }), "utf8").toString("base64url");

  const isProd = process.env.NODE_ENV === "production";
  const cookie = serialize("session", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,          // 🔑 Secure only in prod; localhost needs false
    path: "/",
    maxAge: 60 * 60 * 8      // 8h
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}