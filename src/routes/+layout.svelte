<body>
  <nav>
    <!-- <navbar-h1>abinaya dinesh</navbar-h1> -->
    <a href="/"><strong>about</strong></a>
    <a href="/writing"><strong>writing</strong></a>
    <a href="/projects"><strong>projects</strong></a>
    <a href="/reading"><strong>reading</strong></a>
  </nav>

  <slot />
</body>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    padding-top: 0.2em;
    padding-bottom: 0.7em;
  }
  .body {
    margin-bottom: 2 rem;
  } 

</style>
