<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../../../../styles/articles.css';

  let article = null;
  let loading = true;
  let error = null;
  let isAdmin = false;
  let isEditing = false;
  let saving = false;

  let editTitle = '';
  let editLink = '';
  let editContent = '';
  let editDate = '';
  let editTextarea;

  onMount(async () => {
    isAdmin = sessionStorage.getItem('adminAuth') === 'true';

    try {
      const res = await fetch(`/api/articles/${$page.params.id}`);
      if (!res.ok) {
        error = 'Article not found';
        return;
      }
      const data = await res.json();
      article = data.article;
    } catch (err) {
      error = 'Failed to load article';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function startEditing() {
    editTitle = article.title || '';
    editLink = article.link || '';
    editContent = article.content || '';
    editDate = article.timestamp ? article.timestamp.slice(0, 10) : '';
    isEditing = true;
    setTimeout(() => {
      if (editTextarea) {
        editTextarea.focus();
      }
    }, 0);
  }

  function cancelEditing() {
    isEditing = false;
  }

  async function saveChanges() {
    saving = true;
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          link: editLink,
          content: editContent || null,
          date: editDate || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        article = data.article;
        isEditing = false;
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      saving = false;
    }
  }
</script>

<div class="article-notes-page">
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>{error}</p>
    <a class="article-back" href="/reading">&larr; Back to reading</a>
  {:else if article}
    <a class="article-back" href="/reading">&larr; Back to reading</a>

    {#if isEditing}
      <div class="article-edit-form">
        <label class="article-edit-label">Title
          <input type="text" bind:value={editTitle} class="article-edit-input" />
        </label>
        <label class="article-edit-label">Link
          <input type="url" bind:value={editLink} class="article-edit-input" />
        </label>
        <label class="article-edit-label">Date
          <input type="date" bind:value={editDate} class="article-edit-input" />
        </label>
        <label class="article-edit-label">Notes
          <textarea
            bind:this={editTextarea}
            bind:value={editContent}
            class="article-edit-input article-edit-textarea"
            placeholder="Write your notes..."
          ></textarea>
        </label>
        <div class="article-edit-toolbar">
          <button class="edit-btn save" on:click={saveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button class="edit-btn cancel" on:click={cancelEditing}>Cancel</button>
        </div>
      </div>
    {:else}
      <div class="article-header-row">
        <h1>{article.title}</h1>
        {#if isAdmin}
          <button class="article-edit-btn" on:click={startEditing} title="Edit article">&#x270E;</button>
        {/if}
      </div>
      <p class="article-date">{formatDate(article.timestamp)}</p>

      <div class="article-link">
        <a href={article.link} target="_blank" rel="noopener noreferrer">&rarr; Read original article</a>
      </div>

      {#if article.content}
        <hr class="article-notes-divider" />
        <p class="article-content">{article.content}</p>
      {/if}
    {/if}

  {/if}
</div>
