<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { getProjectStatus } from '$lib/utils/projectStatus.js';
  import SvelteMarkdown from 'svelte-markdown';

  let showEditor = true;

  const tinybotsContent = `# introvert bot

I flew across the country for two days to build microbots with my friends. 

### Project Description:

With the release of Carl Bugeja's penny-sized [codecells](https://microbots.io/products/codecell?srsltid=AfmBOoru9usWntmHmdrsvQdLJ1z-plgWL1feEu-BPRgsevfjh9zjJCJQ&variant=49714638717261) and [drivecells](https://microbots.io/products/drivecell), we tried to build a tiny mobile robot which ran away from the light: essentially, an introvert bot. The specs for this were quite simple: 1) connect the motors to the drivcell and the codecell 2) hook up photoresistors at opposite ends of the bot 3) write a script for the bot to move in the opposite direction of the brightest light source.

v0 v1

Final Design:

[insert image of the cad file and bot itself]

### Learned:

- How to work with limited space on the board (literally running out of pins to connect our sensors to)
    - Introducing concepts like Charlieplexing/multiplexing
- How to solder tiny tiny components
- How to use a proto board!
- How to manually reset a board (by short circuiting it)

### Challenges:

After about 18 hours, we ran a bug that read: "A fatal error occurred: Unable to verify flash chip connection (No serial data received." The only way to fix it was to mechanically reset the board, by connect the SLC and GND pins to each other and supplying power. However, this would only work temporarily, which made it really hard to upload new code to the board. We were stuck with the motors spinning at 'forward' for hours trying to load new code on. 

### Outcome:

We ended up with a script to move the bot in all directors and for it to autonomously move in the direction of least light. It had 2 wheels and 3 photoresistors, meaning it would go backwards, right or left depending on the photoresistor data. We also CAD'ed and assembled the robo, polishing off the wiring by mounting the cables and sensors onto a protoboard. 

---`;

  const defaultProjects = [
    { id: 'writing', title: 'writing', path: '/projects/writing_ideas', lastUpdated: '2025-12-13', status: 'In Progress', hasCommits: true, isPublic: false },
    { id: 'pcb 1', title: 'haptic motor controller (pcb)', path: '/projects/eagelmann-vest-pcb', lastUpdated: '2025-04-17', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'turtlebot3', title: 'Visual Navigation with Turtlebot3', path: '/projects/turtlebot3', lastUpdated: '2024-09-15', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'tinybots', title: 'Playing with micro-micro-controllers', path: '/projects/tinybots', lastUpdated: '2024-08-20', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'bracketbots', title: "Building a 'wifey' bot", path: '/projects/bracketbots', lastUpdated: '2024-10-10', status: 'Graduated', hasCommits: true, isPublic: true }
  ];

  onMount(() => {
    if (browser) {
      const { showEditor: shouldShowEditor } = getProjectStatus('tinybots', defaultProjects);
      showEditor = shouldShowEditor;
    }
  });
</script>

{#if showEditor}
  <ProjectEditor projectId="tinybots" isAdmin={false} />
{:else}
  <div class="graduated-project-content">
    <SvelteMarkdown source={tinybotsContent} />
  </div>
{/if}
