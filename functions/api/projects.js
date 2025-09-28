// /functions/api/projects.js
// Cloudflare Workers compatible projects API

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Parse URL to get query parameters
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // Mock projects data (in production, this would come from a database)
    const projects = [
      {
        id: 1,
        title: "Emirates Business Tower",
        category: "commercial",
        location: "Business Bay, Dubai",
        status: "completed",
        year: 2024,
        budget: "45M AED",
        description: "45-story mixed-use development featuring premium offices, retail spaces, and luxury amenities in the heart of Business Bay.",
        image: "/assets/images/projects/dubai-tower-commercial.webp",
        features: ["LEED Gold Certified", "Smart Building Technology", "Premium Office Spaces", "Ground Floor Retail"],
        client: "Emirates Development Group"
      },
      {
        id: 2,
        title: "Desert Bloom Villas",
        category: "residential",
        location: "Arabian Ranches, Dubai",
        status: "completed",
        year: 2024,
        budget: "25M AED",
        description: "Exclusive collection of 24 luxury villas featuring contemporary Arabian architecture and premium interior finishes.",
        image: "/assets/images/projects/palm-residences.webp",
        features: ["Private Swimming Pools", "Smart Home Integration", "Landscaped Gardens", "Premium Finishes"],
        client: "Private Developer"
      },
      {
        id: 3,
        title: "Azure Luxury Resort",
        category: "interior",
        location: "Palm Jumeirah, Dubai",
        status: "completed",
        year: 2023,
        budget: "35M AED",
        description: "Complete interior design and fit-out for a 300-room luxury resort featuring world-class amenities and dining venues.",
        image: "/assets/images/projects/executive-offices.webp",
        features: ["300 Luxury Rooms", "5 Dining Venues", "Spa & Wellness Center", "Conference Facilities"],
        client: "Azure Hospitality Group"
      },
      {
        id: 4,
        title: "Marina Bay Mall",
        category: "commercial",
        location: "Dubai Marina",
        status: "completed",
        year: 2023,
        budget: "60M AED",
        description: "Three-level retail destination with anchor stores, dining court, and entertainment complex.",
        image: "/assets/images/projects/marina-mall.webp",
        features: ["150 Retail Units", "Food Court", "Cinema Complex", "Underground Parking"],
        client: "Marina Development LLC"
      },
      {
        id: 5,
        title: "Downtown Corporate Plaza",
        category: "commercial",
        location: "Downtown Dubai",
        status: "in-progress",
        year: 2025,
        budget: "80M AED",
        description: "Premium Grade A office building with state-of-the-art facilities and sustainable design features.",
        image: "/assets/images/projects/downtown-plaza.webp",
        features: ["Grade A Offices", "Sustainable Design", "Conference Centers", "Executive Lounges"],
        client: "Downtown Development Authority"
      },
      {
        id: 6,
        title: "Arabian Gardens Community",
        category: "residential",
        location: "Al Barsha, Dubai",
        status: "completed",
        year: 2023,
        budget: "40M AED",
        description: "Gated community of 60 townhouses with community amenities and landscaped common areas.",
        image: "/assets/images/projects/arabian-gardens.webp",
        features: ["60 Townhouses", "Community Pool", "Children's Play Area", "Jogging Tracks"],
        client: "Arabian Developments"
      }
    ];

    // Filter projects if filter parameter is provided
    let filteredProjects = projects;
    if (filter && filter !== 'all') {
      filteredProjects = projects.filter(project => project.category === filter);
    }

    // Apply pagination
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    // Calculate total pages
    const totalProjects = filteredProjects.length;
    const totalPages = Math.ceil(totalProjects / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const response = {
      success: true,
      data: {
        projects: paginatedProjects,
        pagination: {
          currentPage,
          totalPages,
          totalProjects,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        },
        filters: {
          applied: filter || 'all',
          available: ['all', 'commercial', 'residential', 'interior']
        }
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, max-age=300" // Cache for 5 minutes
        }
      }
    );

  } catch (error) {
    console.error('Projects API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "internal_server_error" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Get single project
export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "project_id_required" 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // In production, this would fetch from a database
    // For now, return mock data based on ID
    const project = {
      id: parseInt(id),
      title: "Project Details",
      description: "Detailed project information would be loaded here.",
      status: "completed",
      // ... more project details
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: project 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    console.error('Project detail error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "internal_server_error" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}