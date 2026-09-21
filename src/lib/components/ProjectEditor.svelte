<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import SvelteMarkdown from 'svelte-markdown';
  import ContributionsGraph from '$lib/components/ContributionsGraph.svelte';
  import { loadProjectContent, saveProjectContentToNeon } from '$lib/utils/projects.js';
  import '../../styles/components/editor.css';

  export let projectId = '';
  export let isAdmin = false;
  export let title = ''; // Project title, shown as the article heading in view mode

  // Note: projectId should always be provided as a prop from the parent component
  // (which resolves the project and passes project.id, not the route param)

  let markdownContent = '';

  // One Enter in the editor is a line break; two Enters start a new paragraph
  // (paragraph spacing is one blank line, see .markdown-display p in global.css).
  const markdownOptions = { breaks: true };
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
  let newChangelogDate = '';
  let newChangelogLabel = '';
  let editingChangelogIndex = -1;
  let uploadingImage = false;
  let imageFileInput = null;

  // Insert text at the textarea caret (or append if the textarea isn't focused).
  // Works against editableContent (changelog metadata stripped) and re-embeds it.
  function insertAtCursor(text) {
    const el = editTextarea;
    if (!el) {
      markdownContent = embedChangelog(editableContent + text, timelineData);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const updated = current.slice(0, start) + text + current.slice(end);
    markdownContent = embedChangelog(updated, timelineData);
    setTimeout(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  }

  // Vercel rejects request bodies over ~4.5MB with a bare 413 before our code
  // runs, so shrink large images in the browser first. The server re-encodes
  // to JPEG anyway, so quality loss here is minimal.
  const UPLOAD_TARGET_BYTES = 3.5 * 1024 * 1024;
  const UPLOAD_MAX_DIMENSION = 2400;

  async function decodeImage(file) {
    if (typeof createImageBitmap === 'function') {
      try {
        return await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        // fall through to the <img> path
      }
    }
    const url = URL.createObjectURL(file);
    try {
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not read image'));
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  async function shrinkImage(file) {
    if (file.size <= UPLOAD_TARGET_BYTES) return file;
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

    const source = await decodeImage(file);
    const srcW = source.width || source.naturalWidth;
    const srcH = source.height || source.naturalHeight;
    let scale = Math.min(1, UPLOAD_MAX_DIMENSION / Math.max(srcW, srcH));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let blob = null;

    // Try progressively lower quality, then smaller dimensions, until it fits.
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.max(1, Math.round(srcW * scale));
      canvas.height = Math.max(1, Math.round(srcH * scale));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.7, 0.55]) {
        blob = await canvasToBlob(canvas, quality);
        if (blob && blob.size <= UPLOAD_TARGET_BYTES) break;
      }
      if (blob && blob.size <= UPLOAD_TARGET_BYTES) break;
      scale *= 0.7;
    }
    if (source.close) source.close();
    if (!blob) return file;

    const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  }

  // Upload one image: insert a placeholder marker, POST to /api/images, then
  // swap the marker for an <img> tag pointing at the stored image.
  async function uploadImage(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    uploadingImage = true;
    saveError = null;
    const marker = `⏳uploading-${Date.now()}-${Math.random().toString(36).slice(2)}⏳`;
    insertAtCursor(marker);
    try {
      const upload = await shrinkImage(file);
      const fd = new FormData();
      fd.append('file', upload);
      const res = await fetch('/api/images', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 413) {
          throw new Error(err.error || 'Image is too large to upload (server limit is about 4.5MB)');
        }
        throw new Error(err.error || `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      const imgTag = `<img src="${url}" alt="${file.name || 'image'}" width="50%" />`;
      const updated = editableContent.replace(marker, imgTag);
      markdownContent = embedChangelog(updated, timelineData);
      // Park the caret right after the new tag so a following upload lands
      // beside it (adjacent images render side by side) instead of inside it.
      if (editTextarea) {
        const pos = updated.indexOf(imgTag) + imgTag.length;
        setTimeout(() => {
          editTextarea?.setSelectionRange(pos, pos);
        }, 0);
      }
      await saveProjectData();
    } catch (e) {
      markdownContent = embedChangelog(editableContent.replace(marker, ''), timelineData);
      saveError = e.message || 'Image upload failed';
    } finally {
      uploadingImage = false;
    }
  }

  async function handleDrop(e) {
    if (!isAdmin) return;
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
    for (const f of files) await uploadImage(f);
  }

  function handleDragOver(e) {
    if (!isAdmin) return;
    e.preventDefault();
  }

  async function handlePaste(e) {
    if (!isAdmin) return;
    const items = Array.from(e.clipboardData?.items || []).filter((it) => it.type.startsWith('image/'));
    if (items.length === 0) return;
    e.preventDefault();
    for (const it of items) {
      const f = it.getAsFile();
      if (f) await uploadImage(f);
    }
  }

  function triggerImagePicker() {
    imageFileInput?.click();
  }

  async function handleFileInputChange(e) {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    for (const f of files) await uploadImage(f);
    e.target.value = '';
  }

  // Extract changelog metadata from markdown content
  function extractChangelog(content) {
    if (!content) return { changelog: [], cleanContent: content };
    const match = content.match(/<!-- changelog:(.*?) -->/);
    if (match) {
      try {
        const changelog = JSON.parse(match[1]);
        const cleanContent = content.replace(/<!-- changelog:.*? -->\n?/, '');
        return { changelog, cleanContent };
      } catch (e) {
        return { changelog: [], cleanContent: content };
      }
    }
    return { changelog: [], cleanContent: content };
  }

  // Embed changelog metadata into markdown content
  function embedChangelog(content, changelog) {
    // Remove any existing changelog metadata
    const clean = (content || '').replace(/<!-- changelog:.*? -->\n?/, '');
    if (changelog.length === 0) return clean;
    return `<!-- changelog:${JSON.stringify(changelog)} -->\n${clean}`;
  }

  function addChangelogEntry() {
    if (!isAdmin || !newChangelogDate) return;
    const entry = {
      date: newChangelogDate,
      label: newChangelogLabel || ''
    };
    timelineData = [...timelineData, entry].sort((a, b) => new Date(a.date) - new Date(b.date));
    markdownContent = embedChangelog(markdownContent, timelineData);
    newChangelogDate = '';
    newChangelogLabel = '';
    saveProjectData();
  }

  function removeChangelogEntry(index) {
    if (!isAdmin) return;
    timelineData = timelineData.filter((_, i) => i !== index);
    markdownContent = embedChangelog(markdownContent, timelineData);
    saveProjectData();
  }

  function formatChangelogDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // A Google Drive share link on its own line becomes an embedded player.
  // Handles .../file/d/<id>/view?usp=sharing and .../open?id=<id>. The file
  // must be shared as "Anyone with the link" for the embed to play.
  const DRIVE_LINK_LINE = /^[ \t]*<?(https?:\/\/drive\.google\.com\/(?:file\/d\/([\w-]+)[^\s>]*|open\?id=([\w-]+)[^\s>]*))>?[ \t]*$/gm;

  function embedDriveLinks(md) {
    if (!md) return md;
    return md.replace(DRIVE_LINK_LINE, (_m, _url, idA, idB) => {
      const id = idA || idB;
      return `<iframe class="drive-embed" src="https://drive.google.com/file/d/${id}/preview" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    });
  }

  // Split content into segments: regular markdown and hidden blocks.
  // Returns array of { type: 'visible' | 'hidden', content: string }
  function splitHiddenContent(content) {
    if (!content) return [];
    // Strip changelog metadata before splitting
    const cleaned = content.replace(/<!-- changelog:.*? -->\n?/, '');
    const segments = [];
    const regex = /<hidden>([\s\S]*?)<\/hidden>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(cleaned)) !== null) {
      // Add visible content before this hidden block
      if (match.index > lastIndex) {
        segments.push({ type: 'visible', content: cleaned.slice(lastIndex, match.index) });
      }
      // Add the hidden block
      segments.push({ type: 'hidden', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    // Add remaining visible content
    if (lastIndex < cleaned.length) {
      segments.push({ type: 'visible', content: cleaned.slice(lastIndex) });
    }
    return segments;
  }

  // For non-admins: just strip hidden blocks and changelog metadata
  function stripHiddenContent(content) {
    if (!content) return '';
    return content.replace(/<hidden>[\s\S]*?<\/hidden>/g, '').replace(/<!-- changelog:.*? -->\n?/, '');
  }

  $: contentSegments = isAdmin
    ? splitHiddenContent(markdownContent).map(seg => ({ ...seg, content: embedDriveLinks(seg.content) }))
    : [];
  $: publicContent = !isAdmin ? embedDriveLinks(stripHiddenContent(markdownContent)) : '';
  // Editable content without changelog metadata
  $: editableContent = markdownContent ? markdownContent.replace(/<!-- changelog:.*? -->\n?/, '') : '';

  function handleEditableContentChange(e) {
    const newEditableContent = e.target.value;
    markdownContent = embedChangelog(newEditableContent, timelineData);
  }

  // Wrap the current selection in a markdown marker (e.g. ** or *). With no
  // selection, insert a marker pair and park the caret between them.
  function wrapSelection(marker) {
    const el = editTextarea;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    const selected = value.slice(start, end);
    const updated = value.slice(0, start) + marker + selected + marker + value.slice(end);
    markdownContent = embedChangelog(updated, timelineData);
    setTimeout(() => {
      el.setSelectionRange(start + marker.length, end + marker.length);
    }, 0);
  }

  // Cmd/Ctrl+B -> **bold**, Cmd/Ctrl+I -> *italic*
  function handleEditorKeydown(e) {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      wrapSelection('**');
    } else if (key === 'i') {
      e.preventDefault();
      wrapSelection('*');
    }
  }

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
      const raw = content.markdownContent || '';
      const { changelog } = extractChangelog(raw);
      markdownContent = raw; // keep full content with metadata
      timelineData = changelog;
      githubRepo = content.githubRepo || '';
      if (githubRepo) {
        loadContributions();
      }
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
      // Save to Neon (this will also update localStorage cache)
      await saveProjectContentToNeon(projectId, markdownContent, githubRepo);
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

  // Sidebar visibility: admins always see Changelog and GitHub; viewers only see
  // sections that actually have content.
  $: showChangelog = isAdmin || timelineData.length > 0;
  $: showGithub = isAdmin || !!githubRepo;
  $: showSidebar = showChangelog || showGithub;
</script>

<div class="editor-dashboard" class:no-sidebar={!showSidebar}>
  <!-- Main Editor Column (75%) -->
  <div class="editor-column">
    {#if isAdmin}
      <div class="editor-header">
        <h2>Editor</h2>
        <div class="editor-actions">
        </div>
      </div>
    {:else if title}
      <div class="editor-header">
        <h2>{title}</h2>
      </div>
    {/if}
    
    <div 
      class="editor-content" 
      class:editing={isEditing}
      class:published={!isAdmin}
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
          <button class="image-upload-btn" on:click={triggerImagePicker} disabled={uploadingImage} title="Upload image (or drag/paste into the editor)">
            {uploadingImage ? 'Uploading…' : '📎 Image'}
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            bind:this={imageFileInput}
            on:change={handleFileInputChange}
            style="display: none;"
          />
          {#if saveError}
            <span class="save-error" style="color: #ff6b6b; font-size: 0.9rem; margin-left: 1rem;">
              {saveError}
            </span>
          {/if}
        </div>
        <textarea
          bind:this={editTextarea}
          value={editableContent}
          on:input={handleEditableContentChange}
          on:keydown={handleEditorKeydown}
          on:drop={handleDrop}
          on:dragover={handleDragOver}
          on:paste={handlePaste}
          class="markdown-editor"
          placeholder="Start writing ... (**bold**, *italic*, drag or paste an image to upload, paste a Google Drive link on its own line to embed a video)"
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
                    <SvelteMarkdown source={segment.content} options={markdownOptions} />
                  </div>
                {:else}
                  <SvelteMarkdown source={segment.content} options={markdownOptions} />
                {/if}
              {/each}
            {:else}
              <SvelteMarkdown source={publicContent} options={markdownOptions} />
            {/if}
          {:else}
            <p class="empty-state">
              {#if isAdmin}
                Double-click here to start editing.
              {:else}
                No entries yet.
              {/if}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Sidebar (25%). In view mode, empty sections are hidden; admins always see both. -->
  {#if showSidebar}
  <div class="sidebar-column">
    <!-- Changelog -->
    {#if showChangelog}
    <div class="sidebar-section">
      <h3>Changelog</h3>
      <div class="timeline-container">
        {#if timelineData.length > 0}
          <div class="timeline">
            {#each timelineData as entry, index}
              <div class="timeline-item">
                <span class="timeline-dash">—</span>
                <div class="timeline-entry-content">
                  <span class="timeline-label">{formatChangelogDate(entry.date)}</span>
                  {#if entry.label}
                    <span class="timeline-entry-label">{entry.label}</span>
                  {/if}
                </div>
                {#if isAdmin}
                  <button class="timeline-remove-btn" on:click={() => removeChangelogEntry(index)} title="Remove entry">&times;</button>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-timeline">No entries yet</p>
        {/if}
        {#if isAdmin}
          <div class="changelog-add-form">
            <input type="date" bind:value={newChangelogDate} class="changelog-date-input" />
            <input type="text" bind:value={newChangelogLabel} class="changelog-label-input" placeholder="Description (optional)" />
            <button class="add-date-btn" on:click={addChangelogEntry}>Add</button>
          </div>
        {/if}
      </div>
    </div>
    {/if}

    <!-- GitHub Section -->
    {#if showGithub}
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
    {/if}
  </div>
  {/if}
</div>
