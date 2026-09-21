import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupThreadsTable() {
  console.log('Creating writing_threads table...');

  // A thread (group) is a named collection of writings. Writings point at a
  // thread by name via projects.thread, so a thread can exist with no writings.
  await sql`
    CREATE TABLE IF NOT EXISTS writing_threads (
      name TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Register any thread names already in use on writings
  await sql`
    INSERT INTO writing_threads (name)
    SELECT DISTINCT thread FROM projects WHERE thread IS NOT NULL AND thread <> ''
    ON CONFLICT (name) DO NOTHING
  `;

  console.log('Done! writing_threads table ready.');
}

setupThreadsTable().catch((e) => { console.error(e); process.exit(1); });
