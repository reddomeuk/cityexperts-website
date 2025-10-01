import fs from "node:fs/promises";
import path from "node:path";
import { ProjectZ } from "../_schema-projects.js";
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

  if (req.method === "GET") {
    const q = new URL(req.url, "http://x").searchParams;
    const featured = q.get("featured") === "1";
    const status = q.get("status");
    const locale = q.get("locale") || "en";

    const items = (await readDB())
      .filter(p => !p.deleted)
      .filter(p => !status || p.status === status)
      .filter(p => !featured || p.featured)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Localize text fields
    const localized = items.map(p => ({
      ...p,
      title: p.title?.[locale] || p.title?.en,
      excerpt: p.excerpt?.[locale] || p.excerpt?.en,
      description: undefined, // omit large body for list
      hero: p.hero, 
      thumb: p.thumb, 
      gallery: p.gallery, 
      videos: p.videos
    }));

    const meta = {
      total: localized.length,
      featured,
      status,
      locale
    };

    res.setHeader("Cache-Control", "max-age=60, stale-while-revalidate=600");
    return res.status(200).json({
      success: true,
      ok: true,
      data: localized,
      items: localized,
      meta
    });
  }

  if (req.method === "POST") {
    if (!rateLimit(`projects:create:${ip}`, 10, 60_000)) {
      return res.status(429).json({ error: "rate_limited" });
    }
    
    const sess = await getSession(req, res); 
    if (!sess?.email) {
      return res.status(401).json({ error: "unauth" });
    }
    
    if (!assertCsrf(req, res)) return;

    try {
      const body = await getJson(req);
      sanitizeBody(body);
      const proj = ProjectZ.parse(body);
      
      // Validate featured project requirements
      if (proj.featured) {
        if (!proj.hero?.url) {
          return res.status(422).json({ 
            error: "missing_hero_for_featured",
            message: "Featured projects require a valid hero image" 
          });
        }
        
        // Check if hero image is from Cloudinary and has proper dimensions
        if (!proj.hero.url.includes('res.cloudinary.com')) {
          return res.status(422).json({ 
            error: "invalid_hero_source",
            message: "Hero image must be hosted on Cloudinary" 
          });
        }
        
        // Check dimensions (should be 1920x1080 or larger)
        if (proj.hero.w && proj.hero.h && (proj.hero.w < 1920 || proj.hero.h < 1080)) {
          return res.status(422).json({ 
            error: "invalid_hero_dimensions",
            message: "Featured projects require hero images with minimum dimensions of 1920x1080" 
          });
        }
      }
      
      const db = await readDB();
      
      if (db.some(p => p.id === proj.id)) {
        return res.status(409).json({ error: "id_exists" });
      }
      
      const now = new Date().toISOString();
      proj.updatedAt = now; 
      proj.updatedBy = sess.email; 
      proj.history = [];
      
      db.push(proj);
      await writeDB(db);
      
      return res.status(201).json({ ok: true, id: proj.id });
    } catch (err) {
      return res.status(400).json({ error: err?.message || "invalid" });
    }
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
