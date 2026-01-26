import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EHQCZtD21SFl@ep-shy-bar-afl69rtu-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function testNeonConnection() {
  console.log('Testing Neon database connection...\n');

  try {
    // Test 1: Insert a test project
    console.log('1. Testing INSERT (creating test project)...');
    const now = new Date();
    const testProjectId = 'test-project-' + Date.now();

    const insertResult = await sql`
      INSERT INTO projects (id, title, path, status, last_updated, has_commits, is_public, created_at, updated_at)
      VALUES (${testProjectId}, 'Test Project', ${'/projects/' + testProjectId}, 'In Progress', ${now.toISOString().split('T')[0]}, false, true, ${now}, ${now})
      RETURNING *
    `;
    console.log('   INSERT successful:', insertResult[0].title);

    // Test 2: Read the project back
    console.log('\n2. Testing SELECT (reading project)...');
    const selectResult = await sql`
      SELECT * FROM projects WHERE id = ${testProjectId}
    `;
    console.log('   SELECT successful:', selectResult[0].title, '- Status:', selectResult[0].status);

    // Test 3: Insert project content
    console.log('\n3. Testing INSERT into project_content...');
    await sql`
      INSERT INTO project_content (project_id, markdown_content, github_repo, created_at, last_updated)
      VALUES (${testProjectId}, '# Test Content\n\nThis is a test.', 'https://github.com/test/repo', ${now}, ${now})
    `;
    console.log('   Content INSERT successful');

    // Test 4: Read project content
    console.log('\n4. Testing SELECT from project_content...');
    const contentResult = await sql`
      SELECT * FROM project_content WHERE project_id = ${testProjectId}
    `;
    console.log('   Content SELECT successful, markdown preview:', contentResult[0].markdown_content.substring(0, 30) + '...');

    // Test 5: Update project
    console.log('\n5. Testing UPDATE...');
    const updateResult = await sql`
      UPDATE projects SET title = 'Updated Test Project', status = 'Graduated'
      WHERE id = ${testProjectId}
      RETURNING *
    `;
    console.log('   UPDATE successful:', updateResult[0].title, '- New Status:', updateResult[0].status);

    // Test 6: Clean up - delete test data
    console.log('\n6. Cleaning up test data...');
    await sql`DELETE FROM project_content WHERE project_id = ${testProjectId}`;
    await sql`DELETE FROM projects WHERE id = ${testProjectId}`;
    console.log('   Cleanup successful');

    // Test 7: Verify tables exist and show structure
    console.log('\n7. Verifying table structure...');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    console.log('   Tables found:', tables.map(t => t.table_name).join(', '));

    console.log('\n✅ All tests passed! Neon database is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testNeonConnection();
