import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { BOOK_FIELDS } from '$lib/server/books.js';

// POST - Add a book to the want-to-read list (admin only)
export async function POST({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const author = (body.author || '').trim() || null;
    const image = (body.image || '').trim();
    const note = (body.note || '').trim();
    const date = body.date || null;

    if (!title) {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql.query(
      `INSERT INTO books (title, author, image, note, added_on)
       VALUES ($1, $2, $3, $4, $5::date)
       RETURNING ${BOOK_FIELDS}`,
      [title, author, image, note, date]
    );

    return json({ book: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return json({ error: 'Failed to create book', details: error.message }, { status: 500 });
  }
}
