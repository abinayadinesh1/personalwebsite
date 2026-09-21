<script>
  import { onMount } from 'svelte';
  import '../styles/components/homepage.css';
  import WordsTicker from '$lib/components/WordsTicker.svelte';

  let img1 = "/IMG_4363.jpg";
  let img2 = "/IMG_6410.jpg";
  let img3 = "/IMG_6795.jpg";
  let img4 = "/IMG_9055.jpg";
  let img5 = "/pretty_image.jpg";

  onMount(() => {
    // Add the telescoping text script and styles
    const script = document.createElement('script');
    script.src = "https://unpkg.com/telescopic-text/lib/index.js";
    document.head.appendChild(script);

    const styles = document.createElement('link');
    styles.rel = "stylesheet";
    styles.href = "https://unpkg.com/telescopic-text/lib/index.css";
    document.head.appendChild(styles);

    // Initialize telescoping text after script loads
    script.onload = () => {
  //     const content = `
  // * I 
  //   * Yawning, I
  // * made tea`;

      const content = `
* i love
* dreamy gradients, 
    * dreamy gradients, interactive maps, 
      * dreamy gradients, interactive maps, the history of science + progress, 
        * dreamy gradients, interactive maps, the history of science + progress, tiny things that move really fast (especially robots),
        * and more.
`;
      
      const container = document.getElementById('telescoping-text');
      const node = window.createTelescopicTextFromBulletedList(content, {
        shouldExpandOnMouseOver: true
      });
      container.appendChild(node);
    };
  });

</script>

<body>
  <div class="page-container">
    <!-- Left column -->
    <div class="text-column">
      <img src={img5} 
        style="width:80%; border-radius:10px;"
        alt = "pretty cover image, flying bird and big flower"
      />
      <h1>abinaya dinesh</h1>
      <u><h4>adinesh[at]berkeley.edu</h4></u>
      <p class="social-links">
        <a href="https://curius.app/abinaya-dinesh">Curius</a> |
        <a href="x.com/abinayaaaa">Twitter</a>
      </p>
    </div>

    <!-- Center column with images -->
    <div class="image-column">
      <div class="image-grid">
        <img src={img1} alt="an image of abi" />
        <img src={img2} alt="an image of abi" />
        <img src={img3} alt="an image of abi" />
        <img src={img4} alt="an image of abi" />
      </div>
      <WordsTicker />
    </div>

    <!-- Right column -->
    <div class="text-column">
      <p>
        I'm a tinkerer that likes to make robots that are fun and functional.
        Previously, I was at <a href="https://www.pi.website/">PI</a>, <a href="https://seneca.com/">Seneca</a>, and <a href="https://farm-ng.com/">farm-ng</a>.
      </p>
      <p>
        In my free time, I am <a href="https://runtime.substack.com/p/what-my-body-tells-me">obsessed with rock climbing</a>, sailing, skiing, wildlife photography, prototyping objects, and escaping on long hikes to nature.
      </p>
    </div>  
  </div>
</body>