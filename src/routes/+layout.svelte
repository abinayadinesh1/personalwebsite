<script>
  import '../styles/global.css';
  import '../styles/components/buttons.css';
  import '../styles/components/forms.css';
  import '../styles/components/nav.css';
</script>

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
