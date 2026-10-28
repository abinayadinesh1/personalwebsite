<script>
  import { onMount } from 'svelte';
  import { previewPublic } from '$lib/adminView.js';
  import '../../styles/inspiration.css';
  import InspirationCard from '$lib/components/InspirationCard.svelte';
  import { classifyUrl, parseUrl, DEFAULT_WIDTHS } from '$lib/inspiration.js';

  export let data;

  $: isAdmin = data.isAdmin && !$previewPublic;
  let items = data.items || [];
  let heights = {};

  let viewport;
  let viewportW = 0;
  let viewportH = 0;
  let viewportTop = 0;
  let innerHeight = 0;

  let dragging = false;
  let dropActive = false;
  let busy = 0;
  let status = '';
  let statusTimer;
  let zoomed = null;

  // Leave room past the furthest card so there's always space to drag into
  const BOARD_MARGIN = 400;
  $: extentW = Math.max(0, ...items.map((i) => i.x + i.width));
  $: extentH = Math.max(0, ...items.map((i) => i.y + (heights[i.id] || 300)));
  $: boardW = Math.max(viewportW, extentW + BOARD_MARGIN);
  $: boardH = Math.max(viewportH, extentH + BOARD_MARGIN);
  $: viewportHeight = Math.max(320, innerHeight - viewportTop - 16);

  function measure() {
    if (viewport) viewportTop = viewport.getBoundingClientRect().top + window.scrollY;
  }

  onMount(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  });

  function flash(message) {
    status = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status = ''), 4000);
  }

  // --- Persistence (admin only; visitors can rearrange locally) ---

  async function patch(id, fields) {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/inspiration/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (!res.ok) flash('Failed to save');
    } catch (err) {
      console.error('Failed to save item:', err);
      flash('Failed to save');
    }
  }

  function raise(item) {
    const top = Math.max(0, ...items.map((i) => i.z));
    if (item.z < top || items.filter((i) => i.z === top).length > 1) {
      item.z = top + 1;
      items = items;
    }
  }

  function onGrab(item) {
    dragging = true;
    raise(item);
  }

  function onRelease(item) {
    dragging = false;
    patch(item.id, { x: item.x, y: item.y, width: item.width, z: item.z });
  }

  const noteTimers = {};
  function onNote(item) {
    clearTimeout(noteTimers[item.id]);
    noteTimers[item.id] = setTimeout(() => saveNote(item), 700);
  }
  function saveNote(item) {
    clearTimeout(noteTimers[item.id]);
    delete noteTimers[item.id];
    patch(item.id, { note: item.note });
  }
  function onNoteBlur(item) {
    if (noteTimers[item.id]) saveNote(item);
  }

  async function removeItem(item) {
    try {
      const res = await fetch(`/api/inspiration/${item.id}`, { method: 'DELETE' });
      if (res.ok) items = items.filter((i) => i.id !== item.id);
      else flash('Failed to remove');
    } catch (err) {
      console.error('Failed to remove item:', err);
      flash('Failed to remove');
    }
  }

  // --- Adding ---

  function centerPosition(kind) {
    const w = DEFAULT_WIDTHS[kind] || 300;
    const jitter = () => Math.round((Math.random() - 0.5) * 80);
    return {
      x: Math.max(0, viewport.scrollLeft + viewportW / 2 - w / 2 + jitter()),
      y: Math.max(30, viewport.scrollTop + viewportH / 3 + jitter())
    };
  }

  async function createItem(body) {
    const res = await fetch('/api/inspiration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to add');
    items = [...items, result.item];
  }

  async function upload(endpoint, file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(endpoint, { method: 'POST', body: form });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || (res.status === 413 ? 'File too large' : 'Upload failed'));
    return result;
  }

  async function withBusy(task) {
    busy += 1;
    try {
      await task();
    } catch (err) {
      console.error(err);
      flash(err.message || 'Something went wrong');
    } finally {
      busy -= 1;
    }
  }

  function addUrl(text, pos, forceKind) {
    const classified = classifyUrl(text);
    if (!classified) {
      flash('That isn’t a link');
      return;
    }
    const kind = forceKind || classified.kind;
    const at = pos || centerPosition(kind);
    return withBusy(() => createItem({ url: text.trim(), kind, x: at.x, y: at.y }));
  }

  function addFile(file, pos) {
    if (file.type.startsWith('image/')) {
      const at = pos || centerPosition('image');
      return withBusy(async () => {
        const { url } = await upload('/api/images', file);
        await createItem({ url, kind: 'image', x: at.x, y: at.y });
      });
    }
    if (file.type === 'application/pdf') {
      const at = pos || centerPosition('pdf');
      return withBusy(async () => {
        const { url, filename } = await upload('/api/inspiration/files', file);
        await createItem({ url, kind: 'pdf', meta: { filename }, x: at.x, y: at.y });
      });
    }
    flash(`Can’t add ${file.name || 'that file'} — images and PDFs only`);
  }

  function isEditable(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function onPaste(e) {
    if (!isAdmin || isEditable(e.target)) return;
    const files = [...(e.clipboardData?.files || [])];
    if (files.length) {
      e.preventDefault();
      files.forEach((f) => addFile(f));
      return;
    }
    const text = e.clipboardData?.getData('text/plain') || '';
    if (parseUrl(text)) {
      e.preventDefault();
      addUrl(text);
    }
  }

  // --- Drop ---

  function acceptsDrop(e) {
    const types = [...(e.dataTransfer?.types || [])];
    return isAdmin && (types.includes('Files') || types.includes('text/uri-list') || types.includes('text/plain'));
  }

  function onDragOver(e) {
    if (!acceptsDrop(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropActive = true;
  }

  function onDragLeave(e) {
    if (!viewport.contains(e.relatedTarget)) dropActive = false;
  }

  function onDrop(e) {
    if (!acceptsDrop(e)) return;
    e.preventDefault();
    dropActive = false;

    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left + viewport.scrollLeft;
    const y = e.clientY - rect.top + viewport.scrollTop;
    // Drop point is the card's top-left, nudged so the pointer lands inside it
    const pos = { x: Math.max(0, x - 40), y: Math.max(30, y - 20) };

    const files = [...e.dataTransfer.files];
    if (files.length) {
      files.forEach((f, i) => addFile(f, { x: pos.x + i * 30, y: pos.y + i * 30 }));
      return;
    }

    // An image dragged from another page: use its src even without an image extension
    const html = e.dataTransfer.getData('text/html');
    const imgSrc = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    if (imgSrc && parseUrl(imgSrc)) {
      addUrl(imgSrc.replace(/&amp;/g, '&'), pos, 'image');
      return;
    }

    const uri = (e.dataTransfer.getData('text/uri-list') || '').split('\n').find((l) => l && !l.startsWith('#'));
    const text = uri || e.dataTransfer.getData('text/plain');
    if (parseUrl(text)) addUrl(text, pos);
    else flash('Drop a link, image, YouTube video or PDF');
  }

  // --- Pan by dragging empty canvas with the mouse ---

  function startPan(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target !== e.currentTarget) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const ol = viewport.scrollLeft;
    const ot = viewport.scrollTop;
    viewport.classList.add('panning');
    const move = (ev) => {
      viewport.scrollLeft = ol - (ev.clientX - sx);
      viewport.scrollTop = ot - (ev.clientY - sy);
    };
    const up = () => {
      viewport.classList.remove('panning');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
</script>

<svelte:head>
  <title>inspiration</title>
</svelte:head>

<svelte:window
  bind:innerHeight
  on:paste={onPaste}
  on:keydown={(e) => e.key === 'Escape' && (zoomed = null)}
/>

<div class="insp-page">
  <div class="insp-header">
    <h1>inspiration</h1>
    {#if isAdmin}
      <span class="insp-status">{busy ? 'adding…' : status}</span>
    {/if}
  </div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="insp-viewport"
    class:drop-active={dropActive}
    style="height: {viewportHeight}px;"
    bind:this={viewport}
    bind:clientWidth={viewportW}
    bind:clientHeight={viewportH}
    on:dragover={onDragOver}
    on:dragleave={onDragLeave}
    on:drop={onDrop}
  >
    <div
      class="insp-board"
      class:dragging
      style="width: {boardW}px; height: {boardH}px;"
      on:pointerdown={startPan}
    >
      {#each items as item (item.id)}
        <InspirationCard
          bind:item
          bind:height={heights[item.id]}
          {isAdmin}
          on:grab={() => onGrab(item)}
          on:release={() => onRelease(item)}
          on:note={() => onNote(item)}
          on:noteblur={() => onNoteBlur(item)}
          on:remove={() => removeItem(item)}
          on:zoom={() => (zoomed = item)}
        />
      {/each}

      {#if items.length === 0}
        <p class="insp-empty">
          {isAdmin ? 'paste or drop a link, image, youtube video or pdf anywhere' : 'nothing here yet'}
        </p>
      {/if}
    </div>
  </div>
</div>

{#if zoomed}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="insp-lightbox" on:click={() => (zoomed = null)}>
    <img src={zoomed.url} alt={zoomed.note || 'inspiration image'} />
    {#if zoomed.note}
      <p class="insp-lightbox-note">{zoomed.note}</p>
    {/if}
  </div>
{/if}
