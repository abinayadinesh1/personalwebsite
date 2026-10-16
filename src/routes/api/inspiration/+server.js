import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { classifyUrl, parseUrl, DEFAULT_WIDTHS, MIN_WIDTH } from '$lib/inspiration.js';
import { fetchLinkPreview } from '$lib/linkPreview.js';

const KINDS = ['link', 'image', 'video', 'pdf'];

// GET - All canvas items (public)
export async function GET() {
  try {
    const sql = getDb();
    const items = await sql`
      SELECT id, kind, url, meta, note, x, y, width, z
      FROM inspiration_items
      ORDER BY z, id
    `;
    return json({ items });
  } catch (error) {
    console.error('Error fetching inspiration:', error);
    return json({ error: 'Failed to fetch inspiration', details: error.message }, { status: 500 });
  }
}

// POST - Add an item from a URL (admin only). `kind` is passed for our own
// uploads (/api/images, /api/inspiration/files) whose URLs have no extension.
export async function POST({ request, cookies, url: requestUrl }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const isLocalUpload = typeof body.url === 'string' && body.url.startsWith('/api/');
    const absolute = isLocalUpload ? new URL(body.url, requestUrl.origin).href : body.url;

    if (!parseUrl(absolute)) {
      return json({ error: 'Not a valid http(s) link' }, { status: 400 });
    }

    const classified = classifyUrl(absolute);
    const kind = KINDS.includes(body.kind) ? body.kind : classified.kind;
    let meta = { ...(kind === classified.kind ? classified.meta : {}), ...(body.meta || {}) };
    if (kind === 'link') meta = { ...meta, ...(await fetchLinkPreview(absolute)) };

    const width = Math.max(MIN_WIDTH, Number(body.width) || DEFAULT_WIDTHS[kind]);
    const x = Math.max(0, Number(body.x) || 40);
    const y = Math.max(0, Number(body.y) || 40);
    const storedUrl = isLocalUpload ? body.url : absolute;

    const sql = getDb();
    const result = await sql`
      INSERT INTO inspiration_items (kind, url, meta, x, y, width, z)
      VALUES (
        ${kind}, ${storedUrl}, ${JSON.stringify(meta)}::jsonb, ${x}, ${y}, ${width},
        (SELECT COALESCE(MAX(z), 0) + 1 FROM inspiration_items)
      )
      RETURNING id, kind, url, meta, note, x, y, width, z
    `;

    return json({ item: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating inspiration item:', error);
    return json({ error: 'Failed to add item', details: error.message }, { status: 500 });
  }
}
