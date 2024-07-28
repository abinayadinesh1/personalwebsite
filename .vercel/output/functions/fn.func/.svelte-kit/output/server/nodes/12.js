

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/writing/phofsoil/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.BT3JFDVa.js","_app/immutable/chunks/scheduler.alZtLdMt.js","_app/immutable/chunks/index.B9n9Ww45.js"];
export const stylesheets = [];
export const fonts = [];
