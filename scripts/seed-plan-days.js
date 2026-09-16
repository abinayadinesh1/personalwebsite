import { neon } from '@neondatabase/serverless';
import { PROGRAM, SECTIONS } from './plan-program.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Rebuilds the fixed 48-day program from the shared definition in
// scripts/plan-program.js. Each day is seeded with its full prework /
// exercises / postwork blocks, section set explicitly per movement (the same
// exercise can be pre-work one day and post-work another). Run
// seed-workout-exercises.js first so exercise_id links resolve.
//
// Re-runnable: wipes and re-seeds plan_days. Aborts if any logged workout is
// linked to a plan day, so we never orphan someone's history.
async function getExerciseMap() {
  const rows = await sql`SELECT id, name FROM exercises`;
  const map = new Map();
  for (const r of rows) map.set(r.name, r.id);
  return map;
}

async function seedPlanDays() {
  const linked = await sql`SELECT count(*)::int n FROM workouts WHERE plan_day_id IS NOT NULL`;
  if (linked[0].n > 0) {
    console.error(`Aborting: ${linked[0].n} logged workout(s) reference plan days. Re-seeding would orphan them.`);
    process.exit(1);
  }

  const exerciseMap = await getExerciseMap();

  await sql`DELETE FROM plan_day_exercises`;
  await sql`DELETE FROM plan_days`;
  console.log('Cleared existing plan days.');

  let inserted = 0;
  for (let week = 1; week <= 16; week++) {
    const phase = week <= 8 ? 'Phase 1' : 'Phase 2';
    const templates = PROGRAM[phase];

    for (let day = 1; day <= 3; day++) {
      const orderIndex = (week - 1) * 3 + day;
      const title = `Week ${week} · Day ${day}`;

      const dayResult = await sql`
        INSERT INTO plan_days (order_index, phase, week_number, day_number, title)
        VALUES (${orderIndex}, ${phase}, ${week}, ${day}, ${title})
        RETURNING id
      `;
      const planDayId = dayResult[0].id;

      const template = templates[day - 1];
      let orderInSection = 0;
      let seenSection = null;
      for (const section of SECTIONS) {
        const list = template[section] || [];
        if (section !== seenSection) { orderInSection = 0; seenSection = section; }
        for (const [name, sets, reps] of list) {
          await sql`
            INSERT INTO plan_day_exercises (plan_day_id, exercise_id, exercise_name_snapshot, section, order_index, sets, reps)
            VALUES (${planDayId}, ${exerciseMap.get(name) || null}, ${name}, ${section}, ${orderInSection}, ${sets}, ${reps})
          `;
          orderInSection++;
        }
      }
      inserted++;
    }
  }

  console.log(`Seeded ${inserted} plan days.`);
}

seedPlanDays().catch((e) => { console.error(e); process.exit(1); });
