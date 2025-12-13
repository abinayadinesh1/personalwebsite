<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { PUBLIC_ADMIN_PASSWORD } from '$env/static/public';

  let password = '';
  let error = '';

  // Password is loaded from environment variable PUBLIC_ADMIN_PASSWORD
  // Set it in your .env file (see .env.example)
  const ADMIN_PASSWORD = PUBLIC_ADMIN_PASSWORD || '';

  function handleLogin() {
    if (!ADMIN_PASSWORD) {
      error = 'Admin password not configured. Please set PUBLIC_ADMIN_PASSWORD in .env file';
      return;
    }

    if (password === ADMIN_PASSWORD) {
      if (browser) {
        sessionStorage.setItem('adminAuth', 'true');
        goto('/projects');
      }
    } else {
      error = 'Incorrect password';
      password = '';
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
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>
  .admin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 2rem;
  }

  .admin-card {
    border: 2px solid #cd7f32;
    border-radius: 8px;
    padding: 2rem;
    background: rgba(30, 30, 30, 0.5);
    max-width: 400px;
    width: 100%;
  }

  .admin-card h1 {
    margin: 0 0 1.5rem 0;
    color: #cd7f32 !important;
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    filter: none !important;
  }

  .admin-card form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .admin-card label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #b4ebcb !important;
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    filter: none !important;
    font-size: 0.9rem;
  }

  .admin-card input {
    padding: 0.75rem;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid #cd7f32;
    border-radius: 4px;
    color: #b4ebcb;
    font-family: inherit;
    font-size: 1rem;
  }

  .admin-card input:focus {
    outline: none;
    border-color: #e6a85c;
  }

  .admin-card button {
    padding: 0.75rem 1.5rem;
    border: 1px solid #cd7f32;
    border-radius: 4px;
    background: transparent;
    color: #b4ebcb;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
  }

  .admin-card button:hover {
    background: #cd7f32;
    color: #1e1e1e;
  }

  .error {
    color: #e6a85c !important;
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    filter: none !important;
    font-size: 0.85rem;
    margin: 0;
  }
</style>
