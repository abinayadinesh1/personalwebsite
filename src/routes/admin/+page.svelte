<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import '../../styles/components/admin.css';

  let password = '';
  let error = '';
  let loading = false;

  // GitHub authentication
  let githubToken = '';
  let githubError = '';
  let githubLoading = false;
  let githubAuthenticated = false;
  let githubUsername = '';

  onMount(async () => {
    // Check if GitHub is already authenticated
    if (browser) {
      try {
        const response = await fetch('/api/github/auth');
        const data = await response.json();
        if (data.authenticated) {
          githubAuthenticated = true;
          githubUsername = data.username || '';
        }
      } catch (err) {
        console.error('Error checking GitHub auth:', err);
      }
    }
  });

  async function handleLogin() {
    if (!password.trim()) {
      error = 'Please enter a password';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        if (browser) {
          sessionStorage.setItem('adminAuth', 'true');
          goto('/projects');
        }
      } else {
        error = 'Incorrect password';
        password = '';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  }

  async function handleGitHubAuth() {
    if (!githubToken.trim()) {
      githubError = 'Please enter a GitHub Personal Access Token';
      return;
    }

    githubLoading = true;
    githubError = '';

    try {
      const response = await fetch('/api/github/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: githubToken })
      });

      const data = await response.json();

      if (data.success) {
        githubAuthenticated = true;
        githubUsername = data.username || '';
        githubToken = ''; // Clear the input for security
      } else {
        githubError = data.error || 'Invalid token';
        githubToken = '';
      }
    } catch (err) {
      githubError = 'An error occurred. Please try again.';
      console.error('GitHub auth error:', err);
    } finally {
      githubLoading = false;
    }
  }


  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="admin-container">
  <div class="admin-card">
    <h1>Admin Login</h1>
    <form on:submit|preventDefault={handleLogin}>
      <label>
        Password:
        <input
          type="password"
          bind:value={password}
          on:keypress={handleKeyPress}
          placeholder="Enter admin password"
        />
      </label>
      {#if error}
        <p class="error">{error}</p>
      {/if}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  </div>

  <div class="admin-card">
    <h1>GitHub Authentication</h1>
    {#if githubAuthenticated}
      <div class="github-authenticated">
        <p class="success">✓ Authenticated as <strong>{githubUsername}</strong></p>
        <p class="info">
          Using GitHub token from environment variables.
        </p>
        <p class="info">
          <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
            Manage tokens
          </a>
        </p>
      </div>
    {:else}
      <div class="github-not-authenticated">
        <p class="info">
          GitHub authentication is not configured. Set <code>GITHUB_TOKEN</code> in your <code>.env</code> file,
          or use the form below to authenticate manually.
        </p>
        <form on:submit|preventDefault={handleGitHubAuth}>
          <label>
            GitHub Personal Access Token (optional):
            <input
              type="password"
              bind:value={githubToken}
              placeholder="ghp_xxxxxxxxxxxx"
            />
          </label>
          <p class="info">
            Create a token at{' '}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
              github.com/settings/tokens
            </a>
          </p>
          {#if githubError}
            <p class="error">{githubError}</p>
          {/if}
          <button type="submit" disabled={githubLoading}>
            {githubLoading ? 'Authenticating...' : 'Authenticate Manually'}
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>
