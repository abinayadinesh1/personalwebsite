<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';

  export let data;

  let isAdmin = data?.isAdmin || false;

  onMount(() => {
    if (browser) {
      const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
      isAdmin = data?.isAdmin || clientAuth;
    }
  });
</script>

<ProjectEditor projectId="tinybots" {isAdmin} />
