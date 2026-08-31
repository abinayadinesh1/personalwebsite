import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupWordsTables() {
  console.log('Creating words tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      word TEXT NOT NULL,
      note TEXT,
      learned_on DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Created words table');

  await sql`CREATE INDEX IF NOT EXISTS idx_words_learned_on ON words(learned_on DESC)`;
  console.log('Created index');

  await sql`
    CREATE TABLE IF NOT EXISTS word_date_annotations (
      date DATE PRIMARY KEY,
      label TEXT NOT NULL
    )
  `;
  console.log('Created word_date_annotations table');

  console.log('Words tables created successfully!');
}

setupWordsTables().catch(console.error);
