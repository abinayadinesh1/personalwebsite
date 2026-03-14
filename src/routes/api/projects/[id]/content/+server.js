import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// GET - Fetch project content for a specific project
export async function GET({ params, cookies }) {
  const { id } = params;
  const isAdmin = cookies.get('adminAuth') === 'true';

  if (!id) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const sql = getDb();

    // Check if the project exists and if user has access
    const projects = await sql`
      SELECT id, is_public FROM projects WHERE id = ${id} LIMIT 1
    `;

    if (!projects || projects.length === 0) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];

    // If not admin, only allow access to public projects
    if (!isAdmin && !project.is_public) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch project content
    const contentRows = await sql`
      SELECT markdown_content, github_repo, last_updated
      FROM project_content
      WHERE project_id = ${id}
      LIMIT 1
    `;

    if (!contentRows || contentRows.length === 0) {
      return json({
        content: {
          markdownContent: '',
          githubRepo: '',
          lastUpdated: null
        }
      });
    }

    const content = contentRows[0];

    // Transform to frontend format
    let markdownText = content.markdown_content || '';

    // Strip <hidden>...</hidden> blocks for non-admin users
    if (!isAdmin) {
      markdownText = markdownText.replace(/<hidden>[\s\S]*?<\/hidden>/g, '');
    }

    const formattedContent = {
      markdownContent: markdownText,
      githubRepo: content.github_repo || '',
      lastUpdated: content.last_updated
    };

    return json({ content: formattedContent });
  } catch (error) {
    console.error('Error in GET /api/projects/[id]/content:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// PUT - Update project content
export async function PUT({ params, request, cookies }) {
  const { id } = params;
  const isAdmin = cookies.get('adminAuth') === 'true';

  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!id) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { markdownContent, githubRepo } = body;

    const sql = getDb();

    // Validate that project exists
    const projects = await sql`
      SELECT id FROM projects WHERE id = ${id} LIMIT 1
    `;

    if (!projects || projects.length === 0) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const mdContent = markdownContent || '';
    const repo = githubRepo || null;

    // Upsert project content
    const result = await sql`
      INSERT INTO project_content (project_id, markdown_content, github_repo, last_updated, created_at)
      VALUES (${id}, ${mdContent}, ${repo}, ${now}, ${now})
      ON CONFLICT (project_id)
      DO UPDATE SET
        markdown_content = ${mdContent},
        github_repo = ${repo},
        last_updated = ${now}
      RETURNING markdown_content, github_repo, last_updated
    `;

    const content = result[0];

    const formattedContent = {
      markdownContent: content.markdown_content || '',
      githubRepo: content.github_repo || '',
      lastUpdated: content.last_updated
    };

    return json({ content: formattedContent });
  } catch (error) {
    console.error('Error in PUT /api/projects/[id]/content:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
