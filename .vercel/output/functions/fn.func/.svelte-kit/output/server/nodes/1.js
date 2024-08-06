

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.DtKFhxfa.js","_app/immutable/chunks/scheduler.alZtLdMt.js","_app/immutable/chunks/index.B9n9Ww45.js","_app/immutable/chunks/entry.3CFR8iQK.js"];
export const stylesheets = [];
export const fonts = [];
