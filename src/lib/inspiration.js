// Shared by the /inspiration page and its API: decides what kind of card a
// pasted or dropped URL becomes.

export const DEFAULT_WIDTHS = { link: 300, image: 280, video: 420, pdf: 360 };
export const MIN_WIDTH = 160;

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export function parseUrl(text) {
  try {
    const url = new URL(String(text).trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

// "1h2m3s", "90s" or "90" -> seconds
function parseStart(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) : 0;
}

export function youtubeInfo(url) {
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '');
  let id = null;
  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1] || null;
  }
  if (!id || !/^[\w-]{6,}$/.test(id)) return null;
  return { videoId: id, start: parseStart(url.searchParams.get('t') || url.searchParams.get('start')) };
}

// -> { kind, meta } or null when the text isn't an http(s) URL
export function classifyUrl(text) {
  const url = parseUrl(text);
  if (!url) return null;
  const yt = youtubeInfo(url);
  if (yt) return { kind: 'video', meta: yt };
  if (/\.pdf$/i.test(url.pathname)) return { kind: 'pdf', meta: { filename: decodeURIComponent(url.pathname.split('/').pop()) } };
  if (IMAGE_EXT.test(url.pathname)) return { kind: 'image', meta: {} };
  return { kind: 'link', meta: {} };
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
