// /api/upload.js — Cloudinary version with strict validation
import Busboy from "busboy";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";

const REQS = {
  hero:    { w:1920, h:1080, mb:2,   types:["image/jpeg","image/png","image/webp"] },
  gallery: { w:1600, h:1200, mb:1.5, types:["image/jpeg","image/png","image/webp"] },
  thumb:   { w:800,  h:600,  mb:0.5, types:["image/jpeg","image/png","image/webp"] },
  team:    { w:800,  h:800,  mb:1,   types:["image/jpeg","image/png","image/webp"] },
  logo:    { w:400,  h:200,  mb:0.2, types:["image/png","image/svg+xml","image/jpeg"] },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res){
  try{
    if (req.method !== "POST") return res.status(405).end();
    
    // Security checks
    if (!/session=/.test(req.headers.cookie || "")) {
      return res.status(401).json({ error:"unauthorized" });
    }
    if (!assertCsrf(req, res)) return;

    const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").toString();
    if (!rateLimit(`upload:${ip}`, 20, 60_000)) return res.status(429).json({ error: "rate_limited" });

    const { fields, file } = await readMultipart(req);
    if (!file) return res.status(400).json({ error: "no_file" });

    const cat = fields.category;
    const projectId = fields.projectId || "";
    const pageType = fields.page; // For page header uploads
    const rule = REQS[cat];
    if (!rule) return res.status(400).json({ error: "invalid_category" });
    if (!rule.types.includes(file.mimetype)) return res.status(400).json({ error: "invalid_type" });
    if (file.size > rule.mb * 1024 * 1024) return res.status(400).json({ error: "too_large" });

    // Validate dimensions; convert to WebP (except SVG/logo input)
    let outBuffer = file.buffer;
    let outFormat = "webp";
    if (file.mimetype !== "image/svg+xml"){
      const meta = await sharp(outBuffer).metadata();
      if (meta.width !== rule.w || meta.height !== rule.h){
        return res.status(400).json({ error: `invalid_dimensions_${meta.width}x${meta.height}` });
      }
      // Lossy WebP for everything except logos where we keep higher quality
      const quality = cat === "logo" ? 95 : 85;
      outBuffer = await sharp(outBuffer).webp({ quality }).toBuffer();
    } else {
      outFormat = "svg";
    }

    const folderRoot = (process.env.CLOUDINARY_BASE_FOLDER || "cityexperts").replace(/\/+$/,"");
    // Match the folder structure from migration: cityexperts/[category]/cityexperts/[category]
    const folder = `${folderRoot}/${cat}/${folderRoot}/${cat}`;
    
    const publicId = pageType 
      ? `${pageType}-hero`  // For page headers use consistent naming
      : projectId 
      ? `${Date.now()}-${sanitize(projectId)}-${sanitize(file.filename).replace(/\.[a-z0-9]+$/i,'')}`
      : `${Date.now()}-${sanitize(file.filename).replace(/\.[a-z0-9]+$/i,'')}`;

    // Wrap the stream call in a Promise
    function uploadBuffer(buf){
      return new Promise((resolve, reject)=>{
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite: false,
            format: outFormat,
            use_filename: true,
            unique_filename: false
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buf);
      });
    }
    const result = await uploadBuffer(outBuffer);

    // Build a cache-friendly URL (secure_url already has CDN caching)
    const url = result.secure_url;

    // If this is a page header upload, update headers.json
    if (pageType && cat === 'hero') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        
        const headersPath = path.join(process.cwd(), 'data', 'headers.json');
        let headersData = {};
        
        // Read existing headers.json or create new structure
        try {
          headersData = JSON.parse(fs.readFileSync(headersPath, 'utf8'));
        } catch (e) {
          headersData = { pages: {} };
        }
        
        // Map page names
        const pageMap = {
          'home': 'index',
          'about': 'about', 
          'services': 'services',
          'projects': 'projects'
        };
        
        const pageId = pageMap[pageType] || pageType;
        
        // Initialize page structure if it doesn't exist
        if (!headersData.pages[pageId]) {
          headersData.pages[pageId] = {
            id: pageId,
            name: pageType.charAt(0).toUpperCase() + pageType.slice(1),
            hasHero: true,
            media: {},
            seo: {}
          };
        }
        
        // Update the hero image data
        headersData.pages[pageId].media.hero = {
          url: url,
          public_id: result.public_id,
          alt: {
            en: `${headersData.pages[pageId].name} page header image`,
            ar: `صورة رأس صفحة ${headersData.pages[pageId].name}`
          },
          dimensions: {
            width: 1920,
            height: 1080
          },
          last_updated: new Date().toISOString(),
          updated_by: 'admin' // Could get from session
        };
        
        // Update SEO images
        headersData.pages[pageId].seo = {
          ogImage: url,
          twitterImage: url
        };
        
        // Write back to file
        fs.writeFileSync(headersPath, JSON.stringify(headersData, null, 2));
        
      } catch (headerError) {
        // Don't fail the upload, just log the error
      }
    }

    return res.status(200).json({ ok:true, url, public_id: result.public_id, bytes: result.bytes });
  } catch (e){
    return res.status(500).json({ error: "server_error" });
  }
}

// ---------- helpers ----------
function readMultipart(req){
  return new Promise((resolve, reject)=>{
    const bb = Busboy({ headers: req.headers });
    const fields = {}; let file;
    bb.on("field", (name, val)=> fields[name]=val);
    bb.on("file", (name, stream, info)=>{
      const chunks = []; let size = 0;
      stream.on("data",(c)=>{ chunks.push(c); size+=c.length; });
      stream.on("end", ()=> file = { ...info, buffer: Buffer.concat(chunks), size, mimetype: info.mimeType || info.mime || info.mimetype, filename: info.filename });
    });
    bb.on("error", reject);
    bb.on("finish", ()=> resolve({ fields, file }));
    req.pipe(bb);
  });
}
function sanitize(s=""){ return s.toLowerCase().replace(/[^a-z0-9.\-_]/g,"-").slice(0,80); }