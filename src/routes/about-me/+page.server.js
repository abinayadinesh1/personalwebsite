import { getDb } from '$lib/neonClient.js';

const ABOUT_ID = 'about-me';

export async function load({ cookies }) {
  const sql = getDb();
  const now = new Date().toISOString();

  // Section 'page' keeps it out of the /writing and /projects lists
  await sql`
    INSERT INTO projects (id, title, subtitle, path, status, last_updated, has_commits, is_public, section, created_at, updated_at)
    VALUES (${ABOUT_ID}, 'About me', '', '/about-me', 'In Progress', ${now}, false, true, 'page', ${now}, ${now})
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO project_content (project_id, markdown_content, github_repo, created_at, last_updated)
    VALUES (${ABOUT_ID}, '', ${null}, ${now}, ${now})
    ON CONFLICT (project_id) DO NOTHING
  `;

  return { projectId: ABOUT_ID, isAdmin: cookies.get('adminAuth') === 'true' };
}
