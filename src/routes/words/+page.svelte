<script>
  import { onMount } from 'svelte';
  import '../../styles/words.css';
  import { loadWordsFromCache, fetchWords, saveWordsToCache } from '$lib/utils/words.js';

  export let data;

  let words = [];
  let annotations = [];
  let isAdmin = false;

  let newWord = '';
  let newDate = todayLocal();
  let addError = '';

  let editingId = null;
  let editWord = '';
  let editNote = '';
  let editDate = '';

  let annotatingDate = null;
  let annotationText = '';

  function todayLocal() {
    // en-CA formats as YYYY-MM-DD in local time (avoids toISOString UTC off-by-one)
    return new Date().toLocaleDateString('en-CA');
  }

  onMount(async () => {
    isAdmin = data?.isAdmin || sessionStorage.getItem('adminAuth') === 'true';

    const cached = loadWordsFromCache();
    words = cached.words;
    annotations = cached.annotations;

    const fresh = await fetchWords();
    words = fresh.words || [];
    annotations = fresh.annotations || [];
  });

  async function addWord() {
    addError = '';
    const word = newWord.trim();
    if (!word) {
      addError = 'Word is required';
      return;
    }
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, date: newDate || null })
      });
      if (res.ok) {
        const result = await res.json();
        words = [result.word, ...words];
        newWord = '';
        saveWordsToCache(words, annotations);
      } else {
        const result = await res.json();
        addError = result.error || 'Failed to add word';
      }
    } catch (err) {
      console.error('Failed to add word:', err);
      addError = 'Failed to add word';
    }
  }

  function startEdit(w) {
    editingId = w.id;
    editWord = w.word;
    editNote = w.note || '';
    editDate = w.learned_on;
  }

  function cancelEdit() {
    editingId = null;
  }

  async function saveEdit(id) {
    try {
      const res = await fetch(`/api/words/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: editWord,
          note: editNote || null,
          date: editDate || null
        })
      });
      if (res.ok) {
        const result = await res.json();
        words = words.map(w => w.id === id ? result.word : w);
        editingId = null;
        saveWordsToCache(words, annotations);
      }
    } catch (err) {
      console.error('Failed to save word:', err);
    }
  }

  async function deleteWord(id) {
    if (!confirm('Delete this word?')) return;
    try {
      const res = await fetch(`/api/words/${id}`, { method: 'DELETE' });
      if (res.ok) {
        words = words.filter(w => w.id !== id);
        editingId = null;
        saveWordsToCache(words, annotations);
      }
    } catch (err) {
      console.error('Failed to delete word:', err);
    }
  }

  function startAnnotate(date) {
    annotatingDate = date;
    annotationText = annotationsByDate[date] || '';
  }

  function cancelAnnotate() {
    annotatingDate = null;
    annotationText = '';
  }

  async function saveAnnotation() {
    const date = annotatingDate;
    const label = annotationText.trim();
    try {
      const res = await fetch('/api/words/annotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, label })
      });
      if (res.ok) {
        if (label) {
          const result = await res.json();
          annotations = annotations.some(a => a.date === date)
            ? annotations.map(a => a.date === date ? result.annotation : a)
            : [...annotations, result.annotation];
        } else {
          annotations = annotations.filter(a => a.date !== date);
        }
        annotatingDate = null;
        annotationText = '';
        saveWordsToCache(words, annotations);
      }
    } catch (err) {
      console.error('Failed to save annotation:', err);
    }
  }

  function formatGraphDate(dateStr) {
    // T00:00:00 keeps the date in local time (no UTC day shift)
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  $: dateGroups = (() => {
    const counts = {};
    for (const w of words) {
      counts[w.learned_on] = (counts[w.learned_on] || 0) + 1;
    }
    return Object.keys(counts).sort().map(date => ({ date, count: counts[date] }));
  })();

  $: maxCount = Math.max(1, ...dateGroups.map(g => g.count));

  $: annotationsByDate = Object.fromEntries(annotations.map(a => [a.date, a.label]));
</script>

<div class="words-page">
  <h1>new words i've learned</h1>

  {#if isAdmin}
    <div class="add-word-form">
      <input
        type="text"
        class="edit-input word-input"
        placeholder="a new word..."
        bind:value={newWord}
        on:keydown={(e) => e.key === 'Enter' && addWord()}
      />
      <input type="date" class="edit-input word-date-input" bind:value={newDate} />
      <button class="edit-btn save" on:click={addWord}>Add</button>
    </div>
    {#if addError}
      <p class="add-error">{addError}</p>
    {/if}
  {/if}

  {#if dateGroups.length > 0}
    <div class="word-graph">
      {#each dateGroups as g}
        <div class="word-graph-col">
          <div class="word-bar-area">
            <div
              class="word-bar"
              style="height: {(g.count / maxCount) * 80}px"
              title="{g.count} word{g.count === 1 ? '' : 's'}"
            ></div>
          </div>
          <span class="word-bar-date">{formatGraphDate(g.date)}</span>
          {#if annotatingDate === g.date}
            <input
              class="edit-input annotation-input"
              placeholder="label..."
              bind:value={annotationText}
              on:keydown={(e) => {
                if (e.key === 'Enter') saveAnnotation();
                if (e.key === 'Escape') cancelAnnotate();
              }}
            />
            <div class="annotation-actions">
              <button class="edit-btn save" on:click={saveAnnotation}>Save</button>
              <button class="edit-btn cancel" on:click={cancelAnnotate}>Cancel</button>
            </div>
          {:else}
            {#if annotationsByDate[g.date]}
              <span class="word-bar-annotation">{annotationsByDate[g.date]}</span>
            {/if}
            {#if isAdmin}
              <button class="annotate-btn" title="Annotate this date" on:click={() => startAnnotate(g.date)}>&#x270E;</button>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <ul class="word-list">
    {#each words as w (w.id)}
      {#if editingId === w.id}
        <li class="word-item editing">
          <input type="text" class="edit-input" bind:value={editWord} />
          <input type="text" class="edit-input" placeholder="note (optional)" bind:value={editNote} />
          <input type="date" class="edit-input" bind:value={editDate} />
          <div class="edit-actions">
            <button class="edit-btn save" on:click={() => saveEdit(w.id)}>Save</button>
            <button class="edit-btn cancel" on:click={cancelEdit}>Cancel</button>
            <button class="edit-btn delete" on:click={() => deleteWord(w.id)}>Delete</button>
          </div>
        </li>
      {:else}
        <li class="word-item">
          <span class="word-text">{w.word}</span>
          {#if isAdmin && w.note}
            <span class="word-note">{w.note}</span>
          {/if}
          {#if isAdmin}
            <button class="edit-icon" title="Edit word" on:click={() => startEdit(w)}>&#x270E;</button>
          {/if}
        </li>
      {/if}
    {/each}
    {#if words.length === 0}
      <p class="no-words">No words yet.</p>
    {/if}
  </ul>
</div>
