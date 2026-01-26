import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EHQCZtD21SFl@ep-shy-bar-afl69rtu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setupTables() {
  console.log('Creating tables in Neon...');

  // Create projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      path TEXT NOT NULL,
      status TEXT NOT NULL,
      last_updated DATE NOT NULL,
      has_commits BOOLEAN NOT NULL,
      is_public BOOLEAN NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
      CONSTRAINT projects_pkey PRIMARY KEY (id),
      CONSTRAINT projects_path_key UNIQUE (path)
    )
  `;
  console.log('Created projects table');

  // Create project_content table
  await sql`
    CREATE TABLE IF NOT EXISTS project_content (
      project_id TEXT NOT NULL,
      markdown_content TEXT NOT NULL,
      github_repo TEXT NULL,
      last_updated TIMESTAMP WITHOUT TIME ZONE NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE NULL,
      CONSTRAINT project_content_pkey PRIMARY KEY (project_id)
    )
  `;
  console.log('Created project_content table');

  // Create indexes for better query performance
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public)`;
  console.log('Created indexes');

  console.log('All tables created successfully!');
}

setupTables().catch(console.error);
