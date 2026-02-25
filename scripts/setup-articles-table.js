import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupArticlesTable() {
  console.log('Creating articles table in Neon...');

  // Create articles table
  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT,
      link TEXT NOT NULL,
      timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
      content TEXT
    )
  `;
  console.log('Created articles table');

  // Create index for timestamp ordering
  await sql`CREATE INDEX IF NOT EXISTS idx_articles_timestamp ON articles(timestamp DESC)`;
  console.log('Created index');

  console.log('Articles table created successfully!');
}

setupArticlesTable().catch(console.error);
