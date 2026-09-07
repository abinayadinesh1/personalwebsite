<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { loadProjects, updateProjectInNeon, deleteProjectFromNeon, moveProjectToSection } from '$lib/utils/projects.js';

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
  let editingWriting = null;
  let savingWriting = false;
  let saveError = null;

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
  });

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

  // Date input wants YYYY-MM-DD; the API may return a full ISO timestamp
  function toDateInput(dateString) {
    if (!dateString) return '';
    return String(dateString).slice(0, 10);
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
      project: p
    }));

  $: allPosts = [...dbPosts, ...posts];
  $: filteredPosts = allPosts.filter(p => selectedSubjects.includes(p.subject));

  function handleEditWriting(project) {
    if (!isAdmin) return;
    editingWriting = { ...project, lastUpdated: toDateInput(project.lastUpdated) };
    saveError = null;
  }

  function handleCancelEdit() {
    editingWriting = null;
    saveError = null;
  }

  function replaceWriting(updated) {
    const index = dbWritings.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      dbWritings[index] = updated;
      dbWritings = [...dbWritings];
    }
  }

  async function handleSaveEdit() {
    if (!editingWriting || !browser) return;
    savingWriting = true;
    saveError = null;
    try {
      const updated = await updateProjectInNeon(editingWriting);
      replaceWriting(updated);
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
      if (editingWriting && editingWriting.id === projectId) editingWriting = null;
    } catch (error) {
      saveError = error.message || 'Failed to delete writing';
      console.error('Error deleting writing:', error);
    } finally {
      savingWriting = false;
    }
  }

  // Move a writing back to the Projects tab. It keeps its id, path, and content.
  async function handleMoveToProjects(project) {
    if (!browser || !isAdmin) return;
    savingWriting = true;
    saveError = null;
    try {
      await moveProjectToSection(project, 'projects');
      dbWritings = dbWritings.filter(p => p.id !== project.id);
      if (editingWriting && editingWriting.id === project.id) editingWriting = null;
    } catch (error) {
      saveError = error.message || 'Failed to move writing';
      console.error('Error moving writing to projects:', error);
      alert(`Failed to move: ${saveError}`);
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
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/durstorganic"
    },
    {
      title: "Interview with Ratto Brothers",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/rattobrothers"
    },
    {
      title: "Interview with Cloverfield Organic Farms",
      date: "",
      subject: "Ag",
      href: "./writing/farmerinterviews/cloverfieldorganics"
    },
    {
      title: "Interview with Park Farming",
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
  <h1>Writing</h1>

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
      </tr>
    </thead>
    <tbody>
      {#each filteredPosts as post}
        {#if post.project && editingWriting && editingWriting.id === post.project.id}
          <!-- Inline edit row for a database-backed writing (admin only) -->
          <tr class="edit-row">
            <td colspan="3">
              <div class="edit-form">
                <input type="text" class="edit-input" placeholder="Title" bind:value={editingWriting.title} />
                <input type="text" class="edit-input" placeholder="Short caption (optional)" bind:value={editingWriting.subtitle} />
                <div class="edit-meta">
                  <label>
                    Last updated:
                    <input type="date" class="edit-input small" bind:value={editingWriting.lastUpdated} />
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
                  <label class="check-label">
                    <input type="checkbox" bind:checked={editingWriting.isPublic} />
                    Public
                  </label>
                </div>
                <div class="edit-actions">
                  <button class="admin-btn" on:click={handleSaveEdit} disabled={savingWriting}>
                    {savingWriting ? 'Saving...' : 'Save'}
                  </button>
                  <button class="admin-btn" on:click={handleCancelEdit}>Cancel</button>
                  <button class="admin-btn" on:click={() => handleMoveToProjects(post.project)} disabled={savingWriting}>
                    Move to projects
                  </button>
                  <button class="admin-btn danger" on:click={() => handleDeleteWriting(post.project.id)} disabled={savingWriting}>
                    Delete
                  </button>
                </div>
                {#if saveError}
                  <p class="error-message">Error: {saveError}</p>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td>
              {#if post.starred}<span class="star">&#11088;&#65039;</span>{/if}
              <a href={post.href}>{post.title}</a>
              {#if isAdmin && post.project}
                {#if post.project.isPublic === false}
                  <span class="private-badge" title="Private">🔒</span>
                {/if}
                <span class="row-admin">
                  <button class="icon-btn" title="Edit" on:click={() => handleEditWriting(post.project)}>
                    <i class="las la-edit"></i>
                  </button>
                  <button class="icon-btn" title="Move to projects" on:click={() => handleMoveToProjects(post.project)} disabled={savingWriting}>
                    <i class="las la-cube"></i>
                  </button>
                </span>
              {/if}
            </td>
            <td class="date-cell">{post.date || '—'}</td>
            <td class="subject-cell">{post.subject}</td>
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
    color: transparent;
    text-decoration: none;
  }

  .star {
    margin-right: 0.25rem;
  }

  /* Admin controls for database-backed writings */
  .row-admin {
    display: inline-flex;
    gap: 0.25rem;
    margin-left: 0.5rem;
    vertical-align: middle;
  }

  .private-badge {
    margin-left: 0.35rem;
    font-size: 0.85em;
    opacity: 0.7;
  }

  .icon-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #cd7f32;
    background: transparent;
    color: #b4ebcb;
    font-size: 0.9em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    background: #cd7f32;
    color: #1e1e1e;
  }

  .icon-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
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
