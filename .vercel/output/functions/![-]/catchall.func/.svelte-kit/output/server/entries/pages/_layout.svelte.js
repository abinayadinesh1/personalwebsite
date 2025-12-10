import { c as create_ssr_component } from "../../chunks/ssr.js";
const css = {
  code: "nav.svelte-q62e7t{display:flex;align-items:center;justify-content:center;font-size:1.5em;padding-top:0.2em;padding-bottom:0.7em}",
  map: '{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<body>\\n  <nav>\\n    <!-- <navbar-h1>abinaya dinesh</navbar-h1> -->\\n    <a href=\\"/\\"><strong>about</strong></a>\\n    <a href=\\"/writing\\"><strong>writing</strong></a>\\n    <a href=\\"/projects\\"><strong>projects</strong></a>\\n    <a href=\\"/reading\\"><strong>reading</strong></a>\\n  </nav>\\n\\n  <slot />\\n</body>\\n\\n<style>\\n  nav {\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    font-size: 1.5em;\\n    padding-top: 0.2em;\\n    padding-bottom: 0.7em;\\n  }\\n</style>\\n"],"names":[],"mappings":"AAaE,iBAAI,CACF,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,CAClB,cAAc,CAAE,KAClB"}'
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<body><nav class="svelte-q62e7t" data-svelte-h="svelte-6i080b"> <a href="/"><strong>about</strong></a> <a href="/writing"><strong>writing</strong></a> <a href="/projects"><strong>projects</strong></a> <a href="/reading"><strong>reading</strong></a></nav> ${slots.default ? slots.default({}) : ``} </body>`;
});
export {
  Layout as default
};
