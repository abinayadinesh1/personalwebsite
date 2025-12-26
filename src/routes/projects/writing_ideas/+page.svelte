<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { loadProjects } from '$lib/utils/projects.js';

  export let data;

  let isAdmin = data?.isAdmin || false;
  let project = null;
  let loading = true;
  let error = null;
  let showEditor = false;

  onMount(async () => {
    if (browser) {
      const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
      isAdmin = data?.isAdmin || clientAuth;

      // Load projects to find the writing project
      try {
        const projects = await loadProjects(isAdmin);
        // Find project by path (since route is /projects/writing_ideas)
        // The project ID in database is "writing", but path is "/projects/writing_ideas"
        project = projects.find(p => p.path === '/projects/writing_ideas' || p.id === 'writing');
        
        if (!project) {
          error = 'Project not found';
          loading = false;
          return;
        }

        console.log('✅ Found project:', { id: project.id, path: project.path });
        
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
    <!-- Pass project.id (which is "writing") not the route param -->
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
