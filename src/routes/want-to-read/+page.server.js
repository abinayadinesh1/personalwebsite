import { listBooks } from '$lib/server/books.js';

export async function load({ cookies }) {
  return {
    books: await listBooks(false),
    isAdmin: cookies.get('adminAuth') === 'true'
  };
}
