// functions/api/projects-d1.js
// D1-backed version of projects API for Cloudflare Pages
import { assertCsrf } from "./_csrf.js";
import { rateLimit } from "./_rate.js";

// Cloudinary validation for heroWide images
async function validateHeroWide(url, env) {
  try {
    // Extract public_id from Cloudinary URL
    const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(?:[^\/]+\/)?(.+?)(?:\.[a-z0-9]+)?$/i;
    const match = url.match(cloudinaryPattern);
    
    if (!match) {
      return { ok: false, reason: 'not_cloudinary' };
    }
    
    const [, cloudName, publicIdPath] = match;
    
    // Validate against expected cloud name
    if (env.CLOUDINARY_CLOUD_NAME && cloudName !== env.CLOUDINARY_CLOUD_NAME) {
      return { ok: false, reason: 'wrong_cloud' };
    }
    
    const publicId = publicIdPath.replace(/\.[a-z0-9]+$/i, ''); // Remove extension
    
    // In production with Cloudinary Admin API:
    if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      try {
        const cloudinary = await import('cloudinary');
        cloudinary.v2.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET
        });
        
        const result = await cloudinary.v2.api.resource(publicId);
        const { width, height } = result;
        
        if (width >= 1920 && height >= 1080) {
          // Check aspect ratio (16:9 ± 1%)
          const aspectRatio = width / height;
          const expectedRatio = 16 / 9;
          const tolerance = 0.01;
          
          if (Math.abs(aspectRatio - expectedRatio) <= tolerance) {
            return { ok: true, width, height };
          } else {
            return { ok: false, reason: 'invalid_aspect_ratio', width, height, aspectRatio };
          }
        } else {
          return { ok: false, reason: 'too_small', width, height };
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary API error:', cloudinaryError);
        return { ok: false, reason: 'cloudinary_api_error', error: cloudinaryError.message };
      }
    }
    
    // Fallback validation for development
    return { ok: true, width: 1920, height: 1080 };
    
  } catch (error) {
    return { ok: false, reason: 'validation_error', error: error.message };
  }
}

// Helper to build project object from D1 rows
function buildProjectFromRows(rows) {
  if (!rows.length) return null;
  
  const project = {
    id: rows[0].id,
    status: rows[0].status,
    category: rows[0].category,
    city: rows[0].city,
    client: rows[0].client,
    featured: Boolean(rows[0].featured),
    order: rows[0].order_index,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
    i18n: {},
    media: {}
  };
  
  // Group by language and media type
  for (const row of rows) {
    // Add i18n content
    if (row.lang && row.title) {
      project.i18n[row.lang] = {
        title: row.title,
        excerpt: row.excerpt,
        description: row.description
      };
    }
    
    // Add media
    if (row.media_kind && row.media_url) {
      const mediaItem = {
        url: row.media_url,
        public_id: row.media_public_id,
        alt: {
          en: row.alt_en,
          ar: row.alt_ar
        },
        width: row.media_width,
        height: row.media_height
      };
      
      if (row.media_kind === 'gallery') {
        if (!project.media.gallery) project.media.gallery = [];
        project.media.gallery.push(mediaItem);
      } else {
        project.media[row.media_kind] = mediaItem;
      }
    }
  }
  
  return project;
}

export async function onRequestGet({ request, env }) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Rate limit GET requests
  if (!rateLimit(`projects-get-${clientIp}`, 30, 60000)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'published';
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'order:asc,createdAt:desc';

    // Build query
    let query = `
      SELECT 
        p.id, p.status, p.category, p.city, p.client, p.featured, p.order_index, p.created_at, p.updated_at,
        i.lang, i.title, i.excerpt, i.description,
        m.kind as media_kind, m.url as media_url, m.public_id as media_public_id,
        m.alt_en, m.alt_ar, m.width as media_width, m.height as media_height, m.idx as media_idx
      FROM projects p
      LEFT JOIN project_i18n i ON i.project_id = p.id
      LEFT JOIN project_media m ON m.project_id = p.id
      WHERE p.status = ?1
    `;
    
    const params = [status];
    let paramCount = 1;
    
    if (category) {
      paramCount++;
      query += ` AND p.category = ?${paramCount}`;
      params.push(category);
    }
    
    if (featured !== null && featured !== undefined) {
      paramCount++;
      const isFeatured = featured === 'true' ? 1 : 0;
      query += ` AND p.featured = ?${paramCount}`;
      params.push(isFeatured);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (i.title LIKE ?${paramCount} OR i.description LIKE ?${paramCount})`;
      params.push(`%${search}%`);
    }
    
    // Apply sorting
    if (sort.includes('order')) {
      query += ` ORDER BY p.order_index ASC, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }
    
    query += ` LIMIT ?${paramCount + 1} OFFSET ?${paramCount + 2}`;
    params.push(limit, offset);
    
    const stmt = env.DB.prepare(query);
    const result = await stmt.bind(...params).all();
    
    // Group rows by project
    const projectsMap = new Map();
    for (const row of result.results) {
      if (!projectsMap.has(row.id)) {
        projectsMap.set(row.id, []);
      }
      projectsMap.get(row.id).push(row);
    }
    
    const projects = Array.from(projectsMap.values()).map(buildProjectFromRows).filter(Boolean);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM projects p WHERE p.status = ?1`;
    const countParams = [status];
    if (category) {
      countQuery += ` AND p.category = ?2`;
      countParams.push(category);
    }
    if (featured !== null && featured !== undefined) {
      const featuredParam = featured === 'true' ? 1 : 0;
      countQuery += category ? ` AND p.featured = ?3` : ` AND p.featured = ?2`;
      countParams.push(featuredParam);
    }
    
    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total || 0;
    
    return new Response(JSON.stringify({
      success: true,
      data: projects,
      meta: { total, limit, offset }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Projects GET error:', error);
    return new Response(JSON.stringify({
      error: "server_error",
      message: "Failed to fetch projects"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ request, env }) {
  return handleProjectSave(request, env, 'POST');
}

export async function onRequestPut({ request, env }) {
  return handleProjectSave(request, env, 'PUT');
}

async function handleProjectSave(request, env, method) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Check authentication
  const cookies = request.headers.get('cookie') || '';
  if (!cookies.includes('session=')) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CSRF protection
  const csrfToken = cookies.match(/session=([^;]+)/)?.[1]?.slice(0, 24) || '';
  const providedToken = request.headers.get('x-csrf-token') || '';
  if (!csrfToken || csrfToken !== providedToken) {
    return new Response(JSON.stringify({ error: "csrf_token_invalid" }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate limit write operations
  if (!rateLimit(`projects-write-${clientIp}`, 10, 60000)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.i18n?.en?.title) {
      return new Response(JSON.stringify({
        error: "validation_failed",
        message: "Project title (English) is required"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.id || !/^[a-z0-9-]+$/.test(body.id)) {
      return new Response(JSON.stringify({
        error: "validation_failed",
        message: "Project ID must contain only lowercase letters, numbers, and hyphens"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // SERVER-SIDE HEROWIDE VALIDATION FOR FEATURED PROJECTS
    if (body.featured === true) {
      const heroWideUrl = body.media?.heroWide?.url;
      
      if (!heroWideUrl) {
        return new Response(JSON.stringify({
          error: "heroWide_required",
          message: "Featured projects must have a heroWide image"
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate Cloudinary URL format
      const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//;
      if (!cloudinaryPattern.test(heroWideUrl)) {
        return new Response(JSON.stringify({
          error: "heroWide_must_be_cloudinary",
          message: "Featured project heroWide image must be hosted on Cloudinary"
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate image dimensions via Cloudinary
      const validation = await validateHeroWide(heroWideUrl, env);
      if (!validation.ok) {
        const errorMessages = {
          'not_cloudinary': 'heroWide image must be a valid Cloudinary URL',
          'wrong_cloud': 'heroWide image must be from the configured Cloudinary account',
          'too_small': 'heroWide image must be at least 1920×1080 pixels',
          'invalid_aspect_ratio': 'heroWide image must have 16:9 aspect ratio',
          'cloudinary_api_error': 'Unable to validate image with Cloudinary API',
          'validation_error': 'Unable to validate heroWide image'
        };
        
        return new Response(JSON.stringify({
          error: `heroWide_invalid_${validation.reason}`,
          message: errorMessages[validation.reason] || 'Invalid heroWide image',
          details: validation.error || validation
        }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check if project exists for PUT operations
    if (method === 'PUT') {
      const existingProject = await env.DB.prepare('SELECT id FROM projects WHERE id = ?1').bind(body.id).first();
      if (!existingProject) {
        return new Response(JSON.stringify({
          error: "project_not_found",
          message: "Project not found for update"
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Start database transaction
    const now = new Date().toISOString();
    
    // Insert/Update project
    const projectData = {
      id: body.id,
      status: body.status || 'draft',
      category: body.category,
      city: body.city || null,
      client: body.client || null,
      featured: body.featured ? 1 : 0,
      order_index: body.order || 0,
      updated_at: now
    };

    if (method === 'POST') {
      projectData.created_at = now;
      await env.DB.prepare(`
        INSERT INTO projects (id, status, category, city, client, featured, order_index, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
      `).bind(
        projectData.id, projectData.status, projectData.category, 
        projectData.city, projectData.client, projectData.featured, 
        projectData.order_index, projectData.created_at, projectData.updated_at
      ).run();
    } else {
      await env.DB.prepare(`
        UPDATE projects 
        SET status = ?2, category = ?3, city = ?4, client = ?5, featured = ?6, order_index = ?7, updated_at = ?8
        WHERE id = ?1
      `).bind(
        projectData.id, projectData.status, projectData.category,
        projectData.city, projectData.client, projectData.featured,
        projectData.order_index, projectData.updated_at
      ).run();
    }

    // Handle i18n content
    if (body.i18n) {
      // Delete existing i18n entries
      await env.DB.prepare('DELETE FROM project_i18n WHERE project_id = ?1').bind(body.id).run();
      
      // Insert new i18n entries
      for (const [lang, content] of Object.entries(body.i18n)) {
        if (content.title) {
          await env.DB.prepare(`
            INSERT INTO project_i18n (project_id, lang, title, excerpt, description)
            VALUES (?1, ?2, ?3, ?4, ?5)
          `).bind(body.id, lang, content.title, content.excerpt || null, content.description || null).run();
        }
      }
    }

    // Handle media
    if (body.media) {
      // Delete existing media entries
      await env.DB.prepare('DELETE FROM project_media WHERE project_id = ?1').bind(body.id).run();
      
      // Insert new media entries
      for (const [kind, mediaData] of Object.entries(body.media)) {
        if (kind === 'gallery' && Array.isArray(mediaData)) {
          // Handle gallery items
          for (let i = 0; i < mediaData.length; i++) {
            const item = mediaData[i];
            if (item.url) {
              await env.DB.prepare(`
                INSERT INTO project_media (project_id, kind, url, public_id, alt_en, alt_ar, width, height, idx)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
              `).bind(
                body.id, 'gallery', item.url, item.public_id || null,
                item.alt?.en || null, item.alt?.ar || null,
                item.width || null, item.height || null, i
              ).run();
            }
          }
        } else if (mediaData?.url) {
          // Handle single media items
          await env.DB.prepare(`
            INSERT INTO project_media (project_id, kind, url, public_id, alt_en, alt_ar, width, height, idx)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0)
          `).bind(
            body.id, kind, mediaData.url, mediaData.public_id || null,
            mediaData.alt?.en || null, mediaData.alt?.ar || null,
            mediaData.width || null, mediaData.height || null
          ).run();
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: { id: body.id, ...projectData },
      message: method === 'POST' ? 'Project created successfully' : 'Project updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Project save error:', error);
    return new Response(JSON.stringify({
      error: "server_error",
      message: "Failed to save project"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}