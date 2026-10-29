import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { BOOK_FIELDS } from '$lib/server/books.js';

// PATCH - Edit a book or mark it finished (admin only). Only fields present in the body change.
export async function PATCH({ params, request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : null;
    const hasAuthor = typeof body.author === 'string';
    const author = hasAuthor ? body.author.trim() || null : null;
    const image = typeof body.image === 'string' ? body.image.trim() : null;
    const note = typeof body.note === 'string' ? body.note.trim() : null;
    const hasDate = 'date' in body;
    const date = body.date || null;
    const finished = typeof body.finished === 'boolean' ? body.finished : null;
    // Client sends its local date so "finished today" isn't off by a day in UTC
    const finishedOn = body.finishedOn || null;

    if (title === '') {
      return json({ error: 'Title is required' }, { status: 400 });
    }

    const sql = getDb();
    const result = await sql.query(
      `UPDATE books
       SET title = COALESCE($1, title),
           author = CASE WHEN $2::boolean THEN $3 ELSE author END,
           image = COALESCE($4, image),
           note = COALESCE($5, note),
           added_on = CASE WHEN $6::boolean THEN $7::date ELSE added_on END,
           finished_on = CASE
             WHEN $8::boolean IS NULL THEN finished_on
             WHEN $8::boolean THEN COALESCE(finished_on, $9::date, CURRENT_DATE)
             ELSE NULL
           END
       WHERE id = $10
       RETURNING ${BOOK_FIELDS}`,
      [title, hasAuthor, author, image, note, hasDate, date, finished, finishedOn, params.id]
    );

    if (result.length === 0) {
      return json({ error: 'Book not found' }, { status: 404 });
    }

    return json({ book: result[0] });
  } catch (error) {
    console.error('Error updating book:', error);
    return json({ error: 'Failed to update book', details: error.message }, { status: 500 });
  }
}

// DELETE - Remove a book (admin only)
export async function DELETE({ params, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const result = await sql`DELETE FROM books WHERE id = ${params.id} RETURNING id`;

    if (result.length === 0) {
      return json({ error: 'Book not found' }, { status: 404 });
    }

    return json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error deleting book:', error);
    return json({ error: 'Failed to delete book', details: error.message }, { status: 500 });
  }
}
