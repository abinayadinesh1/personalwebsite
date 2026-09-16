import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Adds the "plan" tables on top of exercises/workouts/workout_exercises
// (see setup-workouts-tables.js, which must run first). plan_days is the
// fixed, ordered 48-day program (Fin's Phase 1 + Phase 2). Each save in the
// /workouts builder becomes a row in `workouts`, optionally linked back to
// the plan_day it fulfilled via workouts.plan_day_id -- that link is what
// lets the page figure out "what's the next day I haven't logged yet" and
// preload it, and lets history show "what I actually did" per plan day.
async function setupPlanTables() {
  console.log('Creating plan tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS plan_days (
      id SERIAL PRIMARY KEY,
      order_index INTEGER NOT NULL UNIQUE,
      phase TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      title TEXT NOT NULL
    )
  `;
  console.log('Created plan_days table');

  await sql`
    CREATE TABLE IF NOT EXISTS plan_day_exercises (
      id SERIAL PRIMARY KEY,
      plan_day_id INTEGER NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
      exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
      exercise_name_snapshot TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'main',
      order_index INTEGER NOT NULL DEFAULT 0,
      sets INTEGER,
      reps TEXT
    )
  `;
  console.log('Created plan_day_exercises table');
  await sql`CREATE INDEX IF NOT EXISTS idx_plan_day_exercises_day ON plan_day_exercises(plan_day_id)`;

  await sql`ALTER TABLE workouts ADD COLUMN IF NOT EXISTS plan_day_id INTEGER REFERENCES plan_days(id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_workouts_plan_day ON workouts(plan_day_id)`;
  console.log('Linked workouts.plan_day_id -> plan_days');

  console.log('Plan tables ready!');
}

setupPlanTables().catch((e) => { console.error(e); process.exit(1); });
