<script>
  import { onMount } from 'svelte';

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
      <h4>Updated: 02/04/225</h4>
      <h4-blue>adinesh@berkeley.edu</h4-blue>
      <p class="social-links">
        <a href="https://curius.app/abinaya-dinesh">Curius</a> |
        <a href="x.com/abinayaaaa">Twitter</a> |
        <a href="https://www.apple.com/newsroom/2021/06/apples-wwdc21-swift-student-challenge-winners-code-to-change-the-world/">Apple</a> |
        <a href="https://www.teenvogue.com/story/national-stem-day">Teen Vogue</a>
      </p>
      <hr class="solid">
      <p>
        I love to host nomads, researchers, and curious fellas at our <a href = "https://joinarcadia.org/">group house in Berkeley</a>. Reach out if you need a place to stay!
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
    </div>

    <!-- Right column -->
    <div class="text-column">
      <p>
        i'm currently studying a mixture of agriculture, computer science, and
        mathematics <a href = "./secret/coursework">at uc berkeley</a> 🧸. 
      </p>
      <p>
        for the past two years, I’ve been obsessed with understanding our food systems, and flew to Minnesota to help build microbial fertilizers for <a href="https://www.loambio.com/">Loam Bio. </a>
        Later, I worked at <a href = "https://farm-ng.com/">Farm-Ng</a>, where I helped build a motion planner for their autonomous rover. Since then, I’ve been obsessed with low level software, ML for edge devices, and robotics. I’m currently building a 16 DoF mobile manipulator from scratch - you can check for progress <a href ="https://x.com/abinayaaaa">here</a>! 
      </p>
      <p>i'm currently dreaming about non-anthropomorphic robots that can cohere with our day to day activities, making life more frictionless and leaving space for whimsy.</p>
      <p>
        in my free time, I am <a href="https://runtime.substack.com/p/what-my-body-tells-me">obsessed with rock climbing</a>, skiing, and occasionaly, photography. 
        <hr class="solid">

        <!-- <div id="telescoping-text"></div>   -->
    </div>  
  </div>
</body>

<style>
  .page-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    max-width: 100%;
    margin: 0 auto;
    align-items: start;
  }

  .text-column {
    padding: 1rem;
    max-width: 600px;
    margin-right: 1rem;
  }

  .image-column {
    width: 100%;
    max-width: 500px;
    padding-top: 1rem;
    padding-right: 1rem;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .image-grid img {
    width: 100%;
    border-radius: 10px;
    object-fit: cover;
  }

  /* Responsive layout */
  @media (max-width: 1200px) {
    .page-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }

    .text-column {
      max-width: 800px;
      margin: 0 auto;
    }

    .image-column {
      margin: 2rem auto;
    }

  .social-links {
    margin-top: 2rem;
  }

  .social-links a {
    /* margin: 0 0.5rem; */
  }
}
:global(.telescopic-text) {
    margin: 1em 0;
    line-height: 1.6;
  }

  :global(.telescopic-text span) {
    cursor: pointer;
    color: #558f6d;
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  :global(.telescopic-text span:hover) {
    color: #3a6049;
  }

</style>