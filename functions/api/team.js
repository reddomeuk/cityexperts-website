import fs from 'fs';
import path from 'path';

export default async function handler(request, context) {
  const dataPath = path.join(process.cwd(), 'data', 'team.json');

  // GET - Retrieve team members
  if (request.method === 'GET') {
    try {
      const teamData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const url = new URL(request.url);
      const status = url.searchParams.get('status') || 'active';
      const limit = parseInt(url.searchParams.get('limit')) || 50;
      const offset = parseInt(url.searchParams.get('offset')) || 0;

      // Filter by status
      let filteredTeam = teamData.team.filter(member => member.status === status);
      
      // Sort by order
      filteredTeam.sort((a, b) => a.order - b.order);

      // Apply pagination
      const total = filteredTeam.length;
      filteredTeam = filteredTeam.slice(offset, offset + limit);

      return new Response(JSON.stringify({
        success: true,
        data: filteredTeam,
        meta: {
          total,
          limit,
          offset,
          count: filteredTeam.length
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to load team data',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // POST - Create new team member (admin only)
  if (request.method === 'POST') {
    if (!context.session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { name, position, bio, expertise, email, linkedin, portraitUrl, portraitPublicId } = body;
      
      // Validate required fields
      if (!name || !position || !bio) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: name, position, bio'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const teamData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // Generate ID from name
      const id = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      // Check if ID already exists
      if (teamData.team.find(member => member.id === id)) {
        return new Response(JSON.stringify({
          error: 'Team member with this name already exists'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get next order number
      const maxOrder = Math.max(...teamData.team.map(m => m.order), 0);

      const newMember = {
        id,
        order: maxOrder + 1,
        status: 'active',
        i18n: {
          en: {
            name,
            position,
            bio,
            expertise: expertise || ''
          },
          ar: {
            name,
            position,
            bio,
            expertise: expertise || ''
          }
        },
        media: {
          portrait: portraitUrl ? {
            url: portraitUrl,
            public_id: portraitPublicId || '',
            alt: {
              en: `${name}, ${position} at City Experts`,
              ar: `${name}، ${position} في خبراء المدينة`
            },
            dimensions: {
              width: 800,
              height: 800
            }
          } : null
        },
        contact: {
          email: email || '',
          linkedin: linkedin || ''
        },
        meta: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: context.session.user.email
        }
      };

      teamData.team.push(newMember);
      fs.writeFileSync(dataPath, JSON.stringify(teamData, null, 2));

      return new Response(JSON.stringify({
        success: true,
        message: 'Team member created successfully',
        data: newMember
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to create team member',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // PUT - Update existing team member (admin only)
  if (request.method === 'PUT') {
    if (!context.session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { id, name, position, bio, expertise, email, linkedin, portraitUrl, portraitPublicId, status: memberStatus, order } = body;
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing required field: id'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const teamData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const memberIndex = teamData.team.findIndex(member => member.id === id);
      
      if (memberIndex === -1) {
        return new Response(JSON.stringify({
          error: 'Team member not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const existingMember = teamData.team[memberIndex];
      
      // Update fields if provided
      if (name) {
        existingMember.i18n.en.name = name;
        existingMember.i18n.ar.name = name; // Could be translated separately
      }
      if (position) {
        existingMember.i18n.en.position = position;
        existingMember.i18n.ar.position = position;
      }
      if (bio) {
        existingMember.i18n.en.bio = bio;
        existingMember.i18n.ar.bio = bio;
      }
      if (expertise !== undefined) {
        existingMember.i18n.en.expertise = expertise;
        existingMember.i18n.ar.expertise = expertise;
      }
      if (email !== undefined) existingMember.contact.email = email;
      if (linkedin !== undefined) existingMember.contact.linkedin = linkedin;
      if (memberStatus) existingMember.status = memberStatus;
      if (order !== undefined) existingMember.order = order;
      
      // Update portrait if provided
      if (portraitUrl) {
        existingMember.media.portrait = {
          url: portraitUrl,
          public_id: portraitPublicId || '',
          alt: {
            en: `${existingMember.i18n.en.name}, ${existingMember.i18n.en.position} at City Experts`,
            ar: `${existingMember.i18n.ar.name}، ${existingMember.i18n.ar.position} في خبراء المدينة`
          },
          dimensions: {
            width: 800,
            height: 800
          }
        };
      }

      // Update metadata
      existingMember.meta.updated_at = new Date().toISOString();
      existingMember.meta.updated_by = context.session.user.email;

      fs.writeFileSync(dataPath, JSON.stringify(teamData, null, 2));

      return new Response(JSON.stringify({
        success: true,
        message: 'Team member updated successfully',
        data: existingMember
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to update team member',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE - Delete team member (admin only)
  if (request.method === 'DELETE') {
    if (!context.session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing required parameter: id'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const teamData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const memberIndex = teamData.team.findIndex(member => member.id === id);
      
      if (memberIndex === -1) {
        return new Response(JSON.stringify({
          error: 'Team member not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const deletedMember = teamData.team.splice(memberIndex, 1)[0];
      fs.writeFileSync(dataPath, JSON.stringify(teamData, null, 2));

      return new Response(JSON.stringify({
        success: true,
        message: 'Team member deleted successfully',
        data: deletedMember
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to delete team member',
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