<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { getProjectStatus } from '$lib/utils/projectStatus.js';
  import SvelteMarkdown from 'svelte-markdown';

  let showEditor = true;

  const bracketbotsContent = `### a friendly 5 foot tall bot that can make sandwiches for you

over the weekend, i flew to across the country for the BEST hardware hackathon to take place, hosted by Brian Machado at UWaterloo.  

in < 14 hours of pure engineering, we built a 'wifey' bot that can make sandwiches for you!!

apart from the features of the base bracket bot (self balancing, rc'able, cameras, etc.), we added a 6DOF teleoperable arm that we controlled to pick up bread + other sandwich ingredients. may not be the most tasty, but at least it's made with love <3`;

  // Default projects data (should match projects/+page.svelte)
  const defaultProjects = [
    { id: 'writing', title: 'writing', path: '/projects/writing_ideas', lastUpdated: '2025-12-13', status: 'In Progress', hasCommits: true, isPublic: false },
    { id: 'pcb 1', title: 'haptic motor controller (pcb)', path: '/projects/eagelmann-vest-pcb', lastUpdated: '2025-04-17', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'turtlebot3', title: 'Visual Navigation with Turtlebot3', path: '/projects/turtlebot3', lastUpdated: '2024-09-15', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'tinybots', title: 'Playing with micro-micro-controllers', path: '/projects/tinybots', lastUpdated: '2024-08-20', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'bracketbots', title: "Building a 'wifey' bot", path: '/projects/bracketbots', lastUpdated: '2024-10-10', status: 'Graduated', hasCommits: true, isPublic: true }
  ];

  onMount(() => {
    if (browser) {
      const { showEditor: shouldShowEditor } = getProjectStatus('bracketbots', defaultProjects);
      showEditor = shouldShowEditor;
    }
  });
</script>

{#if showEditor}
  <ProjectEditor projectId="bracketbots" isAdmin={false} />
{:else}
  <div class="graduated-project-content">
    <SvelteMarkdown source={bracketbotsContent} />
  </div>
{/if}
