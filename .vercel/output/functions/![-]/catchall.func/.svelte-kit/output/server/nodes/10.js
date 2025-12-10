

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/secret/seneca/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.B51tSXME.js","_app/immutable/chunks/BRAXwxwd.js","_app/immutable/chunks/Cm5b7JXn.js","_app/immutable/chunks/D6N1JL1u.js","_app/immutable/chunks/D6YF6ztN.js","_app/immutable/chunks/jss0axom.js"];
export const stylesheets = [];
export const fonts = [];
