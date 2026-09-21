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

  // Every day from the first word through today, with 0 for days without new words
  $: dateGroups = (() => {
    const counts = {};
    for (const w of words) {
      counts[w.learned_on] = (counts[w.learned_on] || 0) + 1;
    }
    const dates = Object.keys(counts).sort();
    if (dates.length === 0) return [];
    const groups = [];
    const cursor = new Date(dates[0] + 'T00:00:00');
    const end = new Date(todayLocal() + 'T00:00:00');
    while (cursor <= end) {
      const date = cursor.toLocaleDateString('en-CA');
      groups.push({ date, count: counts[date] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return groups;
  })();

  $: maxCount = Math.max(1, ...dateGroups.map(g => g.count));

  // Only label every Nth day: as many labels as fit at ~64px each, at most 8
  $: maxLabels = Math.min(8, Math.max(2, Math.floor((innerW || 0) / 64)));
  $: labelEvery = Math.max(1, Math.ceil(dateGroups.length / maxLabels));
  function showLabel(i) {
    const last = dateGroups.length - 1;
    if (i === last) return true;
    // skip a regular label that would sit right next to the final one
    return i % labelEvery === 0 && last - i >= Math.ceil(labelEvery / 2);
  }

  $: annotationsByDate = Object.fromEntries(annotations.map(a => [a.date, a.label]));

  // --- Line graph geometry. The SVG is sized in pixels from the container width
  // so text and stroke widths never stretch. ---
  let graphWidth = 0;
  const GRAPH_H = 150;
  const PAD = { top: 22, right: 8, bottom: 26, left: 8 };
  $: innerW = Math.max(0, graphWidth - PAD.left - PAD.right);
  $: innerH = GRAPH_H - PAD.top - PAD.bottom;
  $: points = dateGroups.map((g, i) => ({
    ...g,
    x: PAD.left + (dateGroups.length > 1 ? (i / (dateGroups.length - 1)) * innerW : innerW / 2),
    y: PAD.top + innerH - (g.count / maxCount) * innerH
  }));
  $: linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  $: areaPath = points.length
    ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${PAD.top + innerH} L${points[0].x.toFixed(1)},${PAD.top + innerH} Z`
    : '';

  let hoverIndex = null;
  function handleGraphMove(e) {
    if (!points.length || !innerW) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    hoverIndex = best;
  }
  function handleGraphLeave() {
    hoverIndex = null;
  }
  function handleGraphClick() {
    if (isAdmin && hoverIndex !== null) startAnnotate(points[hoverIndex].date);
  }
  $: hovered = hoverIndex !== null ? points[hoverIndex] : null;
  // Keep the tooltip inside the graph on either edge
  $: tooltipLeft = hovered ? Math.min(Math.max(hovered.x, 70), Math.max(70, graphWidth - 70)) : 0;
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
    <div class="word-graph" bind:clientWidth={graphWidth}>
      {#if graphWidth > 0}
        <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
        <svg
          class="word-line-graph"
          width={graphWidth}
          height={GRAPH_H}
          role="img"
          aria-label="New words learned per day"
          on:mousemove={handleGraphMove}
          on:mouseleave={handleGraphLeave}
          on:click={handleGraphClick}
        >
          <!-- baseline and max gridline -->
          <line class="grid" x1={PAD.left} x2={PAD.left + innerW} y1={PAD.top + innerH} y2={PAD.top + innerH} />
          <line class="grid faint" x1={PAD.left} x2={PAD.left + innerW} y1={PAD.top} y2={PAD.top} />
          <text class="axis-label" x={PAD.left} y={PAD.top - 6}>{maxCount}</text>

          <path class="area" d={areaPath} />
          <path class="line" d={linePath} />

          <!-- annotated days get a marker and an italic label above the point -->
          {#each points as p}
            {#if annotationsByDate[p.date]}
              <circle class="annotation-dot" cx={p.x} cy={p.y} r="3.5" />
              <text
                class="annotation-label"
                x={p.x}
                y={Math.max(10, p.y - 9)}
                text-anchor={p.x < 60 ? 'start' : p.x > graphWidth - 60 ? 'end' : 'middle'}
              >{annotationsByDate[p.date]}</text>
            {/if}
          {/each}

          <!-- date labels -->
          {#each points as p, i}
            {#if showLabel(i)}
              <text
                class="axis-label"
                x={p.x}
                y={GRAPH_H - 8}
                text-anchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              >{formatGraphDate(p.date)}</text>
            {/if}
          {/each}

          <!-- hover crosshair -->
          {#if hovered}
            <line class="crosshair" x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={PAD.top + innerH} />
            <circle class="hover-dot" cx={hovered.x} cy={hovered.y} r="4" />
          {/if}
        </svg>

        {#if hovered}
          <div class="graph-tooltip" style="left: {tooltipLeft}px;">
            <span class="tooltip-date">{formatGraphDate(hovered.date)}</span>
            <span class="tooltip-value">{hovered.count} word{hovered.count === 1 ? '' : 's'}</span>
            {#if annotationsByDate[hovered.date]}
              <span class="tooltip-note">{annotationsByDate[hovered.date]}</span>
            {/if}
            {#if isAdmin}
              <span class="tooltip-hint">click to annotate</span>
            {/if}
          </div>
        {/if}
      {/if}

      {#if annotatingDate}
        <div class="annotation-form">
          <span class="annotation-form-date">{formatGraphDate(annotatingDate)}</span>
          <input
            class="edit-input annotation-input"
            placeholder="label..."
            bind:value={annotationText}
            on:keydown={(e) => {
              if (e.key === 'Enter') saveAnnotation();
              if (e.key === 'Escape') cancelAnnotate();
            }}
          />
          <button class="edit-btn save" on:click={saveAnnotation}>Save</button>
          <button class="edit-btn cancel" on:click={cancelAnnotate}>Cancel</button>
        </div>
      {/if}
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
