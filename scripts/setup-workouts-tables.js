import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupWorkoutsTables() {
  console.log('Creating workouts tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      muscle_group TEXT NOT NULL,
      movement_pattern TEXT,
      exercise_type TEXT NOT NULL DEFAULT 'main',
      default_sets INTEGER,
      default_reps TEXT,
      equipment TEXT,
      notes TEXT,
      video_url TEXT,
      is_custom BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('Created exercises table');

  await sql`CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(exercise_type)`;

  await sql`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      title TEXT,
      workout_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('Created workouts table');

  await sql`CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
      exercise_name_snapshot TEXT NOT NULL DEFAULT '',
      section TEXT NOT NULL DEFAULT 'main',
      order_index INTEGER NOT NULL DEFAULT 0,
      sets INTEGER,
      reps TEXT,
      weight TEXT,
      notes TEXT
    )
  `;
  console.log('Created workout_exercises table');

  await sql`CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id)`;

  console.log('Workouts tables created successfully!');
}

setupWorkoutsTables().catch((e) => { console.error(e); process.exit(1); });
