<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../../../../styles/articles.css';

  let article = null;
  let loading = true;
  let error = null;

  onMount(async () => {
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
</script>

<div class="article-notes-page">
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>{error}</p>
    <a class="article-back" href="/reading">&larr; Back to reading</a>
  {:else if article}
    <h1>{article.title}</h1>
    <p class="article-date">{formatDate(article.timestamp)}</p>

    <div class="article-link">
      <a href={article.link} target="_blank" rel="noopener noreferrer">&rarr; Read original article</a>
    </div>

    {#if article.content}
      <hr class="article-notes-divider" />
      <div class="article-content">{article.content}</div>
    {/if}

    <a class="article-back" href="/reading">&larr; Back to reading</a>
  {/if}
</div>
