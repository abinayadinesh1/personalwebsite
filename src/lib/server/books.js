import { getDb } from '$lib/neonClient.js';

export const BOOK_FIELDS = `id, title, author, image, note,
  to_char(added_on, 'YYYY-MM-DD') AS added_on,
  to_char(finished_on, 'YYYY-MM-DD') AS finished_on`;

export async function listBooks(finished) {
  const sql = getDb();
  return finished
    ? sql.query(`SELECT ${BOOK_FIELDS} FROM books WHERE finished_on IS NOT NULL ORDER BY finished_on DESC, id DESC`)
    : sql.query(`SELECT ${BOOK_FIELDS} FROM books WHERE finished_on IS NULL ORDER BY added_on DESC NULLS LAST, id DESC`);
}
