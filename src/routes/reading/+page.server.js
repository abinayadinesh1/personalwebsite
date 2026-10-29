import { listBooks } from '$lib/server/books.js';

export async function load() {
  try {
    return { finishedBooks: await listBooks(true) };
  } catch (error) {
    // The hardcoded shelf still renders if the DB is unreachable
    console.error('Error loading finished books:', error);
    return { finishedBooks: [] };
  }
}
