<script context="module">
  let apiPromise;

  function loadYouTubeApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT);
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    });
    return apiPromise;
  }
</script>

<script>
  import { onMount, onDestroy } from 'svelte';

  export let videoId;
  export let start = 0;

  let wrapper;
  let target;
  let player;
  let ready = false;
  let paused = false;
  let muted = false;
  let current = start;
  let duration = 0;
  let scrubbing = false;
  let poll;

  function format(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  }

  onMount(async () => {
    const YT = await loadYouTubeApi();
    // controls=0: YouTube's own overlay never learns reliably that the cursor
    // left a cross-origin iframe, so it lingers. Our overlay owns all input instead.
    player = new YT.Player(target, {
      host: 'https://www.youtube-nocookie.com',
      videoId,
      playerVars: { autoplay: 1, controls: 0, disablekb: 1, rel: 0, playsinline: 1, iv_load_policy: 3, start },
      events: {
        onReady: () => {
          ready = true;
          duration = player.getDuration();
          muted = player.isMuted();
          player.playVideo();
        },
        onStateChange: (e) => {
          paused = e.data !== YT.PlayerState.PLAYING && e.data !== YT.PlayerState.BUFFERING;
          duration = player.getDuration() || duration;
        }
      }
    });
    poll = setInterval(() => {
      if (ready && !scrubbing) current = player.getCurrentTime();
    }, 250);
  });

  onDestroy(() => {
    clearInterval(poll);
    player?.destroy?.();
  });

  function toggle() {
    if (!ready) return;
    if (paused) player.playVideo();
    else player.pauseVideo();
  }

  function seek(e) {
    current = Number(e.currentTarget.value);
    player?.seekTo(current, true);
  }

  function toggleMute() {
    if (!ready) return;
    if (muted) player.unMute();
    else player.mute();
    muted = !muted;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (wrapper.requestFullscreen || wrapper.webkitRequestFullscreen)?.call(wrapper);
    }
  }
</script>

<div class="vp" class:paused bind:this={wrapper}>
  <div bind:this={target}></div>

  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="vp-hit" on:click={toggle} on:dblclick={toggleFullscreen}>
    {#if paused && ready}
      <span class="vp-big-play" aria-hidden="true">▶</span>
    {/if}
  </div>

  <div class="vp-controls">
    <button class="vp-btn" on:click={toggle} aria-label={paused ? 'Play' : 'Pause'}>
      {#if paused}
        <svg viewBox="0 0 24 24"><path class="fill" d="M8 5v14l11-7z" /></svg>
      {:else}
        <svg viewBox="0 0 24 24"><path class="fill" d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
      {/if}
    </button>
    <input
      class="vp-scrub"
      type="range"
      min="0"
      max={duration || 0}
      step="0.1"
      value={current}
      aria-label="Seek"
      style="--progress: {duration ? (current / duration) * 100 : 0}%"
      on:pointerdown={() => (scrubbing = true)}
      on:pointerup={() => (scrubbing = false)}
      on:change={() => (scrubbing = false)}
      on:input={seek}
    />
    <span class="vp-time">{format(current)} / {format(duration)}</span>
    <button class="vp-btn" on:click={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
      {#if muted}
        <svg viewBox="0 0 24 24"><path class="fill" d="M4 9v6h4l5 5V4L8 9z" /><path d="M16.5 9l5 6M21.5 9l-5 6" /></svg>
      {:else}
        <svg viewBox="0 0 24 24"><path class="fill" d="M4 9v6h4l5 5V4L8 9z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /></svg>
      {/if}
    </button>
    <button class="vp-btn" on:click={toggleFullscreen} aria-label="Fullscreen">
      <svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
    </button>
  </div>
</div>
