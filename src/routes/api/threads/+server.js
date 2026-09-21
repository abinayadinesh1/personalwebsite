import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// Threads (groups) for the Writing page. Writings reference a thread by name.

// Idempotent: creates the table on first use and registers any thread names
// already set on writings, so no separate migration step is required.
async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS writing_threads (
      name TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO writing_threads (name)
    SELECT DISTINCT thread FROM projects WHERE thread IS NOT NULL AND thread <> ''
    ON CONFLICT (name) DO NOTHING
  `;
}

// GET - List all thread names
export async function GET() {
  try {
    const sql = getDb();
    await ensureTable(sql);
    const rows = await sql`SELECT name FROM writing_threads ORDER BY created_at DESC`;
    return json({ threads: rows.map(r => r.name) });
  } catch (error) {
    console.error('Error in GET /api/threads:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// POST - Create a thread
export async function POST({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = (body?.name || '').trim();
    if (!name) {
      return json({ error: 'Thread name is required' }, { status: 400 });
    }

    const sql = getDb();
    await ensureTable(sql);
    const existing = await sql`SELECT name FROM writing_threads WHERE name = ${name}`;
    if (existing.length > 0) {
      return json({ error: 'A group with this name already exists' }, { status: 409 });
    }

    await sql`INSERT INTO writing_threads (name) VALUES (${name})`;
    return json({ thread: name }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/threads:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// PUT - Rename a thread; writings in it follow the new name
export async function PUT({ request, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = (body?.name || '').trim();
    const newName = (body?.newName || '').trim();
    if (!name || !newName) {
      return json({ error: 'Both the current and new group names are required' }, { status: 400 });
    }
    if (name === newName) {
      return json({ thread: newName });
    }

    const sql = getDb();
    await ensureTable(sql);
    const clash = await sql`SELECT name FROM writing_threads WHERE name = ${newName}`;
    if (clash.length > 0) {
      return json({ error: 'A group with this name already exists' }, { status: 409 });
    }

    await sql`INSERT INTO writing_threads (name) VALUES (${newName}) ON CONFLICT (name) DO NOTHING`;
    await sql`UPDATE projects SET thread = ${newName} WHERE thread = ${name}`;
    await sql`DELETE FROM writing_threads WHERE name = ${name}`;
    return json({ thread: newName });
  } catch (error) {
    console.error('Error in PUT /api/threads:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Remove a thread; writings in it become ungrouped
export async function DELETE({ url, cookies }) {
  if (cookies.get('adminAuth') !== 'true') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const name = (url.searchParams.get('name') || '').trim();
    if (!name) {
      return json({ error: 'Thread name is required' }, { status: 400 });
    }

    const sql = getDb();
    await ensureTable(sql);
    await sql`UPDATE projects SET thread = NULL WHERE thread = ${name}`;
    await sql`DELETE FROM writing_threads WHERE name = ${name}`;
    return json({ success: true, name });
  } catch (error) {
    console.error('Error in DELETE /api/threads:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
