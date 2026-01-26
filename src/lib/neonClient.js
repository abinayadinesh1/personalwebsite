import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

let sql;

export function getDb() {
  if (!DATABASE_URL) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  if (!sql) {
    sql = neon(DATABASE_URL);
  }

  return sql;
}
