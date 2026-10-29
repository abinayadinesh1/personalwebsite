import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupBooksTable() {
  console.log('Creating books table in Neon...');

  // /want-to-read shows rows with no finished_on; finished ones join the /reading bookshelf
  await sql`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      image TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      added_on DATE DEFAULT CURRENT_DATE,
      finished_on DATE,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Created books table');

  // Moved off the hardcoded /reading shelf onto the want-to-read list
  const seed = [
    ['The Idea Factory', 'Jon Gertner', '/idea_factory.jpg', '', '2025-01-30'],
    ['Project Hail Mary', 'Andy Weir', '/hailmary.jpg', 'A brian machado recc!', null],
    ['Weather: A Very Short Introduction', 'Storm Dunlop', '/weather.jpeg', '', null]
  ];
  for (const [title, author, image, note, addedOn] of seed) {
    await sql`
      INSERT INTO books (title, author, image, note, added_on)
      SELECT ${title}, ${author}, ${image}, ${note}, ${addedOn}::date
      WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = ${title})
    `;
  }
  console.log('Seeded books');

  console.log('Books table created successfully!');
}

setupBooksTable().catch(console.error);
