/**
 * Load projects from Supabase, with localStorage as fallback
 * @param {boolean} isAdmin - Whether user is admin (affects which projects are returned)
 * @returns {Promise<Array>} Array of projects
 */
export async function loadProjects(isAdmin = false) {
  if (typeof window === 'undefined') {
    // Server-side: return empty array, will be loaded client-side
    return [];
  }
  
  try {
    // Try to fetch from Supabase first
    const response = await fetch('/api/projects');
    
    if (response.ok) {
      const data = await response.json();
      const projects = data.projects || [];
      
      // Cache in localStorage for offline/fallback use
      if (projects.length > 0) {
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('projects_last_sync', new Date().toISOString());
      }
      
      return projects;
    } else {
      // If Supabase fails, fall back to localStorage
      console.warn('Failed to load from Supabase, falling back to localStorage');
      return loadFromLocalStorage();
    }
  } catch (error) {
    console.error('Error loading projects from Supabase:', error);
    // Fall back to localStorage
    return loadFromLocalStorage();
  }
}

/**
 * Load projects from localStorage
 * @returns {Array} Array of projects
 */
export function loadFromLocalStorage() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const stored = localStorage.getItem('projects');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing projects from localStorage:', e);
      return [];
    }
  }
  
  return [];
}

/**
 * Save project to Supabase and update localStorage cache
 * @param {Object} project - Project object to save
 * @returns {Promise<Object>} Saved project object
 */
export async function saveProjectToSupabase(project) {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: project.title,
        path: project.path,
        status: project.status,
        lastUpdated: project.lastUpdated,
        hasCommits: project.hasCommits ?? false,
        isPublic: project.isPublic ?? true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to save project: ${response.status}`);
    }
    
    const data = await response.json();
    const savedProject = data.project;
    
    // Update localStorage cache
    const cachedProjects = loadFromLocalStorage();
    const existingIndex = cachedProjects.findIndex(p => p.id === savedProject.id);
    
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = savedProject;
    } else {
      cachedProjects.push(savedProject);
    }
    
    localStorage.setItem('projects', JSON.stringify(cachedProjects));
    localStorage.setItem('projects_last_sync', new Date().toISOString());
    
    return savedProject;
  } catch (error) {
    console.error('Error saving project to Supabase:', error);
    // Still save to localStorage as backup
    const cachedProjects = loadFromLocalStorage();
    cachedProjects.push(project);
    localStorage.setItem('projects', JSON.stringify(cachedProjects));
    throw error; // Re-throw so caller knows Supabase save failed
  }
}

/**
 * Update project in Supabase and update localStorage cache
 * @param {Object} project - Project object to update (must include id)
 * @returns {Promise<Object>} Updated project object
 */
export async function updateProjectInSupabase(project) {
  try {
    const response = await fetch('/api/projects', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: project.id,
        title: project.title,
        path: project.path,
        status: project.status,
        lastUpdated: project.lastUpdated,
        hasCommits: project.hasCommits ?? false,
        isPublic: project.isPublic ?? true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update project: ${response.status}`);
    }
    
    const data = await response.json();
    const updatedProject = data.project;
    
    // Update localStorage cache
    const cachedProjects = loadFromLocalStorage();
    const existingIndex = cachedProjects.findIndex(p => p.id === updatedProject.id);
    
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = updatedProject;
    } else {
      cachedProjects.push(updatedProject);
    }
    
    localStorage.setItem('projects', JSON.stringify(cachedProjects));
    localStorage.setItem('projects_last_sync', new Date().toISOString());
    
    return updatedProject;
  } catch (error) {
    console.error('Error updating project in Supabase:', error);
    // Still update localStorage as backup
    const cachedProjects = loadFromLocalStorage();
    const existingIndex = cachedProjects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      cachedProjects[existingIndex] = project;
    } else {
      cachedProjects.push(project);
    }
    localStorage.setItem('projects', JSON.stringify(cachedProjects));
    throw error; // Re-throw so caller knows Supabase update failed
  }
}

/**
 * Delete project from Supabase and update localStorage cache
 * @param {string} projectId - ID of project to delete
 * @returns {Promise<void>}
 */
export async function deleteProjectFromSupabase(projectId) {
  try {
    const response = await fetch(`/api/projects?id=${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete project: ${response.status}`);
    }
    
    // Update localStorage cache
    const cachedProjects = loadFromLocalStorage();
    const filteredProjects = cachedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(filteredProjects));
    localStorage.setItem('projects_last_sync', new Date().toISOString());
    
    return;
  } catch (error) {
    console.error('Error deleting project from Supabase:', error);
    // Still update localStorage as backup
    const cachedProjects = loadFromLocalStorage();
    const filteredProjects = cachedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(filteredProjects));
    throw error; // Re-throw so caller knows Supabase delete failed
  }
}

/**
 * Load project content from Supabase, with localStorage as fallback
 * @param {string} projectId - ID of the project
 * @returns {Promise<Object>} Object with markdownContent, githubRepo, and lastUpdated
 */
export async function loadProjectContent(projectId) {
  if (typeof window === 'undefined') {
    // Server-side: return empty content
    return { markdownContent: '', githubRepo: '', lastUpdated: null };
  }
  
  try {
    // Try to fetch from Supabase first
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/content`);
    
    if (response.ok) {
      const data = await response.json();
      const content = data.content || { markdownContent: '', githubRepo: '', lastUpdated: null };
      
      // Cache in localStorage for offline/fallback use
      const key = `project_${projectId}`;
      const cacheData = {
        content: content.markdownContent,
        githubRepo: content.githubRepo,
        lastUpdated: content.lastUpdated || new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      
      return content;
    } else {
      // If Supabase fails, fall back to localStorage
      console.warn('Failed to load content from Supabase, falling back to localStorage');
      return loadProjectContentFromLocalStorage(projectId);
    }
  } catch (error) {
    console.error('Error loading project content from Supabase:', error);
    // Fall back to localStorage
    return loadProjectContentFromLocalStorage(projectId);
  }
}

/**
 * Load project content from localStorage
 * @param {string} projectId - ID of the project
 * @returns {Object} Object with markdownContent, githubRepo, and lastUpdated
 */
export function loadProjectContentFromLocalStorage(projectId) {
  if (typeof window === 'undefined') {
    return { markdownContent: '', githubRepo: '', lastUpdated: null };
  }
  
  const key = `project_${projectId}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      return {
        markdownContent: data.content || '',
        githubRepo: data.githubRepo || '',
        lastUpdated: data.lastUpdated || null
      };
    } catch (e) {
      console.error('Error parsing project content from localStorage:', e);
      return { markdownContent: '', githubRepo: '', lastUpdated: null };
    }
  }
  
  return { markdownContent: '', githubRepo: '', lastUpdated: null };
}

/**
 * Sync projects to Supabase - creates projects in database if they don't exist
 * @param {Array} projects - Array of projects to sync
 * @returns {Promise<Array>} Array of synced projects
 */
export async function syncProjectsToSupabase(projects) {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const syncedProjects = [];
  
  // First, load existing projects to see which ones already exist
  let existingProjects = [];
  try {
    const loaded = await loadProjects(true); // Load as admin to get all projects
    existingProjects = loaded.map(p => p.id);
  } catch (error) {
    console.error('Error loading existing projects for sync:', error);
    // Continue anyway - we'll try to create/update each project
  }
  
  for (const project of projects) {
    try {
      if (existingProjects.includes(project.id)) {
        // Project exists, update it
        const updatedProject = await updateProjectInSupabase(project);
        syncedProjects.push(updatedProject);
      } else {
        // Project doesn't exist, create it
        const savedProject = await saveProjectToSupabase(project);
        syncedProjects.push(savedProject);
      }
    } catch (error) {
      console.error(`Error syncing project ${project.id}:`, error);
      // Continue with other projects even if one fails
      // Include the project in the result so it's still displayed
      syncedProjects.push(project);
    }
  }
  
  return syncedProjects;
}

/**
 * Save project content to Supabase and update localStorage cache
 * @param {string} projectId - ID of the project
 * @param {string} markdownContent - Markdown content to save
 * @param {string} githubRepo - GitHub repository URL (optional)
 * @returns {Promise<Object>} Saved content object
 */
export async function saveProjectContentToSupabase(projectId, markdownContent, githubRepo = '') {
  if (typeof window === 'undefined') {
    throw new Error('saveProjectContentToSupabase can only be called from the browser');
  }
  
  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        markdownContent: markdownContent || '',
        githubRepo: githubRepo || ''
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to save project content: ${response.status}`);
    }
    
    const data = await response.json();
    const savedContent = data.content || { markdownContent: '', githubRepo: '', lastUpdated: null };
    
    // Update localStorage cache
    const key = `project_${projectId}`;
    const cacheData = {
      content: savedContent.markdownContent,
      githubRepo: savedContent.githubRepo,
      lastUpdated: savedContent.lastUpdated || new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    
    return savedContent;
  } catch (error) {
    console.error('Error saving project content to Supabase:', error);
    // Still save to localStorage as backup
    const key = `project_${projectId}`;
    const cacheData = {
      content: markdownContent || '',
      githubRepo: githubRepo || '',
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    throw error; // Re-throw so caller knows Supabase save failed
  }
}
