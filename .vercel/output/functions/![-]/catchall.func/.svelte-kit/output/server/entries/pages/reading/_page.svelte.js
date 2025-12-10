import { c as create_ssr_component, f as each, e as escape, d as add_attribute } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let transformOffset;
  let currentIndex = 0;
  let itemsPerView = 5;
  let cardWidth = 160;
  let cardGap = 8;
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
    }
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
  currentIndex + itemsPerView < books.length;
  transformOffset = currentIndex * (cardWidth + cardGap);
  return `<h1 data-svelte-h="svelte-14r5emw">Favorite Texts</h1> <h3 data-svelte-h="svelte-xarig7">Bookshelf</h3> <p data-svelte-h="svelte-18dv9uo">A virtual version of my physical bookshelf, only containing the books I loved back to back.</p> <div class="carousel-container"><button class="carousel-button prev" aria-label="Previous book" data-svelte-h="svelte-1shyatn">‹</button> <div class="carousel"><div class="carousel-track" style="${"transform: translateX(-" + escape(transformOffset, true) + "px)"}">${each(books, (book) => {
    return `<div class="carousel-item"><div class="book-card">${book.note ? `<div class="book-note-popup"><p>${escape(book.note)}</p> </div>` : ``} <img${add_attribute("src", book.image, 0)} alt="${escape(book.title, true) + " cover"}"> <div class="book-info"><h4 class="book-title">${escape(book.title)}</h4> <p class="book-author">by ${escape(book.author)}</p> <p class="book-date">${escape(book.date)}</p> </div></div> </div>`;
  })}</div></div> <button class="carousel-button next" aria-label="Next book" data-svelte-h="svelte-1x40j3o">›</button></div> <h3 data-svelte-h="svelte-v8z2fj">Textbooks</h3> <div class="carousel"><div class="carousel-track" style="${"transform: translateX(-" + escape(transformOffset, true) + "px)"}">${each(textbooks, (textbook) => {
    return `<div class="carousel-item"><div class="book-card">${textbook.note ? `<div class="book-note-popup"><p>${escape(textbook.note)}</p> </div>` : ``} <img${add_attribute("src", textbook.image, 0)} alt="${escape(textbook.title, true) + " cover"}"> <div class="book-info"><h4 class="book-title">${escape(textbook.title)}</h4> <p class="book-author">by ${escape(textbook.author)}</p> <p class="book-date">${escape(textbook.date)}</p> </div></div> </div>`;
  })}</div></div> <h3 data-svelte-h="svelte-cn4vas">Courses</h3> <ul data-svelte-h="svelte-3u06yt"><li><a href="./reading/underactuated_robotics">Underactuated Robotics</a></li></ul>`;
});
export {
  Page as default
};
