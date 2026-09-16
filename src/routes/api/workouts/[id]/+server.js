import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// GET - Fetch one workout log with its exercises and (if linked) plan day
export async function GET({ params, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const workoutResult = await sql`
      SELECT w.*, pd.title AS plan_title, pd.order_index AS plan_order_index
      FROM workouts w
      LEFT JOIN plan_days pd ON pd.id = w.plan_day_id
      WHERE w.id = ${params.id}
    `;
    const workout = workoutResult[0];
    if (!workout) {
      return json({ error: 'Not found' }, { status: 404 });
    }

    const exercises = await sql`
      SELECT * FROM workout_exercises WHERE workout_id = ${params.id} ORDER BY section, order_index
    `;

    return json({ workout, exercises });
  } catch (error) {
    console.error('Error in GET /api/workouts/[id]:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// PUT - Update a workout log's metadata and replace its exercise list.
// Used for correcting an already-saved log entry, not for advancing the
// plan (that's always a fresh POST from the builder).
export async function PUT({ params, request, cookies }) {
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
      UPDATE workouts
      SET title = ${title || null},
          workout_date = ${workout_date},
          notes = ${notes || null},
          plan_day_id = ${plan_day_id ?? null},
          updated_at = ${now}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (!result.length) {
      return json({ error: 'Not found' }, { status: 404 });
    }

    await sql`DELETE FROM workout_exercises WHERE workout_id = ${params.id}`;

    if (Array.isArray(exercises)) {
      for (const ex of exercises) {
        await sql`
          INSERT INTO workout_exercises
            (workout_id, exercise_id, exercise_name_snapshot, section, order_index, sets, reps, weight, notes)
          VALUES
            (${params.id}, ${ex.exercise_id || null}, ${ex.exercise_name_snapshot || ''}, ${ex.section}, ${ex.order_index ?? 0}, ${ex.sets || null}, ${ex.reps || null}, ${ex.weight || null}, ${ex.notes || null})
        `;
      }
    }

    return json({ workout: result[0] });
  } catch (error) {
    console.error('Error in PUT /api/workouts/[id]:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Remove a workout log (cascades to its exercises; un-completes
// the linked plan day, since completion is derived from log existence)
export async function DELETE({ params, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    await sql`DELETE FROM workouts WHERE id = ${params.id}`;
    return json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/workouts/[id]:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
