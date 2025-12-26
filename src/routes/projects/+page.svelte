<script>
  import '../../styles/projects.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { loadProjects, saveProjectToSupabase, updateProjectInSupabase, deleteProjectFromSupabase, syncProjectsToSupabase } from '$lib/utils/projects.js';

  export let data; // Server-side data from +page.server.js

  let isAdmin = data?.isAdmin || false;
  let editingProject = null;
  let loadingProjects = false;
  let savingProject = false;
  let saveError = null;

  function checkAuth() {
    if (browser) {
      return sessionStorage.getItem('adminAuth') === 'true';
    }
    return false;
  }

  // Default project data structure
  const defaultProjects = [
    {
      id: 'writing',
      title: 'writing',
      path: '/projects/writing_ideas',
      lastUpdated: '2025-12-13',
      status: 'In Progress',
      hasCommits: true,
      isPublic: false
    },

    {
      id: 'pcb 1',
      title: 'haptic motor controller (pcb)',
      path: '/projects/eagelmann-vest-pcb',
      lastUpdated: '2025-04-17',
      status: 'Graduated',
      hasCommits: true,
      isPublic: true
    },
    {
      id: 'turtlebot3',
      title: 'Visual Navigation with Turtlebot3',
      path: '/projects/turtlebot3',
      lastUpdated: '2024-09-15',
      status: 'Graduated',
      hasCommits: true,
      isPublic: true
    },
    {
      id: 'tinybots',
      title: 'Playing with micro-micro-controllers',
      path: '/projects/tinybots',
      lastUpdated: '2024-08-20',
      status: 'Graduated',
      hasCommits: true,
      isPublic: true
    },
    {
      id: 'bracketbots',
      title: "Building a 'wifey' bot",
      path: '/projects/bracketbots',
      lastUpdated: '2024-10-10',
      status: 'Graduated',
      hasCommits: true,
      isPublic: true
    }
  ];

  // Initialize as empty array - will be loaded from database
  let projectsData = [];

  // New project being added
  let newProject = null;

  // Load projects from Supabase (with localStorage fallback) on mount
  onMount(async () => {
    if (browser) {
      // Sync admin auth from server-side cookie (primary) or sessionStorage (fallback)
      // Server-side auth is the source of truth, but we also check sessionStorage
      // for immediate client-side updates after login
      const serverAuth = data?.isAdmin || false;
      const clientAuth = checkAuth();
      isAdmin = serverAuth || clientAuth;
      
      // Always try to load from database first
      loadingProjects = true;
      try {
        // Try to fetch directly from API (bypassing localStorage cache)
        const response = await fetch('/api/projects');
        
        if (response.ok) {
          const data = await response.json();
          const loaded = data.projects || [];
          
          if (loaded.length > 0) {
            // Projects exist in database - use them
            projectsData = loaded.map(p => ({
              ...p,
              isPublic: p.isPublic !== undefined ? p.isPublic : true
            }));
            // Update localStorage cache
            localStorage.setItem('projects', JSON.stringify(projectsData));
            localStorage.setItem('projects_last_sync', new Date().toISOString());
          } else {
            // No projects in database - sync default projects if admin
            if (isAdmin) {
              console.log('No projects in database, syncing default projects...');
              try {
                const synced = await syncProjectsToSupabase(defaultProjects);
                projectsData = synced.map(p => ({
                  ...p,
                  isPublic: p.isPublic !== undefined ? p.isPublic : true
                }));
                // Update localStorage cache
                localStorage.setItem('projects', JSON.stringify(projectsData));
                localStorage.setItem('projects_last_sync', new Date().toISOString());
              } catch (syncError) {
                console.error('Error syncing projects to database:', syncError);
                // Fall back to localStorage if sync fails
                const stored = localStorage.getItem('projects');
                if (stored) {
                  try {
                    const parsed = JSON.parse(stored);
                    projectsData = parsed.map(p => ({
                      ...p,
                      isPublic: p.isPublic !== undefined ? p.isPublic : true
                    }));
                  } catch (e) {
                    console.error('Error loading projects from localStorage:', e);
                    projectsData = defaultProjects;
                  }
                } else {
                  projectsData = defaultProjects;
                }
              }
            } else {
              // Non-admin: use localStorage or defaults
              const stored = localStorage.getItem('projects');
              if (stored) {
                try {
                  const parsed = JSON.parse(stored);
                  projectsData = parsed.map(p => ({
                    ...p,
                    isPublic: p.isPublic !== undefined ? p.isPublic : true
                  }));
                } catch (e) {
                  console.error('Error loading projects from localStorage:', e);
                  projectsData = defaultProjects;
                }
              } else {
                projectsData = defaultProjects;
              }
            }
          }
        } else {
          // API request failed - fall back to localStorage
          console.warn('Failed to load from Supabase, falling back to localStorage');
          const stored = localStorage.getItem('projects');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              projectsData = parsed.map(p => ({
                ...p,
                isPublic: p.isPublic !== undefined ? p.isPublic : true
              }));
            } catch (e) {
              console.error('Error loading projects from localStorage:', e);
              projectsData = defaultProjects;
            }
          } else {
            projectsData = defaultProjects;
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        // Fall back to localStorage on network error
        const stored = localStorage.getItem('projects');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            projectsData = parsed.map(p => ({
              ...p,
              isPublic: p.isPublic !== undefined ? p.isPublic : true
            }));
          } catch (e) {
            console.error('Error loading projects from localStorage:', e);
            projectsData = defaultProjects;
          }
        } else {
          projectsData = defaultProjects;
        }
      } finally {
        loadingProjects = false;
      }
    }
  });

  // Save to localStorage whenever projectsData changes (only after initial load)
  $: if (browser && projectsData.length > 0) {
    localStorage.setItem('projects', JSON.stringify(projectsData));
  }

  // Filter and sort projects
  // Show all projects to admins, only public projects to non-admins
  // Note: newProject is rendered separately, so we don't include it here
  $: allProjects = projectsData.map(p => ({
    ...p,
    isPublic: p.isPublic !== undefined ? p.isPublic : true // Ensure isPublic is set
  }));
  $: filteredProjects = isAdmin 
    ? allProjects 
    : allProjects.filter(p => p.isPublic === true); // Only show public projects to non-admins
  $: projects = filteredProjects.sort((a, b) => {
    return new Date(b.lastUpdated) - new Date(a.lastUpdated);
  });

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function handleAddProject() {
    const today = new Date().toISOString().split('T')[0];
    newProject = {
      id: `new-project-${Date.now()}`,
      title: '',
      path: '',
      lastUpdated: today,
      status: 'In Progress',
      hasCommits: false,
      isPublic: true,
      isNew: true
    };
  }

  async function handleSaveProject() {
    if (!newProject || !newProject.title.trim()) {
      return;
    }
    
    if (!browser) return;
    
    savingProject = true;
    saveError = null;
    
    // Generate a path from the title
    const pathId = newProject.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    newProject.path = `/projects/${pathId}`;
    newProject.id = pathId;
    newProject.hasCommits = newProject.hasCommits ?? true;
    
    try {
      // Save to Supabase via API (this will also update localStorage cache)
      const savedProject = await saveProjectToSupabase(newProject);
      
      // Update local state
      projectsData = [...projectsData, savedProject];
      
      // Reset form
      newProject = null;
      
      console.log('Project created:', savedProject);
    } catch (error) {
      saveError = error.message || 'Failed to save project';
      console.error('Error creating project:', error);
      
      // Still save to localStorage as backup for offline use
      delete newProject.isNew;
      projectsData = [...projectsData, newProject];
      
      // Note: We're not showing an alert here - the error will be displayed in the UI
      // The project is still saved locally so the user doesn't lose their work
      newProject = null;
    } finally {
      savingProject = false;
    }
  }

  function handleCancelProject() {
    newProject = null;
  }

  function handleEditProject(project) {
    if (isAdmin) {
      editingProject = { ...project };
    }
  }

  async function handleSaveEdit() {
    if (!editingProject || !browser) return;
    
    savingProject = true;
    saveError = null;
    
    try {
      // Update in Supabase (this will also update localStorage cache)
      const updatedProject = await updateProjectInSupabase(editingProject);
      
      // Update local state
      const index = projectsData.findIndex(p => p.id === updatedProject.id);
      if (index !== -1) {
        projectsData[index] = updatedProject;
        projectsData = [...projectsData]; // Trigger reactivity
      }
      
      editingProject = null;
      console.log('Project updated:', updatedProject);
    } catch (error) {
      saveError = error.message || 'Failed to update project';
      console.error('Error updating project:', error);
      
      // Still update local state as backup
      const index = projectsData.findIndex(p => p.id === editingProject.id);
      if (index !== -1) {
        projectsData[index] = { ...editingProject };
        projectsData = [...projectsData]; // Trigger reactivity
      }
      // Don't close the edit form on error so user can retry
    } finally {
      savingProject = false;
    }
  }

  function handleCancelEdit() {
    editingProject = null;
    saveError = null;
  }

  async function handleDeleteProject(projectId) {
    if (!browser) return;
    
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    savingProject = true;
    saveError = null;
    
    try {
      // Delete from Supabase (this will also update localStorage cache)
      await deleteProjectFromSupabase(projectId);
      
      // Update local state
      projectsData = projectsData.filter(p => p.id !== projectId);
      
      // If we were editing this project, cancel the edit
      if (editingProject && editingProject.id === projectId) {
        editingProject = null;
      }
      
      console.log('Project deleted:', projectId);
    } catch (error) {
      saveError = error.message || 'Failed to delete project';
      console.error('Error deleting project:', error);
      
      // Still remove from local state as backup
      projectsData = projectsData.filter(p => p.id !== projectId);
      
      // If we were editing this project, cancel the edit
      if (editingProject && editingProject.id === projectId) {
        editingProject = null;
      }
    } finally {
      savingProject = false;
    }
  }
</script>

<div class="dashboard-container">
  
  <div class="header">
    <h1>Projects</h1>
    {#if isAdmin}
        <button class="add-button" on:click={handleAddProject} title="Add new project">
            <i class="las la-plus"></i>
        </button>
    {/if}
  </div>

  {#if loadingProjects}
    <div class="loading-indicator">Loading projects...</div>
  {/if}

  <div class="projects-grid">
    {#if newProject}
      <!-- New project editable card -->
      <div class="project-card editable-card">
        <div class="card-content">
          <div class="card-main">
            <input
              type="text"
              class="project-title-input"
              placeholder="Project title"
              bind:value={newProject.title}
            />
            <div class="project-meta">
              <label class="date-label">
                Last updated:
                <input
                  type="date"
                  class="date-input"
                  bind:value={newProject.lastUpdated}
                />
              </label>
              <label class="status-label">
                Status:
                <select class="status-select" bind:value={newProject.status}>
                  <option value="Graduated">Graduated</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Graveyard">Graveyard</option>
                  <option value="Idea">Idea</option>
                </select>
              </label>
              {#if isAdmin}
                <label class="visibility-label">
                  <input
                    type="checkbox"
                    class="visibility-checkbox"
                    bind:checked={newProject.isPublic}
                  />
                  <span>Public</span>
                </label>
              {/if}
            </div>
            <div class="edit-actions">
              <button 
                class="save-button" 
                on:click={handleSaveProject} 
                disabled={savingProject || !newProject.title.trim()}
              >
                {savingProject ? 'Creating...' : 'Save'}
              </button>
              <button 
                class="cancel-button" 
                on:click={handleCancelProject}
                disabled={savingProject}
              >
                Cancel
              </button>
            </div>
            {#if saveError}
              <p class="error-message" style="color: #c33; margin-top: 0.5rem; font-size: 0.9rem;">
                Error: {saveError}
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    
    {#each projects as project}
      {#if editingProject && editingProject.id === project.id}
        <!-- Editing existing project card -->
        <div class="project-card editable-card">
          <div class="card-content">
            <div class="card-main">
              <input
                type="text"
                class="project-title-input"
                bind:value={editingProject.title}
              />
              <div class="project-meta">
                <label class="date-label">
                  Last updated:
                  <input
                    type="date"
                    class="date-input"
                    bind:value={editingProject.lastUpdated}
                  />
                </label>
                <label class="status-label">
                  Status:
                  <select class="status-select" bind:value={editingProject.status}>
                    <option value="Graduated">Graduated</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Graveyard">Graveyard</option>
                    <option value="Idea">Idea</option>
                  </select>
                </label>
                <label class="visibility-label">
                  <input
                    type="checkbox"
                    class="visibility-checkbox"
                    bind:checked={editingProject.isPublic}
                  />
                  <span>Public</span>
                </label>
              </div>
              <div class="edit-actions">
                <button 
                  class="save-button" 
                  on:click={handleSaveEdit}
                  disabled={savingProject}
                >
                  {savingProject ? 'Saving...' : 'Save'}
                </button>
                <button 
                  class="cancel-button" 
                  on:click={handleCancelEdit}
                  disabled={savingProject}
                >
                  Cancel
                </button>
                <button 
                  class="delete-button" 
                  on:click={() => handleDeleteProject(project.id)}
                  disabled={savingProject}
                >
                  Delete
                </button>
              </div>
              {#if saveError}
                <p class="error-message" style="color: #c33; margin-top: 0.5rem; font-size: 0.9rem;">
                  Error: {saveError}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <!-- Existing project card -->
        <div class="project-card-wrapper">
          <a href={project.path} class="project-card">
            <div class="card-content">
              <div class="card-main">
                <h2 class="project-title">{project.title}</h2>
              <div class="project-meta">
                <span class="last-updated">Last updated: {formatDate(project.lastUpdated)}</span>
                <div class="status-row">
                  <span class="status">
                    {project.status}
                  </span>
                  {#if isAdmin && !project.isPublic}
                    <span class="private-badge" title="Private project">🔒</span>
                  {/if}
                </div>
              </div>
              </div>
              {#if project.hasCommits}
                <div class="commit-thumbnail">
                  <div class="commit-bars">
                    {#each Array(7) as _, i}
                      {@const height = (project.id.charCodeAt(i % project.id.length) % 50) + 25}
                      <div class="commit-bar" style="height: {height}%"></div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </a>
          {#if isAdmin}
            <button class="edit-button" on:click={() => handleEditProject(project)} title="Edit project">
              <i class="las la-edit"></i>
            </button>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
