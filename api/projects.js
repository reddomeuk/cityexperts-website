// api/projects.js
import fs from "fs/promises";
import path from "path";
import { assertCsrf } from "./_csrf.js";

export default async function handler(req, res){
  if (req.method === "GET") {
    // Get all projects
    try {
      const file = path.join(process.cwd(), "data", "projects.json");
      const json = JSON.parse(await fs.readFile(file, "utf8"));
      res.status(200).json(json);
    } catch (err) {
      res.status(500).json({ error: "read_failed" });
    }
    return;
  }

  if (req.method !== "PUT") return res.status(405).end();
  if (!/session=/.test(req.headers.cookie || "")) return res.status(401).json({ error:"unauthorized" });
  if (!assertCsrf(req, res)) return;

  const { projectId, slot, url, public_id, alt } = req.body || {};
  if (!projectId || !slot || !url || !public_id) return res.status(400).json({ error: "missing_fields" });

  try {
    const file = path.join(process.cwd(), "data", "projects.json");
    const json = JSON.parse(await fs.readFile(file, "utf8"));
    const p = json.find(x => x.id === projectId);
    if (!p) return res.status(404).json({ error: "project_not_found" });

    if (slot === "hero" || slot === "thumb") {
      p[slot] = { url, public_id, alt: alt || p[slot]?.alt || "" };
    } else if (slot === "gallery") {
      p.gallery = p.gallery || [];
      p.gallery.push({ url, public_id, alt: alt || "" });
    } else {
      return res.status(400).json({ error: "invalid_slot" });
    }

    await fs.writeFile(file, JSON.stringify(json, null, 2));
    res.status(200).json({ ok: true, project: p });
  } catch (err) {
    res.status(500).json({ error: "write_failed" });
  }
}