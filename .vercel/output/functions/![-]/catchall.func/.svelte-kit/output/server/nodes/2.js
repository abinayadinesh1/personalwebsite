

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.Hvcb3gc6.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/chunks/Cm5b7JXn.js"];
export const stylesheets = ["_app/immutable/assets/2.Bp-l9xK5.css"];
export const fonts = [];
