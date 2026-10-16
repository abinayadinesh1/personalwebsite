import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { MIN_WIDTH } from '$lib/inspiration.js';

function num(v) {
  const n = Number(v);
  return v === undefined || v === null || !Number.isFinite(n) ? null : n;
}

// PATCH - Move/resize/restack an item or edit its note (admin only).
// Only the fields present in the body change.
export async function PATCH({ params, request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const x = num(body.x) === null ? null : Math.max(0, num(body.x));
    const y = num(body.y) === null ? null : Math.max(0, num(body.y));
    const width = num(body.width) === null ? null : Math.max(MIN_WIDTH, num(body.width));
    const z = num(body.z) === null ? null : Math.round(num(body.z));
    const hasNote = typeof body.note === 'string';

    const sql = getDb();
    const result = await sql`
      UPDATE inspiration_items
      SET x = COALESCE(${x}::real, x),
          y = COALESCE(${y}::real, y),
          width = COALESCE(${width}::real, width),
          z = COALESCE(${z}::integer, z),
          note = CASE WHEN ${hasNote} THEN ${hasNote ? body.note : ''} ELSE note END
      WHERE id = ${params.id}
      RETURNING id, kind, url, meta, note, x, y, width, z
    `;

    if (result.length === 0) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    return json({ item: result[0] });
  } catch (error) {
    console.error('Error updating inspiration item:', error);
    return json({ error: 'Failed to update item', details: error.message }, { status: 500 });
  }
}

// DELETE - Remove an item (admin only)
export async function DELETE({ params, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const result = await sql`
      DELETE FROM inspiration_items
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    return json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error deleting inspiration item:', error);
    return json({ error: 'Failed to delete item', details: error.message }, { status: 500 });
  }
}
