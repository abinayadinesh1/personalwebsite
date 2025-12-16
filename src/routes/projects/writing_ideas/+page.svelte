<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { getProjectStatus } from '$lib/utils/projectStatus.js';

  export let data;

  let isAdmin = data?.isAdmin || false;
  let showEditor = true;

  const defaultProjects = [
    { id: 'writing', title: 'writing', path: '/projects/writing_ideas', lastUpdated: '2025-12-13', status: 'In Progress', hasCommits: true, isPublic: false },
    { id: 'pcb 1', title: 'haptic motor controller (pcb)', path: '/projects/eagelmann-vest-pcb', lastUpdated: '2025-04-17', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'turtlebot3', title: 'Visual Navigation with Turtlebot3', path: '/projects/turtlebot3', lastUpdated: '2024-09-15', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'tinybots', title: 'Playing with micro-micro-controllers', path: '/projects/tinybots', lastUpdated: '2024-08-20', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'bracketbots', title: "Building a 'wifey' bot", path: '/projects/bracketbots', lastUpdated: '2024-10-10', status: 'Graduated', hasCommits: true, isPublic: true }
  ];

  onMount(() => {
    if (browser) {
      const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
      isAdmin = data?.isAdmin || clientAuth;

      const { showEditor: shouldShowEditor } = getProjectStatus('writing_ideas', defaultProjects);
      showEditor = shouldShowEditor;
    }
  });
</script>

{#if showEditor}
  <ProjectEditor projectId="writing_ideas" {isAdmin} />
{:else}
  <!-- Graduated project content - add your static content here -->
  <div class="graduated-project">
    <h1>writing</h1>
    <p>This is a graduated project. Add your project content here.</p>
  </div>
{/if}
  