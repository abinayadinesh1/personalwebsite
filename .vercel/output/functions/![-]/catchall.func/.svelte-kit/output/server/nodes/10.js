

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/secret/seneca/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.DXvnTLz7.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js","_app/immutable/chunks/A-LUeCcg.js","_app/immutable/chunks/jss0axom.js"];
export const stylesheets = [];
export const fonts = [];
