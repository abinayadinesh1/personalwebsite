<script>
  import { onMount } from 'svelte';
  import '../../styles/carousel.css';
  import '../../styles/articles.css';

  let currentIndex = 0;
  let itemsPerView = 5;
  let cardWidth = 160; // Base card width in pixels
  let cardGap = 8; // Gap between cards (0.5rem ≈ 8px)
  let articles = [];

  const books = [
    {
      date: "02.04.25",
      title: "The Burden of Joy",
      author: "Lexi Kent-Monning",
      image: "/burden_of_joy.jpg",
      note: "Book club'd with Alice! We cried sm, such a beautiful depiction of a woman's life."
    },
    {
      date: "01.30.25",
      title: "The Idea Factory",
      author: "Jon Gertner",
      image: "/idea_factory.jpg",
      note: ""
    },
    {
      date: "01.16.25",
      title: "15 Myths on Homelessness",
      author: "Mary Brosnahan",
      image: "/homelessness.jpg",
      note: "Extremeley important for those of us in the Bay Area."
    },
    {
      date: "",
      title: "Fire Weather",
      author: "John Vaillant",
      image: "/fire.jpg",
      note: "You'll learn about so much more than just fire."
    },
    {
      date: "",
      title: "The Golden Spruce",
      author: "John Vaillant",
      image: "/golden.jpeg",
      note: "John became my favorite author with this book."
    },
    {
      date: "",
      title: "The Anthropocene Reviewed",
      author: "John Green",
      image: "/anthropocene.jpg",
      note: "Inspired me to write my own chapters as a continuation of the book!"
    },
    {
      date: "",
      title: "How Big Things Get Done",
      author: "Bent Flyvbjerg & Dan Gardner",
      image: "/bigthings.jpg",
      note: "A Nick Foley recommendation; changed the way I think about estimation."
    },
    {
      date: "",
      title: "Project Hail Mary",
      author: "Andy Weir",
      image: "/hailmary.jpg",
      note: "A brian machado recc!"
    },
    {
      date: "",
      title: "The Secret Life of Groceries",
      author: "Benjamin Lorr",
      image: "/secretlife.jpg",
      note: "Karina Bao recc, impeccable. "
    },
    {
      date: "",
      title: "Weather: A Very Short Introduction",
      author: "Storm Dunlop",
      image: "/weather.jpeg",
      note: ""
    },

  ];

  const textbooks = [
    {
      date: "02.04.25",
      title: "The Art of Electronics",
      author: "Paul Horowitz and Winfield Hill",
      image: "/elec.jpg",
      note: "Keep coming back to this for the fundamentals"
    },
    {
      date: "",
      title: "Linear Algebra",
      author: "Alexander Givental",
      image: "/linalg.jpg",
      note: "there's a million linalg books; this is succint, and trains your general problem solving skills. he's a mathematical physics prof, and this book gives physics grounding with all the normal vector stuff. just read the first chapter."
    }
  ];


  function updateItemsPerView() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 600) {
        itemsPerView = 1;
        cardWidth = 100;
        cardGap = 8;
      } else {
        itemsPerView = 5;
        cardWidth = 160;
        cardGap = 8;
      }
      // Reset index if it's out of bounds
      if (currentIndex + itemsPerView > books.length) {
        currentIndex = Math.max(0, books.length - itemsPerView);
      }
    }
  }

  onMount(async () => {
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);

    // Fetch articles from API
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      articles = data.articles || [];
    } catch (err) {
      console.error('Failed to load articles:', err);
    }

    return () => window.removeEventListener('resize', updateItemsPerView);
  });

  function nextBook() {
    if (currentIndex + itemsPerView < books.length) {
      currentIndex = currentIndex + 1;
    }
  }

  function prevBook() {
    if (currentIndex > 0) {
      currentIndex = currentIndex - 1;
    }
  }

  $: canGoNext = currentIndex + itemsPerView < books.length;
  $: canGoPrev = currentIndex > 0;
  // Transform by card width + gap
  $: transformOffset = currentIndex * (cardWidth + cardGap);
</script>

<h1>Favorite Texts</h1>

<div class="reading-layout">
  <div class="reading-left">
    <h3>Bookshelf</h3>
    <p>A virtual version of my physical bookshelf, only containing the books I loved back to back.</p>

    <div class="carousel-container">
      <button class="carousel-button prev" on:click={prevBook} aria-label="Previous book">‹</button>

      <div class="carousel">
        <div class="carousel-track" style="transform: translateX(-{transformOffset}px)">
          {#each books as book}
            <div class="carousel-item">
              <div class="book-card">
                {#if book.note}
                  <div class="book-note-popup">
                    <p>{book.note}</p>
                  </div>
                {/if}
                <img src={book.image} alt="{book.title} cover" />
                <div class="book-info">
                  <h4 class="book-title">{book.title}</h4>
                  <p class="book-author">by {book.author}</p>
                  <p class="book-date">{book.date}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <button class="carousel-button next" on:click={nextBook} aria-label="Next book">›</button>
    </div>

    <h3>Textbooks</h3>
    <div class="carousel-container">
      <div class="carousel">
        <div class="carousel-track">
          {#each textbooks as textbook}
            <div class="carousel-item">
              <div class="book-card">
                {#if textbook.note}
                  <div class="book-note-popup">
                    <p>{textbook.note}</p>
                  </div>
                {/if}
                <img src={textbook.image} alt="{textbook.title} cover" />
                <div class="book-info">
                  <h4 class="book-title">{textbook.title}</h4>
                  <p class="book-author">by {textbook.author}</p>
                  <p class="book-date">{textbook.date}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <h3>Courses</h3>
    <ul>
      <li>
        <a href = "./reading/underactuated_robotics">Underactuated Robotics</a>
      </li>
    </ul>
  </div>

  <div class="reading-right">
    <div class="articles-column">
      <h3>Short(er) Form</h3>
      <div class="articles-list">
        {#each articles as article}
          <a class="article-card" href="/reading/articles/{article.id}">
            <h4 class="article-title">{article.title || article.link}</h4>
            {#if article.content}
              <span class="notes-icon" title="Has notes">&#x1f4dd;</span>
            {/if}
          </a>
        {/each}
        {#if articles.length === 0}
          <p style="font-size: 0.8em; opacity: 0.5;">No articles yet.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
