export default async function handler(request, context) {
  // Only allow authenticated users
  if (!context.session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'GET') {
    try {
      // Read headers.json file
      const fs = await import('fs');
      const path = await import('path');
      
      const headersPath = path.join(process.cwd(), 'data', 'headers.json');
      const headersData = JSON.parse(fs.readFileSync(headersPath, 'utf8'));
      
      return new Response(JSON.stringify({
        success: true,
        data: headersData.pages
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to load headers',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const { pageId, imageData } = body;
      
      // Validate required fields
      if (!pageId || !imageData) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: pageId, imageData'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate image data structure
      if (!imageData.url || !imageData.public_id) {
        return new Response(JSON.stringify({
          error: 'Invalid image data: url and public_id required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate dimensions for hero images
      if (imageData.dimensions) {
        const { width, height } = imageData.dimensions;
        if (width !== 1920 || height !== 1080) {
          return new Response(JSON.stringify({
            error: 'Hero images must be exactly 1920x1080 pixels',
            received: { width, height },
            required: { width: 1920, height: 1080 }
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      const fs = await import('fs');
      const path = await import('path');
      
      const headersPath = path.join(process.cwd(), 'data', 'headers.json');
      const headersData = JSON.parse(fs.readFileSync(headersPath, 'utf8'));
      
      // Validate pageId exists
      if (!headersData.pages[pageId]) {
        return new Response(JSON.stringify({
          error: `Invalid pageId: ${pageId}`,
          validPages: Object.keys(headersData.pages)
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update the page header
      headersData.pages[pageId].media.hero = {
        ...headersData.pages[pageId].media.hero,
        ...imageData,
        last_updated: new Date().toISOString(),
        updated_by: context.session.user.email
      };

      // Update SEO images if hero image changed
      if (headersData.pages[pageId].seo) {
        headersData.pages[pageId].seo.ogImage = imageData.url;
        headersData.pages[pageId].seo.twitterImage = imageData.url;
      }

      // Write updated data back to file
      fs.writeFileSync(headersPath, JSON.stringify(headersData, null, 2));

      return new Response(JSON.stringify({
        success: true,
        message: `Header image updated for ${pageId} page`,
        data: headersData.pages[pageId]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to update header',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}