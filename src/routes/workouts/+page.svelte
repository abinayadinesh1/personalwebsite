<script>
  import { onMount } from 'svelte';
  import '../../styles/components/admin.css';
  import '../../styles/components/workouts.css';

  export let data;

  let isAdmin = data.isAdmin;
  let password = '';
  let loginError = '';
  let loginLoading = false;

  const MUSCLE_GROUPS = ['all', 'legs', 'push', 'pull', 'core', 'cardio', 'full_body'];
  const SECTIONS = ['prework', 'exercises', 'postwork'];
  const SECTION_LABELS = { prework: 'pre-work', exercises: 'exercises', postwork: 'post-work' };

  let exercises = [];
  let libraryFilter = 'all';
  let librarySearch = '';
  let showAddExercise = false;
  let newExercise = { name: '', muscle_group: 'legs', movement_pattern: '', exercise_type: 'exercises', default_sets: 3, default_reps: '' };

  let workoutDate = new Date().toISOString().slice(0, 10);
  let workoutTitle = '';
  let workoutNotes = '';
  let currentWorkoutId = null;
  let planDayId = null;
  let sections = { prework: [], exercises: [], postwork: [] };
  let saveMessage = '';

  let history = [];
  let showHistory = false;

  // Plan progress ("Day X of 48")
  let planTotal = 0;
  let planCompleted = 0;
  let planLoaded = false;
  let planFinished = false;

  // Preview of upcoming (not-yet-logged) plan days.
  let planDays = [];
  let showUpcoming = false;
  let expandedDayId = null;
  let previewCache = {}; // plan_day_id -> template exercises

  $: upcomingDays = planDays.filter((d) => !d.completed);

  let dragPayload = null;
  let dropHintSection = null;

  $: visibleExercises = exercises.filter((e) => {
    if (libraryFilter !== 'all' && e.muscle_group !== libraryFilter) return false;
    if (librarySearch && !e.name.toLowerCase().includes(librarySearch.toLowerCase())) return false;
    return true;
  });

  // Demo links live on the exercise library rows; workout/plan items only carry
  // an exercise_id snapshot, so map id -> video to show the link in the builder.
  $: videoById = new Map(exercises.filter((e) => e.video_url).map((e) => [e.id, e.video_url]));

  async function login() {
    if (!password.trim()) {
      loginError = 'Please enter a password';
      return;
    }
    loginLoading = true;
    loginError = '';
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const d = await res.json();
      if (d.success) {
        isAdmin = true;
        await loadAll();
      } else {
        loginError = 'Incorrect password';
        password = '';
      }
    } catch (err) {
      loginError = 'Something went wrong. Try again.';
      console.error('Login error:', err);
    } finally {
      loginLoading = false;
    }
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    isAdmin = false;
  }

  async function loadAll() {
    await Promise.all([loadExercises(), loadHistory()]);
    await loadPlanProgress();
  }

  async function loadExercises() {
    const res = await fetch('/api/exercises');
    if (res.ok) {
      const d = await res.json();
      exercises = d.exercises;
    }
  }

  async function loadHistory() {
    const res = await fetch('/api/workouts');
    if (res.ok) {
      const d = await res.json();
      history = d.workouts;
    }
  }

  // Pulls the plan's completion state and, if there's a day left, preloads
  // it straight into the builder as a fresh (unsaved) entry.
  async function loadPlanProgress() {
    const res = await fetch('/api/plan/progress');
    if (!res.ok) {
      planLoaded = true;
      return;
    }
    const d = await res.json();
    planTotal = d.total;
    planCompleted = d.completed;
    planDays = d.days || [];
    planLoaded = true;

    if (d.currentDay) {
      planFinished = false;
      applyPlanDay(d.currentDay);
    } else {
      planFinished = planTotal > 0;
    }
  }

  function applyPlanDay(day) {
    currentWorkoutId = null;
    planDayId = day.id;
    workoutTitle = day.title;
    workoutNotes = '';
    workoutDate = new Date().toISOString().slice(0, 10);
    const grouped = { prework: [], exercises: [], postwork: [] };
    for (const ex of day.exercises) {
      const sec = SECTIONS.includes(ex.section) ? ex.section : 'exercises';
      grouped[sec].push({
        exercise_id: ex.exercise_id,
        exercise_name_snapshot: ex.exercise_name_snapshot,
        sets: ex.sets,
        reps: ex.reps,
        weight: '',
        notes: ''
      });
    }
    sections = grouped;
    showHistory = false;
  }

  async function jumpToPlanDay(id) {
    const res = await fetch(`/api/plan/${id}`);
    if (!res.ok) return;
    const d = await res.json();
    applyPlanDay({ ...d.day, exercises: d.exercises });
    showUpcoming = false;
  }

  // Expand/collapse an upcoming day and lazily fetch its template exercises.
  async function togglePreview(day) {
    if (expandedDayId === day.id) {
      expandedDayId = null;
      return;
    }
    expandedDayId = day.id;
    if (!previewCache[day.id]) {
      const res = await fetch(`/api/plan/${day.id}`);
      if (res.ok) {
        const d = await res.json();
        previewCache = { ...previewCache, [day.id]: d.exercises };
      }
    }
  }

  function previewSection(exercises, section) {
    return exercises.filter((e) => (SECTIONS.includes(e.section) ? e.section : 'exercises') === section);
  }

  async function loadWorkout(id) {
    const res = await fetch(`/api/workouts/${id}`);
    if (!res.ok) return;
    const d = await res.json();
    currentWorkoutId = d.workout.id;
    planDayId = d.workout.plan_day_id || null;
    workoutTitle = d.workout.title || '';
    workoutDate = (d.workout.workout_date || '').slice(0, 10) || workoutDate;
    workoutNotes = d.workout.notes || '';
    const grouped = { prework: [], exercises: [], postwork: [] };
    for (const ex of d.exercises) {
      const sec = SECTIONS.includes(ex.section) ? ex.section : 'exercises';
      grouped[sec].push(ex);
    }
    sections = grouped;
    showHistory = false;
  }

  function newWorkout() {
    currentWorkoutId = null;
    planDayId = null;
    workoutTitle = '';
    workoutNotes = '';
    workoutDate = new Date().toISOString().slice(0, 10);
    sections = { prework: [], exercises: [], postwork: [] };
  }

  function onLibraryDragStart(e, exercise) {
    dragPayload = { source: 'library', exercise };
    e.dataTransfer.effectAllowed = 'copy';
  }

  function onItemDragStart(e, section, index) {
    dragPayload = { source: 'section', section, index };
    e.dataTransfer.effectAllowed = 'move';
  }

  function onSectionDragOver(e, section) {
    e.preventDefault();
    dropHintSection = section;
  }

  function onSectionDrop(e, section) {
    e.preventDefault();
    dropHintSection = null;
    if (!dragPayload) return;

    if (dragPayload.source === 'library') {
      const ex = dragPayload.exercise;
      sections[section] = [
        ...sections[section],
        {
          exercise_id: ex.id,
          exercise_name_snapshot: ex.name,
          sets: ex.default_sets || 3,
          reps: ex.default_reps || '',
          weight: '',
          notes: ''
        }
      ];
    } else if (dragPayload.source === 'section') {
      const { section: fromSection, index } = dragPayload;
      const arr = [...sections[fromSection]];
      const [item] = arr.splice(index, 1);
      sections[fromSection] = arr;
      sections[section] = [...sections[section], item];
    }
    sections = { ...sections };
    dragPayload = null;
  }

  function removeItem(section, index) {
    const arr = [...sections[section]];
    arr.splice(index, 1);
    sections[section] = arr;
    sections = { ...sections };
  }

  function moveItem(section, index, dir) {
    const arr = [...sections[section]];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    sections[section] = arr;
    sections = { ...sections };
  }

  async function saveWorkout() {
    const wasFreshPlanDay = !currentWorkoutId && planDayId;

    const payload = {
      title: workoutTitle,
      workout_date: workoutDate,
      notes: workoutNotes,
      plan_day_id: planDayId,
      exercises: SECTIONS.flatMap((sec) =>
        sections[sec].map((item, idx) => ({
          exercise_id: item.exercise_id,
          exercise_name_snapshot: item.exercise_name_snapshot,
          section: sec,
          order_index: idx,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
          notes: item.notes
        }))
      )
    };

    const res = currentWorkoutId
      ? await fetch(`/api/workouts/${currentWorkoutId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      : await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

    if (res.ok) {
      const d = await res.json();
      currentWorkoutId = d.workout.id;
      await loadHistory();

      if (wasFreshPlanDay) {
        // Logging a fresh plan day completes it -- move on to the next one.
        saveMessage = 'logged! loading next day...';
        await loadPlanProgress();
      } else {
        saveMessage = 'saved';
      }
    } else {
      saveMessage = 'error saving';
    }
    setTimeout(() => (saveMessage = ''), 2500);
  }

  async function deleteWorkout(id) {
    if (!confirm('Delete this workout log? (its plan day will show as not-yet-done again)')) return;
    await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
    if (id === currentWorkoutId) newWorkout();
    await loadHistory();
    await loadPlanProgress();
  }

  async function addExercise() {
    if (!newExercise.name.trim()) return;
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise)
    });
    if (res.ok) {
      await loadExercises();
      showAddExercise = false;
      newExercise = { name: '', muscle_group: 'legs', movement_pattern: '', exercise_type: 'exercises', default_sets: 3, default_reps: '' };
    }
  }

  onMount(() => {
    if (isAdmin) loadAll();
  });
</script>

<svelte:head>
  <title>workouts</title>
</svelte:head>

{#if !isAdmin}
  <div class="admin-container">
    <div class="admin-card">
      <h1>workouts</h1>
      <form on:submit|preventDefault={login}>
        <label>
          password
          <input type="password" bind:value={password} autocomplete="current-password" />
        </label>
        {#if loginError}<p class="error">{loginError}</p>{/if}
        <button type="submit" disabled={loginLoading}>{loginLoading ? 'checking...' : 'enter'}</button>
      </form>
    </div>
  </div>
{:else}
  <div class="workouts-page">
    {#if planLoaded && planTotal > 0}
      <div class="plan-progress">
        <div class="plan-progress-bar">
          <div class="plan-progress-fill" style="width: {(planCompleted / planTotal) * 100}%"></div>
        </div>
        <div class="plan-progress-label">
          {#if planFinished}
            plan complete — {planCompleted} / {planTotal} days logged
          {:else}
            day {planCompleted + 1} of {planTotal} · {workoutTitle}
            {#if planDayId && currentWorkoutId === null}<span class="plan-tag">preloaded from plan</span>{/if}
          {/if}
        </div>
      </div>
    {/if}

    <div class="workouts-toolbar">
      <input type="date" bind:value={workoutDate} />
      <input type="text" placeholder="workout title (optional)" bind:value={workoutTitle} />
      <button type="button" on:click={newWorkout}>+ freeform</button>
      {#if !planFinished}
        <button type="button" on:click={loadPlanProgress}>↻ back to plan</button>
      {/if}
      <button type="button" on:click={saveWorkout}>{planDayId && !currentWorkoutId ? 'log this day' : 'save'}</button>
      {#if upcomingDays.length > 0}
        <button type="button" on:click={() => (showUpcoming = !showUpcoming)}>upcoming ({upcomingDays.length})</button>
      {/if}
      <button type="button" on:click={() => (showHistory = !showHistory)}>history ({history.length})</button>
      {#if saveMessage}<span class="save-msg">{saveMessage}</span>{/if}
      <button type="button" class="logout-link" on:click={logout}>log out</button>
    </div>

    {#if showUpcoming}
      <div class="workouts-upcoming">
        {#each upcomingDays as day, i (day.id)}
          <div class="upcoming-day">
            <div class="upcoming-day-header">
              <button type="button" class="upcoming-toggle" on:click={() => togglePreview(day)}>
                <span class="upcoming-caret">{expandedDayId === day.id ? '▾' : '▸'}</span>
                <span class="upcoming-day-num">day {planCompleted + 1 + i}</span>
                {day.title || 'untitled'}
                {#if day.week_number}<span class="upcoming-meta">wk {day.week_number}{#if day.day_number} · d{day.day_number}{/if}</span>{/if}
                {#if i === 0}<span class="plan-tag">next up</span>{/if}
              </button>
              <button type="button" class="upcoming-load" on:click={() => jumpToPlanDay(day.id)}>load</button>
            </div>
            {#if expandedDayId === day.id}
              <div class="upcoming-exercises">
                {#if previewCache[day.id]}
                  {#each SECTIONS as sec}
                    {@const secEx = previewSection(previewCache[day.id], sec)}
                    {#if secEx.length}
                      <div class="upcoming-section">
                        <span class="upcoming-section-label">{SECTION_LABELS[sec]}</span>
                        {#each secEx as ex}
                          <div class="upcoming-ex">{ex.exercise_name_snapshot} · {ex.sets}×{ex.reps || '?'}</div>
                        {/each}
                      </div>
                    {/if}
                  {/each}
                  {#if previewCache[day.id].length === 0}<p class="empty-hint">no exercises for this day</p>{/if}
                {:else}
                  <p class="empty-hint">loading…</p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if showHistory}
      <div class="workouts-history">
        {#each history as w (w.id)}
          <div class="history-item">
            <button type="button" class="history-load" on:click={() => loadWorkout(w.id)}>
              {w.workout_date?.slice(0, 10)} — {w.plan_title || w.title || 'untitled'} ({w.exercise_count} exercises)
            </button>
            <button type="button" class="history-delete" on:click={() => deleteWorkout(w.id)}>delete</button>
          </div>
        {/each}
        {#if history.length === 0}<p>no saved workouts yet</p>{/if}
      </div>
    {/if}

    <div class="workouts-layout">
      <aside class="exercise-library">
        <h2>library</h2>
        <input type="text" placeholder="search exercises" bind:value={librarySearch} />
        <div class="library-filters">
          {#each MUSCLE_GROUPS as g}
            <button type="button" class:active={libraryFilter === g} on:click={() => (libraryFilter = g)}>
              {g.replace('_', ' ')}
            </button>
          {/each}
        </div>
        <div class="library-list">
          {#each visibleExercises as ex (ex.id)}
            <div class="exercise-card" draggable="true" on:dragstart={(e) => onLibraryDragStart(e, ex)}>
              <div class="exercise-card-name">{ex.name}</div>
              <div class="exercise-card-meta">
                <span class="tag tag-{ex.muscle_group}">{ex.muscle_group.replace('_', ' ')}</span>
                <span class="tag">{ex.exercise_type}</span>
                {#if ex.default_sets}<span class="exercise-card-sets">{ex.default_sets}x{ex.default_reps || '?'}</span>{/if}
              </div>
              {#if ex.notes}<div class="exercise-card-notes">{ex.notes}</div>{/if}
              {#if ex.video_url}
                <a class="exercise-card-demo" href={ex.video_url} target="_blank" rel="noopener noreferrer" on:mousedown|stopPropagation on:click|stopPropagation>▶ demo</a>
              {/if}
            </div>
          {/each}
          {#if visibleExercises.length === 0}<p class="empty-hint">no matching exercises</p>{/if}
        </div>
        <button type="button" class="add-exercise-btn" on:click={() => (showAddExercise = !showAddExercise)}>
          {showAddExercise ? 'cancel' : '+ add exercise'}
        </button>
        {#if showAddExercise}
          <form class="add-exercise-form" on:submit|preventDefault={addExercise}>
            <input placeholder="name" bind:value={newExercise.name} required />
            <select bind:value={newExercise.muscle_group}>
              <option value="legs">legs</option>
              <option value="push">push</option>
              <option value="pull">pull</option>
              <option value="core">core</option>
              <option value="cardio">cardio</option>
              <option value="full_body">full body</option>
            </select>
            <select bind:value={newExercise.exercise_type}>
              <option value="prework">pre-work</option>
              <option value="exercises">exercises</option>
              <option value="postwork">post-work</option>
            </select>
            <input placeholder="movement pattern (e.g. lunge)" bind:value={newExercise.movement_pattern} />
            <div class="row">
              <input type="number" placeholder="sets" bind:value={newExercise.default_sets} min="1" />
              <input placeholder="reps (e.g. 10ea)" bind:value={newExercise.default_reps} />
            </div>
            <button type="submit">add to library</button>
          </form>
        {/if}
      </aside>

      <main class="workout-builder">
        {#each SECTIONS as section (section)}
          <div
            class="workout-section"
            class:drag-over={dropHintSection === section}
            on:dragover={(e) => onSectionDragOver(e, section)}
            on:dragleave={() => (dropHintSection = null)}
            on:drop={(e) => onSectionDrop(e, section)}
          >
            <h3>{SECTION_LABELS[section]}</h3>
            {#if sections[section].length === 0}
              <p class="empty-hint">drag exercises here</p>
            {/if}
            {#each sections[section] as item, i (i)}
              <div class="workout-item" draggable="true" on:dragstart={(e) => onItemDragStart(e, section, i)}>
                <div class="workout-item-name">
                  {item.exercise_name_snapshot}
                  {#if videoById.get(item.exercise_id)}
                    <a class="workout-item-demo" href={videoById.get(item.exercise_id)} target="_blank" rel="noopener noreferrer" on:mousedown|stopPropagation on:click|stopPropagation>▶</a>
                  {/if}
                </div>
                <div class="workout-item-fields">
                  <input type="number" bind:value={item.sets} min="0" placeholder="sets" />
                  <input type="text" bind:value={item.reps} placeholder="reps" />
                  <input type="text" bind:value={item.weight} placeholder="wt" />
                </div>
                <div class="workout-item-actions">
                  <button type="button" on:click={() => moveItem(section, i, -1)} title="move up">↑</button>
                  <button type="button" on:click={() => moveItem(section, i, 1)} title="move down">↓</button>
                  <button type="button" class="remove-btn" on:click={() => removeItem(section, i)} title="remove">×</button>
                </div>
              </div>
            {/each}
          </div>
        {/each}
      </main>
    </div>
  </div>
{/if}
