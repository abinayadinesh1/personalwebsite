

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/writing/economiesofscale/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.BCzNy33Y.js","_app/immutable/chunks/scheduler.alZtLdMt.js","_app/immutable/chunks/index.B9n9Ww45.js"];
export const stylesheets = [];
export const fonts = [];
