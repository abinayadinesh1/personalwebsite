import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Helper function to get GitHub token (env first, then cookie)
function getGitHubToken(cookies) {
  return env.GITHUB_TOKEN || cookies.get('githubToken');
}

export async function GET({ url, cookies }) {
  const token = getGitHubToken(cookies);
  const owner = url.searchParams.get('owner');
  const repo = url.searchParams.get('repo');
  
  if (!token) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  if (!owner || !repo) {
    return json({ error: 'Owner and repo parameters are required' }, { status: 400 });
  }
  
  try {
    // Fetch commits for the repository
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) {
      return json({ error: 'Failed to fetch commits' }, { status: response.status });
    }
    
    const commits = await response.json();
    
    // Format commits for frontend
    const formattedCommits = commits.map(commit => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      date: commit.commit.author.date,
      author: commit.commit.author.name,
      url: commit.html_url
    }));
    
    return json({ commits: formattedCommits });
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    return json({ error: 'Failed to fetch commits' }, { status: 500 });
  }
}
