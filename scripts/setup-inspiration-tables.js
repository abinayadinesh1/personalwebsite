import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupInspirationTables() {
  console.log('Creating inspiration tables in Neon...');

  // One row per piece on the /inspiration canvas. Height isn't stored: each
  // kind derives it from its width (image aspect, 16:9 video, letter-size pdf).
  await sql`
    CREATE TABLE IF NOT EXISTS inspiration_items (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('link', 'image', 'video', 'pdf')),
      url TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      note TEXT NOT NULL DEFAULT '',
      x REAL NOT NULL DEFAULT 40,
      y REAL NOT NULL DEFAULT 40,
      width REAL NOT NULL DEFAULT 300,
      z INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Created inspiration_items table');

  // Uploaded PDFs (images go through the existing images table).
  await sql`
    CREATE TABLE IF NOT EXISTS inspiration_files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      byte_size INTEGER NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Created inspiration_files table');

  console.log('Inspiration tables created successfully!');
}

setupInspirationTables().catch(console.error);
