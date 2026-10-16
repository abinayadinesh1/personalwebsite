<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { hostOf, MIN_WIDTH } from '$lib/inspiration.js';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';

  export let item;
  export let isAdmin = false;
  export let height = 0;

  const dispatch = createEventDispatcher();

  // Movement below this is a click (open/play/zoom), not a drag
  const DRAG_THRESHOLD = 4;
  // Keep the hover toolbar, which floats above the card, on the board
  const MIN_Y = 30;

  let playing = false;
  let suppressClick = false;
  let noteEl;
  let faviconFailed = false;
  let imageFailed = false;

  $: meta = item.meta || {};
  $: host = hostOf(item.url);
  $: label = item.kind === 'pdf' ? (meta.filename || 'pdf') : item.kind === 'video' ? 'youtube' : host;
  $: openUrl = item.kind === 'video'
    ? `https://www.youtube.com/watch?v=${meta.videoId}${meta.start ? `&t=${meta.start}s` : ''}`
    : item.url;
  $: showPaper = isAdmin || (item.note || '').trim().length > 0;

  function track(e, onMove, onEnd) {
    const move = (ev) => onMove(ev);
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      onEnd(ev);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function startDrag(e) {
    if (e.button !== 0) return;
    if (e.target.closest('textarea, iframe, .card-action, .resize-handle, .vp-controls')) return;

    const sx = e.clientX;
    const sy = e.clientY;
    const ox = item.x;
    const oy = item.y;
    let moved = false;

    track(e, (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        moved = true;
        dispatch('grab');
      }
      ev.preventDefault();
      item.x = Math.max(0, ox + dx);
      item.y = Math.max(MIN_Y, oy + dy);
    }, () => {
      if (!moved) return;
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      dispatch('release', { x: item.x, y: item.y });
    });
  }

  function startResize(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const ow = item.width;
    dispatch('grab');
    track(e, (ev) => {
      item.width = Math.max(MIN_WIDTH, ow + ev.clientX - sx);
    }, () => {
      dispatch('release', { width: item.width });
    });
  }

  // A drag that ends over a link/image must not also open it
  function swallowClickAfterDrag(e) {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  }

  function autosize() {
    if (!noteEl) return;
    noteEl.style.height = 'auto';
    noteEl.style.height = `${noteEl.scrollHeight}px`;
  }

  async function onNoteInput() {
    autosize();
    dispatch('note', item.note);
  }

  function remove() {
    if (confirm('Remove this from the canvas?')) dispatch('remove');
  }

  onMount(async () => {
    await tick();
    autosize();
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<article
  class="insp-card kind-{item.kind}"
  style="left: {item.x}px; top: {item.y}px; width: {item.width}px; z-index: {item.z};"
  bind:clientHeight={height}
  on:pointerdown={startDrag}
  on:click|capture={swallowClickAfterDrag}
  on:dragstart|preventDefault
>
  <header class="insp-toolbar">
    <span class="insp-grip" aria-hidden="true">⠿</span>
    <span class="insp-label" title={label}>{label}</span>
    <a class="card-action" href={openUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">↗</a>
    {#if isAdmin}
      <button class="card-action" title="Remove" on:click={remove}>×</button>
    {/if}
  </header>

  <div class="insp-content">
    {#if item.kind === 'image'}
      {#if imageFailed}
        <div class="insp-missing">image unavailable</div>
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
        <img
          src={item.url}
          alt={item.note || 'inspiration image'}
          draggable="false"
          loading="lazy"
          on:click={() => dispatch('zoom')}
          on:error={() => (imageFailed = true)}
        />
      {/if}

    {:else if item.kind === 'video'}
      {#if playing}
        <VideoPlayer videoId={meta.videoId} start={meta.start || 0} />
      {:else}
        <button class="insp-video-poster" on:click={() => (playing = true)} aria-label="Play video">
          <img src="https://i.ytimg.com/vi/{meta.videoId}/hqdefault.jpg" alt="" draggable="false" loading="lazy" />
          <span class="insp-play" aria-hidden="true">▶</span>
        </button>
      {/if}

    {:else if item.kind === 'pdf'}
      <iframe src="{item.url}#view=FitH" title={meta.filename || 'PDF'}></iframe>

    {:else}
      <a class="insp-link" href={item.url} target="_blank" rel="noopener noreferrer" draggable="false">
        {#if meta.image && !imageFailed}
          <img class="insp-link-image" src={meta.image} alt="" draggable="false" loading="lazy" on:error={() => (imageFailed = true)} />
        {/if}
        <span class="insp-link-body">
          <span class="insp-link-title">{meta.title || host}</span>
          {#if meta.description}
            <span class="insp-link-desc">{meta.description}</span>
          {/if}
          <span class="insp-link-site">
            {#if meta.favicon && !faviconFailed}
              <img class="insp-favicon" src={meta.favicon} alt="" draggable="false" on:error={() => (faviconFailed = true)} />
            {/if}
            {meta.siteName || host}
          </span>
        </span>
      </a>
    {/if}
  </div>

  {#if showPaper}
    <div class="insp-paper">
      {#if isAdmin}
        <textarea
          bind:this={noteEl}
          bind:value={item.note}
          rows="1"
          placeholder="write about it…"
          on:input={onNoteInput}
          on:blur={() => dispatch('noteblur')}
        ></textarea>
      {:else}
        <p>{item.note}</p>
      {/if}
    </div>
  {/if}

  {#if isAdmin}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="resize-handle" title="Drag to resize" on:pointerdown={startResize}></span>
  {/if}
</article>
