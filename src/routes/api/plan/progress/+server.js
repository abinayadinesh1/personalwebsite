import { json } from '@sveltejs/kit';
import { getDb } from '$lib/neonClient.js';

// Returns the whole plan's completion state plus the next day that hasn't
// been logged yet (with its exercises), so the workouts page can preload
// "today" without the user having to pick anything.
export async function GET({ cookies }) {
  const isAdmin = cookies.get('adminAuth') === 'true';
  if (!isAdmin) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    const days = await sql`
      SELECT pd.id, pd.order_index, pd.phase, pd.week_number, pd.day_number, pd.title,
             EXISTS(SELECT 1 FROM workouts w WHERE w.plan_day_id = pd.id) AS completed
      FROM plan_days pd
      ORDER BY pd.order_index
    `;

    const total = days.length;
    const completed = days.filter((d) => d.completed).length;
    const nextDay = days.find((d) => !d.completed) || null;

    let currentDay = null;
    if (nextDay) {
      const exercises = await sql`
        SELECT * FROM plan_day_exercises WHERE plan_day_id = ${nextDay.id} ORDER BY section, order_index
      `;
      currentDay = { ...nextDay, exercises };
    }

    return json({ total, completed, days, currentDay });
  } catch (error) {
    console.error('Error in GET /api/plan/progress:', error);
    return json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
