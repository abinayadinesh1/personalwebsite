import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getDb } from '$lib/neonClient.js';

// Vercel also caps request bodies (~4.5MB), so larger PDFs fail in production
// before reaching this check.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// POST - Upload a PDF for the inspiration canvas (admin only)
export async function POST({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
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
  if (file.type !== 'application/pdf') {
    return json({ error: 'File must be a PDF' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return json({ error: 'PDF too large' }, { status: 413 });
  }

  // Content-addressed like /api/images: dedupes and lets the URL cache forever
  const id = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 32);
  const filename = typeof file.name === 'string' && file.name ? file.name : 'document.pdf';

  const sql = getDb();
  await sql`
    INSERT INTO inspiration_files (id, filename, mime_type, data, byte_size, created_at)
    VALUES (${id}, ${filename}, 'application/pdf', decode(${buffer.toString('base64')}, 'base64'), ${buffer.length}, ${new Date().toISOString()})
    ON CONFLICT (id) DO NOTHING
  `;

  return json({ url: `/api/inspiration/files/${id}`, id, filename, byteSize: buffer.length });
}
