import { json } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/supabaseServer';

// GET - Fetch project content for a specific project
export async function GET({ params, cookies, url }) {
  const { id } = params;
  const isAdmin = cookies.get('adminAuth') === 'true';
  
  if (!id) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }
  
  try {
    const supabase = getServerSupabase();
    
    // First check if the project exists and if user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, is_public')
      .eq('id', id)
      .single();
    
    if (projectError || !project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    // If not admin, only allow access to public projects
    if (!isAdmin && !project.is_public) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Fetch project content
    const { data: content, error: contentError } = await supabase
      .from('project_content')
      .select('markdown_content, github_repo, last_updated')
      .eq('project_id', id)
      .single();
    
    if (contentError) {
      // If content doesn't exist, return empty content (not an error)
      if (contentError.code === 'PGRST116') {
        return json({
          content: {
            markdownContent: '',
            githubRepo: '',
            lastUpdated: null
          }
        });
      }
      console.error('Error fetching project content:', contentError);
      return json({ error: 'Failed to fetch project content', details: contentError.message }, { status: 500 });
    }
    
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
    
    // Validate that project exists
    const supabase = getServerSupabase();
    
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();
    
    if (projectError || !project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Get current timestamp
    const now = new Date().toISOString();
    
    // Upsert project content (insert if doesn't exist, update if it does)
    // Note: created_at will be set by database default if this is a new record
    const { data: content, error: contentError } = await supabase
      .from('project_content')
      .upsert({
        project_id: id,
        markdown_content: markdownContent || '',
        github_repo: githubRepo || null,
        last_updated: now
      }, {
        onConflict: 'project_id'
      })
      .select('markdown_content, github_repo, last_updated')
      .single();
    
    if (contentError) {
      console.error('Error updating project content:', contentError);
      return json({ error: 'Failed to update project content', details: contentError.message }, { status: 500 });
    }
    
    // Transform to frontend format
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

