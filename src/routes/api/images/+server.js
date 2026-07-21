import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { getDb } from '$lib/neonClient.js';

// Cap the raw upload we'll accept. Note: on Vercel, serverless functions also
// impose their own request body limit (~4.5MB), so very large originals may be
// rejected in production before reaching this check.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// POST - Upload an image. Compresses to JPEG and stores the bytes in Neon.
export async function POST({ request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return json({ error: 'No file provided' }, { status: 400 });
  }
  if (!file.type || !file.type.startsWith('image/')) {
    return json({ error: 'File must be an image' }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  if (inputBuffer.length > MAX_UPLOAD_BYTES) {
    return json({ error: 'Image too large' }, { status: 413 });
  }

  // Compress by re-encoding to JPEG. No resize/crop — dimensions are preserved.
  // rotate() bakes in EXIF orientation; flatten() gives transparent pixels a
  // white background since JPEG has no alpha channel.
  let jpegBuffer;
  try {
    jpegBuffer = await sharp(inputBuffer)
      .rotate()
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    return json({ error: 'Failed to process image' }, { status: 400 });
  }

  // Content-addressed id: identical images dedupe, and the URL can be cached
  // forever because a different image always yields a different id.
  const id = crypto.createHash('sha256').update(jpegBuffer).digest('hex').slice(0, 32);
  const base64 = jpegBuffer.toString('base64');
  const originalName = typeof file.name === 'string' && file.name ? file.name : 'image';

  const sql = getDb();
  await sql`
    INSERT INTO images (id, filename, mime_type, data, byte_size, created_at)
    VALUES (${id}, ${originalName}, 'image/jpeg', decode(${base64}, 'base64'), ${jpegBuffer.length}, ${new Date().toISOString()})
    ON CONFLICT (id) DO NOTHING
  `;

  return json({ url: `/api/images/${id}`, id, byteSize: jpegBuffer.length });
}
