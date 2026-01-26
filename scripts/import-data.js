import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EHQCZtD21SFl@ep-shy-bar-afl69rtu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

// Simple CSV parser that handles quoted fields with newlines
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (char === '\n' || (char === '\r' && content[i + 1] === '\n')) {
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i += (char === '\r' ? 2 : 1);
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

async function importData() {
  console.log('Importing data into Neon...\n');

  try {
    // Read and parse projects CSV
    const projectsContent = readFileSync('/Users/abinayadinesh/Downloads/projects_rows.csv', 'utf-8');
    const projectRows = parseCSV(projectsContent);
    const projectHeaders = projectRows[0];
    const projectData = projectRows.slice(1);

    console.log(`Found ${projectData.length} projects to import`);

    // Import projects
    for (const row of projectData) {
      const project = {};
      projectHeaders.forEach((header, idx) => {
        project[header] = row[idx] || null;
      });

      // Convert boolean strings
      const hasCommits = project.has_commits === 'true';
      const isPublic = project.is_public === 'true';

      try {
        await sql`
          INSERT INTO projects (id, title, path, status, last_updated, has_commits, is_public, created_at, updated_at)
          VALUES (
            ${project.id},
            ${project.title},
            ${project.path},
            ${project.status},
            ${project.last_updated},
            ${hasCommits},
            ${isPublic},
            ${project.created_at},
            ${project.updated_at}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = ${project.title},
            path = ${project.path},
            status = ${project.status},
            last_updated = ${project.last_updated},
            has_commits = ${hasCommits},
            is_public = ${isPublic},
            updated_at = ${project.updated_at}
        `;
        console.log(`  ✓ Imported project: ${project.title}`);
      } catch (err) {
        console.error(`  ✗ Failed to import project ${project.id}:`, err.message);
      }
    }

    // Read and parse project_content CSV
    const contentContent = readFileSync('/Users/abinayadinesh/Downloads/project_content_rows.csv', 'utf-8');
    const contentRows = parseCSV(contentContent);
    const contentHeaders = contentRows[0];
    const contentData = contentRows.slice(1);

    console.log(`\nFound ${contentData.length} project contents to import`);

    // Import project content
    for (const row of contentData) {
      const content = {};
      contentHeaders.forEach((header, idx) => {
        content[header] = row[idx] || null;
      });

      // Skip if project_id doesn't exist in projects table
      const projectExists = await sql`SELECT id FROM projects WHERE id = ${content.project_id}`;
      if (projectExists.length === 0) {
        console.log(`  - Skipping content for non-existent project: ${content.project_id}`);
        continue;
      }

      try {
        await sql`
          INSERT INTO project_content (project_id, markdown_content, github_repo, last_updated, created_at)
          VALUES (
            ${content.project_id},
            ${content.markdown_content || ''},
            ${content.github_repo || null},
            ${content.last_updated || null},
            ${content.created_at || null}
          )
          ON CONFLICT (project_id) DO UPDATE SET
            markdown_content = ${content.markdown_content || ''},
            github_repo = ${content.github_repo || null},
            last_updated = ${content.last_updated || null}
        `;
        console.log(`  ✓ Imported content for: ${content.project_id}`);
      } catch (err) {
        console.error(`  ✗ Failed to import content for ${content.project_id}:`, err.message);
      }
    }

    // Verify import
    console.log('\n--- Verification ---');
    const projects = await sql`SELECT COUNT(*) as count FROM projects`;
    const contents = await sql`SELECT COUNT(*) as count FROM project_content`;
    console.log(`Projects in database: ${projects[0].count}`);
    console.log(`Project contents in database: ${contents[0].count}`);

    console.log('\n✅ Import complete!');

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importData();
