import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Helper function to get GitHub token (env first, then cookie)
function getGitHubToken(cookies) {
  return env.GITHUB_TOKEN || cookies.get('githubToken');
}

export async function GET({ cookies }) {
  const token = getGitHubToken(cookies);
  
  if (!token) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    // Fetch user's repositories
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      return json({ error: 'Failed to fetch repositories' }, { status: response.status });
    }
    
    const repos = await response.json();
    
    // Format repos for frontend
    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description || '',
      private: repo.private,
      updatedAt: repo.updated_at
    }));
    
    return json({ repos: formattedRepos });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}
