import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// The fixed program, as written: Phase 1 runs weeks 1-8 with the same
// three-day split each week (only load/RIR progresses week to week, which
// this app tracks per-log rather than per-template), Phase 2 runs weeks
// 9-16 with a second three-day split. Section is left null here and
// resolved from the exercise's own exercise_type at seed time, since that's
// already tagged in scripts/seed-workout-exercises.js (run that first).
const PHASE1_DAY1 = [
  ['Seated Vertical Jump', 5, '3'],
  ['Pause Goblet Squat', 4, '8'],
  ['Incline DB Row', 4, '8'],
  ['Pause KB RDL', 4, '8'],
  ['Pull Ups', 4, '8+'],
  ['10 Kneeling Windmill Press', 3, '6ea'],
  ['DB SA Floor Press', 3, '8ea'],
  ['Hand Supported Step Down', 3, '15ea'],
  ['Zottman Curls', 3, '15'],
  ['Hanging Scapular Retraction', 3, '12'],
  ['Weighted Side Plank', 3, '30s']
];

const PHASE1_DAY2 = [
  ['Box Jump to Land', 5, '3'],
  ['Rack Supported SL RDL', 4, '8'],
  ['Pause Incline DB Press', 4, '8'],
  ['FFE Goblet Split Squat', 4, '6'],
  ['Monkey Bar Chin-Up', 3, '7ea'],
  ['Prone Cable Row', 3, '15ea'],
  ['DNS Star', 3, '12'],
  ['Tricep Pulldown', 3, '15'],
  ['SL Bent Knee Calf Raise', 3, '17']
];

const PHASE1_DAY3 = [
  ['MB Slam', 4, '4'],
  ['DB RFE Split Squat', 4, '8ea'],
  ['Bird Dog Row', 4, '8ea'],
  ['DB Lateral Weight Shift', 4, '7ea'],
  ['Weighted Pause Push Up', 3, '8'],
  ['1/2 Kneeling Cable Rotation', 3, '10ea'],
  ['Hanging MB Knee Raise', 3, '12'],
  ['Lateral Bear Crawl Walk', 3, '10yd'],
  ['DB Wrist Extension and Flexion', 3, '20ea'],
  ['Bicep Curl', 3, '15+']
];

const PHASE2_DAY1 = [
  ['DB Squat Jump', 3, '3'],
  ['Safety Bar Squat Heels Elevated', 4, '6'],
  ['DB Tripod Row', 4, '8'],
  ['DB SL Glute Bridge', 4, '8'],
  ['Horizontal Bar Row w/ Hand Release', 3, '12'],
  ['DB Alt Floor Press', 3, '6ea'],
  ['Hamstring Iso w/ OH DB Flexion', 3, '20s'],
  ['Weighted Pull Ups', 3, '6']
];

const PHASE2_DAY2 = [
  ['Seated Vert Jump to Vert Jump', 3, '3'],
  ['BB RDL', 4, '6'],
  ['1/2 Kneeling Cable Row', 4, '6ea'],
  ['DB Split Squat', 4, '6ea'],
  ['Bent Over MB Chest Slam', 3, '3'],
  ['Lateral Lunge Drop from Box', 3, '6ea'],
  ['KB Hip Airplane', 3, '10ea'],
  ['DB Pause Flat Press', 3, '5']
];

const PHASE2_DAY3 = [
  ['MB Slam to Vert Jump', 4, '4'],
  ['DB RFE Split Squat', 4, '8ea'],
  ['Knee on Bench Row', 4, '6'],
  ['Plate Lateral Box Step Down', 4, '7ea'],
  ['Bear Crawl Openers', 3, '5ea'],
  ['DB Wrist Extension and Flexion', 3, '20ea'],
  ['Bicep Curl', 3, '15+'],
  ['1/2 Kneeling Landmine Press', 3, '6ea'],
  ['DB Side Bend', 3, '12ea'],
  ['Chin Up Iso Hold Knee Raise', 3, '12ea']
];

const DAY_TEMPLATES = [PHASE1_DAY1, PHASE1_DAY2, PHASE1_DAY3];
const PHASE2_TEMPLATES = [PHASE2_DAY1, PHASE2_DAY2, PHASE2_DAY3];

async function getExerciseMap() {
  const rows = await sql`SELECT id, name, exercise_type FROM exercises`;
  const map = new Map();
  for (const r of rows) map.set(r.name, r);
  return map;
}

async function seedPlanDays() {
  const exerciseMap = await getExerciseMap();
  let inserted = 0;
  let skipped = 0;

  for (let week = 1; week <= 16; week++) {
    const phase = week <= 8 ? 'Phase 1' : 'Phase 2';
    const templates = week <= 8 ? DAY_TEMPLATES : PHASE2_TEMPLATES;

    for (let day = 1; day <= 3; day++) {
      const orderIndex = (week - 1) * 3 + day;
      const title = `Week ${week} · Day ${day}`;

      const existing = await sql`SELECT id FROM plan_days WHERE order_index = ${orderIndex}`;
      if (existing.length) {
        skipped++;
        continue;
      }

      const dayResult = await sql`
        INSERT INTO plan_days (order_index, phase, week_number, day_number, title)
        VALUES (${orderIndex}, ${phase}, ${week}, ${day}, ${title})
        RETURNING id
      `;
      const planDayId = dayResult[0].id;

      const list = templates[day - 1];
      for (let i = 0; i < list.length; i++) {
        const [name, sets, reps] = list[i];
        const ex = exerciseMap.get(name);
        const section = ex ? ex.exercise_type : 'main';
        await sql`
          INSERT INTO plan_day_exercises (plan_day_id, exercise_id, exercise_name_snapshot, section, order_index, sets, reps)
          VALUES (${planDayId}, ${ex ? ex.id : null}, ${name}, ${section}, ${i}, ${sets}, ${reps})
        `;
      }
      inserted++;
    }
  }

  console.log(`Seeded ${inserted} plan days (${skipped} already existed).`);
}

seedPlanDays().catch((e) => { console.error(e); process.exit(1); });
