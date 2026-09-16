// Single source of truth for Fin Grathwol's program, transcribed from
// Finn_Grathwol_Program_LINKS_FIXED.pdf. Both the fresh-install seed scripts
// (seed-workout-exercises.js, seed-plan-days.js) and the live-DB migration
// (reseed-program.js) import from here so the library and the plan-day
// templates can never drift apart.
//
// Each training day is split into three sections, matching the chart:
//   prework   -- the mobility / plyometric warm-up block ("Pre-Work")
//   exercises -- every lift in the chart (the paired main lifts + the pull-up
//                slot + the "Pair Stacks")
//   postwork  -- the finisher block ("Post-Work")
//
// exercise_type on a library row is just its *primary* section (used for the
// add-exercise form default); a movement's actual section is set per plan day
// below, since a few movements (e.g. DB Wrist Extension and Flexion) show up
// as pre-work on one day and post-work on another.

export const SECTIONS = ['prework', 'exercises', 'postwork'];

export const EXERCISES = [
  // --- Pre-work / warm-up movements ---
  { name: 'Pogo Jumps', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'prework', default_sets: 1, default_reps: '50', equipment: 'Bodyweight' },
  { name: 'T-Spine Rotation', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'prework', default_sets: 1, default_reps: '8ea', equipment: 'Bodyweight' },
  { name: 'Deep Squat Hold', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'prework', default_sets: 1, default_reps: '60s', equipment: 'Bodyweight' },
  { name: 'CM Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'prework', default_sets: 1, default_reps: '5', equipment: 'Bodyweight', notes: 'Countermovement jump, max intent' },
  { name: 'SL Glute Bridge', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'prework', default_sets: 1, default_reps: '10ea', equipment: 'Bodyweight' },
  { name: 'Push Up to T-Spine Rotation', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'prework', default_sets: 1, default_reps: '8ea', equipment: 'Bodyweight' },
  { name: 'Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'prework', default_sets: 1, default_reps: '6ea', equipment: 'Bodyweight' },
  { name: 'SL RDL to Hip Drive', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'prework', default_sets: 1, default_reps: '6ea', equipment: 'Bodyweight' },
  { name: 'Tuck Jumps', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'prework', default_sets: 1, default_reps: '5', equipment: 'Bodyweight' },
  { name: 'Squat Jumps', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'prework', default_sets: 1, default_reps: '5', equipment: 'Bodyweight' },
  // Swap-in warm-up options Abinaya asked for.
  { name: 'Side Lunges', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'prework', default_sets: 3, default_reps: '10ea', equipment: 'Bodyweight', notes: 'Lateral lunge, warm-up tempo / light load' },
  { name: 'Jumping Jacks', muscle_group: 'cardio', movement_pattern: 'warmup', exercise_type: 'prework', default_sets: 3, default_reps: '30s', equipment: 'Bodyweight', notes: 'Swap-in warm-up option' },

  // --- Main lifts / pair stacks ("exercises") ---
  // Phase 1, Day 1
  { name: 'Seated Vertical Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'exercises', default_sets: 5, default_reps: '3', equipment: 'Bodyweight' },
  { name: 'Pause Goblet Squat', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Incline DB Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Pause KB RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'KB' },
  { name: 'Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '8+', equipment: 'Bodyweight' },
  { name: '1/2 Kneeling Windmill Press', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'exercises', default_sets: 3, default_reps: '6ea', equipment: 'DB' },
  { name: 'DB SA Floor Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 3, default_reps: '8ea', equipment: 'DB' },
  { name: 'Hand Supported Step Down', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 3, default_reps: '15ea', equipment: 'Bodyweight' },
  // Phase 1, Day 2
  { name: 'Box Jump to Land', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'exercises', default_sets: 5, default_reps: '3', equipment: 'Box' },
  { name: 'Rack Supported SL RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'Barbell' },
  { name: 'Pause Incline DB Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'FFE Goblet Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 4, default_reps: '6', equipment: 'DB' },
  { name: 'Monkey Bar Chin-Up', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '7ea', equipment: 'Bar' },
  { name: 'Prone Cable Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 3, default_reps: '15ea', equipment: 'Cable' },
  { name: 'DNS Star', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'exercises', default_sets: 3, default_reps: '12', equipment: 'Bodyweight' },
  // Phase 1, Day 3
  { name: 'MB Slam', muscle_group: 'full_body', movement_pattern: 'power', exercise_type: 'exercises', default_sets: 4, default_reps: '4', equipment: 'Medicine Ball' },
  { name: 'DB RFE Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 4, default_reps: '8ea', equipment: 'DB' },
  { name: 'Bird Dog Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 4, default_reps: '8ea', equipment: 'DB' },
  { name: 'DB Lateral Weight Shift', muscle_group: 'legs', movement_pattern: 'lateral', exercise_type: 'exercises', default_sets: 4, default_reps: '7ea', equipment: 'DB' },
  { name: 'Pause Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '5', equipment: 'Bodyweight' },
  { name: 'Weighted Pause Push Up', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 3, default_reps: '8', equipment: 'Plate' },
  { name: '1/2 Kneeling Cable Rotation', muscle_group: 'core', movement_pattern: 'rotation', exercise_type: 'exercises', default_sets: 3, default_reps: '10ea', equipment: 'Cable' },
  { name: 'Hanging MB Knee Raise', muscle_group: 'core', movement_pattern: 'flexion', exercise_type: 'exercises', default_sets: 3, default_reps: '12', equipment: 'Medicine Ball' },
  // Phase 2, Day 1
  { name: 'DB Squat Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'exercises', default_sets: 3, default_reps: '3', equipment: 'DB' },
  { name: 'Safety Bar Squat Heels Elevated', muscle_group: 'legs', movement_pattern: 'squat', exercise_type: 'exercises', default_sets: 4, default_reps: '6', equipment: 'Safety Bar' },
  { name: 'DB Tripod Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 4, default_reps: '6', equipment: 'DB' },
  { name: 'DB SL Glute Bridge', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'exercises', default_sets: 4, default_reps: '8', equipment: 'DB' },
  { name: 'Weighted Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '6', equipment: 'Plate' },
  { name: 'Horizontal Bar Row w/ Hand Release', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 3, default_reps: '12', equipment: 'Bar' },
  { name: 'DB Alt Floor Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 3, default_reps: '6ea', equipment: 'DB' },
  { name: 'Hamstring Iso w/ OH DB Flexion', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'exercises', default_sets: 3, default_reps: '20s', equipment: 'DB' },
  // Phase 2, Day 2
  { name: 'Seated Vert Jump to Vert Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'exercises', default_sets: 3, default_reps: '3', equipment: 'Bodyweight' },
  { name: 'BB RDL', muscle_group: 'legs', movement_pattern: 'hinge', exercise_type: 'exercises', default_sets: 4, default_reps: '6', equipment: 'Barbell' },
  { name: '1/2 Kneeling Cable Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 4, default_reps: '6ea', equipment: 'Cable' },
  { name: 'DB Split Squat', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 4, default_reps: '6ea', equipment: 'DB' },
  { name: 'DB Pause Flat Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 3, default_reps: '5', equipment: 'DB' },
  { name: 'Bent Over MB Chest Slam', muscle_group: 'full_body', movement_pattern: 'power', exercise_type: 'exercises', default_sets: 3, default_reps: '3', equipment: 'Medicine Ball' },
  { name: 'Lateral Lunge Drop from Box', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 3, default_reps: '6ea', equipment: 'Box' },
  { name: 'KB Hip Airplane', muscle_group: 'legs', movement_pattern: 'rotation', exercise_type: 'exercises', default_sets: 3, default_reps: '10ea', equipment: 'KB' },
  // Phase 2, Day 3
  { name: 'MB Slam to Vert Jump', muscle_group: 'legs', movement_pattern: 'jump', exercise_type: 'exercises', default_sets: 4, default_reps: '4', equipment: 'Medicine Ball' },
  { name: 'Knee on Bench Row', muscle_group: 'pull', movement_pattern: 'row', exercise_type: 'exercises', default_sets: 3, default_reps: '6', equipment: 'DB' },
  { name: 'Plate Lateral Box Step Down', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 3, default_reps: '7ea', equipment: 'Plate' },
  { name: 'Weighted Pause Pull Ups', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '5', equipment: 'Plate' },
  { name: '1/2 Kneeling Landmine Press', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'exercises', default_sets: 3, default_reps: '6ea', equipment: 'Barbell' },
  { name: 'DB Side Bend', muscle_group: 'core', movement_pattern: 'lateral', exercise_type: 'exercises', default_sets: 3, default_reps: '12ea', equipment: 'DB' },
  { name: 'Chin Up Iso Hold Knee Raise', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'exercises', default_sets: 3, default_reps: '12ea', equipment: 'Bar' },
  // Extra swap-in leg options.
  { name: 'Step Ups', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 3, default_reps: '10ea', equipment: 'DB / Box' },
  { name: 'Walking Lunges', muscle_group: 'legs', movement_pattern: 'lunge', exercise_type: 'exercises', default_sets: 3, default_reps: '10ea', equipment: 'DB', notes: 'Progressive weight across sets/weeks' },

  // --- Post-work / finisher movements ---
  { name: 'Zottman Curls', muscle_group: 'pull', movement_pattern: 'curl', exercise_type: 'postwork', default_sets: 3, default_reps: '15', equipment: 'DB' },
  { name: 'Hanging Scapular Retraction', muscle_group: 'pull', movement_pattern: 'pull', exercise_type: 'postwork', default_sets: 3, default_reps: '12', equipment: 'Bar' },
  { name: 'Weighted Side Plank', muscle_group: 'core', movement_pattern: 'plank', exercise_type: 'postwork', default_sets: 3, default_reps: '30s', equipment: 'Plate' },
  { name: 'Tricep Pulldown', muscle_group: 'push', movement_pattern: 'press', exercise_type: 'postwork', default_sets: 3, default_reps: '15', equipment: 'Cable' },
  { name: 'SL Bent Knee Calf Raise', muscle_group: 'legs', movement_pattern: 'calf', exercise_type: 'postwork', default_sets: 3, default_reps: '17', equipment: 'Bodyweight' },
  { name: 'Seated Machine Calf Raise', muscle_group: 'legs', movement_pattern: 'calf', exercise_type: 'postwork', default_sets: 3, default_reps: '10', equipment: 'Machine' },
  { name: 'Lateral Bear Crawl Walk', muscle_group: 'full_body', movement_pattern: 'crawl', exercise_type: 'postwork', default_sets: 3, default_reps: '10yd', equipment: 'Bodyweight' },
  { name: 'Bear Crawl Openers', muscle_group: 'full_body', movement_pattern: 'rotation', exercise_type: 'postwork', default_sets: 3, default_reps: '5ea', equipment: 'Bodyweight' },
  { name: 'DB Wrist Extension and Flexion', muscle_group: 'pull', movement_pattern: 'wrist', exercise_type: 'postwork', default_sets: 3, default_reps: '20ea', equipment: 'DB' },
  { name: 'Bicep Curl', muscle_group: 'pull', movement_pattern: 'curl', exercise_type: 'postwork', default_sets: 3, default_reps: '15+', equipment: 'DB' }
];

// Per-day templates. Each entry is [name, sets, reps]. Section is the object key.
const P1D1 = {
  prework: [['Pogo Jumps', 1, '50'], ['T-Spine Rotation', 1, '8ea'], ['Deep Squat Hold', 1, '60s'], ['DB Wrist Extension and Flexion', 1, '20ea'], ['CM Jump', 1, '5']],
  exercises: [['Seated Vertical Jump', 5, '3'], ['Pause Goblet Squat', 4, '8'], ['Incline DB Row', 4, '8'], ['Pause KB RDL', 4, '8'], ['Pull Ups', 3, '8+'], ['1/2 Kneeling Windmill Press', 3, '6ea'], ['DB SA Floor Press', 3, '8ea'], ['Hand Supported Step Down', 3, '15ea']],
  postwork: [['Zottman Curls', 3, '15'], ['Hanging Scapular Retraction', 3, '12'], ['Weighted Side Plank', 3, '30s']]
};

const P1D2 = {
  prework: [['Pogo Jumps', 1, '50'], ['SL Glute Bridge', 1, '10ea'], ['Push Up to T-Spine Rotation', 1, '8ea'], ['Split Squat', 1, '6ea'], ['CM Jump', 1, '5']],
  exercises: [['Box Jump to Land', 5, '3'], ['Rack Supported SL RDL', 4, '8'], ['Pause Incline DB Press', 4, '8'], ['FFE Goblet Split Squat', 4, '6'], ['Pull Ups', 3, '8+'], ['Monkey Bar Chin-Up', 3, '7ea'], ['Prone Cable Row', 3, '15ea'], ['DNS Star', 3, '12']],
  postwork: [['Tricep Pulldown', 3, '15'], ['Hanging Scapular Retraction', 3, '12'], ['SL Bent Knee Calf Raise', 3, '17']]
};

const P1D3 = {
  prework: [['Pogo Jumps', 1, '50'], ['T-Spine Rotation', 1, '8ea'], ['SL RDL to Hip Drive', 1, '6ea'], ['Split Squat', 1, '6ea'], ['Tuck Jumps', 1, '5'], ['Squat Jumps', 1, '5']],
  exercises: [['MB Slam', 4, '4'], ['DB RFE Split Squat', 4, '8ea'], ['Bird Dog Row', 4, '8ea'], ['DB Lateral Weight Shift', 4, '7ea'], ['Pause Pull Ups', 3, '5'], ['Weighted Pause Push Up', 3, '8'], ['1/2 Kneeling Cable Rotation', 3, '10ea'], ['Hanging MB Knee Raise', 3, '12']],
  postwork: [['Lateral Bear Crawl Walk', 3, '10yd'], ['DB Wrist Extension and Flexion', 3, '20ea'], ['Bicep Curl', 3, '15+']]
};

const P2D1 = {
  prework: [['Pogo Jumps', 1, '50'], ['T-Spine Rotation', 1, '8ea'], ['Deep Squat Hold', 1, '60s'], ['DB Wrist Extension and Flexion', 1, '20ea'], ['CM Jump', 1, '5']],
  exercises: [['DB Squat Jump', 3, '3'], ['Safety Bar Squat Heels Elevated', 4, '6'], ['DB Tripod Row', 4, '6'], ['DB SL Glute Bridge', 4, '8'], ['Weighted Pull Ups', 3, '6'], ['Horizontal Bar Row w/ Hand Release', 3, '12'], ['DB Alt Floor Press', 3, '6ea'], ['Hamstring Iso w/ OH DB Flexion', 3, '20s']],
  postwork: [['Zottman Curls', 3, '15'], ['Hanging Scapular Retraction', 3, '12'], ['Weighted Side Plank', 3, '30s']]
};

const P2D2 = {
  prework: [['Pogo Jumps', 1, '50'], ['SL Glute Bridge', 1, '10ea'], ['Push Up to T-Spine Rotation', 1, '8ea'], ['Split Squat', 1, '6ea'], ['CM Jump', 1, '5']],
  exercises: [['Seated Vert Jump to Vert Jump', 3, '3'], ['BB RDL', 4, '6'], ['1/2 Kneeling Cable Row', 4, '6ea'], ['DB Split Squat', 4, '6ea'], ['DB Pause Flat Press', 3, '5'], ['Bent Over MB Chest Slam', 3, '3'], ['Lateral Lunge Drop from Box', 3, '6ea'], ['KB Hip Airplane', 3, '10ea']],
  postwork: [['Tricep Pulldown', 3, '15'], ['Hanging Scapular Retraction', 3, '12'], ['Seated Machine Calf Raise', 3, '10']]
};

const P2D3 = {
  prework: [['Pogo Jumps', 1, '50'], ['T-Spine Rotation', 1, '8ea'], ['SL RDL to Hip Drive', 1, '6ea'], ['Split Squat', 1, '6ea'], ['Tuck Jumps', 1, '5'], ['Squat Jumps', 1, '5']],
  exercises: [['MB Slam to Vert Jump', 4, '4'], ['DB RFE Split Squat', 3, '6'], ['Knee on Bench Row', 3, '6'], ['Plate Lateral Box Step Down', 3, '7ea'], ['Weighted Pause Pull Ups', 3, '5'], ['1/2 Kneeling Landmine Press', 3, '6ea'], ['DB Side Bend', 3, '12ea'], ['Chin Up Iso Hold Knee Raise', 3, '12ea']],
  postwork: [['Bear Crawl Openers', 3, '5ea'], ['DB Wrist Extension and Flexion', 3, '20ea'], ['Bicep Curl', 3, '15+']]
};

// Phase 1 = weeks 1-8, Phase 2 = weeks 9-16, each a repeating 3-day split.
export const PROGRAM = {
  'Phase 1': [P1D1, P1D2, P1D3],
  'Phase 2': [P2D1, P2D2, P2D3]
};

// Renamed for correctness against the chart -- delete the old typo'd row so it
// doesn't linger in the library after a re-seed.
export const RENAMED_AWAY = ['10 Kneeling Windmill Press'];
