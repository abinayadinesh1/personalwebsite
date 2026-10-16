import { getDb } from '$lib/neonClient.js';

// GET - Serve an uploaded file inline so it can render in the canvas iframe
export async function GET({ params }) {
  const sql = getDb();
  const rows = await sql`
    SELECT filename, mime_type, encode(data, 'base64') AS data_b64
    FROM inspiration_files
    WHERE id = ${params.id}
  `;

  if (!rows || rows.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const { filename, mime_type, data_b64 } = rows[0];
  const buffer = Buffer.from(data_b64, 'base64');
  const safeName = filename.replace(/["\\\r\n]/g, '');

  return new Response(buffer, {
    headers: {
      'Content-Type': mime_type,
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
