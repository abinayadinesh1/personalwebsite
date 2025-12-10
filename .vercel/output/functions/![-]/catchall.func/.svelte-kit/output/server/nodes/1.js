

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.CAq-Q8j5.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js","_app/immutable/chunks/D1jodhVs.js"];
export const stylesheets = [];
export const fonts = [];
