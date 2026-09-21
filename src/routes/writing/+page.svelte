<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { loadProjects, saveProjectToNeon, updateProjectInNeon, deleteProjectFromNeon } from '$lib/utils/projects.js';

  export let data; // Server-side data from +page.server.js

  let isAdmin = data?.isAdmin || false;

  const subjects = ["General", "Ag", "Notes"];
  let selectedSubjects = ["General"];

  function toggleSubject(subject) {
    if (selectedSubjects.includes(subject)) {
      selectedSubjects = selectedSubjects.filter(s => s !== subject);
    } else {
      selectedSubjects = [...selectedSubjects, subject];
    }
  }

  function selectAll() {
    selectedSubjects = [...subjects];
  }

  // --- Writings that live in the database (projects moved into the Writing tab) ---
  let dbWritings = [];

  onMount(async () => {
    if (!browser) return;
    const clientAuth = sessionStorage.getItem('adminAuth') === 'true';
    isAdmin = (data?.isAdmin || false) || clientAuth;
    try {
      const all = await loadProjects(isAdmin);
      dbWritings = all.filter(p => p.section === 'writing');
    } catch (e) {
      console.error('Error loading writings from database:', e);
    }
    await loadThreads();
  });

  // --- Threads (groups) stored in the database. A group can exist with no writings. ---
  let dbThreads = [];

  async function loadThreads() {
    try {
      const res = await fetch('/api/threads');
      if (res.ok) {
        const data = await res.json();
        dbThreads = data.threads || [];
      }
    } catch (e) {
      console.error('Error loading threads:', e);
    }
  }

  // Every group name available for assignment: database groups plus any names
  // used by the static posts below (e.g. "farmer interviews").
  $: threadOptions = Array.from(new Set([
    ...dbThreads,
    ...allPosts.map(p => p.thread).filter(Boolean)
  ]));

  // Format an ISO date (YYYY-MM-DD) like the static posts: MM.DD.YY
  function formatShortDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d)) return '';
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const yy = String(d.getUTCFullYear()).slice(-2);
    return `${mm}.${dd}.${yy}`;
  }

  // Database writings are shown under "General" alongside the static posts.
  // Private ones are only returned by the API to admins.
  $: dbPosts = dbWritings
    .filter(p => isAdmin || p.isPublic !== false)
    .map(p => ({
      title: p.title,
      date: formatShortDate(p.lastUpdated),
      sortDate: new Date(p.lastUpdated),
      subject: "General",
      href: p.path,
      thread: p.thread || null,
      project: p
    }));

  $: allPosts = [...dbPosts, ...posts];
  $: filteredPosts = allPosts.filter(p => selectedSubjects.includes(p.subject));

  // --- Threads: posts that share a `thread` name are shown together under one heading ---
  // Rows keep the position of the thread's first post; ungrouped posts render as plain rows.
  let collapsedThreads = new Set();

  function toggleThread(name) {
    const next = new Set(collapsedThreads);
    if (next.has(name)) next.delete(name); else next.add(name);
    collapsedThreads = next;
  }

  function buildRows(list, threadNames) {
    const rows = [];
    const seen = new Set();
    for (const post of list) {
      if (!post.thread) {
        rows.push({ type: 'post', post });
        continue;
      }
      if (seen.has(post.thread)) continue;
      seen.add(post.thread);
      const items = list.filter(p => p.thread === post.thread);
      const subjectSet = new Set(items.map(p => p.subject));
      rows.push({
        type: 'thread',
        name: post.thread,
        items,
        date: items.find(p => p.date)?.date || '',
        subject: subjectSet.size === 1 ? items[0].subject : 'Mixed'
      });
    }
    // Groups with no (visible) writings yet appear at the top so they can be found
    const empty = threadNames
      .filter(name => !seen.has(name))
      .map(name => ({ type: 'thread', name, items: [], date: '', subject: '—' }));
    return [...empty, ...rows];
  }

  $: rows = buildRows(filteredPosts, isAdmin ? dbThreads : dbThreads.filter(n => allPosts.some(p => p.thread === n)));

  // --- Admin: create a new group or a new database-backed writing from this page ---
  // newMode: null | 'choose' | 'group' | 'writing'
  let newMode = null;
  let newWriting = null;
  let newGroupName = '';
  let savingWriting = false;
  let saveError = null;

  function handleAddNew() {
    editingWriting = null;
    newMode = 'choose';
    saveError = null;
  }

  function handleChooseGroup() {
    newGroupName = '';
    newMode = 'group';
    saveError = null;
  }

  function handleChooseWriting() {
    const today = new Date().toISOString().split('T')[0];
    newWriting = { title: '', subtitle: '', lastUpdated: today, thread: '', isPublic: false };
    newMode = 'writing';
    saveError = null;
  }

  function handleCancelWriting() {
    newMode = null;
    newWriting = null;
    newGroupName = '';
    saveError = null;
  }

  async function handleSaveGroup() {
    if (!browser) return;
    const name = newGroupName.trim();
    if (!name) {
      saveError = 'Group name is required';
      return;
    }
    savingWriting = true;
    saveError = null;
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create group: ${res.status}`);
      }
      dbThreads = [name, ...dbThreads.filter(n => n !== name)];
      handleCancelWriting();
    } catch (error) {
      saveError = error.message || 'Failed to create group';
      console.error('Error creating group:', error);
    } finally {
      savingWriting = false;
    }
  }

  async function handleRenameGroup(name) {
    if (!browser) return;
    const text = prompt('Rename group:', name);
    if (text === null) return;
    const newName = text.trim();
    if (!newName || newName === name) return;
    try {
      const res = await fetch('/api/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, newName })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to rename group: ${res.status}`);
      }
      dbThreads = dbThreads.map(n => (n === name ? newName : n));
      dbWritings = dbWritings.map(p => (p.thread === name ? { ...p, thread: newName } : p));
      if (collapsedThreads.has(name)) {
        const next = new Set(collapsedThreads);
        next.delete(name);
        next.add(newName);
        collapsedThreads = next;
      }
    } catch (error) {
      saveError = error.message || 'Failed to rename group';
      console.error('Error renaming group:', error);
    }
  }

  async function handleDeleteGroup(name) {
    if (!browser) return;
    if (!confirm(`Delete the group "${name}"? Its writings will be kept but ungrouped.`)) return;
    try {
      const res = await fetch(`/api/threads?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete group: ${res.status}`);
      }
      dbThreads = dbThreads.filter(n => n !== name);
      dbWritings = dbWritings.map(p => (p.thread === name ? { ...p, thread: null } : p));
    } catch (error) {
      saveError = error.message || 'Failed to delete group';
      console.error('Error deleting group:', error);
    }
  }

  async function handleSaveWriting() {
    if (!newWriting || !browser) return;
    const title = newWriting.title.trim();
    if (!title) {
      saveError = 'Title is required';
      return;
    }
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      saveError = 'Title needs at least one letter or number';
      return;
    }
    savingWriting = true;
    saveError = null;
    try {
      const saved = await saveProjectToNeon({
        ...newWriting,
        title,
        id: slug,
        path: `/projects/${slug}`,
        status: 'In Progress',
        hasCommits: false,
        section: 'writing'
      });
      dbWritings = [saved, ...dbWritings];
      handleCancelWriting();
    } catch (error) {
      saveError = error.message || 'Failed to create writing';
      console.error('Error creating writing:', error);
    } finally {
      savingWriting = false;
    }
  }

  // --- Admin: edit or delete an existing database-backed writing ---
  let editingWriting = null;

  // Date input wants YYYY-MM-DD; the API may return a full ISO timestamp
  function toDateInput(dateString) {
    if (!dateString) return '';
    return String(dateString).slice(0, 10);
  }

  function handleEditWriting(project) {
    if (!isAdmin) return;
    handleCancelWriting();
    editingWriting = {
      ...project,
      lastUpdated: toDateInput(project.lastUpdated),
      section: project.section || 'writing',
      thread: project.thread || ''
    };
    saveError = null;
  }

  function handleCancelEdit() {
    editingWriting = null;
    saveError = null;
  }

  async function handleSaveEdit() {
    if (!editingWriting || !browser) return;
    if (!editingWriting.title.trim()) {
      saveError = 'Title is required';
      return;
    }
    savingWriting = true;
    saveError = null;
    try {
      const updated = await updateProjectInNeon(editingWriting);
      if (updated.section === 'writing') {
        dbWritings = dbWritings.map(p => (p.id === updated.id ? updated : p));
      } else {
        // Section changed: it now lives on the Projects tab, so drop it here.
        dbWritings = dbWritings.filter(p => p.id !== updated.id);
      }
      editingWriting = null;
    } catch (error) {
      saveError = error.message || 'Failed to update writing';
      console.error('Error updating writing:', error);
    } finally {
      savingWriting = false;
    }
  }

  async function handleDeleteWriting(projectId) {
    if (!browser) return;
    if (!confirm('Are you sure you want to delete this writing?')) return;
    savingWriting = true;
    saveError = null;
    try {
      await deleteProjectFromNeon(projectId);
      dbWritings = dbWritings.filter(p => p.id !== projectId);
      editingWriting = null;
    } catch (error) {
      saveError = error.message || 'Failed to delete writing';
      console.error('Error deleting writing:', error);
    } finally {
      savingWriting = false;
    }
  }

  const posts = [
    {
      title: "favorite publications of 2024",
      date: "01.07.25",
      subject: "General",
      href: "./writing/fav_pubs"
    },
    {
      title: "a lit review including parallelized trajectory optimization",
      date: "01.22.25",
      subject: "General",
      href: "https://docs.google.com/document/d/1UOtDPD3F_469Qe_RGj4N10eKHTV5VavyjYZcgpg0Yyw/edit?usp=sharing"
    },
    {
      title: "how to drive to maximize your passengers comfort",
      date: "01.07.25",
      subject: "General",
      href: "./writing/driving"
    },
    {
      title: "how to write an email to a researcher (undergrad)",
      date: "11.19.24",
      subject: "General",
      href: "./writing/researcher"
    },
    {
      title: "IAS: an environment for genius",
      date: "07.24.24",
      subject: "General",
      href: "./writing/homeforgenius"
    },
    {
      title: "should tech people read the news?",
      date: "12.28.23",
      subject: "General",
      href: "./writing/readthenews",
      starred: true
    },
    {
      title: "why do economies at scale break down with agriculture?",
      date: "2.17.24",
      subject: "Ag",
      href: "./writing/economiesofscale"
    },
    {
      title: "the deep connections between soil and greenhouse gas emissions",
      date: "8.6.23",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1UwPVsQsHbcuBo2-CUYT1dk7Ymp6Jl2NDv5esT4iS5vw/edit?usp=sharing"
    },
    {
      title: "the role of mycorrhizal fungi in plant growth and development",
      date: "4.21.23",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1aw5Nn2ph2TABpfSMn1JqiJZblZ7yP6rOiH7Hd4tXpQY/edit?usp=sharing"
    },
    {
      title: "deep dives on spectrometers",
      date: "07.23.23",
      subject: "Ag",
      href: "./writing/spectrometer"
    },
    {
      title: "metagenomic time series analysis on nitrate reduction pathway in cattle gut",
      date: "5.2.23",
      subject: "Ag",
      href: "https://docs.google.com/presentation/d/1Z8ebEN76z4dJMa5gXSBFIMoTtN-JtdcPauNKf1b8Y-g/edit?usp=sharing"
    },
    {
      title: "how synthetic fertilizer impacts microbial diversity",
      date: "4.30.23",
      subject: "Ag",
      href: "https://www.notion.so/Winogradsky-Columns-Report-3-fb51de6e68e84730909f24d890c7c487?pvs=4"
    },
    {
      title: "the impacts of conventional agriculture on public health",
      date: "",
      subject: "Ag",
      href: "./writing/agonpublichealth"
    },
    {
      title: "a whitepaper on the decline of soil health and means to repair",
      date: "",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1J0cMUOZxR5uYQW0_8o-8rmIfRiUbMCjCkNdIXq2oV_k/edit?usp=sharing"
    },
    {
      title: "the industry of soil pH",
      date: "",
      subject: "Ag",
      href: "./writing/phofsoil"
    },
    {
      title: "Interview with Durst Organic Farms",
      thread: "farmer interviews",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/durstorganic"
    },
    {
      title: "Interview with Ratto Brothers",
      thread: "farmer interviews",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/rattobrothers"
    },
    {
      title: "Interview with Cloverfield Organic Farms",
      thread: "farmer interviews",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/cloverfieldorganics"
    },
    {
      title: "Interview with Park Farming",
      thread: "farmer interviews",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/parkfarming"
    },
    {
      title: "coursework",
      date: "",
      subject: "Notes",
      href: "./secret/coursework/"
    },
    {
      title: "ag ideas",
      date: "",
      subject: "Notes",
      href: "./writing/notes/"
    }
  ];
</script>

<div class="writing-page">
  <div class="page-header">
    <h1>Writing</h1>
    {#if isAdmin && !newMode && !editingWriting}
      <button class="admin-btn" on:click={handleAddNew}>+ New</button>
    {/if}
  </div>

  {#if newMode === 'choose'}
    <div class="new-writing choose">
      <span class="choose-label">Create a new</span>
      <div class="edit-actions">
        <button class="admin-btn" on:click={handleChooseGroup}>Group</button>
        <button class="admin-btn" on:click={handleChooseWriting}>Writing</button>
        <button class="admin-btn" on:click={handleCancelWriting}>Cancel</button>
      </div>
    </div>
  {:else if newMode === 'group'}
    <div class="new-writing">
      <input type="text" class="edit-input" placeholder="Group name" bind:value={newGroupName} />
      <div class="edit-actions">
        <button class="admin-btn" on:click={handleSaveGroup} disabled={savingWriting}>
          {savingWriting ? 'Creating...' : 'Create group'}
        </button>
        <button class="admin-btn" on:click={handleCancelWriting} disabled={savingWriting}>Cancel</button>
      </div>
      {#if saveError}
        <p class="error-message">Error: {saveError}</p>
      {/if}
    </div>
  {:else if newMode === 'writing' && newWriting}
    <div class="new-writing">
      <input type="text" class="edit-input" placeholder="Title" bind:value={newWriting.title} />
      <input type="text" class="edit-input" placeholder="Short caption (optional)" bind:value={newWriting.subtitle} />
      <div class="edit-meta">
        <label>
          Date:
          <input type="date" class="edit-input small" bind:value={newWriting.lastUpdated} />
        </label>
        <label>
          Thread:
          <select class="edit-input small" bind:value={newWriting.thread}>
            <option value="">No group</option>
            {#each threadOptions as name}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </label>
        <label class="check-label">
          <input type="checkbox" bind:checked={newWriting.isPublic} />
          Public
        </label>
      </div>
      <div class="edit-actions">
        <button class="admin-btn" on:click={handleSaveWriting} disabled={savingWriting}>
          {savingWriting ? 'Creating...' : 'Create'}
        </button>
        <button class="admin-btn" on:click={handleCancelWriting} disabled={savingWriting}>Cancel</button>
      </div>
      {#if saveError}
        <p class="error-message">Error: {saveError}</p>
      {/if}
    </div>
  {/if}

  {#if editingWriting}
    <div class="new-writing">
      <input type="text" class="edit-input" placeholder="Title" bind:value={editingWriting.title} />
      <input type="text" class="edit-input" placeholder="Short caption (optional)" bind:value={editingWriting.subtitle} />
      <div class="edit-meta">
        <label>
          Last updated:
          <input type="date" class="edit-input small" bind:value={editingWriting.lastUpdated} />
        </label>
        <label>
          Thread:
          <select class="edit-input small" bind:value={editingWriting.thread}>
            <option value="">No group</option>
            {#each threadOptions as name}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </label>
        <label>
          Status:
          <select class="edit-input small" bind:value={editingWriting.status}>
            <option value="Graduated">Graduated</option>
            <option value="In Progress">In Progress</option>
            <option value="Graveyard">Graveyard</option>
            <option value="Idea">Idea</option>
          </select>
        </label>
        <label>
          Section:
          <select class="edit-input small" bind:value={editingWriting.section}>
            <option value="projects">Projects</option>
            <option value="writing">Writing</option>
          </select>
        </label>
        <label class="check-label">
          <input type="checkbox" bind:checked={editingWriting.isPublic} />
          Public
        </label>
      </div>
      <div class="edit-actions">
        <button class="admin-btn" on:click={handleSaveEdit} disabled={savingWriting}>
          {savingWriting ? 'Saving...' : 'Save'}
        </button>
        <button class="admin-btn" on:click={handleCancelEdit} disabled={savingWriting}>Cancel</button>
        <button class="admin-btn danger" on:click={() => handleDeleteWriting(editingWriting.id)} disabled={savingWriting}>
          Delete
        </button>
      </div>
      {#if saveError}
        <p class="error-message">Error: {saveError}</p>
      {/if}
    </div>
  {/if}

  <div class="filter-bar">
    <span class="filter-label">Filter by subject:</span>
    <div class="filter-options">
      {#each subjects as subject}
        <button
          class="filter-btn"
          class:active={selectedSubjects.includes(subject)}
          on:click={() => toggleSubject(subject)}
        >
          {subject}
        </button>
      {/each}
      {#if selectedSubjects.length < subjects.length}
        <button class="filter-btn show-all" on:click={selectAll}>
          Show all
        </button>
      {/if}
    </div>
  </div>

  <table class="writing-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Date</th>
        <th>Subject</th>
        {#if isAdmin}<th class="action-cell" aria-label="Actions"></th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        {#if row.type === 'thread'}
          <tr class="thread-row">
            <td>
              <button
                class="thread-toggle"
                aria-expanded={!collapsedThreads.has(row.name)}
                on:click={() => toggleThread(row.name)}
              >
                <span class="thread-caret" class:collapsed={collapsedThreads.has(row.name)}>&#9662;</span>
                <span class="thread-title">{row.name}</span>
                <span class="thread-count">{row.items.length}</span>
              </button>
            </td>
            <td class="date-cell">{row.date || '—'}</td>
            <td class="subject-cell">{row.subject}</td>
            {#if isAdmin}
              <td class="action-cell">
                {#if dbThreads.includes(row.name)}
                  <button class="icon-btn" title="Rename group" on:click={() => handleRenameGroup(row.name)}>
                    <i class="las la-edit"></i>
                  </button>
                  <button class="icon-btn" title="Delete group" on:click={() => handleDeleteGroup(row.name)}>
                    <i class="las la-trash"></i>
                  </button>
                {/if}
              </td>
            {/if}
          </tr>
          {#if !collapsedThreads.has(row.name)}
            {#each row.items as post}
              <tr class="thread-item">
                <td>
                  <span class="thread-indent"></span>
                  {#if post.starred}<span class="star">&#11088;&#65039;</span>{/if}
                  <a href={post.href}>{post.title}</a>
                  {#if isAdmin && post.project && post.project.isPublic === false}
                    <span class="private-badge" title="Private">🔒</span>
                  {/if}
                </td>
                <td class="date-cell">{post.date || '—'}</td>
                <td class="subject-cell">{post.subject}</td>
                {#if isAdmin}
                  <td class="action-cell">
                    {#if post.project}
                      <button class="icon-btn" title="Edit" on:click={() => handleEditWriting(post.project)}>
                        <i class="las la-edit"></i>
                      </button>
                    {/if}
                  </td>
                {/if}
              </tr>
            {/each}
          {/if}
        {:else}
          <tr>
            <td>
              {#if row.post.starred}<span class="star">&#11088;&#65039;</span>{/if}
              <a href={row.post.href}>{row.post.title}</a>
              {#if isAdmin && row.post.project && row.post.project.isPublic === false}
                <span class="private-badge" title="Private">🔒</span>
              {/if}
            </td>
            <td class="date-cell">{row.post.date || '—'}</td>
            <td class="subject-cell">{row.post.subject}</td>
            {#if isAdmin}
              <td class="action-cell">
                {#if row.post.project}
                  <button class="icon-btn" title="Edit" on:click={() => handleEditWriting(row.post.project)}>
                    <i class="las la-edit"></i>
                  </button>
                {/if}
              </td>
            {/if}
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .writing-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    text-align: center;
  }

  .writing-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    margin: 0 auto;
  }

  .writing-table thead th {
    padding: 0.4rem 1rem;
    border-bottom: 1px solid rgba(180, 235, 203, 0.5);
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .writing-table tbody td {
    padding: 0.35rem 1rem;
    font-size: 0.85em;
    vertical-align: top;
    border-bottom: 1px solid rgba(180, 235, 203, 0.5);
  }

  .writing-table tbody tr:last-child td {
    border-bottom: none;
  }

  .date-cell {
    white-space: nowrap;
    width: 70px;
  }

  .subject-cell {
    white-space: nowrap;
    width: 80px;
  }

  /* Filter bar */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-label {
    font-size: 0.85em;
  }

  .filter-options {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-btn {
    padding: 0.3rem 0.7rem;
    font-size: 0.8em;
    border: 1px solid rgba(180, 235, 203, 0.5);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.45;
    transition: opacity 0.15s;
  }

  .filter-btn.active {
    opacity: 1;
    border-color: rgba(180, 235, 203, 0.8);
  }

  .filter-btn.show-all {
    opacity: 0.6;
    border-style: dashed;
  }

  .filter-btn:hover {
    opacity: 1;
  }

  .writing-table a {
    color: var(--text-bronze);
    text-decoration: none;
  }

  .star {
    margin-right: 0.25rem;
  }

  .private-badge {
    margin-left: 0.35rem;
    font-size: 0.85em;
    opacity: 0.7;
  }

  /* Admin controls for database-backed writings: a bare icon left of the title */
  .icon-btn {
    border: none;
    background: transparent;
    color: rgba(180, 235, 203, 0.5); /* same faded mint as the .thread-count ring */
    font-size: 1em;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 0;
    vertical-align: middle;
    transition: color 0.2s ease;
  }

  .icon-btn + .icon-btn {
    margin-left: 0.4rem;
  }

  /* Admin icons sit past the subject column with no header or rule beneath them */
  .writing-table .action-cell,
  .writing-table thead th.action-cell,
  .writing-table tbody td.action-cell,
  .writing-table tbody tr.thread-item td.action-cell {
    width: 1.5rem;
    padding-left: 0.5rem;
    padding-right: 0;
    border-bottom: none;
    white-space: nowrap;
  }

  .icon-btn:hover {
    color: #b4ebcb;
  }

  /* Page header with admin "new writing" button */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  /* Threads: one heading row with its articles listed underneath */
  .thread-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }

  .thread-caret {
    display: inline-block;
    font-size: 0.8em;
    opacity: 0.7;
    transition: transform 0.15s;
  }

  .thread-caret.collapsed {
    transform: rotate(-90deg);
  }

  .thread-title {
    font-weight: 600;
  }

  .thread-count {
    font-size: 0.75em;
    opacity: 0.6;
    border: 1px solid rgba(180, 235, 203, 0.5);
    border-radius: 999px;
    padding: 0 0.45em;
    line-height: 1.5;
  }

  .writing-table tbody tr.thread-item td {
    border-bottom-color: rgba(180, 235, 203, 0.2);
  }

  .thread-indent {
    display: inline-block;
    width: 1.25rem;
    border-left: 1px solid rgba(180, 235, 203, 0.4);
    margin-left: 0.3rem;
    margin-right: 0.5rem;
    height: 1em;
    vertical-align: middle;
  }

  /* Admin: new group / writing forms */
  .new-writing.choose {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .choose-label {
    opacity: 0.8;
  }

  .new-writing {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 600px;
    margin: 0 auto 1.5rem;
    padding: 0.75rem;
    border: 1px solid rgba(180, 235, 203, 0.5);
    border-radius: 6px;
    text-align: left;
  }

  .edit-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.4rem 0.5rem;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #cd7f32;
    border-radius: 4px;
    color: #b4ebcb;
    font-family: inherit;
    font-size: 0.9em;
  }

  .edit-input.small {
    width: auto;
  }

  .edit-input:focus {
    outline: none;
    border-color: #e6a85c;
  }

  .edit-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    font-size: 0.85em;
  }

  .edit-meta label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .check-label input {
    accent-color: #cd7f32;
  }

  .edit-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .admin-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid #cd7f32;
    border-radius: 4px;
    background: transparent;
    color: #cd7f32;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85em;
    transition: all 0.2s ease;
  }

  .admin-btn:hover {
    background: rgba(205, 127, 50, 0.15);
  }

  .admin-btn.danger {
    border-color: #966919;
    color: #966919;
  }

  .admin-btn.danger:hover {
    background: #966919;
    color: #1e1e1e;
  }

  .admin-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .error-message {
    color: #c33;
    font-size: 0.85em;
    margin: 0;
  }

  @media (max-width: 600px) {
    .writing-table {
      font-size: 0.8em;
    }

    .writing-table td,
    .writing-table th {
      padding: 0.4rem 0.5rem;
    }
  }
</style>
