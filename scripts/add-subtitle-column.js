import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EHQCZtD21SFl@ep-shy-bar-afl69rtu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function addSubtitleColumn() {
  console.log('Adding subtitle column to projects table...');

  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT ''
  `;

  console.log('Done! subtitle column added to projects table.');
}

addSubtitleColumn().catch(console.error);
