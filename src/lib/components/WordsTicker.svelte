<script>
  import { onMount } from 'svelte';
  import '../../styles/components/words-ticker.css';
  import { loadWordsFromCache, fetchWords } from '$lib/utils/words.js';

  let words = [];

  onMount(async () => {
    // Paint instantly from cache, then refresh from the API in the background
    words = loadWordsFromCache().words;
    const fresh = await fetchWords();
    words = fresh.words || [];
  });
</script>

{#if words.length > 0}
  <a class="words-ticker" href="/words" aria-label="New words I've learned">
    <span class="words-ticker-label">new words i've learned</span>
    <div class="words-ticker-viewport">
      <div class="words-ticker-track" style="animation-duration: {Math.max(15, words.length * 2.5)}s">
        {#each [...words, ...words] as w}
          <span class="ticker-word">{w.word}</span><span class="ticker-sep">·</span>
        {/each}
      </div>
    </div>
  </a>
{/if}
