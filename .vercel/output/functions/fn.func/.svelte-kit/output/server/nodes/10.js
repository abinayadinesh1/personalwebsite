

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/writing/homeforgenius/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.BbVj4yDB.js","_app/immutable/chunks/scheduler.alZtLdMt.js","_app/immutable/chunks/index.B9n9Ww45.js"];
export const stylesheets = [];
export const fonts = [];
