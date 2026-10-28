import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'previewPublic';

function read() {
  try {
    return browser && sessionStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}

// When true, a logged-in admin sees every page as the public does (toggled from the home page)
export const previewPublic = writable(read());

if (browser) {
  previewPublic.subscribe((v) => {
    try {
      sessionStorage.setItem(KEY, String(v));
    } catch {}
  });
}
