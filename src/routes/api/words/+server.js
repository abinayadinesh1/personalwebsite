import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// GET - Fetch all words and date annotations (public)
export async function GET() {
  try {
    const sql = getDb();

    const words = await sql`
      SELECT id, word, note, to_char(learned_on, 'YYYY-MM-DD') AS learned_on
      FROM words
      ORDER BY learned_on DESC, id DESC
    `;

    const annotations = await sql`
      SELECT to_char(date, 'YYYY-MM-DD') AS date, label
      FROM word_date_annotations
      ORDER BY date
    `;

    return json({ words, annotations });
  } catch (error) {
    console.error('Error fetching words:', error);
    return json({ error: 'Failed to fetch words', details: error.message }, { status: 500 });
  }
}

// POST - Add a new word (admin only)
export async function POST({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const word = (body.word || '').trim();
    const date = body.date || null;

    if (!word) {
      return json({ error: 'Word is required' }, { status: 400 });
    }

    const sql = getDb();

    const result = await sql`
      INSERT INTO words (word, learned_on)
      VALUES (${word}, COALESCE(${date}::date, CURRENT_DATE))
      RETURNING id, word, note, to_char(learned_on, 'YYYY-MM-DD') AS learned_on
    `;

    return json({ word: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating word:', error);
    return json({ error: 'Failed to create word', details: error.message }, { status: 500 });
  }
}
