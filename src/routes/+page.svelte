<script>
  let img1 = "/IMG_4363.jpg";
  let img2 = "/IMG_6410.jpg";
  let img3 = "/IMG_6795.jpg";
  let img4 = "/IMG_9055.jpg";
</script>

<body>
  <div class="page-container">
    <!-- Left column -->
    <div class="text-column">
      <h1>hi!! i'm abinaya dinesh</h1>
      <h4>adinesh@berkeley.edu</h4>
      <h3>Updated: 7/28/24</h3>
      <p>
        im currently interested in using robotics to bring agency and utility to
        farmers by developing visual navigation systems that can explore and
        understand diverse cropping systems. broadly, I'm curious about how to
        shorten the overall food supply chain, make small farmers competitive on the
        market, and leverage policy and sustainability for long term goals in public
        health.
      </p>
      <p>
        in the past, I developed fungal cultures for farms at <a href="https://www.loambio.com/">Loam Bio</a>, machine learning algorithms for the <a href="https://apps.apple.com/us/app/mta-traintime/id1104885987">MTA</a>, and
        <a href="https://ieeexplore.ieee.org/document/9668883">science fair projects</a> to improve diagnosis processes using eye tracking.
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
        mathematics at uc berkeley 🧸. my next semester will be spent understanding the fate of developing countries (should we all aspire to be another America?), writing algorithms, and talking to hundreds of farmers for <a href="https://ambrook.com/">Ambrook</a>. 
      </p>
      <p>
        i'd love for you to check out my past <a href="./writing">work</a>.
      </p>
      <p>
        in my free time, I am <a href="https://runtime.substack.com/p/what-my-body-tells-me">obsessed with rock climbing</a> and making tiny zines. If you ever want to climb (lead certified 🙌🏼), grab
        pastries, or build together, reach out to me!
      </p>
      <p>find me around the internet!</p>
      <p class="social-links">
        <a href="https://curius.app/abinaya-dinesh">Curius</a> |
        <a href="x.com/abinayaaaa">Twitter</a> |
        <a href="https://www.apple.com/newsroom/2021/06/apples-wwdc21-swift-student-challenge-winners-code-to-change-the-world/">Apple</a> |
        <a href="https://www.teenvogue.com/story/national-stem-day">Teen Vogue</a>
      </p>
    </div>
  </div>
</body>

<style>
  .body {
    margin-bottom: 2 rem;
  } 
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
  }

  .image-column {
    width: 100%;
    max-width: 500px;
    padding-top: 5rem;
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
</style>