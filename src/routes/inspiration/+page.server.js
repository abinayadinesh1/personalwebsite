import { getDb } from '$lib/neonClient.js';

export async function load({ cookies }) {
  const sql = getDb();
  const items = await sql`
    SELECT id, kind, url, meta, note, x, y, width, z
    FROM inspiration_items
    ORDER BY z, id
  `;

  return {
    isAdmin: cookies.get('adminAuth') === 'true',
    items
  };
}
