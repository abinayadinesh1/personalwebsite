<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { previewPublic } from '$lib/adminView.js';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';

  export let data;

  let adminAuth = data.isAdmin || false;
  $: isAdmin = adminAuth && !$previewPublic;

  onMount(() => {
    if (browser) {
      adminAuth = data.isAdmin || sessionStorage.getItem('adminAuth') === 'true';
    }
  });
</script>

<svelte:head>
  <title>About me</title>
</svelte:head>

<ProjectEditor projectId={data.projectId} title="About me" narrow {isAdmin} />
