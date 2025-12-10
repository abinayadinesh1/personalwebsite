

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.Ddd_NOp2.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js"];
export const stylesheets = ["_app/immutable/assets/0.C_bDadYN.css"];
export const fonts = [];
