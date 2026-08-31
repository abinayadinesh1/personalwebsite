import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// PUT - Upsert a date annotation; an empty label removes it (admin only)
export async function PUT({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const date = body.date;
    const label = (body.label || '').trim();

    if (!date) {
      return json({ error: 'Date is required' }, { status: 400 });
    }

    const sql = getDb();

    if (!label) {
      await sql`DELETE FROM word_date_annotations WHERE date = ${date}`;
      return json({ success: true, date });
    }

    const result = await sql`
      INSERT INTO word_date_annotations (date, label)
      VALUES (${date}, ${label})
      ON CONFLICT (date) DO UPDATE SET label = EXCLUDED.label
      RETURNING to_char(date, 'YYYY-MM-DD') AS date, label
    `;

    return json({ annotation: result[0] });
  } catch (error) {
    console.error('Error saving annotation:', error);
    return json({ error: 'Failed to save annotation', details: error.message }, { status: 500 });
  }
}
