

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/writing/spectrometer/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/25.DC0aDK_W.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js"];
export const stylesheets = [];
export const fonts = [];
