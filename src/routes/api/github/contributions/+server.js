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
    // Fetch commits for the repository to build contribution graph
    // We'll get commits from the last year and aggregate by date
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&since=${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) {
      return json({ error: 'Failed to fetch contributions' }, { status: response.status });
    }
    
    const commits = await response.json();
    
    // Aggregate commits by date and format for github-contribution-graph
    // Format: { "2024": [{ done: 5, not_done: 0, date: "2024-01-15" }, ...], ... }
    const contributionsByYear = {};
    let totalContributions = 0;
    
    commits.forEach(commit => {
      const dateStr = commit.commit.author.date.split('T')[0]; // Get YYYY-MM-DD format
      const year = dateStr.split('-')[0];
      
      if (!contributionsByYear[year]) {
        contributionsByYear[year] = {};
      }
      
      if (!contributionsByYear[year][dateStr]) {
        contributionsByYear[year][dateStr] = 0;
      }
      
      contributionsByYear[year][dateStr]++;
      totalContributions++;
    });
    
    // Transform to the format expected by github-contribution-graph
    // { "2024": [{ done: 5, not_done: 0, date: "2024-01-15" }, ...], ... }
    const contributions = {};
    Object.keys(contributionsByYear).forEach(year => {
      contributions[year] = Object.keys(contributionsByYear[year]).map(date => ({
        done: contributionsByYear[year][date],
        not_done: 0,
        date: date
      }));
    });
    
    return json({ 
      contributions,
      totalContributions
    });
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
