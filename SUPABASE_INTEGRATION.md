# Supabase Integration Guide

## Overview
This project now uses a hybrid strategy for storing projects:
- **Supabase** is the source of truth for all project data
- **localStorage** acts as a cache/fallback for offline access

## Environment Variables Setup

Add these to your `.env.local` file (and `.env` for production):

```bash
# Public variables (accessible in browser)
PUBLIC_SUPABASE_URL=your-supabase-project-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Private variables (server-side only)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Where to find these values:
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `SUPABASE_URL` and `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Keep it secure and never commit it to version control!

## Database Tables

Make sure you've created these tables in Supabase:

### 1. `projects` table
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Graduated', 'In Progress', 'Graveyard', 'Idea')),
  last_updated DATE NOT NULL,
  has_commits BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_is_public ON projects(is_public);
```

### 2. `project_content` table
```sql
CREATE TABLE project_content (
  project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  markdown_content TEXT,
  github_repo TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## How It Works

### Creating a New Project

1. **User clicks "Add Project"** → `handleAddProject()` creates a new project form
2. **User fills in details and clicks "Save"** → `handleSaveProject()` is called
3. **Function flow:**
   - Generates project ID and path from title
   - Calls `saveProjectToSupabase()` which:
     - POSTs to `/api/projects` with project data
     - Server creates entry in `projects` table
     - If status !== 'Graduated', also creates entry in `project_content` table
     - Returns saved project
   - Updates local state and localStorage cache
   - Shows success or error message

### Loading Projects

1. **On page mount** → `loadProjects()` is called
2. **Function flow:**
   - Tries to fetch from `/api/projects` (Supabase)
   - On success: caches in localStorage and returns data
   - On failure: falls back to localStorage
   - If no localStorage: uses default projects

### Data Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─→ Load Projects
       │   ├─→ Try Supabase API (/api/projects)
       │   │   ├─→ Success: Cache in localStorage
       │   │   └─→ Fail: Use localStorage
       │   └─→ Display projects
       │
       └─→ Save New Project
           ├─→ POST to /api/projects
           │   ├─→ Server saves to Supabase
           │   └─→ Returns saved project
           ├─→ Update localStorage cache
           └─→ Update UI
```

## Files Created/Modified

### New Files:
- `src/lib/utils/supabase.js` - Supabase client (browser-side)
- `src/lib/utils/projects.js` - Project loading/saving utilities
- `src/routes/api/projects/+server.js` - API endpoints for projects CRUD

### Modified Files:
- `src/routes/projects/+page.svelte` - Updated to use Supabase integration

## Testing the Integration

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Login as admin** (if not already logged in)

3. **Test creating a project:**
   - Click the "+" button
   - Fill in project details
   - Click "Save"
   - Check browser console for success/error messages
   - Verify in Supabase dashboard that the project was created

4. **Test loading projects:**
   - Refresh the page
   - Projects should load from Supabase
   - Check Network tab to see API calls to `/api/projects`

5. **Test fallback:**
   - Temporarily break Supabase connection (wrong URL)
   - Projects should still load from localStorage
   - Check console for fallback warnings

## Next Steps

To complete the integration:

1. **Edit Project functionality** - Update `handleSaveEdit()` to save edits to Supabase
2. **Delete Project functionality** - Update `handleDeleteProject()` to delete from Supabase
3. **Project Content** - Update `ProjectEditor.svelte` to save/load markdown content from `project_content` table
4. **Row Level Security (RLS)** - Set up RLS policies in Supabase for better security

## Troubleshooting

### "Missing Supabase environment variables" error
- Check that all env variables are set in `.env.local`
- Restart your dev server after adding env variables
- Verify variable names match exactly (case-sensitive)

### "Failed to save project" error
- Check browser console for detailed error message
- Verify Supabase tables exist and have correct schema
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify project ID doesn't already exist (must be unique)

### Projects not loading
- Check Network tab for failed API requests
- Verify Supabase URL and keys are correct
- Check Supabase dashboard logs for errors
- Try accessing Supabase directly to verify connectivity
