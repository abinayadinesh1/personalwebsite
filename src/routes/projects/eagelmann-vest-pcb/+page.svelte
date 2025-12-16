<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { getProjectStatus } from '$lib/utils/projectStatus.js';
  import SvelteMarkdown from 'svelte-markdown';

  let showEditor = true;

  const eagelmannContent = `### My first PCB, made in 15 hours in KiCad. 

  - controls 10 haptic motors, w/ capacity up to 16

  - 5V to ctrl motors and 3.3V to ctrl board

  - i2C forwarder to mux motor id's

  - LED status grid

  Miraculously worked first try (have never said that before); uploading code, controlling each motor independently.

  <img src="/pcb.jpeg" alt="Description" width="25%" />`;

  const defaultProjects = [
    { id: 'writing', title: 'writing', path: '/projects/writing_ideas', lastUpdated: '2025-12-13', status: 'In Progress', hasCommits: true, isPublic: false },
    { id: 'pcb 1', title: 'haptic motor controller (pcb)', path: '/projects/eagelmann-vest-pcb', lastUpdated: '2025-04-17', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'turtlebot3', title: 'Visual Navigation with Turtlebot3', path: '/projects/turtlebot3', lastUpdated: '2024-09-15', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'tinybots', title: 'Playing with micro-micro-controllers', path: '/projects/tinybots', lastUpdated: '2024-08-20', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'bracketbots', title: "Building a 'wifey' bot", path: '/projects/bracketbots', lastUpdated: '2024-10-10', status: 'Graduated', hasCommits: true, isPublic: true }
  ];

  onMount(() => {
    if (browser) {
      const { showEditor: shouldShowEditor } = getProjectStatus('eagelmann-vest-pcb', defaultProjects);
      showEditor = shouldShowEditor;
    }
  });
</script>

{#if showEditor}
  <ProjectEditor projectId="eagelmann-vest-pcb" isAdmin={false} />
{:else}
  <div class="graduated-project-content">
    <SvelteMarkdown source={eagelmannContent} />
  </div>
{/if}
