import { json } from '@sveltejs/kit';
import { getServerSupabase } from '$lib/supabaseServer';

// GET - Fetch all projects
export async function GET({ url, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  
  try {
    const supabase = getServerSupabase();
    
    // If admin, get all projects; otherwise only public ones
    let query = supabase.from('projects').select('*').order('last_updated', { ascending: false });
    
    if (!isAdmin) {
      query = query.eq('is_public', true);
    }
    
    const { data: projects, error } = await query;
    
    if (error) {
      console.error('Error fetching projects:', error);
      return json({ error: 'Failed to fetch projects', details: error.message }, { status: 500 });
    }
    
    // Transform database format to frontend format
    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
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
    const { title, path, status, lastUpdated, hasCommits, isPublic } = body;
    
    // Validate required fields
    if (!title || !path || !status || !lastUpdated) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['Graduated', 'In Progress', 'Graveyard', 'Idea'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }
    
    // Generate project ID from path (e.g., '/projects/my-project' -> 'my-project')
    const projectId = path.replace('/projects/', '').replace(/^\//, '') || 
                     title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const supabase = getServerSupabase();
    
    // Get current timestamp for created_at and updated_at
    const now = new Date().toISOString();
    
    // Insert into projects table
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        title: title.trim(),
        path: path,
        status: status,
        last_updated: lastUpdated,
        has_commits: hasCommits ?? false,
        is_public: isPublic ?? true,
        created_at: now,
        updated_at: now
      })
      .select(); // Returns the inserted row
    
    // Handle single row response
    const insertedProject = Array.isArray(project) ? project[0] : project;
    
    if (projectError) {
      console.error('Error creating project:', projectError);
      // Check if it's a unique constraint violation
      if (projectError.code === '23505') {
        return json({ error: 'Project with this ID or path already exists' }, { status: 409 });
      }
      return json({ error: 'Failed to create project', details: projectError.message }, { status: 500 });
    }
    
    if (!insertedProject) {
      return json({ error: 'Failed to create project: no data returned' }, { status: 500 });
    }
    
    // If status is not 'Graduated', also create an entry in project_content
    if (status !== 'Graduated') {
      const { error: contentError } = await supabase
        .from('project_content')
        .insert({
          project_id: projectId,
          markdown_content: '',
          github_repo: null,
          created_at: now,
          last_updated: now
        });
      
      if (contentError) {
        console.error('Error creating project content:', contentError);
        // Don't fail the whole request, but log the error
        // The content can be added later
      }
    }
    
    // Transform to frontend format
    const formattedProject = {
      id: insertedProject.id,
      title: insertedProject.title,
      path: insertedProject.path,
      lastUpdated: insertedProject.last_updated,
      status: insertedProject.status,
      hasCommits: insertedProject.has_commits,
      isPublic: insertedProject.is_public
    };
    
    return json({ project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
