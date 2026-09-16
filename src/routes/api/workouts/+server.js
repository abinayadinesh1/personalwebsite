import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// GET - List all saved workouts (most recent first), with the plan day
// title attached when the log is linked to one, so history reads like
// "Week 3 - Day 1" instead of a bare date.
export async function GET({ cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const workouts = await sql`
      SELECT w.*, pd.title AS plan_title, pd.order_index AS plan_order_index,
             COUNT(we.id)::int AS exercise_count
      FROM workouts w
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN plan_days pd ON pd.id = w.plan_day_id
      GROUP BY w.id, pd.title, pd.order_index
      ORDER BY w.workout_date DESC, w.created_at DESC
    `;
    return json({ workouts });
  } catch (error) {
    console.error('Error in GET /api/workouts:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// POST - Create a new workout log (with its exercises). If plan_day_id is
// set, this log counts as "completing" that day of the program.
export async function POST({ request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, workout_date, notes, exercises, plan_day_id } = body;

    if (!workout_date) {
      return json({ error: 'workout_date is required' }, { status: 400 });
    }

    const sql = getDb();
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO workouts (title, workout_date, notes, plan_day_id, created_at, updated_at)
      VALUES (${title || null}, ${workout_date}, ${notes || null}, ${plan_day_id || null}, ${now}, ${now})
      RETURNING *
    `;
    const workout = result[0];

    if (Array.isArray(exercises)) {
      for (const ex of exercises) {
        await sql`
          INSERT INTO workout_exercises
            (workout_id, exercise_id, exercise_name_snapshot, section, order_index, sets, reps, weight, notes)
          VALUES
            (${workout.id}, ${ex.exercise_id || null}, ${ex.exercise_name_snapshot || ''}, ${ex.section}, ${ex.order_index ?? 0}, ${ex.sets || null}, ${ex.reps || null}, ${ex.weight || null}, ${ex.notes || null})
        `;
      }
    }

    return json({ workout }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/workouts:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
