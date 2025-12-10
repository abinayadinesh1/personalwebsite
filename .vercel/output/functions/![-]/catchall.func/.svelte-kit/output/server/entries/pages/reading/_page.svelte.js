import { c as create_ssr_component, d as add_attribute } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1 data-svelte-h="svelte-gkthky">Reading</h1> <h3 data-svelte-h="svelte-my79gs">Books</h3> <ul data-svelte-h="svelte-1w8gai9"><li><p>02.04.25 The Burden of Joy, by Lexi Kent-Monning</p></li> <li><p>01.30.25 The Idea Factory, by Jon Gertner</p></li> <li><p>01.16.25 15 Myths on Homelessness, by Mary Brosnahan</p></li></ul> <h3 data-svelte-h="svelte-v8z2fj">Textbooks</h3> <p data-svelte-h="svelte-1fgau9o">Coming soon ~</p> <div class="image-column"><div class="image-grid"><img${add_attribute("src", img1, 0)} alt="an image of abi"> <img${add_attribute("src", img2, 0)} alt="an image of abi"> <img${add_attribute("src", img3, 0)} alt="an image of abi"> <img${add_attribute("src", img4, 0)} alt="an image of abi"></div></div> <h3 data-svelte-h="svelte-cn4vas">Courses</h3> <ul data-svelte-h="svelte-3u06yt"><li><a href="./reading/underactuated_robotics">Underactuated Robotics</a></li></ul>`;
});
export {
  Page as default
};
