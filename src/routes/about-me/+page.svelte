<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';

  export let data;

  let isAdmin = data.isAdmin || false;

  onMount(() => {
    if (browser) {
      isAdmin = data.isAdmin || sessionStorage.getItem('adminAuth') === 'true';
    }
  });
</script>

<svelte:head>
  <title>About me</title>
</svelte:head>

<ProjectEditor projectId={data.projectId} title="About me" narrow {isAdmin} />
