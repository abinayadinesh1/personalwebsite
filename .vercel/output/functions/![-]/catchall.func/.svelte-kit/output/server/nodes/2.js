

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BtE2lY6y.js","_app/immutable/chunks/Ci_zxSXj.js","_app/immutable/chunks/BlG282hF.js"];
export const stylesheets = ["_app/immutable/assets/2.Bp-l9xK5.css"];
export const fonts = [];
