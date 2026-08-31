import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// PUT - Update a word (admin only)
export async function PUT({ params, request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const word = (body.word || '').trim();
    const note = (body.note || '').trim() || null;
    const date = body.date || null;

    if (!word) {
      return json({ error: 'Word is required' }, { status: 400 });
    }

    const sql = getDb();

    const result = await sql`
      UPDATE words
      SET word = ${word},
          note = ${note},
          learned_on = COALESCE(${date}::date, learned_on)
      WHERE id = ${params.id}
      RETURNING id, word, note, to_char(learned_on, 'YYYY-MM-DD') AS learned_on
    `;

    if (result.length === 0) {
      return json({ error: 'Word not found' }, { status: 404 });
    }

    return json({ word: result[0] });
  } catch (error) {
    console.error('Error updating word:', error);
    return json({ error: 'Failed to update word', details: error.message }, { status: 500 });
  }
}

// DELETE - Delete a word (admin only)
export async function DELETE({ params, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    const result = await sql`
      DELETE FROM words
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return json({ error: 'Word not found' }, { status: 404 });
    }

    return json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error deleting word:', error);
    return json({ error: 'Failed to delete word', details: error.message }, { status: 500 });
  }
}
