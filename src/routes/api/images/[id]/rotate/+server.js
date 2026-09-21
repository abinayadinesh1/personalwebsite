import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { getDb } from '$lib/neonClient.js';

// POST - Rotate a stored image by 90, 180 or 270 degrees. Ids are content
// hashes, so the result is stored as a new image and its url is returned;
// the original is left in place.
export async function POST({ params, request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let degrees = 90;
  try {
    const body = await request.json();
    degrees = Number(body?.degrees ?? 90);
  } catch {
    // default to 90
  }
  if (![90, 180, 270].includes(degrees)) {
    return json({ error: 'degrees must be 90, 180 or 270' }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`SELECT filename, encode(data, 'base64') AS data_b64 FROM images WHERE id = ${params.id}`;
  if (!rows || rows.length === 0) {
    return json({ error: 'Image not found' }, { status: 404 });
  }

  let rotated;
  try {
    rotated = await sharp(Buffer.from(rows[0].data_b64, 'base64'))
      .rotate(degrees)
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
  } catch {
    return json({ error: 'Failed to rotate image' }, { status: 500 });
  }

  const id = crypto.createHash('sha256').update(rotated).digest('hex').slice(0, 32);
  await sql`
    INSERT INTO images (id, filename, mime_type, data, byte_size, created_at)
    VALUES (${id}, ${rows[0].filename || 'image'}, 'image/jpeg', decode(${rotated.toString('base64')}, 'base64'), ${rotated.length}, ${new Date().toISOString()})
    ON CONFLICT (id) DO NOTHING
  `;

  return json({ url: `/api/images/${id}`, id });
}
