<script>
  import { previewPublic } from '$lib/adminView.js';
  import { shelfDate } from '$lib/books.js';
  import { onMount } from 'svelte';
  import '../../styles/carousel.css';
  import '../../styles/articles.css';
  import '../../styles/want-to-read.css';

  export let data;

  let books = data.books || [];
  let adminAuth = data.isAdmin || false;
  $: isAdmin = adminAuth && !$previewPublic;

  let dialog;
  let editingId = null; // null = adding
  let formTitle = '';
  let formAuthor = '';
  let formNote = '';
  let formDate = '';
  let formImage = '';
  let formFile = null;
  let filePreview = '';
  let formError = '';
  let saving = false;

  function todayLocal() {
    // en-CA formats as YYYY-MM-DD in local time (avoids toISOString UTC off-by-one)
    return new Date().toLocaleDateString('en-CA');
  }

  onMount(() => {
    adminAuth = data.isAdmin || sessionStorage.getItem('adminAuth') === 'true';
  });

  function openForm(book = null) {
    editingId = book?.id ?? null;
    formTitle = book?.title || '';
    formAuthor = book?.author || '';
    formNote = book?.note || '';
    formDate = book ? book.added_on || '' : todayLocal();
    formImage = book?.image || '';
    formFile = null;
    filePreview = '';
    formError = '';
    dialog.showModal();
  }

  function closeForm() {
    if (filePreview) URL.revokeObjectURL(filePreview);
    dialog.close();
  }

  function pickFile(e) {
    formFile = e.target.files?.[0] || null;
    if (filePreview) URL.revokeObjectURL(filePreview);
    filePreview = formFile ? URL.createObjectURL(formFile) : '';
  }

  async function uploadImage(file) {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/images', { method: 'POST', body });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Image upload failed');
    return result.url;
  }

  async function save() {
    formError = '';
    if (!formTitle.trim()) {
      formError = 'Title is required';
      return;
    }
    saving = true;
    try {
      const image = formFile ? await uploadImage(formFile) : formImage;
      const res = await fetch(editingId ? `/api/books/${editingId}` : '/api/books', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, author: formAuthor, note: formNote, date: formDate || null, image })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save book');
      books = editingId
        ? books.map((b) => (b.id === editingId ? result.book : b))
        : [result.book, ...books];
      closeForm();
    } catch (err) {
      formError = err.message;
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm(`Remove "${formTitle}"?`)) return;
    const res = await fetch(`/api/books/${editingId}`, { method: 'DELETE' });
    if (res.ok) {
      books = books.filter((b) => b.id !== editingId);
      closeForm();
    } else {
      formError = 'Failed to remove book';
    }
  }

  async function markFinished(book) {
    const res = await fetch(`/api/books/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finished: true, finishedOn: todayLocal() })
    });
    if (res.ok) {
      books = books.filter((b) => b.id !== book.id);
    } else {
      alert('Failed to mark as finished');
    }
  }
</script>

<h1>Books I Want To Read</h1>

<section class="want-to-read">
  <p class="want-intro">
    The difference between the books we think we want to read vs the books we actually do is quite interesting. Regardless, here's my running list.
    {#if isAdmin}<button class="add-article-btn" on:click={() => openForm()}>+ add</button>{/if}
  </p>

  <div class="want-grid">
    {#each books as book (book.id)}
      <div class="book-card">
        {#if book.note}
          <div class="book-note-popup">
            <p>{book.note}</p>
          </div>
        {/if}
        {#if isAdmin}
          <button class="want-edit" title="Edit book" on:click={() => openForm(book)}>&#x270E;</button>
        {/if}
        {#if book.image}
          <img src={book.image} alt="{book.title} cover" />
        {:else}
          <span class="want-placeholder">{book.title}</span>
        {/if}
        <div class="book-info">
          <h4 class="book-title">{book.title}</h4>
          {#if book.author}<p class="book-author">by {book.author}</p>{/if}
          <p class="book-date">{shelfDate(book.added_on)}</p>
          {#if isAdmin}
            <label class="want-finished">
              <input type="checkbox" on:change={() => markFinished(book)} /> finished
            </label>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  {#if books.length === 0}
    <p style="font-size: 0.8em; opacity: 0.5;">Nothing on the list right now.</p>
  {/if}
</section>

<dialog class="want-dialog" bind:this={dialog} on:close={() => (saving = false)}>
  <form method="dialog" on:submit|preventDefault={save}>
    <h3>{editingId ? 'Edit book' : 'Add book'}</h3>
    <label class="edit-label">Cover image
      <input type="file" accept="image/*" class="edit-input" on:change={pickFile} />
    </label>
    {#if filePreview || formImage}
      <img class="want-preview" src={filePreview || formImage} alt="Cover preview" />
    {/if}
    <label class="edit-label">Title
      <input type="text" bind:value={formTitle} class="edit-input" />
    </label>
    <label class="edit-label">Author (optional)
      <input type="text" bind:value={formAuthor} class="edit-input" />
    </label>
    <label class="edit-label">Date (optional)
      <input type="date" bind:value={formDate} class="edit-input" />
    </label>
    <label class="edit-label">Note (optional, shown on hover)
      <textarea bind:value={formNote} class="edit-input edit-textarea" rows="2"></textarea>
    </label>
    {#if formError}
      <p class="add-error">{formError}</p>
    {/if}
    <p class="edit-actions">
      <button type="submit" class="edit-btn save" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save' : 'Add'}</button>
      <button type="button" class="edit-btn cancel" on:click={closeForm}>Cancel</button>
      {#if editingId}
        <button type="button" class="edit-btn cancel want-delete" on:click={remove}>Delete</button>
      {/if}
    </p>
  </form>
</dialog>
