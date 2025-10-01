// functions/api/headers.js - Page headers API
import fs from "fs/promises";
import path from "path";

// Debug headers
function addDebugHeaders(response, env) {
  response.headers.set("X-API-Version", "hotfix-20251001");
  response.headers.set("X-Env-Cloudinary", env.CLOUDINARY_CLOUD_NAME ? "true" : "false");
  console.log("[DEBUG] Headers API - Cloudinary:", !!env.CLOUDINARY_CLOUD_NAME);
  return response;
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');

    console.log(`[DEBUG] Headers GET: page=${page}`);

    // Load headers from JSON
    let headers = {};
    try {
      const file = path.join(process.cwd(), "data", "headers.json");
      const data = await fs.readFile(file, "utf8");
      headers = JSON.parse(data);
      console.log(`[DEBUG] Loaded headers for ${Object.keys(headers.pages || {}).length} pages`);
    } catch (err) {
      console.log('[DEBUG] No headers.json found');
      const response = new Response(JSON.stringify({
        success: true,
        data: {}
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      return addDebugHeaders(response, env);
    }
    
    let result = headers.pages || {};
    
    // If specific page requested, return just that page
    if (page && result[page]) {
      result = result[page];
    }
    
    console.log(`[DEBUG] Returning headers data`);
    
    const response = new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
    return addDebugHeaders(response, env);
    
  } catch (err) {
    console.error('[ERROR] Headers GET failed:', err);
    const response = new Response(JSON.stringify({ 
      error: "server_error", 
      message: "Failed to fetch headers" 
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
    message: "Headers updates pending implementation"
  }), {
    status: 501,
    headers: { "Content-Type": "application/json" }
  });
  return addDebugHeaders(response, env);
}
