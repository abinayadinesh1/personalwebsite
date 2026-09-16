import { neon } from '@neondatabase/serverless';
import { EXERCISE_VIDEOS, EXERCISE_NOTES } from './exercise-media.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Seed library: the exercises from Fin's Phase 1 (wk 1-8) + Phase 2 (wk 9-16)
// program, tagged by muscle_group/movement_pattern/exercise_type, plus the
// new swap-in exercises Abinaya asked for (Side Lunges, Step Ups, Walking
// Lunges, Jumping Jacks).
const EXERCISES = [
  // --- New swap-in exercises ---
  { name: 'Side Lunges', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'warmup', default_sets: 3, default_reps: '10ea', equipment: 'Bodyweight', notes: 'Lateral lunge, warm-up tempo / light load' },
  { name: 'Step Ups', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 3, default_reps: '10ea', equipment: 'DB / Box', notes: '' },
  { name: 'Walking Lunges', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 3, default_reps: '10ea', equipment: 'DB', notes: 'Progressive weight across sets/weeks' },
  { name: 'Jumping Jacks', muscle_group: 'cardio', movement_pattern: 'warmup', exercise_type: 'warmup', default_sets: 3, default_reps: '30s', equipment: 'Bodyweight', notes: 'Swap-in warm-up option' },

  // --- Phase 1, Day 1 ---
  { name: 'Seated Vertical Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'main', default_sets: 5, default_reps: '3', equipment: 'Bodyweight' },
  { name: 'Pause Goblet Squat', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Incline DB Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Pause KB RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'KB' },
  { name: 'Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'accessory', default_sets: 4, default_reps: '8+', equipment: 'Bodyweight' },
  { name: '10 Kneeling Windmill Press', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'warmup', default_sets: 3, default_reps: '6ea', equipment: 'DB' },
  { name: 'DB SA Floor Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'warmup', default_sets: 3, default_reps: '8ea', equipment: 'DB' },
  { name: 'Hand Supported Step Down', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'warmup', default_sets: 3, default_reps: '15ea', equipment: 'Bodyweight' },
  { name: 'Zottman Curls', muscle_group: 'pull', movement_pattern: 'curl', exercise_type: 'accessory', default_sets: 3, default_reps: '15', equipment: 'DB' },
  { name: 'Hanging Scapular Retraction', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'accessory', default_sets: 3, default_reps: '12', equipment: 'Bar' },
  { name: 'Weighted Side Plank', muscle_group: 'core', movement_pattern: 'plank', exercise_type: 'accessory', default_sets: 3, default_reps: '30s', equipment: 'Plate' },

  // --- Phase 1, Day 2 ---
  { name: 'Box Jump to Land', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'main', default_sets: 5, default_reps: '3', equipment: 'Box' },
  { name: 'Rack Supported SL RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'Barbell' },
  { name: 'Pause Incline DB Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'FFE Goblet Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 4, default_reps: '6', equipment: 'DB' },
  { name: 'Monkey Bar Chin-Up', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'accessory', default_sets: 3, default_reps: '7ea', equipment: 'Bar' },
  { name: 'Prone Cable Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'accessory', default_sets: 3, default_reps: '15ea', equipment: 'Cable' },
  { name: 'DNS Star', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'accessory', default_sets: 3, default_reps: '12', equipment: 'Bodyweight' },
  { name: 'Tricep Pulldown', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'accessory', default_sets: 3, default_reps: '15', equipment: 'Cable' },
  { name: 'SL Bent Knee Calf Raise', muscle_group: 'legs', movement_pattern: 'calf', exercise_type: 'accessory', default_sets: 3, default_reps: '17', equipment: 'Bodyweight' },

  // --- Phase 1, Day 3 ---
  { name: 'MB Slam', muscle_group: 'full_body', movement_pattern: 'power', exercise_type: 'main', default_sets: 4, default_reps: '4', equipment: 'Medicine Ball' },
  { name: 'DB RFE Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 4, default_reps: '8ea', equipment: 'DB' },
  { name: 'Bird Dog Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'main', default_sets: 4, default_reps: '8ea', equipment: 'DB' },
  { name: 'DB Lateral Weight Shift', muscle_group: 'legs', movement_pattern: 'lateral', exercise_type: 'main', default_sets: 4, default_reps: '7ea', equipment: 'DB' },
  { name: 'Weighted Pause Push Up', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'accessory', default_sets: 3, default_reps: '8', equipment: 'Plate' },
  { name: '1/2 Kneeling Cable Rotation', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'accessory', default_sets: 3, default_reps: '10ea', equipment: 'Cable' },
  { name: 'Hanging MB Knee Raise', muscle_group: 'core', movement_pattern: 'flexion', exercise_type: 'accessory', default_sets: 3, default_reps: '12', equipment: 'Medicine Ball' },
  { name: 'Lateral Bear Crawl Walk', muscle_group: 'full_body', movement_pattern: 'crawl', exercise_type: 'accessory', default_sets: 3, default_reps: '10yd', equipment: 'Bodyweight' },
  { name: 'DB Wrist Extension and Flexion', muscle_group: 'pull', movement_pattern: 'wrist', exercise_type: 'accessory', default_sets: 3, default_reps: '20ea', equipment: 'DB' },
  { name: 'Bicep Curl', muscle_group: 'pull', movement_pattern: 'curl', exercise_type: 'accessory', default_sets: 3, default_reps: '15+', equipment: 'DB' },

  // --- Phase 2, Day 1 ---
  { name: 'DB Squat Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'main', default_sets: 3, default_reps: '3', equipment: 'DB' },
  { name: 'Safety Bar Squat Heels Elevated', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'main', default_sets: 4, default_reps: '6', equipment: 'Safety Bar' },
  { name: 'DB Tripod Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'DB SL Glute Bridge', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'main', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Horizontal Bar Row w/ Hand Release', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'warmup', default_sets: 3, default_reps: '12', equipment: 'Bar' },
  { name: 'DB Alt Floor Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'accessory', default_sets: 3, default_reps: '6ea', equipment: 'DB' },
  { name: 'Hamstring Iso w/ OH DB Flexion', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'accessory', default_sets: 3, default_reps: '20s', equipment: 'DB' },
  { name: 'Weighted Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'accessory', default_sets: 3, default_reps: '6', equipment: 'Plate' },

  // --- Phase 2, Day 2 ---
  { name: 'Seated Vert Jump to Vert Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'main', default_sets: 3, default_reps: '3', equipment: 'Bodyweight' },
  { name: 'BB RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'main', default_sets: 4, default_reps: '6', equipment: 'Barbell' },
  { name: '1/2 Kneeling Cable Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'main', default_sets: 4, default_reps: '6ea', equipment: 'Cable' },
  { name: 'DB Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 4, default_reps: '6ea', equipment: 'DB' },
  { name: 'Bent Over MB Chest Slam', muscle_group: 'full_body', movement_pattern: 'power', exercise_type: 'accessory', default_sets: 3, default_reps: '3', equipment: 'Medicine Ball' },
  { name: 'Lateral Lunge Drop from Box', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'accessory', default_sets: 3, default_reps: '6ea', equipment: 'Box' },
  { name: 'KB Hip Airplane', muscle_group: 'legs', movement_pattern: 'rotation', exercise_type: 'accessory', default_sets: 3, default_reps: '10ea', equipment: 'KB' },
  { name: 'DB Pause Flat Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'accessory', default_sets: 3, default_reps: '5', equipment: 'DB' },

  // --- Phase 2, Day 3 ---
  { name: 'MB Slam to Vert Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'main', default_sets: 4, default_reps: '4', equipment: 'Medicine Ball' },
  { name: 'Knee on Bench Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'main', default_sets: 4, default_reps: '6', equipment: 'DB' },
  { name: 'Plate Lateral Box Step Down', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'main', default_sets: 4, default_reps: '7ea', equipment: 'Plate' },
  { name: 'Bear Crawl Openers', muscle_group: 'full_body', movement_pattern: 'rotation', exercise_type: 'accessory', default_sets: 3, default_reps: '5ea', equipment: 'Bodyweight' },
  { name: '1/2 Kneeling Landmine Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'accessory', default_sets: 3, default_reps: '6ea', equipment: 'Barbell' },
  { name: 'DB Side Bend', muscle_group: 'core', movement_pattern: 'lateral', exercise_type: 'accessory', default_sets: 3, default_reps: '12ea', equipment: 'DB' },
  { name: 'Chin Up Iso Hold Knee Raise', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'accessory', default_sets: 3, default_reps: '12ea', equipment: 'Bar' },

  // --- General warm-up / pre-work, referenced across days ---
  { name: 'Pogo Jumps', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'warmup', default_sets: 1, default_reps: '50', equipment: 'Bodyweight' },
  { name: 'T-Spine Rotation', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'warmup', default_sets: 1, default_reps: '8ea', equipment: 'Bodyweight' },
  { name: 'Deep Squat Hold', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'warmup', default_sets: 1, default_reps: '60s', equipment: 'Bodyweight' }
];

async function seedExercises() {
  console.log(`Seeding ${EXERCISES.length} exercises...`);
  let inserted = 0;
  for (const ex of EXERCISES) {
    // Demo link + coaching cue from the original program live in the shared
    // exercise-media.js so fresh installs and the backfill stay in sync.
    const videoUrl = EXERCISE_VIDEOS[ex.name] || null;
    const notes = ex.notes || EXERCISE_NOTES[ex.name] || null;
    const result = await sql`
      INSERT INTO exercises (name, muscle_group, movement_pattern, exercise_type, default_sets, default_reps, equipment, notes, video_url, is_custom)
      VALUES (${ex.name}, ${ex.muscle_group}, ${ex.movement_pattern || null}, ${ex.exercise_type}, ${ex.default_sets || null}, ${ex.default_reps || null}, ${ex.equipment || null}, ${notes}, ${videoUrl}, false)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `;
    if (result.length) inserted++;
  }
  console.log(`Inserted ${inserted} new exercises (${EXERCISES.length - inserted} already existed).`);
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
      'Auto-generated example: Side Lunges + Jumping Jacks as a warm-up, Step Ups + Walking Lunges swapped in for the main leg work.',
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
    { name: 'Side Lunges', section: 'warmup', order_index: 0, sets: 3, reps: '10ea' },
    { name: 'Jumping Jacks', section: 'warmup', order_index: 1, sets: 3, reps: '30s' },
    { name: 'Step Ups', section: 'main', order_index: 0, sets: 3, reps: '10ea' },
    { name: 'Walking Lunges', section: 'main', order_index: 1, sets: 3, reps: '10ea' },
    { name: 'Rack Supported SL RDL', section: 'main', order_index: 2, sets: 4, reps: '8' },
    { name: 'Incline DB Row', section: 'main', order_index: 3, sets: 4, reps: '8' }
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
