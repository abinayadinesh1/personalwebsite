import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// GET - Fetch all projects
export async function GET({ url, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';

  try {
    const sql = getDb();

    let projects;
    if (isAdmin) {
      projects = await sql`
        SELECT * FROM projects ORDER BY last_updated DESC
      `;
    } else {
      projects = await sql`
        SELECT * FROM projects WHERE is_public = true ORDER BY last_updated DESC
      `;
    }

    // Transform database format to frontend format
    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle || '',
      path: p.path,
      lastUpdated: p.last_updated,
      status: p.status,
      hasCommits: p.has_commits,
      isPublic: p.is_public
    }));

    return json({ projects: formattedProjects });
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// POST - Create a new project
export async function POST({ request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';

  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, path, status, lastUpdated, hasCommits, isPublic } = body;

    // Validate required fields
    if (!title || !path || !status || !lastUpdated) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['Graduated', 'In Progress', 'Graveyard', 'Idea'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    // Generate project ID from path
    const projectId = path.replace('/projects/', '').replace(/^\//, '') ||
                     title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const sql = getDb();
    const now = new Date().toISOString();
    const trimmedTitle = title.trim();
    const trimmedSubtitle = (subtitle || '').trim();
    const commits = hasCommits ?? false;
    const pub = isPublic ?? true;

    const result = await sql`
      INSERT INTO projects (id, title, subtitle, path, status, last_updated, has_commits, is_public, created_at, updated_at)
      VALUES (${projectId}, ${trimmedTitle}, ${trimmedSubtitle}, ${path}, ${status}, ${lastUpdated}, ${commits}, ${pub}, ${now}, ${now})
      RETURNING *
    `;

    const insertedProject = result[0];

    if (!insertedProject) {
      return json({ error: 'Failed to create project: no data returned' }, { status: 500 });
    }

    // Create an entry in project_content
    try {
      await sql`
        INSERT INTO project_content (project_id, markdown_content, github_repo, created_at, last_updated)
        VALUES (${projectId}, '', ${null}, ${now}, ${now})
      `;
    } catch (contentError) {
      console.error('Error creating project content:', contentError);
    }

    // Transform to frontend format
    const formattedProject = {
      id: insertedProject.id,
      title: insertedProject.title,
      subtitle: insertedProject.subtitle || '',
      path: insertedProject.path,
      lastUpdated: insertedProject.last_updated,
      status: insertedProject.status,
      hasCommits: insertedProject.has_commits,
      isPublic: insertedProject.is_public
    };

    return json({ project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return json({ error: 'Project with this ID or path already exists' }, { status: 409 });
    }
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// PUT - Update an existing project
export async function PUT({ request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';

  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, subtitle, path, status, lastUpdated, hasCommits, isPublic } = body;

    if (!id) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!title || !path || !status || !lastUpdated) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['Graduated', 'In Progress', 'Graveyard', 'Idea'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const sql = getDb();
    const now = new Date().toISOString();
    const trimmedTitle = title.trim();
    const trimmedSubtitle = (subtitle || '').trim();
    const commits = hasCommits ?? false;
    const pub = isPublic ?? true;

    const result = await sql`
      UPDATE projects
      SET title = ${trimmedTitle},
          subtitle = ${trimmedSubtitle},
          path = ${path},
          status = ${status},
          last_updated = ${lastUpdated},
          has_commits = ${commits},
          is_public = ${pub},
          updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject = result[0];

    // Ensure project_content entry exists
    try {
      await sql`
        INSERT INTO project_content (project_id, markdown_content, github_repo, created_at, last_updated)
        VALUES (${id}, '', ${null}, ${now}, ${now})
        ON CONFLICT (project_id) DO NOTHING
      `;
    } catch (contentError) {
      console.error('Error ensuring project content:', contentError);
    }

    const formattedProject = {
      id: updatedProject.id,
      title: updatedProject.title,
      subtitle: updatedProject.subtitle || '',
      path: updatedProject.path,
      lastUpdated: updatedProject.last_updated,
      status: updatedProject.status,
      hasCommits: updatedProject.has_commits,
      isPublic: updatedProject.is_public
    };

    return json({ project: formattedProject });
  } catch (error) {
    console.error('Error in PUT /api/projects:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Delete an existing project
export async function DELETE({ request, cookies, url }) {
  const isAdmin = cookies.get('adminAuth') === 'true';

  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projectId = url.searchParams.get('id');
    let body = null;

    try {
      body = await request.json().catch(() => null);
    } catch (e) {
      // Request might not have a body
    }

    const id = projectId || body?.id;

    if (!id) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    const sql = getDb();

    await sql`DELETE FROM projects WHERE id = ${id}`;

    return json({ success: true, id });
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
