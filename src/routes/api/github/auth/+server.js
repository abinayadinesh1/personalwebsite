import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Helper function to get GitHub token (env first, then cookie)
function getGitHubToken(cookies) {
  return env.GITHUB_TOKEN || cookies.get('githubToken');
}

export async function POST({ request, cookies }) {
  const { token } = await request.json();
  
  if (!token || !token.trim()) {
    return json({ success: false, error: 'Token is required' }, { status: 400 });
  }
  
  // Verify the token by making a test request to GitHub API
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      return json({ success: false, error: 'Invalid GitHub token' }, { status: 401 });
    }
    
    const userData = await response.json();
    
    // Store the token in a secure httpOnly cookie (only if not using env token)
    if (!env.GITHUB_TOKEN) {
      cookies.set('githubToken', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return json({ success: true, username: userData.login });
  } catch (error) {
    console.error('GitHub token verification error:', error);
    return json({ success: false, error: 'Failed to verify token' }, { status: 500 });
  }
}

export async function DELETE({ cookies }) {
  // Clear the GitHub token cookie
  cookies.delete('githubToken', { path: '/' });
  return json({ success: true });
}

export async function GET({ cookies }) {
  // Check if token exists and is valid (env first, then cookie)
  const token = getGitHubToken(cookies);
  
  if (!token) {
    return json({ authenticated: false });
  }
  
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      // Token is invalid, clear cookie if it was from cookie (not env)
      if (!env.GITHUB_TOKEN) {
        cookies.delete('githubToken', { path: '/' });
      }
      return json({ authenticated: false });
    }
    
    const userData = await response.json();
    return json({ authenticated: true, username: userData.login });
  } catch (error) {
    // Only clear cookie if not using env token
    if (!env.GITHUB_TOKEN) {
      cookies.delete('githubToken', { path: '/' });
    }
    return json({ authenticated: false });
  }
}
