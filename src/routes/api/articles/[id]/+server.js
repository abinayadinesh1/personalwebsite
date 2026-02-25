import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { ARTICLES_API_KEY } from '$env/static/private';

// GET - Fetch a single article
export async function GET({ params }) {
  try {
    const sql = getDb();

    const result = await sql`
      SELECT id, title, link, timestamp, content
      FROM articles
      WHERE id = ${params.id}
    `;

    if (result.length === 0) {
      return json({ error: 'Article not found' }, { status: 404 });
    }

    return json({ article: result[0] });
  } catch (error) {
    console.error('Error fetching article:', error);
    return json({ error: 'Failed to fetch article', details: error.message }, { status: 500 });
  }
}

// PUT - Update an article (protected by API key or admin cookie)
export async function PUT({ params, request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  const authHeader = request.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');

  if (!isAdmin && (!ARTICLES_API_KEY || providedKey !== ARTICLES_API_KEY)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content } = body;

    const sql = getDb();

    const result = await sql`
      UPDATE articles
      SET title = COALESCE(${title ?? null}, title),
          content = COALESCE(${content ?? null}, content)
      WHERE id = ${params.id}
      RETURNING id, title, link, timestamp, content
    `;

    if (result.length === 0) {
      return json({ error: 'Article not found' }, { status: 404 });
    }

    return json({ article: result[0] });
  } catch (error) {
    console.error('Error updating article:', error);
    return json({ error: 'Failed to update article', details: error.message }, { status: 500 });
  }
}

// DELETE - Delete an article (protected by API key or admin cookie)
export async function DELETE({ params, request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  const authHeader = request.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');

  if (!isAdmin && (!ARTICLES_API_KEY || providedKey !== ARTICLES_API_KEY)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    const result = await sql`
      DELETE FROM articles
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return json({ error: 'Article not found' }, { status: 404 });
    }

    return json({ success: true, id: params.id });
  } catch (error) {
    console.error('Error deleting article:', error);
    return json({ error: 'Failed to delete article', details: error.message }, { status: 500 });
  }
}
