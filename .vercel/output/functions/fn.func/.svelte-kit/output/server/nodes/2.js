

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.USIyM5_c.js","_app/immutable/chunks/scheduler.alZtLdMt.js","_app/immutable/chunks/index.B9n9Ww45.js"];
export const stylesheets = ["_app/immutable/assets/2.D1pKLzX8.css"];
export const fonts = [];
