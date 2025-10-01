// /api/logout.js
import { serialize } from "cookie";

export default function handler(req, res){
  if (req.method !== "POST") return res.status(405).end();
  
  // Clear session cookie
  const isProd = process.env.NODE_ENV === "production";
  const cookie = serialize("session", "", {
    httpOnly: true, 
    sameSite: "lax", 
    secure: isProd, 
    path: "/", 
    maxAge: 0
  });
  
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true, message: "Logged out successfully" });
}