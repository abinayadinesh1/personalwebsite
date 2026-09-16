import { neon } from '@neondatabase/serverless';
import { EXERCISES, RENAMED_AWAY } from './plan-program.js';
import { EXERCISE_VIDEOS, EXERCISE_NOTES } from './exercise-media.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Seeds the exercise library from the shared program definition
// (scripts/plan-program.js). Upserts so re-running keeps muscle_group /
// exercise_type / metadata in sync with the source of truth.
async function seedExercises() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);
  let inserted = 0;
  let updated = 0;
  for (const ex of EXERCISES) {
    // Demo link + coaching cue from the original program live in the shared
    // exercise-media.js so fresh installs and the backfill stay in sync.
    const videoUrl = EXERCISE_VIDEOS[ex.name] || null;
    const notes = ex.notes || EXERCISE_NOTES[ex.name] || null;
    const result = await sql`
      INSERT INTO exercises (name, muscle_group, movement_pattern, exercise_type, default_sets, default_reps, equipment, notes, video_url, is_custom)
      VALUES (${ex.name}, ${ex.muscle_group}, ${ex.movement_pattern || null}, ${ex.exercise_type}, ${ex.default_sets || null}, ${ex.default_reps || null}, ${ex.equipment || null}, ${notes}, ${videoUrl}, false)
      ON CONFLICT (name) DO UPDATE SET
        muscle_group = EXCLUDED.muscle_group,
        movement_pattern = EXCLUDED.movement_pattern,
        exercise_type = EXCLUDED.exercise_type,
        default_sets = EXCLUDED.default_sets,
        default_reps = EXCLUDED.default_reps,
        equipment = EXCLUDED.equipment,
        notes = COALESCE(EXCLUDED.notes, exercises.notes),
        video_url = COALESCE(EXCLUDED.video_url, exercises.video_url)
      RETURNING (xmax = 0) AS is_insert
    `;
    if (result[0]?.is_insert) inserted++; else updated++;
  }
  console.log(`Inserted ${inserted}, updated ${updated}.`);

  // Drop any library rows that were renamed for correctness.
  for (const stale of RENAMED_AWAY) {
    const del = await sql`DELETE FROM exercises WHERE name = ${stale} RETURNING id`;
    if (del.length) console.log(`Removed renamed exercise: ${stale}`);
  }
}

async function seedExampleWorkout() {
  const existing = await sql`SELECT id FROM workouts WHERE title = 'Example: Leg Day (new lunge variations)'`;
  if (existing.length) {
    console.log('Example workout already exists, skipping.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const workoutResult = await sql`
    INSERT INTO workouts (title, workout_date, notes, created_at, updated_at)
    VALUES (
      'Example: Leg Day (new lunge variations)',
      ${today},
      'Auto-generated example: Side Lunges as pre-work, Step Ups + Walking Lunges swapped in for the main leg work.',
      now(),
      now()
    )
    RETURNING id
  `;
  const workoutId = workoutResult[0].id;

  const names = ['Side Lunges', 'Jumping Jacks', 'Step Ups', 'Walking Lunges', 'Rack Supported SL RDL', 'Incline DB Row'];
  const rows = await sql`SELECT id, name FROM exercises WHERE name = ANY(${names})`;
  const nameToId = Object.fromEntries(rows.map(r => [r.name, r.id]));

  const items = [
    { name: 'Side Lunges', section: 'prework', order_index: 0, sets: 3, reps: '10ea' },
    { name: 'Jumping Jacks', section: 'prework', order_index: 1, sets: 3, reps: '30s' },
    { name: 'Step Ups', section: 'exercises', order_index: 0, sets: 3, reps: '10ea' },
    { name: 'Walking Lunges', section: 'exercises', order_index: 1, sets: 3, reps: '10ea' },
    { name: 'Rack Supported SL RDL', section: 'exercises', order_index: 2, sets: 4, reps: '8' },
    { name: 'Incline DB Row', section: 'exercises', order_index: 3, sets: 4, reps: '8' }
  ];

  for (const item of items) {
    await sql`
      INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name_snapshot, section, order_index, sets, reps)
      VALUES (${workoutId}, ${nameToId[item.name] || null}, ${item.name}, ${item.section}, ${item.order_index}, ${item.sets}, ${item.reps})
    `;
  }
  console.log('Seeded example workout.');
}

async function main() {
  await seedExercises();
  await seedExampleWorkout();
}

main().catch((e) => { console.error(e); process.exit(1); });
