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
  <ProjectEditor projectId={project.id} {isAdmin} />
{/if}
