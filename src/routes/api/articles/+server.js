import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';
import { fetchTitle } from '$lib/fetchTitle.js';
import { ARTICLES_API_KEY } from '$env/static/private';

// GET - Fetch all articles (public)
export async function GET() {
  try {
    const sql = getDb();

    const articles = await sql`
      SELECT id, title, link, timestamp, content
      FROM articles
      ORDER BY timestamp DESC
    `;

    return json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return json({ error: 'Failed to fetch articles', details: error.message }, { status: 500 });
  }
}

// POST - Create a new article (protected by API key)
export async function POST({ request }) {
  try {
    // Check API key authorization
    const authHeader = request.headers.get('Authorization');
    const providedKey = authHeader?.replace('Bearer ', '');

    if (!ARTICLES_API_KEY || providedKey !== ARTICLES_API_KEY) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { link, content, date } = body;

    // Validate required fields
    if (!link) {
      return json({ error: 'Link is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(link);
    } catch {
      return json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch title from the URL
    const title = await fetchTitle(link);

    const sql = getDb();

    // Parse date if provided, otherwise default to now
    const timestamp = date ? new Date(date) : new Date();

    // Insert the article
    const result = await sql`
      INSERT INTO articles (title, link, content, timestamp)
      VALUES (${title}, ${link}, ${content || null}, ${timestamp})
      RETURNING id, title, link, timestamp, content
    `;

    const article = result[0];

    return json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return json({ error: 'Failed to create article', details: error.message }, { status: 500 });
  }
}
