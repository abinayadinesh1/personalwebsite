<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { previewPublic } from '$lib/adminView.js';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { loadProjects } from '$lib/utils/projects.js';

  export let data; // Server-side data from +page.server.js

  const { projectId, isAdmin: serverIsAdmin } = data;
  let adminAuth = serverIsAdmin || false;
  $: isAdmin = adminAuth && !$previewPublic;
  let project = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    if (browser) {
      // Check client-side admin auth
      const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
      adminAuth = serverIsAdmin || clientAuth;

      // Load projects to find the current one
      try {
        const projects = await loadProjects(adminAuth);
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

  // In public view, private writings look the way they do to the public
  $: hiddenFromPublic = project && project.isPublic === false && !isAdmin;
</script>

{#if loading}
  <div style="padding: 2rem; text-align: center;">
    <p>Loading project...</p>
  </div>
{:else if error || hiddenFromPublic}
  <div style="padding: 2rem;">
    <h1>Project Not Found</h1>
    <p>{error || 'Project not found'}</p>
    <a href="/projects">← Back to Projects</a>
  </div>
{:else if project}
  <ProjectEditor projectId={project.id} title={project.title} narrow={(project.section || 'projects') !== 'projects'} {isAdmin} />
{/if}
