<script>
  import '../../styles/projects.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let isAdmin = false;
  let editingProject = null;

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

  // Load projects from localStorage or use defaults
  let projectsData = defaultProjects;

  // New project being added
  let newProject = null;

  // Load from localStorage and check auth on mount
  onMount(() => {
    if (browser) {
      // Check admin auth
      isAdmin = checkAuth();
      
      // Load projects from localStorage
      const stored = localStorage.getItem('projects');
      if (stored) {
        try {
          const loaded = JSON.parse(stored);
          // Ensure all projects have isPublic field (default to true for backwards compatibility)
          projectsData = loaded.map(p => ({
            ...p,
            isPublic: p.isPublic !== undefined ? p.isPublic : true
          }));
        } catch (e) {
          console.error('Error loading projects from localStorage:', e);
          projectsData = defaultProjects;
        }
      }
    }
  });

  // Save to localStorage whenever projectsData changes
  $: if (browser && projectsData) {
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

  function handleSaveProject() {
    if (newProject && newProject.title.trim()) {
      // Generate a path from the title
      const pathId = newProject.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      newProject.path = `/projects/${pathId}`;
      newProject.id = pathId;
      newProject.hasCommits = true;
      delete newProject.isNew;
      
      projectsData = [...projectsData, newProject];
      // localStorage will be updated automatically via the reactive statement
      newProject = null;
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

  function handleSaveEdit() {
    if (editingProject) {
      const index = projectsData.findIndex(p => p.id === editingProject.id);
      if (index !== -1) {
        projectsData[index] = { ...editingProject };
        projectsData = [...projectsData]; // Trigger reactivity
        editingProject = null;
      }
    }
  }

  function handleCancelEdit() {
    editingProject = null;
  }

  function handleDeleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
      projectsData = projectsData.filter(p => p.id !== projectId);
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
              <button class="save-button" on:click={handleSaveProject}>Save</button>
              <button class="cancel-button" on:click={handleCancelProject}>Cancel</button>
            </div>
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
                <button class="save-button" on:click={handleSaveEdit}>Save</button>
                <button class="cancel-button" on:click={handleCancelEdit}>Cancel</button>
                <button class="delete-button" on:click={() => handleDeleteProject(project.id)}>Delete</button>
              </div>
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
