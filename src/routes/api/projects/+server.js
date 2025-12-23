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

// PUT - Update an existing project
export async function PUT({ request, cookies, url }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { id, title, path, status, lastUpdated, hasCommits, isPublic } = body;
    
    // Validate required fields
    if (!id) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    if (!title || !path || !status || !lastUpdated) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['Graduated', 'In Progress', 'Graveyard', 'Idea'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }
    
    const supabase = getServerSupabase();
    
    // Get current timestamp for updated_at
    const now = new Date().toISOString();
    
    // Update the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        title: title.trim(),
        path: path,
        status: status,
        last_updated: lastUpdated,
        has_commits: hasCommits ?? false,
        is_public: isPublic ?? true,
        updated_at: now
      })
      .eq('id', id)
      .select(); // Returns the updated row
    
    if (projectError) {
      console.error('Error updating project:', projectError);
      return json({ error: 'Failed to update project', details: projectError.message }, { status: 500 });
    }
    
    if (!project || (Array.isArray(project) && project.length === 0)) {
      return json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Handle single row response
    const updatedProject = Array.isArray(project) ? project[0] : project;
    
    // Transform to frontend format
    const formattedProject = {
      id: updatedProject.id,
      title: updatedProject.title,
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
    // Get project ID from query params or request body
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
    
    const supabase = getServerSupabase();
    
    // Delete the project (this should cascade delete related records if foreign keys are set up)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return json({ error: 'Failed to delete project', details: deleteError.message }, { status: 500 });
    }
    
    return json({ success: true, id });
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
