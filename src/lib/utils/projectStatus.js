// Helper to get project status from localStorage
// Can search by id, projectId (route name), or path
export function getProjectStatus(projectId, defaultProjects = []) {
  if (typeof window === 'undefined') {
    return { status: 'In Progress', showEditor: true };
  }

  const stored = localStorage.getItem('projects');
  let projectsData = defaultProjects;

  if (stored) {
    try {
      projectsData = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading projects from localStorage:', e);
    }
  }

  // Try to find by id first, then by path (extracting project name from path)
  let project = projectsData.find(p => p.id === projectId);
  
  if (!project) {
    // Try to find by path (e.g., '/projects/writing_ideas' -> 'writing_ideas')
    const pathToMatch = `/projects/${projectId}`;
    project = projectsData.find(p => p.path === pathToMatch);
  }
  
  if (!project) {
    // Try partial match on path
    project = projectsData.find(p => p.path && p.path.includes(projectId));
  }

  const status = project?.status || 'In Progress';
  
  return {
    status,
    showEditor: status !== 'Graduated'
  };
}
