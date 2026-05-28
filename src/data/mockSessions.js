// Placeholder dates: the original logs did not include exact dates, so these ISO dates
// are temporary chronological anchors spaced a few days apart and can be edited later.

const muscleGroups = {
  cableRow2Arm: ['back', 'lats', 'biceps'],
  seatedRow: ['back', 'lats', 'biceps'],
  singleArmCableRow: ['back', 'lats', 'biceps'],
  rearDeltFly: ['rear delts', 'upper back'],
  latPulldown: ['lats', 'back', 'biceps'],
  bicepHammerCurl: ['biceps', 'forearms'],
  pulldownPump: ['lats', 'back', 'biceps'],
  chestPress: ['chest', 'triceps', 'shoulders'],
  inclineDumbbellPress: ['chest', 'shoulders', 'triceps'],
  cableFly: ['chest'],
  shoulderSideRaise: ['side delts', 'shoulders'],
  tricepExtension: ['triceps'],
  pushUp: ['chest', 'triceps', 'shoulders'],
};

const baseRecovery = {
  sleepQuality: 'oke',
  energyLevel: 'normaal',
  recoveryLevel: 'redelijk',
  stressLevel: 'normaal',
  painLevel: 'geen',
  painLocation: '',
  notes: '',
};

const set = (setNumber, values = {}) => ({
  setNumber,
  weight: values.weight ?? 0,
  reps: values.reps ?? 0,
  rir: values.rir ?? null,
  completed: true,
  ...(values.durationMinutes !== undefined ? { durationMinutes: values.durationMinutes } : {}),
  ...(values.distanceMeters !== undefined ? { distanceMeters: values.distanceMeters } : {}),
  ...(values.notes ? { notes: values.notes } : {}),
});

const exercise = (exerciseId, exerciseName, groups, sets, notes = '') => ({
  exerciseId,
  exerciseName,
  muscleGroups: groups,
  sets,
  ...(notes ? { notes } : {}),
});

const session = (id, programId, programName, date, exercises, recovery = {}, notes = '') => ({
  id,
  programId,
  programName,
  date,
  completed: true,
  recovery: { ...baseRecovery, ...recovery },
  exercises,
  ...(notes ? { notes } : {}),
  createdAt: `${date}T08:00:00.000Z`,
  completedAt: `${date}T09:10:00.000Z`,
});

export const mockSessions = [
  session('mock-training-b-1', 'training-b', 'Training B', '2026-04-24', [
    exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
      set(1, { weight: 45, reps: 12 }),
      set(2, { weight: 50, reps: 10 }),
      set(3, { weight: 55, reps: 10 }),
      set(4, { weight: 55, reps: 8 }),
    ]),
    exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
      set(1, { weight: 20, reps: 10 }),
      set(2, { weight: 20, reps: 10 }),
      set(3, { weight: 20, reps: 10 }),
    ]),
    exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
      set(1, { weight: 5, reps: 10 }),
      set(2, { weight: 5, reps: 10 }),
      set(3, { weight: 5, reps: 10 }),
    ], 'schouderhoogte 7'),
    exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
      set(1, { weight: 2.5, reps: 8 }),
      set(2, { weight: 2.5, reps: 8 }),
      set(3, { weight: 2.5, reps: 8 }),
    ]),
    exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
      set(1, { weight: 20, reps: 15, notes: 'Tricep Extension Rope' }),
      set(2, { weight: 20, reps: 12, notes: 'Tricep Extension Rope' }),
      set(3, { weight: 20, reps: 15, notes: 'Tricep Extension Rope' }),
    ]),
  ]),
  session(
    'mock-training-a-1',
    'training-a',
    'Training A',
    '2026-04-26',
    [
      exercise('cable-row-2-arm', 'Cable Row 2 Arm', muscleGroups.cableRow2Arm, [
        set(1, { weight: 35, reps: 9 }),
        set(2, { weight: 35, reps: 10 }),
        set(3, { weight: 35, reps: 10 }),
      ]),
      exercise('seated-row', 'Seated Row', muscleGroups.seatedRow, [
        set(1, { weight: 140, reps: 10, notes: '4th set only was logged' }),
      ], 'Only the 4th set was logged. Earlier sets are unknown.'),
    ],
  ),
  session(
    'mock-training-b-2',
    'training-b',
    'Training B',
    '2026-04-29',
    [
      exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
        set(1, { weight: 50, reps: 8, notes: 'elleboog begon te verzuren bij 7' }),
        set(2, { weight: 50, reps: 12, notes: 'geen elleboog last' }),
        set(3, { weight: 50, reps: 12 }),
      ]),
      exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
        set(1, { weight: 20, reps: 8 }),
        set(2, { weight: 20, reps: 10 }),
      ]),
    ],
    {
      painLevel: 'licht',
      painLocation: 'elleboog/onderarm',
      notes:
        'Before chest press, user did tricep pushdowns with low reps and low weight. First chest press set had elbow/forearm fatigue around rep 7. More rest next time before first set.',
    },
    'Tricep pushdowns vooraf; meer rust nemen voor eerste chest press set.',
  ),
  session('mock-training-a-2', 'training-a', 'Training A', '2026-05-01', [
    exercise('cable-row-2-arm', 'Cable Row 2 Arm', muscleGroups.cableRow2Arm, [
      set(1, { weight: 35, reps: 10 }),
      set(2, { weight: 40, reps: 10 }),
      set(3, { weight: 40, reps: 10 }),
    ]),
    exercise('seated-row', 'Seated Row', muscleGroups.seatedRow, [
      set(1, { weight: 150, reps: 10 }),
      set(2, { weight: 150, reps: 10 }),
      set(3, { weight: 150, reps: 10 }),
      set(4, { weight: 150, reps: 10 }),
    ]),
    exercise('single-arm-cable-row', 'Single Arm Cable Row', muscleGroups.singleArmCableRow, [
      set(1, { weight: 25, reps: 10 }),
      set(2, { weight: 20, reps: 10, notes: 'better connection than 25kg' }),
      set(3, { weight: 20, reps: 12 }),
      set(4, { weight: 20, reps: 12 }),
    ]),
    exercise('rear-delt-fly', 'Rear Delt Fly', muscleGroups.rearDeltFly, [
      set(1, { weight: 22.5, reps: 15 }),
    ]),
    exercise('lat-pulldown', 'Lat Pulldown', muscleGroups.latPulldown, [
      set(1, { weight: 20, reps: 12 }),
    ]),
    exercise('bicep-hammer-curl', 'Bicep Hammer Curl', muscleGroups.bicepHammerCurl, [
      set(1, { weight: 8, reps: 12 }),
      set(2, { weight: 8, reps: 12 }),
      set(3, { weight: 8, reps: 12 }),
    ]),
    exercise('pulldown-pump', 'Pulldown Pump', muscleGroups.pulldownPump, [
      set(1, { weight: 20, reps: 0, notes: 'original was 3x@20, reps unknown' }),
      set(2, { weight: 20, reps: 0, notes: 'original was 3x@20, reps unknown' }),
      set(3, { weight: 20, reps: 0, notes: 'original was 3x@20, reps unknown' }),
    ]),
  ]),
  session(
    'mock-training-b-3',
    'training-b',
    'Training B',
    '2026-05-04',
    [
      exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
        set(1, { weight: 50, reps: 12, notes: 'uncertain, original: ?12x50?' }),
        set(2, { weight: 50, reps: 12 }),
        set(3, { weight: 50, reps: 10, rir: 2 }),
        set(4, { weight: 50, reps: 12, notes: 'onderarm bij elleboog begon te verzuren' }),
        set(5, { weight: 12, reps: 10, rir: 0, notes: 'original text unclear: 10x12(max)' }),
      ]),
      exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
        set(1, { weight: 20, reps: 10 }),
        set(2, { weight: 20, reps: 10 }),
        set(3, { weight: 20, reps: 10 }),
      ]),
      exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
        set(1, { weight: 5, reps: 12 }),
        set(2, { weight: 5, reps: 12 }),
        set(3, { weight: 5, reps: 12 }),
      ], 'schouderhoogte 7'),
      exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
        set(1, { weight: 5, reps: 8 }),
        set(2, { weight: 5, reps: 8 }),
        set(3, { weight: 5, reps: 8 }),
      ]),
      exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
        set(1, { weight: 20, reps: 20 }),
        set(2, { weight: 27.5, reps: 15 }),
        set(3, { weight: 27.5, reps: 15 }),
      ]),
    ],
    {
      sleepQuality: 'slecht',
      energyLevel: 'moe',
      painLevel: 'matig',
      painLocation: 'buik',
      notes: 'slaap slecht; veel wakker; buikpijn; wc',
    },
  ),
  session('mock-training-a-3', 'training-a', 'Training A', '2026-05-06', [
    exercise('seated-row', 'Seated Row', muscleGroups.seatedRow, [
      set(1, { weight: 140, reps: 12 }),
      set(2, { weight: 140, reps: 12 }),
      set(3, { weight: 140, reps: 12 }),
      set(4, { weight: 160, reps: 10 }),
    ]),
    exercise('single-arm-cable-row', 'Single Arm Cable Row', muscleGroups.singleArmCableRow, [
      set(1, { weight: 20, reps: 12 }),
      set(2, { weight: 22.5, reps: 12 }),
      set(3, { weight: 25, reps: 12 }),
      set(4, { weight: 25, reps: 12 }),
    ]),
    exercise('rear-delt-fly', 'Rear Delt Fly', muscleGroups.rearDeltFly, [
      set(1, { weight: 23, reps: 15 }),
    ]),
    exercise('lat-pulldown', 'Lat Pulldown', muscleGroups.latPulldown, [
      set(1, { weight: 22.5, reps: 12 }),
    ]),
    exercise('bicep-hammer-curl', 'Bicep Hammer Curl', muscleGroups.bicepHammerCurl, [
      set(1, { weight: 10, reps: 12 }),
      set(2, { weight: 10, reps: 10 }),
      set(3, { weight: 10, reps: 12 }),
    ]),
    exercise('pulldown-pump', 'Pulldown Pump', muscleGroups.pulldownPump, [
      set(1, { weight: 30, reps: 20 }),
      set(2, { weight: 30, reps: 20 }),
      set(3, { weight: 30, reps: 20 }),
    ]),
  ]),
  session('mock-training-b-4', 'training-b', 'Training B', '2026-05-09', [
    exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
      set(1, { weight: 50, reps: 12 }),
      set(2, { weight: 50, reps: 12 }),
      set(3, { weight: 50, reps: 12 }),
      set(4, { weight: 50, reps: 12 }),
    ]),
    exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
      set(1, { weight: 20, reps: 10 }),
      set(2, { weight: 20, reps: 10 }),
    ]),
    exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
      set(1, { weight: 7.5, reps: 12 }),
      set(2, { weight: 7.5, reps: 12 }),
      set(3, { weight: 7.5, reps: 12 }),
    ], 'schouderhoogte 10'),
    exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
      set(1, { weight: 5, reps: 10 }),
      set(2, { weight: 5, reps: 10 }),
      set(3, { weight: 5, reps: 10 }),
    ]),
    exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
      set(1, { weight: 10, reps: 10, notes: 'Single Arm Tricep Extension' }),
      set(2, { weight: 10, reps: 10, notes: 'Single Arm Tricep Extension' }),
      set(3, { weight: 10, reps: 10, notes: 'Single Arm Tricep Extension' }),
    ]),
  ]),
  session('mock-training-a-4', 'training-a', 'Training A', '2026-05-11', [
    exercise('seated-row', 'Seated Row', muscleGroups.seatedRow, [
      set(1, { weight: 150, reps: 12 }),
      set(2, { weight: 150, reps: 12 }),
      set(3, { weight: 150, reps: 12 }),
      set(4, { weight: 160, reps: 12 }),
      set(5, { weight: 160, reps: 12 }),
    ]),
    exercise('single-arm-cable-row', 'Single Arm Cable Row', muscleGroups.singleArmCableRow, [
      set(1, { weight: 22.5, reps: 12 }),
      set(2, { weight: 22.5, reps: 12 }),
      set(3, { weight: 25, reps: 12 }),
      set(4, { weight: 25, reps: 12 }),
    ]),
    exercise('rear-delt-fly', 'Rear Delt Fly', muscleGroups.rearDeltFly, [
      set(1, { weight: 22.5, reps: 15 }),
      set(2, { weight: 25, reps: 15 }),
      set(3, { weight: 25, reps: 15 }),
    ]),
    exercise('lat-pulldown', 'Lat Pulldown', muscleGroups.latPulldown, [
      set(1, { weight: 22.5, reps: 15 }),
      set(2, { weight: 27.5, reps: 15 }),
      set(3, { weight: 27.5, reps: 15 }),
    ]),
    exercise('bicep-hammer-curl', 'Bicep Hammer Curl', muscleGroups.bicepHammerCurl, [
      set(1, { weight: 12, reps: 12 }),
      set(2, { weight: 12, reps: 12, rir: 0, notes: 'failure' }),
      set(3, { weight: 12, reps: 12, rir: 0, notes: 'failure' }),
    ]),
    exercise('pulldown-pump', 'Pulldown Pump', muscleGroups.pulldownPump, [
      set(1, { weight: 27.5, reps: 20 }),
      set(2, { weight: 30, reps: 20 }),
      set(3, { weight: 30, reps: 20 }),
    ]),
  ]),
  session('mock-training-b-5', 'training-b', 'Training B', '2026-05-14', [
    exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
      set(1, { weight: 55, reps: 10, rir: 3, notes: 'RIR 2-3' }),
      set(2, { weight: 55, reps: 10, rir: 2 }),
      set(3, { weight: 55, reps: 10, rir: 1 }),
      set(4, { weight: 55, reps: 10, rir: 0, notes: 'max' }),
    ]),
    exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
      set(1, { weight: 20, reps: 12, notes: '30 degrees' }),
      set(2, { weight: 20, reps: 10, notes: '15 degrees' }),
    ]),
    exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
      set(1, { weight: 10, reps: 12 }),
      set(2, { weight: 10, reps: 15 }),
      set(3, { weight: 10, reps: 13 }),
    ], 'schouderhoogte 10'),
    exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
      set(1, { weight: 5, reps: 11 }),
      set(2, { weight: 5, reps: 10 }),
      set(3, { weight: 5, reps: 10 }),
    ]),
    exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
      set(1, { weight: 27.5, reps: 15 }),
      set(2, { weight: 27.5, reps: 15 }),
      set(3, { weight: 27.5, reps: 15 }),
    ]),
  ]),
  session(
    'mock-training-a-5',
    'training-a',
    'Training A',
    '2026-05-16',
    [
      exercise('seated-row', 'Seated Row', muscleGroups.seatedRow, [
        set(1, { weight: 150, reps: 12 }),
        set(2, { weight: 160, reps: 12 }),
        set(3, { weight: 160, reps: 12 }),
        set(4, { weight: 160, reps: 15 }),
      ]),
      exercise('single-arm-cable-row', 'Single Arm Cable Row', muscleGroups.singleArmCableRow, [
        set(1, { weight: 22.5, reps: 12 }),
        set(2, { weight: 22.5, reps: 12 }),
        set(3, { weight: 25, reps: 12 }),
        set(4, { weight: 20, reps: 12 }),
      ]),
      exercise('rear-delt-fly', 'Rear Delt Fly', muscleGroups.rearDeltFly, [
        set(1, { weight: 25, reps: 15 }),
        set(2, { weight: 27.5, reps: 15 }),
        set(3, { weight: 27.5, reps: 15 }),
      ]),
      exercise('lat-pulldown', 'Lat Pulldown', muscleGroups.latPulldown, [
        set(1, { weight: 27.5, reps: 15 }),
        set(2, { weight: 35, reps: 10 }),
        set(3, { weight: 35, reps: 12 }),
      ]),
      exercise('bicep-hammer-curl', 'Bicep Hammer Curl', muscleGroups.bicepHammerCurl, [
        set(1, { weight: 12, reps: 12 }),
        set(2, { weight: 12, reps: 12 }),
        set(3, { weight: 12, reps: 12 }),
      ]),
      exercise('pulldown-pump', 'Pulldown Pump', muscleGroups.pulldownPump, [
        set(1, { weight: 36.25, reps: 20 }),
        set(2, { weight: 36.25, reps: 15, rir: 0, notes: 'failure, biceps close to maxing' }),
        set(3, { weight: 36.25, reps: 20, rir: 3, notes: 'RIR 2-3' }),
      ], 'take more rest between biceps and pulldown'),
    ],
    {
      notes: 'Take more rest between biceps and pulldown.',
    },
  ),
  session(
    'mock-training-b-6',
    'training-b',
    'Training B',
    '2026-05-21',
    [
      exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
        set(1, { weight: 55, reps: 11, rir: 3, notes: 'RIR 2-3' }),
        set(2, { weight: 55, reps: 11, rir: 2 }),
        set(3, { weight: 55, reps: 10, rir: 1 }),
        set(4, { weight: 55, reps: 11, rir: 0, notes: 'max' }),
      ]),
      exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
        set(1, { weight: 20, reps: 11, notes: '15 degrees' }),
        set(2, { weight: 20, reps: 11, notes: '15 degrees' }),
        set(3, { weight: 20, reps: 11, notes: '15 degrees' }),
      ]),
      exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
        set(1, { weight: 10, reps: 12 }),
        set(2, { weight: 10, reps: 12 }),
        set(3, { weight: 10, reps: 13 }),
      ], 'schouderhoogte 10'),
      exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
        set(1, { weight: 5, reps: 8 }),
        set(2, { weight: 5, reps: 10 }),
        set(3, { weight: 5, reps: 10 }),
      ]),
      exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
        set(1, { weight: 27.5, reps: 20 }),
        set(2, { weight: 27.5, reps: 20 }),
        set(3, { weight: 27.5, reps: 20 }),
      ]),
    ],
    {
      sleepQuality: 'goed',
      energyLevel: 'moe',
      notes: 'goed doorgeslapen; moe tijdens training; gapen; suf',
    },
  ),
  session(
    'mock-training-b-7',
    'training-b',
    'Training B',
    '2026-05-26',
    [
      exercise('chest-press', 'Chest Press', muscleGroups.chestPress, [
        set(1, { weight: 55, reps: 12 }),
        set(2, { weight: 55, reps: 12, rir: 2 }),
        set(3, { weight: 55, reps: 12, rir: 1 }),
        set(4, { weight: 55, reps: 12, rir: 0, notes: 'max' }),
      ]),
      exercise('incline-dumbbell-press', 'Incline Dumbbell Press', muscleGroups.inclineDumbbellPress, [
        set(1, { weight: 22, reps: 8 }),
        set(2, { weight: 22, reps: 9 }),
        set(3, { weight: 22, reps: 9 }),
      ]),
      exercise('cable-fly', 'Cable Fly', muscleGroups.cableFly, [
        set(1, { weight: 7.5, reps: 12 }),
        set(2, { weight: 7.5, reps: 12 }),
        set(3, { weight: 7.5, reps: 12 }),
      ], 'schouderhoogte 10'),
      exercise('shoulder-side-raise', 'Shoulder Side Raise', muscleGroups.shoulderSideRaise, [
        set(1, { weight: 5, reps: 10 }),
        set(2, { weight: 5, reps: 10 }),
        set(3, { weight: 5, reps: 10 }),
      ]),
      exercise('tricep-extension', 'Tricep Extension', muscleGroups.tricepExtension, [
        set(1, { weight: 29, reps: 20 }),
        set(2, { weight: 29, reps: 20 }),
        set(3, { weight: 29, reps: 20 }),
      ]),
      exercise('push-up', 'Push-up', muscleGroups.pushUp, [
        set(1, { weight: 0, reps: 12 }),
        set(2, { weight: 0, reps: 12, rir: 0, notes: 'max' }),
        set(3, { weight: 0, reps: 7, rir: 0, notes: 'failure around rep 8, strict 1 min rest' }),
      ], 'failure around rep 8, strict 1 min rest'),
    ],
    {
      sleepQuality: 'goed',
      notes: 'goed doorgeslapen',
    },
  ),
];
