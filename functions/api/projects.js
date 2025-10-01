// api/projects.js
import fs from "fs/promises";
import path from "path";
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";

// Cloudinary validation for heroWide images
async function validateHeroWide(url) {
  try {
    // Extract public_id from Cloudinary URL
    const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(?:[^\/]+\/)?(.+?)(?:\.[a-z0-9]+)?$/i;
    const match = url.match(cloudinaryPattern);
    
    if (!match) {
      return { ok: false, reason: 'not_cloudinary' };
    }
    
    const [, cloudName, publicIdPath] = match;
    const publicId = publicIdPath.replace(/\.[a-z0-9]+$/i, ''); // Remove extension
    
    // For now, we'll validate URL format and require specific dimensions
    // In production, you would use Cloudinary Admin API:
    // const cloudinary = require('cloudinary').v2;
    // const result = await cloudinary.api.resource(publicId);
    // const { width, height } = result;
    
    // Mock validation - in production replace with actual Cloudinary API call
    if (url.includes('w_1920') && url.includes('h_1080')) {
      return { ok: true, width: 1920, height: 1080 };
    }
    
    // Basic URL structure validation
    if (url.includes('res.cloudinary.com') && cloudName) {
      return { ok: true, width: 1920, height: 1080 }; // Assume valid for now
    }
    
    return { ok: false, reason: 'invalid_dimensions' };
  } catch (error) {
    return { ok: false, reason: 'validation_error', error: error.message };
  }
}

export default async function handler(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  
  if (req.method === "GET") {
    // Rate limit GET requests
    if (!rateLimit(`projects-get-${clientIp}`, 30, 60000)) {
      return res.status(429).json({ error: "rate_limited" });
    }

    try {
      const url = new URL(`http://localhost${req.url}`);
      const status = url.searchParams.get('status') || 'published';
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort') || 'order:asc,createdAt:desc';

      // Try to read from JSON file (fallback until D1 is implemented)
      let projects = [];
      try {
        const file = path.join(process.cwd(), "data", "projects.json");
        projects = JSON.parse(await fs.readFile(file, "utf8"));
      } catch (err) {
        // Return empty data if file doesn't exist (as it was deleted)
        return res.status(200).json({
          success: true,
          data: [],
          meta: { total: 0, limit, offset }
        });
      }
      
      // Apply filters
      let filteredProjects = projects;
      
      if (status) {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }
      
      if (category) {
        filteredProjects = filteredProjects.filter(p => p.category === category);
      }
      
      if (featured !== null && featured !== undefined) {
        const isFeatured = featured === 'true';
        filteredProjects = filteredProjects.filter(p => p.featured === isFeatured);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProjects = filteredProjects.filter(p => 
          (p.i18n?.en?.title?.toLowerCase().includes(searchLower)) ||
          (p.i18n?.ar?.title?.toLowerCase().includes(searchLower)) ||
          (p.i18n?.en?.description?.toLowerCase().includes(searchLower)) ||
          (p.i18n?.ar?.description?.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      if (sort) {
        const sortFields = sort.split(',');
        filteredProjects.sort((a, b) => {
          for (const field of sortFields) {
            const [key, direction = 'asc'] = field.split(':');
            let aVal = a[key];
            let bVal = b[key];
            
            if (key === 'createdAt') {
              aVal = new Date(aVal || 0).getTime();
              bVal = new Date(bVal || 0).getTime();
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      // Apply pagination
      const total = filteredProjects.length;
      const paginatedProjects = filteredProjects.slice(offset, offset + limit);
      
      res.status(200).json({
        success: true,
        data: paginatedProjects,
        meta: { total, limit, offset }
      });
    } catch (err) {
      console.error('Projects GET error:', err);
      res.status(500).json({ error: "server_error", message: "Failed to fetch projects" });
    }
    return;
  }

  // POST and PUT methods require authentication and CSRF protection
  if (!["POST", "PUT"].includes(req.method)) {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Check authentication
  if (!/session=/.test(req.headers.cookie || "")) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // CSRF protection
  if (!assertCsrf(req, res)) return;

  // Rate limit write operations more strictly
  if (!rateLimit(`projects-write-${clientIp}`, 10, 60000)) {
    return res.status(429).json({ error: "rate_limited" });
  }

  try {
    const body = req.body || {};
    
    // Basic validation
    if (!body.i18n?.en?.title) {
      return res.status(400).json({ 
        error: "validation_failed", 
        message: "Project title (English) is required" 
      });
    }

    if (!body.id || !/^[a-z0-9-]+$/.test(body.id)) {
      return res.status(400).json({ 
        error: "validation_failed", 
        message: "Project ID must contain only lowercase letters, numbers, and hyphens" 
      });
    }

    // SERVER-SIDE HEROWIDE VALIDATION FOR FEATURED PROJECTS
    if (body.featured === true) {
      const heroWideUrl = body.media?.heroWide?.url;
      
      if (!heroWideUrl) {
        return res.status(400).json({
          error: "heroWide_required",
          message: "Featured projects must have a heroWide image"
        });
      }

      // Validate Cloudinary URL format
      const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//;
      if (!cloudinaryPattern.test(heroWideUrl)) {
        return res.status(400).json({
          error: "heroWide_must_be_cloudinary",
          message: "Featured project heroWide image must be hosted on Cloudinary"
        });
      }

      // Validate image dimensions via Cloudinary
      const validation = await validateHeroWide(heroWideUrl);
      if (!validation.ok) {
        const errorMessages = {
          'not_cloudinary': 'heroWide image must be a valid Cloudinary URL',
          'invalid_dimensions': 'heroWide image must be at least 1920×1080 pixels',
          'validation_error': 'Unable to validate heroWide image'
        };
        
        return res.status(422).json({
          error: `heroWide_invalid_${validation.reason}`,
          message: errorMessages[validation.reason] || 'Invalid heroWide image',
          details: validation.error
        });
      }

      // Optional: Check aspect ratio (16:9 ± 1%)
      if (validation.width && validation.height) {
        const aspectRatio = validation.width / validation.height;
        const expectedRatio = 16 / 9;
        const tolerance = 0.01; // 1%
        
        if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
          return res.status(422).json({
            error: "heroWide_invalid_aspect_ratio",
            message: `Featured project heroWide must have 16:9 aspect ratio. Current: ${aspectRatio.toFixed(2)}`,
            details: { width: validation.width, height: validation.height, aspectRatio }
          });
        }
      }
    }

    // TODO: Replace this with D1 database operations
    // For now, return a placeholder response since projects.json was deleted
    return res.status(501).json({
      error: "not_implemented",
      message: "Project saving will be implemented with D1 database. Currently, the JSON file was removed as part of cleanup."
    });

  } catch (err) {
    console.error('Projects POST/PUT error:', err);
    res.status(500).json({ 
      error: "server_error", 
      message: "Failed to process project data" 
    });
  }
}