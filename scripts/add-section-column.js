import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addSectionColumn() {
  console.log('Adding section column to projects table...');

  // section: 'projects' (default) or 'writing' — controls which tab a project appears under
  await sql`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'projects'
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_section ON projects(section)`;

  console.log('Done! section column added to projects table.');
}

addSectionColumn().catch((e) => { console.error(e); process.exit(1); });
