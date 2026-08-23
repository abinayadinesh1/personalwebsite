<div class="writing-content">
  <slot />
</div>

<style>
  .writing-content {
    /* Fluid width: 92% of the viewport on small screens (even gutters),
       capped at 720px on larger screens. Always self-centers. */
    width: min(92%, 720px);
    margin: 0 auto;
    box-sizing: border-box;
  }

  /* Prevent long words / URLs from overflowing off the right edge */
  .writing-content :global(*) {
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  .writing-content :global(img),
  .writing-content :global(table),
  .writing-content :global(pre) {
    max-width: 100%;
  }
</style>
