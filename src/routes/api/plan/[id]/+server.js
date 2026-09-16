import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// Fetch a specific plan day + its template exercises, so the builder can
// jump to any day in the program manually (not just "the next one").
export async function GET({ params, cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const dayResult = await sql`SELECT * FROM plan_days WHERE id = ${params.id}`;
    const day = dayResult[0];
    if (!day) {
      return json({ error: 'Not found' }, { status: 404 });
    }

    const exercises = await sql`
      SELECT * FROM plan_day_exercises WHERE plan_day_id = ${params.id} ORDER BY section, order_index
    `;

    return json({ day, exercises });
  } catch (error) {
    console.error('Error in GET /api/plan/[id]:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
