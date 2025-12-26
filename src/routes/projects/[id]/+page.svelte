<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { loadProjects } from '$lib/utils/projects.js';

  export let data; // Server-side data from +page.server.js

  const { projectId, isAdmin: serverIsAdmin } = data;
  let isAdmin = serverIsAdmin || false;
  let project = null;
  let loading = true;
  let error = null;
  let showEditor = false;

  onMount(async () => {
    if (browser) {
      // Check client-side admin auth
      const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
      isAdmin = serverIsAdmin || clientAuth;

      // Load projects to find the current one
      try {
        const projects = await loadProjects(isAdmin);
        project = projects.find(p => p.id === projectId || p.path === `/projects/${projectId}`);
        
        if (!project) {
          error = 'Project not found';
          loading = false;
          return;
        }

        // Show editor if project is not "Graduated"
        showEditor = project.status !== 'Graduated';
        loading = false;
      } catch (err) {
        console.error('Error loading project:', err);
        error = 'Failed to load project';
        loading = false;
      }
    }
  });
</script>

{#if loading}
  <div style="padding: 2rem; text-align: center;">
    <p>Loading project...</p>
  </div>
{:else if error}
  <div style="padding: 2rem;">
    <h1>Project Not Found</h1>
    <p>{error}</p>
    <a href="/projects">← Back to Projects</a>
  </div>
{:else if project}
  {#if showEditor}
    <ProjectEditor projectId={project.id} {isAdmin} />
  {:else}
    <!-- Graduated project content -->
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h1>{project.title}</h1>
      <p style="color: #666; margin-bottom: 2rem;">
        Last updated: {new Date(project.lastUpdated).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      <p>This project has been graduated. Static content will be displayed here.</p>
      <a href="/projects">← Back to Projects</a>
    </div>
  {/if}
{/if}
