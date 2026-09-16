import { neon } from '@neondatabase/serverless';
import { EXERCISE_VIDEOS as VIDEOS, EXERCISE_NOTES as NOTES } from './exercise-media.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Backfills the demo-video links (and a couple of per-exercise cues) from Fin's
// original program doc onto exercise rows that were seeded before the video_url
// column existed. seed-workout-exercises.js skips rows that already exist, so a
// re-seed won't add these -- this UPDATE path does. Data lives in
// scripts/exercise-media.js, shared with the seeder for fresh installs.

async function addExerciseVideos() {
  console.log('Adding video_url column and backfilling links...');
  await sql`ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT`;

  let updated = 0;
  let missing = [];
  for (const [name, url] of Object.entries(VIDEOS)) {
    const res = await sql`UPDATE exercises SET video_url = ${url} WHERE name = ${name} RETURNING id`;
    if (res.length) updated++;
    else missing.push(name);
  }

  let noted = 0;
  for (const [name, note] of Object.entries(NOTES)) {
    // Don't clobber an existing note; only fill when empty.
    const res = await sql`
      UPDATE exercises SET notes = ${note}
      WHERE name = ${name} AND (notes IS NULL OR notes = '')
      RETURNING id
    `;
    if (res.length) noted++;
  }

  console.log(`Set video_url on ${updated} exercises, notes on ${noted}.`);
  if (missing.length) {
    console.warn(`No matching exercise row for ${missing.length} link(s):`, missing.join(', '));
  }
  console.log('Done!');
}

addExerciseVideos().catch((e) => { console.error(e); process.exit(1); });
