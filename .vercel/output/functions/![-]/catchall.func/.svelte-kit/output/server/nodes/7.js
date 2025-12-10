

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/reading/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.BuWVhK9K.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js"];
export const stylesheets = [];
export const fonts = [];
