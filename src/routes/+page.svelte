<script>
  import { onMount } from 'svelte';
  import '../styles/components/homepage.css';

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
      <u><h4>adinesh[at]berkeley.edu</h4></u>
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
        between 2022-2024, i was obsessed with understanding our food systems, and flew to Minnesota to help build microbial fertilizers for <a href="https://www.loambio.com/">Loam Bio. </a>
        Later, I worked at <a href = "https://farm-ng.com/">Farm-Ng</a>, where I built a motion planner for their farm rover. 
      </p>
      <p>Most recently, I did a 5-month stint with <a href = "https://seneca.com/">Seneca</a>, where we build heavy lift drones that can fight fires from the air. I'm super grateful to spend time protecting wild spaces and urban infrastructure. </p>
      <p>Now, I spend most of my time thinking about how to engineer robust, reliable, and observable software for hardware, from the OS level to full-scale mobile manipulators. </p>
      <p>
        in my free time, I am <a href="https://runtime.substack.com/p/what-my-body-tells-me">obsessed with rock climbing</a>, skiing, and occasionally, photography. 
        <hr class="solid">
        <a href="https://drive.google.com/file/d/14ItwjFKHKaMP2Gp4xY0hrOXUA45f7-Jo/view?usp=sharing">Resume</a>
        <!-- <div id="telescoping-text"></div>   -->
    </div>  
  </div>
</body>