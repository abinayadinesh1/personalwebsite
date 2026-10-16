import { hostOf } from '$lib/inspiration.js';

// Enough to cover <head> on nearly every page without downloading huge documents.
const MAX_HTML_BYTES = 512 * 1024;

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4];
  }
  return attrs;
}

function absolutize(href, base) {
  if (!href) return null;
  try {
    return new URL(decodeEntities(href), base).href;
  } catch {
    return null;
  }
}

async function readCapped(res) {
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks));
}

// Open Graph / Twitter card / <title> unfurl. Never throws: falls back to the host.
export async function fetchLinkPreview(url) {
  const fallback = {
    title: hostOf(url),
    description: null,
    image: null,
    siteName: hostOf(url),
    favicon: absolutize('/favicon.ico', url)
  };

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InspirationBot/1.0; +https://abinayadinesh.com)',
        Accept: 'text/html,application/xhtml+xml'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('html')) return fallback;

    const html = await readCapped(res);
    const base = res.url || url;

    const meta = {};
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
      const attrs = parseAttrs(tag);
      const key = (attrs.property || attrs.name || '').toLowerCase();
      if (key && attrs.content && !(key in meta)) meta[key] = decodeEntities(attrs.content).trim();
    }
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    let iconHref = null;
    for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
      const attrs = parseAttrs(tag);
      const rel = (attrs.rel || '').toLowerCase();
      if (rel.split(/\s+/).includes('icon') || rel === 'apple-touch-icon') {
        iconHref = attrs.href;
        if (rel === 'apple-touch-icon') break; // prefer the larger icon
      }
    }

    return {
      title: meta['og:title'] || meta['twitter:title'] || (titleTag && decodeEntities(titleTag).trim()) || fallback.title,
      description: meta['og:description'] || meta['twitter:description'] || meta['description'] || null,
      image: absolutize(meta['og:image'] || meta['og:image:url'] || meta['twitter:image'] || meta['twitter:image:src'], base),
      siteName: meta['og:site_name'] || hostOf(base),
      favicon: absolutize(iconHref, base) || absolutize('/favicon.ico', base)
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return fallback;
  }
}
