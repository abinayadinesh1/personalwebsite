

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/writing/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.SHwHwVok.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/chunks/Cm5b7JXn.js"];
export const stylesheets = [];
export const fonts = [];
