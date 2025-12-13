<script>
  import SvelteMarkdown from "svelte-markdown";
  const source = `
  
  ### My first PCB, made in 15 hours in KiCad. 

  - controls 10 haptic motors, w/ capacity up to 16
  - 5V to ctrl motors and 3.3V to ctrl board
  - i2C forwarder to mux motor id's
  - LED status grid

  
  Miraculously worked first try (have never said that before); uploading code, controlling each motor independently.

  ![pic](/pcb.jpeg)
`
  </script>

<div class="markdown-wrapper">
  <SvelteMarkdown {source} />
</div>
