<script>
  let img1 = "/IMG_4363.jpg";
  let img2 = "/IMG_6410.jpg";
  let img3 = "/IMG_6795.jpg";
  let img4 = "/IMG_9055.jpg";

  // /Users/abinayadinesh/Documents/personalwebsite/src/routes/+page.svelte
  // /Users/abinayadinesh/Documents/personalwebsite/static/IMG_9055.jpg

</script>

<body>
  <h1>hi!! i'm abinaya dinesh</h1>
  <h4>adinesh@berkeley.edu</h4>
  <br />
  <div class="image-container-1">
    <img
      src={img1}
      alt="an image of abi"
      style="width:20%; border-radius:10px;"
    />
    <img
      src={img2}
      alt="an image of abi"
      style="width:20%; border-radius:10px;"
    />
  </div>
  <div class="image-container-1">
    <img
      src={img3}
      alt="an image of abi"
      style="width:20%; border-radius:10px;"
    />
    <img
      src={img4}
      alt="an image of abi"
      style="width:20%; border-radius: 10px;"
    />
  </div>

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
    in the past, I developed fungal cultures for farms at <a href ="https://www.loambio.com/">Loam Bio</a>, machine learning algorithms for the <a href="https://apps.apple.com/us/app/mta-traintime/id1104885987">MTA</a>, and
    <a href="https://ieeexplore.ieee.org/document/9668883"
      >science fair projects</a
    > to improve diagnosis processes using eye tracking.
  </p>
  <p>
    i'm currently studying a mixture of agriculture, computer science, and
    mathematics at uc berkeley 🧸. my next semester will be spent understanding the fate of developing countries (should we all aspire to be another America?), writing algorithms, and talking to hundreds of farmers for <a href="https://ambrook.com/">Ambrook<a/>. 
  </p>
  <p>
    i&#39;d love for you to check out my past <a href="./writing">work</a>.
  </p>
  <p>
    in my free time, I am <a
      href="https://runtime.substack.com/p/what-my-body-tells-me"
      >obsessed with rock climbing</a
    > and making tiny zines. If you ever want to climb (lead certified 🙌🏼), grab
    pastries, or build together, reach out to me!
  </p>
  <p>find me around the internet!</p>

  <p>
    <a
      href="https://www.apple.com/newsroom/2021/06/apples-wwdc21-swift-student-challenge-winners-code-to-change-the-world/"
      >Apple</a
    >
    |
    <a href="https://www.teenvogue.com/story/national-stem-day">Teen Vogue</a>
    |
    <a
      href="https://www.aol.com/students-color-still-disadvantage-comes-190544531.html"
      >AOL&#39;s In the Know</a
    >
    |
    <a
      href="https://www.tapinto.net/towns/south-brunswick/sections/education/articles/north-brunswick-teen-wins-apple-scholarship-for-gastro-app"
      >Tap Into</a
    >
    |
    <a
      href="https://www.thehindu.com/sci-tech/technology/wwdc-2021-swift-student-winners-from-india-interview-developers-tech-industry/article34751539.ece"
      >The Hindu</a
    >
  </p>
</body>

<style>
  .image-container-1 {
    padding: 0.25em;
    display: flex;
    /* border: 2px dotted #558f6d; */
    justify-content: center;
    align-items: center;
    gap: 2em;
    border-radius: 25px;
  }
  .image-container-2 {
    border-radius: 2em;
    padding: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
