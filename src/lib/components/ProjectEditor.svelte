<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import SvelteMarkdown from 'svelte-markdown';
  import ContributionsGraph from '$lib/components/ContributionsGraph.svelte';
  import '../../styles/components/editor.css';

  export let projectId = '';
  export let isAdmin = false;

  // Extract project ID from route if not provided
  $: if (!projectId && browser) {
    const pathname = $page.url.pathname;
    const match = pathname.match(/\/projects\/([^\/]+)/);
    if (match) {
      projectId = match[1];
    }
  }

  let markdownContent = '';
  let isEditing = false;
  let editTextarea = null;
  let githubRepo = '';
  let isEditingRepo = false;
  let tempRepoUrl = '';
  let contributions = {};
  let totalContributions = 0;
  let loadingContributions = false;
  let timelineData = [];
  let availableRepos = [];
  let loadingRepos = false;
  let selectedRepoId = '';

  // Load project data from localStorage
  onMount(() => {
    if (browser && projectId) {
      loadProjectData();
      if (isAdmin) {
        loadAvailableRepos();
      }
    }
  });

  function loadProjectData() {
    if (!browser) return;
    
    const key = `project_${projectId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        markdownContent = data.content || '';
        githubRepo = data.githubRepo || '';
        if (githubRepo) {
          loadContributions();
        }
        updateTimeline();
      } catch (e) {
        console.error('Error loading project data:', e);
      }
    }
  }

  function saveProjectData() {
    if (!browser || !projectId) return;
    
    const key = `project_${projectId}`;
    const data = {
      content: markdownContent,
      githubRepo: githubRepo,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    updateTimeline();
  }

  function handleDoubleClick() {
    if (!isAdmin) return;
    
    if (!isEditing) {
      isEditing = true;
      // Focus the textarea after it's rendered
      setTimeout(() => {
        if (editTextarea) {
          editTextarea.focus();
          // Move cursor to end
          editTextarea.setSelectionRange(editTextarea.value.length, editTextarea.value.length);
        }
      }, 0);
    }
  }

  function handleBlur() {
    // Small delay to allow save button clicks
    setTimeout(() => {
      if (isEditing) {
        saveProjectData();
        isEditing = false;
      }
    }, 200);
  }

  function handleSave() {
    saveProjectData();
    isEditing = false;
  }

  function handleCancel() {
    loadProjectData(); // Reload original content
    isEditing = false;
  }

  function addDateEntry() {
    if (!isAdmin) return;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const dateHeader = `\n\n## ${dateStr}\n\n`;
    
    if (!isEditing) {
      isEditing = true;
    }
    
    // Add date header at the end
    markdownContent += dateHeader;
    
    // Focus textarea and move cursor after the new header
    setTimeout(() => {
      if (editTextarea) {
        editTextarea.focus();
        const newPos = editTextarea.value.length;
        editTextarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }

  function updateTimeline() {
    if (!markdownContent) {
      timelineData = [];
      return;
    }

    // Extract dates from markdown headers (## Date format)
    const dateRegex = /^##\s+(.+)$/gm;
    const dates = [];
    let match;
    
    while ((match = dateRegex.exec(markdownContent)) !== null) {
      const dateStr = match[1].trim();
      const date = parseDate(dateStr);
      if (date) {
        dates.push({
          date: date,
          dateStr: dateStr,
          position: match.index
        });
      }
    }

    // Sort by date
    dates.sort((a, b) => a.date - b.date);
    timelineData = dates;
  }

  function parseDate(dateStr) {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  }

  async function loadAvailableRepos() {
    if (!browser || !isAdmin) return;
    
    loadingRepos = true;
    try {
      const response = await fetch('/api/github/repos');
      if (response.ok) {
        const data = await response.json();
        availableRepos = data.repos || [];
        
        // Set selectedRepoId if githubRepo matches a repo
        if (githubRepo) {
          const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (match) {
            const fullName = `${match[1]}/${match[2].replace(/\.git$/, '').replace(/\/$/, '')}`;
            const repo = availableRepos.find(r => r.fullName === fullName);
            if (repo) {
              selectedRepoId = repo.id.toString();
            }
          }
        }
      } else {
        console.error('Failed to load repos:', response.status);
        availableRepos = [];
      }
    } catch (e) {
      console.error('Error loading available repos:', e);
      availableRepos = [];
    } finally {
      loadingRepos = false;
    }
  }

  async function loadContributions() {
    if (!githubRepo || !browser) {
      contributions = {};
      totalContributions = 0;
      return;
    }
    
    loadingContributions = true;
    try {
      // Extract owner and repo from URL
      const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        contributions = {};
        totalContributions = 0;
        return;
      }
      
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '').replace(/\/$/, '');
      
      // Fetch contributions from authenticated API
      const response = await fetch(`/api/github/contributions?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Contributions data received:', data);
        contributions = data.contributions || {};
        totalContributions = data.totalContributions || 0;
        console.log('Contributions object:', contributions, 'Total:', totalContributions);
      } else {
        // If not authenticated or error, use empty object
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch contributions:', response.status, errorData);
        contributions = {};
        totalContributions = 0;
      }
    } catch (e) {
      console.error('Error loading contributions:', e);
      contributions = {};
      totalContributions = 0;
    } finally {
      loadingContributions = false;
    }
  }

  function startEditingRepo() {
    if (!isAdmin) return;
    if (availableRepos.length === 0) {
      loadAvailableRepos();
    }
    // Set selectedRepoId to current repo if it exists
    if (githubRepo) {
      const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const fullName = `${match[1]}/${match[2].replace(/\.git$/, '').replace(/\/$/, '')}`;
        const repo = availableRepos.find(r => r.fullName === fullName);
        if (repo) {
          selectedRepoId = repo.id.toString();
        }
      }
    }
    isEditingRepo = true;
  }

  function saveRepo() {
    if (selectedRepoId) {
      const selectedRepo = availableRepos.find(r => r.id.toString() === selectedRepoId);
      if (selectedRepo) {
        githubRepo = selectedRepo.url;
      }
    } else {
      githubRepo = '';
    }
    isEditingRepo = false;
    saveProjectData();
    if (githubRepo) {
      loadContributions();
    }
  }

  function cancelRepoEdit() {
    selectedRepoId = '';
    isEditingRepo = false;
  }

  // Update timeline when content changes
  $: if (markdownContent) {
    updateTimeline();
  }
</script>

<div class="editor-dashboard">
  <!-- Main Editor Column (75%) -->
  <div class="editor-column">
    <div class="editor-header">
      <h2>Daily Log</h2>
      {#if isAdmin}
        <div class="editor-actions">
          <button class="add-date-btn" on:click={addDateEntry} title="Add date entry">
            <i class="las la-calendar-plus"></i> Add Date
          </button>
        </div>
      {/if}
    </div>
    
    <div 
      class="editor-content" 
      class:editing={isEditing}
      on:dblclick={handleDoubleClick}
      role={isAdmin ? "textbox" : "article"}
      aria-label={isAdmin ? "Double-click to edit daily log" : "Daily log content"}
    >
      {#if isEditing && isAdmin}
        <div class="edit-toolbar">
          <button class="save-btn" on:click={handleSave}>Save</button>
          <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
        </div>
        <textarea
          bind:this={editTextarea}
          bind:value={markdownContent}
          on:blur={handleBlur}
          class="markdown-editor"
          placeholder="Start writing your daily log... Double-click to edit or use 'Add Date' to add a new entry."
        ></textarea>
      {:else}
        <div class="markdown-display">
          {#if markdownContent}
            <SvelteMarkdown source={markdownContent} />
          {:else}
            <p class="empty-state">
              {#if isAdmin}
                Double-click here to start editing, or click "Add Date" to add your first entry.
              {:else}
                No entries yet.
              {/if}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Sidebar (25%) -->
  <div class="sidebar-column">
    <!-- Timeline Graph -->
    <div class="sidebar-section">
      <h3>Timeline</h3>
      <div class="timeline-container">
        {#if timelineData.length > 0}
          <div class="timeline">
            {#each timelineData as entry, index}
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-line" class:last={index === timelineData.length - 1}></div>
                <div class="timeline-label">{entry.dateStr}</div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-timeline">No entries yet</p>
        {/if}
      </div>
    </div>

    <!-- GitHub Section -->
    <div class="sidebar-section">
      <h3>GitHub</h3>
      {#if isEditingRepo && isAdmin}
        <div class="repo-editor">
          {#if loadingRepos}
            <p class="loading-repos">Loading repositories...</p>
          {:else if availableRepos.length === 0}
            <p class="no-repos">
              No repositories found. Please authenticate GitHub in{' '}
              <a href="/admin" target="_blank">admin settings</a>.
            </p>
          {:else}
            <select
              bind:value={selectedRepoId}
              class="repo-select"
            >
              <option value="">-- Select a repository --</option>
              {#each availableRepos as repo}
                <option value={repo.id.toString()}>
                  {repo.fullName} {repo.private ? '(Private)' : ''}
                </option>
              {/each}
            </select>
          {/if}
          <div class="repo-actions">
            <button class="save-btn" on:click={saveRepo} disabled={loadingRepos || availableRepos.length === 0}>
              Save
            </button>
            <button class="cancel-btn" on:click={cancelRepoEdit}>Cancel</button>
          </div>
        </div>
      {:else}
        <div class="github-section">
          {#if githubRepo}
            <a href={githubRepo} target="_blank" rel="noopener noreferrer" class="repo-link">
              {githubRepo.replace('https://github.com/', '')}
            </a>
            {#if isAdmin}
              <button class="edit-repo-btn" on:click={startEditingRepo}>Edit</button>
            {/if}
          {:else}
            {#if isAdmin}
              <button class="add-repo-btn" on:click={startEditingRepo}>Link GitHub Repo</button>
            {:else}
              <p class="no-repo">No repository linked</p>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- GitHub Contributions Graph -->
      {#if githubRepo}
        <div class="commit-history">
          <h4>GitHub Contributions</h4>
          {#if loadingContributions}
            <p class="no-commits">Loading contributions...</p>
          {:else if totalContributions > 0}
            <p class="contributions-count">Total contributions: {totalContributions}</p>
            {#key contributions}
              <ContributionsGraph contributions={contributions} />
            {/key}
          {:else}
            <p class="no-commits">No contributions found</p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
