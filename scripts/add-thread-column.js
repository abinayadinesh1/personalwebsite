import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addThreadColumn() {
  console.log('Adding thread column to projects table...');

  // thread: optional group name. Writings that share a thread are shown together
  // under one heading on the Writing page.
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS thread TEXT
  `;

  console.log('Done! thread column added to projects table.');
}

addThreadColumn().catch((e) => { console.error(e); process.exit(1); });
