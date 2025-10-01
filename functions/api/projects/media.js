import { assertCsrf } from "../_csrf.js";
import { rateLimit } from "../_rate.js";
import { getSession } from "../_session.js";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import Busboy from "busboy";

const REQS = {
  hero:    { w: 1920, h: 1080, mb: 2,   types: ["image/jpeg", "image/png", "image/webp"] },
  gallery: { w: 1600, h: 1200, mb: 1.5, types: ["image/jpeg", "image/png", "image/webp"] },
  thumb:   { w: 800,  h: 600,  mb: 0.5, types: ["image/jpeg", "image/png", "image/webp"] },
  video:   { maxMb: 100, types: ["video/mp4", "video/webm"] }
};

export default async function handler(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
  const sess = await getSession(req, res); 
  if (!sess?.email) return res.status(401).json({ error: "unauth" });
  if (!assertCsrf(req, res)) return;

  if (req.method === "POST") {
    if (!rateLimit(`projects:media:${ip}`, 20, 60_000)) {
      return res.status(429).json({ error: "rate_limited" });
    }

    const bus = Busboy({ headers: req.headers });
    let fileInfo = null, fields = {};
    
    bus.on("field", (name, val) => fields[name] = val);
    bus.on("file", (name, file, info) => {
      fileInfo = info; // { filename, mimeType }
      handleUpload(file, info, fields).then(out => {
        res.status(200).json({ ok: true, ...out });
      }).catch(err => {
        res.status(400).json({ error: err?.message || "upload_failed" });
      });
    });
    
    req.pipe(bus);
    return;
  }

  if (req.method === "DELETE") {
    if (!rateLimit(`projects:mediaDel:${ip}`, 10, 60_000)) {
      return res.status(429).json({ error: "rate_limited" });
    }
    
    const { public_id } = await getJson(req);
    if (!public_id) return res.status(400).json({ error: "public_id_required" });
    
    await cloudinary.uploader.destroy(public_id, { resource_type: "auto" });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}

async function handleUpload(stream, { filename, mimeType }, fields) {
  const kind = fields.kind; 
  const projectId = fields.projectId || "misc";
  
  if (!kind) throw new Error("kind_required");
  
  if (kind === "video") {
    if (!REQS.video.types.includes(mimeType)) throw new Error("invalid_type");
    
    const folder = `cityexperts/projects/${projectId}/video`;
    
    return await new Promise((resolve, reject) => {
      const up = cloudinary.uploader.upload_stream({ 
        resource_type: "video", 
        folder 
      }, (err, cld) => {
        if (err) return reject(err);
        resolve({ 
          url: cld.secure_url, 
          public_id: cld.public_id, 
          type: "video", 
          duration: cld.duration 
        });
      });
      stream.pipe(up);
    });
  } else {
    // buffer image to validate dims
    const buf = await streamToBuffer(stream);
    const dims = await sharp(buf).metadata();
    const req = REQS[kind]; 
    if (!req) throw new Error("invalid_kind");
    if (!req.types.includes(mimeType)) throw new Error("invalid_type");
    
    const maxBytes = req.mb * 1024 * 1024;
    if (buf.length > maxBytes) throw new Error("too_large");
    if (dims.width !== req.w || dims.height !== req.h) {
      throw new Error(`invalid_dimensions_${dims.width}x${dims.height}`);
    }

    const folder = `cityexperts/projects/${projectId}/${kind}`;
    
    return await new Promise((resolve, reject) => {
      const up = cloudinary.uploader.upload_stream({
        folder, 
        resource_type: "image", 
        format: "webp",
        transformation: [{ 
          quality: "auto:good", 
          fetch_format: "auto", 
          crop: "fill", 
          gravity: "auto" 
        }]
      }, (err, cld) => {
        if (err) return reject(err);
        resolve({ 
          url: cld.secure_url, 
          public_id: cld.public_id, 
          type: "image" 
        });
      });
      // write the validated buffer
      up.end(buf);
    });
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []; 
    stream.on("data", c => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function getJson(req) {
  const buf = await new Promise((res, rej) => { 
    let d = []; 
    req.on("data", c => d.push(c)); 
    req.on("end", () => res(Buffer.concat(d))); 
    req.on("error", rej); 
  });
  return JSON.parse(buf.toString("utf8"));
}