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
    const page = url.searchParams.get('page') || 'index';
    
    console.log(`[DEBUG] Headers GET: page=${page}`);
    
    // Load headers from JSON using dynamic import
    let headers = {};
    try {
      const headersModule = await import('../../data/headers.json', { assert: { type: 'json' } });
      headers = headersModule.default || headersModule;
      console.log(`[DEBUG] Loaded headers via dynamic import`);
    } catch (importError) {
      console.log(`[DEBUG] Headers import failed: ${importError.message}`);
      headers = {};
    }
    
    const pageHeader = headers[page] || null;
    
    const response = new Response(JSON.stringify({
      success: true,
      data: pageHeader
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
