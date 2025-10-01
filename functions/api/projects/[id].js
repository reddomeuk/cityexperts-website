import fs from "node:fs/promises";
import path from "node:path";
import { ProjectZ, PartialProjectZ } from "../_schema-projects.js";
import DOMPurify from "isomorphic-dompurify";
import { assertCsrf } from "../_csrf.js";
import { rateLimit } from "../_rate.js";
import { getSession } from "../_session.js";

const DB = path.join(process.cwd(), "data", "projects.json");

async function readDB() { 
  return JSON.parse(await fs.readFile(DB, "utf8")); 
}

async function writeDB(data) { 
  const tmp = DB + ".tmp"; 
  await fs.writeFile(tmp, JSON.stringify(data, null, 2)); 
  await fs.rename(tmp, DB); 
}

export default async function handler(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
  const id = req.url.split("/").pop().split("?")[0]; // handle query params

  if (req.method === "GET") {
    const db = await readDB();
    const item = db.find(p => p.id === id && !p.deleted);
    return item ? res.status(200).json({ ok: true, item }) : res.status(404).json({ error: "not_found" });
  }

  const sess = await getSession(req, res); 
  if (!sess?.email) {
    return res.status(401).json({ error: "unauth" });
  }
  
  if (!assertCsrf(req, res)) return;

  if (req.method === "PUT" || req.method === "PATCH") {
    if (!rateLimit(`projects:update:${ip}`, 40, 60_000)) {
      return res.status(429).json({ error: "rate_limited" });
    }
    
    const body = await getJson(req);
    sanitizeBody(body);
    
    try {
      const db = await readDB();
      const idx = db.findIndex(p => p.id === id);
      if (idx < 0) return res.status(404).json({ error: "not_found" });
      
      // Validate hero image requirement for featured projects
      const dataToUpdate = req.method === "PUT" ? body : { ...db[idx], ...body };
      if (dataToUpdate.featured === true) {
        const heroUrl = dataToUpdate.media?.hero?.url;
        if (!heroUrl) {
          return res.status(400).json({ 
            error: "invalid_featured_without_hero", 
            message: "Featured projects require a hero image. Please upload a 1920×1080 hero image before setting featured=true." 
          });
        }
        
        // Basic validation that the hero URL exists (more detailed validation could be added)
        if (!heroUrl.includes('1920') || !heroUrl.includes('1080')) {
          return res.status(400).json({ 
            error: "invalid_featured_hero_size", 
            message: "Featured projects require a 1920×1080 hero image. Current hero image does not meet size requirements." 
          });
        }
      }
      
      const now = new Date().toISOString();

      if (req.method === "PUT") {
        const next = ProjectZ.parse(body);
        next.updatedAt = now; 
        next.updatedBy = sess.email;
        db[idx].history?.push({ at: now, by: sess.email, action: "put", prev: db[idx] });
        db[idx] = next;
      } else {
        const patch = PartialProjectZ.parse(body);
        db[idx] = { ...db[idx], ...patch, updatedAt: now, updatedBy: sess.email };
        db[idx].history?.push({ at: now, by: sess.email, action: "patch", patch });
      }
      
      await writeDB(db);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(400).json({ error: err?.message || "invalid" });
    }
  }

  if (req.method === "DELETE") {
    const db = await readDB();
    const item = db.find(p => p.id === id);
    if (!item) return res.status(404).json({ error: "not_found" });
    
    item.deleted = true; 
    item.updatedBy = sess.email; 
    item.updatedAt = new Date().toISOString();
    item.history?.push({ at: item.updatedAt, by: sess.email, action: "soft_delete" });
    
    await writeDB(db);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST" && req.url.includes("/restore")) {
    const db = await readDB();
    const item = db.find(p => p.id === id);
    if (!item) return res.status(404).json({ error: "not_found" });
    
    item.deleted = false; 
    item.updatedBy = sess.email; 
    item.updatedAt = new Date().toISOString();
    item.history?.push({ at: item.updatedAt, by: sess.email, action: "restore" });
    
    await writeDB(db);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST" && req.url.includes("/order")) {
    const db = await readDB();
    const item = db.find(p => p.id === id);
    if (!item) return res.status(404).json({ error: "not_found" });
    
    const { order } = await getJson(req);
    item.order = Number(order) || 0; 
    item.updatedBy = sess.email; 
    item.updatedAt = new Date().toISOString();
    item.history?.push({ at: item.updatedAt, by: sess.email, action: "order", value: item.order });
    
    await writeDB(db);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}

function sanitizeBody(b) {
  ["en", "ar"].forEach(l => {
    if (b.description?.[l]) {
      b.description[l] = DOMPurify.sanitize(b.description[l], { 
        ALLOWED_TAGS: ["b", "i", "strong", "em", "ul", "ol", "li", "p", "br", "a", "h3", "h4"], 
        ALLOWED_ATTR: ["href", "title", "target", "rel"] 
      });
    }
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