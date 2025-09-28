// /api/delete.js
import { v2 as cloudinary } from "cloudinary";
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(req, res){
  if (req.method !== "POST") return res.status(405).end();
  
  // Security checks
  if (!/session=/.test(req.headers.cookie || "")) {
    return res.status(401).json({ error:"unauthorized" });
  }
  if (!assertCsrf(req, res)) return;

  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString();
  if (!rateLimit(`delete:${ip}`, 10, 60_000)) return res.status(429).json({ error: "rate_limited" });
  
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "invalid_json" });
  }
  
  const { public_id } = body || {};
  if (!public_id) return res.status(400).json({ error:"missing_public_id" });
  
  try{
    const r = await cloudinary.uploader.destroy(public_id, { resource_type:"image" });
    return res.status(200).json({ ok:true, result:r });
  }catch(e){
    console.error("Delete error:", e); 
    return res.status(500).json({ error:"server_error" });
  }
}