import { c as create_ssr_component } from "../../chunks/ssr.js";
const css = {
  code: "nav.svelte-q62e7t{display:flex;align-items:center;justify-content:center;font-size:1.5em;padding-top:0.2em;padding-bottom:0.7em}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<body><nav class="svelte-q62e7t" data-svelte-h="svelte-4gf2tl"> <a href="/"><strong>about</strong></a> <a href="/writing"><strong>writing</strong></a></nav> ${slots.default ? slots.default({}) : ``} </body>`;
});
export {
  Layout as default
};
