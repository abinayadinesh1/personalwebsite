

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/projects/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.Cxkt6Mbm.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/chunks/Cm5b7JXn.js"];
export const stylesheets = [];
export const fonts = [];
