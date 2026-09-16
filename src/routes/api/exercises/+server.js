import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

const MUSCLE_GROUPS = ['legs', 'push', 'pull', 'core', 'cardio', 'full_body'];
const EXERCISE_TYPES = ['warmup', 'main', 'accessory'];

// GET - Fetch exercise library (optionally filtered)
export async function GET({ url, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const muscleGroup = url.searchParams.get('muscle_group');
    const type = url.searchParams.get('type');

    let exercises;
    if (muscleGroup && muscleGroup !== 'all' && type) {
      exercises = await sql`
        SELECT * FROM exercises WHERE muscle_group = ${muscleGroup} AND exercise_type = ${type} ORDER BY name
      `;
    } else if (muscleGroup && muscleGroup !== 'all') {
      exercises = await sql`SELECT * FROM exercises WHERE muscle_group = ${muscleGroup} ORDER BY name`;
    } else if (type) {
      exercises = await sql`SELECT * FROM exercises WHERE exercise_type = ${type} ORDER BY name`;
    } else {
      exercises = await sql`SELECT * FROM exercises ORDER BY name`;
    }

    return json({ exercises });
  } catch (error) {
    console.error('Error in GET /api/exercises:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// POST - Add (or update, by name) a custom exercise to the library
export async function POST({ request, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, muscle_group, movement_pattern, exercise_type, default_sets, default_reps, equipment, notes } = body;

    if (!name || !muscle_group) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!MUSCLE_GROUPS.includes(muscle_group)) {
      return json({ error: 'Invalid muscle_group' }, { status: 400 });
    }
    const type = EXERCISE_TYPES.includes(exercise_type) ? exercise_type : 'main';
    const sets = default_sets ? parseInt(default_sets, 10) : null;

    const sql = getDb();
    const result = await sql`
      INSERT INTO exercises (name, muscle_group, movement_pattern, exercise_type, default_sets, default_reps, equipment, notes, is_custom)
      VALUES (${name.trim()}, ${muscle_group}, ${movement_pattern || null}, ${type}, ${sets}, ${default_reps || null}, ${equipment || null}, ${notes || null}, true)
      ON CONFLICT (name) DO UPDATE SET
        muscle_group = EXCLUDED.muscle_group,
        movement_pattern = EXCLUDED.movement_pattern,
        exercise_type = EXCLUDED.exercise_type,
        default_sets = EXCLUDED.default_sets,
        default_reps = EXCLUDED.default_reps,
        equipment = EXCLUDED.equipment,
        notes = EXCLUDED.notes
      RETURNING *
    `;

    return json({ exercise: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/exercises:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Remove an exercise from the library
export async function DELETE({ url, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Exercise id is required' }, { status: 400 });
    }
    const sql = getDb();
    await sql`DELETE FROM exercises WHERE id = ${id}`;
    return json({ success: true, id });
  } catch (error) {
    console.error('Error in DELETE /api/exercises:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
