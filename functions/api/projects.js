// functions/api/projects.js - Simple JSON-backed projects API
import fs from "fs/promises";
import path from "path";

// Debug headers
function addDebugHeaders(response, env) {
  response.headers.set("X-API-Version", "hotfix-20251001");
  response.headers.set("X-Env-Cloudinary", env.CLOUDINARY_CLOUD_NAME ? "true" : "false");
  response.headers.set("X-DB-Binding", env.DB ? "true" : "false");
  console.log("[DEBUG] Cloudinary:", !!env.CLOUDINARY_CLOUD_NAME, "DB:", !!env.DB);
  return response;
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const featured = url.searchParams.get('featured');
    const spotlight = url.searchParams.get('spotlight');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    console.log(`[DEBUG] Projects GET: status=${status}, featured=${featured}, spotlight=${spotlight}, limit=${limit}`);

    // Load projects from JSON
    let projects = [];
    try {
      // Try multiple possible paths for Cloudflare Pages
      let file = path.join(process.cwd(), "data", "projects.json");
      let data;
      
      try {
        data = await fs.readFile(file, "utf8");
      } catch (firstError) {
        // Try alternative path
        file = "./data/projects.json";
        data = await fs.readFile(file, "utf8");
      }
      
      projects = JSON.parse(data);
      console.log(`[DEBUG] Loaded ${projects.length} projects from ${file}`);
    } catch (err) {
      console.log('[DEBUG] No projects.json found:', err.message);
      const response = new Response(JSON.stringify({
        success: true,
        data: [],
        meta: { total: 0, limit, offset }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      return addDebugHeaders(response, env);
    }
    
    // Apply filters
    let filteredProjects = projects;
    
    if (status && status !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }
    
    if (featured === 'true') {
      filteredProjects = filteredProjects.filter(p => p.featured === true);
      console.log(`[DEBUG] Featured filter: ${filteredProjects.length} projects`);
      
      // Add heroWide from hero for existing data
      filteredProjects = filteredProjects.map(p => {
        if (!p.media?.heroWide?.url && p.media?.hero?.url) {
          p.media.heroWide = { ...p.media.hero };
        }
        return p;
      });
    }
    
    if (spotlight === 'true') {
      filteredProjects = filteredProjects.filter(p => p.spotlight === true);
      console.log(`[DEBUG] Spotlight filter: ${filteredProjects.length} projects`);
    }
    
    // Apply pagination
    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);
    
    console.log(`[DEBUG] Returning ${paginatedProjects.length}/${total} projects`);
    
    const response = new Response(JSON.stringify({
      success: true,
      data: paginatedProjects,
      meta: { total, limit, offset }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
    return addDebugHeaders(response, env);
    
  } catch (err) {
    console.error('[ERROR] Projects GET failed:', err);
    const response = new Response(JSON.stringify({ 
      error: "server_error", 
      message: "Failed to fetch projects" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
    return addDebugHeaders(response, env);
  }
}

export async function onRequestPost({ request, env }) {
  const response = new Response(JSON.stringify({
    error: "not_implemented",
    message: "Project creation pending D1 integration"
  }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
  return addDebugHeaders(response, env);
}

export async function onRequestPut({ request, env }) {
  const response = new Response(JSON.stringify({
    error: "not_implemented", 
    message: "Project updates pending D1 integration"
  }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
  return addDebugHeaders(response, env);
}
