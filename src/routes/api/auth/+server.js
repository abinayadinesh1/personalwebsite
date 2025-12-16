import { json } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private'; // No PUBLIC_ prefix

export async function POST({ request, cookies }) {
  const { password } = await request.json();
  
  if (password === ADMIN_PASSWORD) {
    // Set a secure cookie for server-side verification
    cookies.set('adminAuth', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return json({ success: true });
  }
  
  return json({ success: false }, { status: 401 });
}

export async function DELETE({ cookies }) {
  // Clear the auth cookie
  cookies.delete('adminAuth', { path: '/' });
  return json({ success: true });
}