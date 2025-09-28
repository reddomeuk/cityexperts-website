// /api/login.js
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";

export default async function handler(req, res){
  if (req.method !== "POST") return res.status(405).end();
  
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString();
  if (!rateLimit(`login:${ip}`, 5, 60_000)) return res.status(429).json({ error: "rate_limited" });
  // Skip CSRF check for login - we don't have a session cookie yet
  
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "invalid_json" });
  }
  
  const { email, password } = body || {};
  if (!email || !password) return res.status(400).json({ error: "missing_credentials" });

  // Simple test - bypass bcrypt for debugging
  const ok = email === "admin@cityexperts.ae" && password === "TestPassword123";
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