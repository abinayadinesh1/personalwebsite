<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import SvelteMarkdown from 'svelte-markdown';
  import ContributionsGraph from '$lib/components/ContributionsGraph.svelte';
  import { loadProjectContent, saveProjectContentToSupabase } from '$lib/utils/projects.js';
  import '../../styles/components/editor.css';

  export let projectId = '';
  export let isAdmin = false;

  // Note: projectId should always be provided as a prop from the parent component
  // (which resolves the project and passes project.id, not the route param)

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
  let loadingContent = false;
  let savingContent = false;
  let saveError = null;

  // Split content into segments: regular markdown and hidden blocks.
  // Returns array of { type: 'visible' | 'hidden', content: string }
  function splitHiddenContent(content) {
    if (!content) return [];
    const segments = [];
    const regex = /<hidden>([\s\S]*?)<\/hidden>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add visible content before this hidden block
      if (match.index > lastIndex) {
        segments.push({ type: 'visible', content: content.slice(lastIndex, match.index) });
      }
      // Add the hidden block
      segments.push({ type: 'hidden', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    // Add remaining visible content
    if (lastIndex < content.length) {
      segments.push({ type: 'visible', content: content.slice(lastIndex) });
    }
    return segments;
  }

  // For non-admins: just strip hidden blocks entirely
  function stripHiddenContent(content) {
    if (!content) return '';
    return content.replace(/<hidden>[\s\S]*?<\/hidden>/g, '');
  }

  $: contentSegments = isAdmin ? splitHiddenContent(markdownContent) : [];
  $: publicContent = !isAdmin ? stripHiddenContent(markdownContent) : '';

  // Load project data from backend (with localStorage fallback)
  onMount(async () => {
    if (browser && projectId) {
      await loadProjectData();
      if (isAdmin) {
        loadAvailableRepos();
      }
    }
  });

  async function loadProjectData() {
    if (!browser || !projectId) return;
    
    console.log('📥 Loading project content with ID:', projectId);
    loadingContent = true;
    try {
      const content = await loadProjectContent(projectId);
      markdownContent = content.markdownContent || '';
      githubRepo = content.githubRepo || '';
      if (githubRepo) {
        loadContributions();
      }
      updateTimeline();
    } catch (e) {
      console.error('Error loading project data:', e);
      // Content will be empty, which is fine - user can start fresh
    } finally {
      loadingContent = false;
    }
  }

  async function saveProjectData() {
    if (!browser || !projectId) return;
    
    console.log('💾 Saving project content with ID:', projectId);
    savingContent = true;
    saveError = null;
    
    try {
      // Save to Supabase (this will also update localStorage cache)
      await saveProjectContentToSupabase(projectId, markdownContent, githubRepo);
      updateTimeline();
    } catch (error) {
      console.error('Error saving project content:', error);
      saveError = error.message || 'Failed to save content';
      // Content is still saved to localStorage as backup by the utility function
    } finally {
      savingContent = false;
    }
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

  async function handleSave() {
    await saveProjectData();
    if (!saveError) {
      isEditing = false;
    }
  }

  async function handleCancel() {
    await loadProjectData(); // Reload original content
    isEditing = false;
    saveError = null;
  }

  function addDateEntry() {
    if (!isAdmin) return;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const dateHeader = `## ${dateStr}\n\n`;
    
    if (!isEditing) {
      isEditing = true;
    }
    
    // Add date header at the top
    markdownContent = dateHeader + (markdownContent ? '\n\n' + markdownContent : '');
    
    // Focus textarea and move cursor after the new header
    setTimeout(() => {
      if (editTextarea) {
        editTextarea.focus();
        const newPos = dateHeader.length;
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

  async function saveRepo() {
    if (selectedRepoId) {
      const selectedRepo = availableRepos.find(r => r.id.toString() === selectedRepoId);
      if (selectedRepo) {
        githubRepo = selectedRepo.url;
      }
    } else {
      githubRepo = '';
    }
    isEditingRepo = false;
    await saveProjectData();
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
          <button class="save-btn" on:click={handleSave} disabled={savingContent}>
            {savingContent ? 'Saving...' : 'Save'}
          </button>
          <button class="cancel-btn" on:click={handleCancel} disabled={savingContent}>Cancel</button>
          {#if saveError}
            <span class="save-error" style="color: #ff6b6b; font-size: 0.9rem; margin-left: 1rem;">
              {saveError}
            </span>
          {/if}
        </div>
        <textarea
          bind:this={editTextarea}
          bind:value={markdownContent}
          class="markdown-editor"
          placeholder="Start writing your daily log... Double-click to edit or use 'Add Date' to add a new entry."
        ></textarea>
      {:else}
        <div class="markdown-display">
          {#if loadingContent}
            <p class="empty-state">Loading content...</p>
          {:else if markdownContent}
            {#if isAdmin}
              {#each contentSegments as segment}
                {#if segment.type === 'hidden'}
                  <div class="hidden-content-admin">
                    <span class="hidden-badge">Hidden</span>
                    <SvelteMarkdown source={segment.content} />
                  </div>
                {:else}
                  <SvelteMarkdown source={segment.content} />
                {/if}
              {/each}
            {:else}
              <SvelteMarkdown source={publicContent} />
            {/if}
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
