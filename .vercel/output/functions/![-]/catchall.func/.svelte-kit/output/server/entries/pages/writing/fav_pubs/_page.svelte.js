import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { S as SvelteMarkdown } from "../../../../chunks/SvelteMarkdown.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const source = `
    # favorite publications of 2024

After being silo’ed away from the news, public politics, and international relations for most of my childhood, I was inspired this year to learn about the world. I love the news because it is an entry to point to history, understanding patterns and relationships between world powers that make today’s economy, health, and living conditions what they are. Otherwise, I love learning about findings in biology, math, physics, and robotics! 

### Daily

The New York Times

The Economist

### Biweekly

Ambrook Research 

Quanta

Palladium Mag

Works in Progress

Asterisk 

The New Yorker

The Atlantic`;
  return `${validate_component(SvelteMarkdown, "SvelteMarkdown").$$render($$result, { source }, {}, {})}`;
});
export {
  Page as default
};
