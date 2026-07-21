import { getDb } from '$lib/neonClient.js';

// GET - Serve a stored image by id. ids are content hashes, so responses are
// safe to cache immutably.
export async function GET({ params }) {
  const { id } = params;

  const sql = getDb();
  const rows = await sql`
    SELECT mime_type, encode(data, 'base64') AS data_b64
    FROM images
    WHERE id = ${id}
  `;

  if (!rows || rows.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const { mime_type, data_b64 } = rows[0];
  const buffer = Buffer.from(data_b64, 'base64');

  return new Response(buffer, {
    headers: {
      'Content-Type': mime_type || 'image/jpeg',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
