import { useMemo, useState } from 'react';
import { byCompletedDesc, completedSessions, exerciseMetrics, findPreviousExerciseSession } from '../utils/calculations';
import { todayIsoDate } from '../utils/date';

const defaultRecovery = {
  sleepQuality: 'goed',
  energyLevel: 'normaal',
  recoveryLevel: 'goed',
  stressLevel: 'laag',
  painLevel: 'geen',
  painLocation: '',
  notes: '',
};

function defaultSets(exercise) {
  if (Array.isArray(exercise.plannedSets) && exercise.plannedSets.length) {
    return exercise.plannedSets.map((set, index) => ({
      setNumber: set.setNumber || index + 1,
      weight: set.weight ?? (exercise.modality === 'strength' ? '' : 0),
      reps: set.reps ?? (['timed', 'carry'].includes(exercise.modality) ? 0 : exercise.targetRepMin),
      rir: set.rir ?? exercise.targetRirMax,
      ...(set.durationMinutes !== undefined ? { durationMinutes: set.durationMinutes } : {}),
      ...(set.distanceMeters !== undefined ? { distanceMeters: set.distanceMeters } : {}),
      notes: set.notes || '',
      completed: false,
    }));
  }

  return Array.from({ length: exercise.targetSets }, (_, index) => ({
    setNumber: index + 1,
    weight: exercise.modality === 'strength' ? '' : 0,
    reps: ['timed', 'carry'].includes(exercise.modality) ? 0 : exercise.targetRepMin,
    rir: exercise.targetRirMax,
    ...(exercise.modality === 'timed'
      ? { durationMinutes: exercise.targetDurationMinutes || 0 }
      : {}),
    ...(exercise.modality === 'carry'
      ? { distanceMeters: exercise.targetDistanceMeters || 0, durationMinutes: 0 }
      : {}),
    notes: '',
    completed: false,
  }));
}

function previousSets(previous, exercise) {
  if (!previous) return defaultSets(exercise);
  return previous.exercise.sets.map((set, index) => ({
    setNumber: index + 1,
    weight: set.weight === '' || set.weight === null || set.weight === undefined ? '' : Number(set.weight || 0),
    reps: Number(set.reps || (['timed', 'carry'].includes(exercise.modality) ? 0 : exercise.targetRepMin)),
    rir: Number(set.rir ?? exercise.targetRirMax),
    ...(set.durationMinutes !== undefined ? { durationMinutes: Number(set.durationMinutes || 0) } : {}),
    ...(set.distanceMeters !== undefined ? { distanceMeters: Number(set.distanceMeters || 0) } : {}),
    notes: set.notes || '',
    completed: false,
  }));
}

export function useWorkoutSession(program, sessions, initialDraft = null) {
  const previousByExercise = useMemo(() => {
    const entries = program.exercises.map((exercise) => [
      exercise.id,
      findPreviousForExercise(sessions, exercise),
    ]);
    return Object.fromEntries(entries);
  }, [program, sessions]);
  const [sourceLabels, setSourceLabels] = useState(() =>
    initialDraft?.sourceLabels ||
      Object.fromEntries(
        program.exercises.map((exercise) => [
          exercise.id,
          previousByExercise[exercise.id] ? 'Gebaseerd op vorige sessie' : 'Programma standaard',
        ]),
      ),
  );

  const [exerciseSessions, setExerciseSessions] = useState(() =>
    initialDraft?.exerciseSessions ||
      program.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroups: exercise.muscleGroups,
        modality: exercise.modality || 'strength',
        notes: '',
        sets: previousSets(previousByExercise[exercise.id], exercise),
      })),
  );

  const totalSets = exerciseSessions.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = exerciseSessions.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  );
  const completedExercises = exerciseSessions.filter((exercise) =>
    exercise.sets.some((set) => set.completed),
  ).length;

  function updateSet(exerciseId, setNumber, patch) {
    setExerciseSessions((current) =>
      current.map((exercise) =>
        exercise.exerciseId !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.setNumber === setNumber ? { ...set, ...patch } : set,
              ),
            },
      ),
    );
    if (!Object.prototype.hasOwnProperty.call(patch, 'completed')) {
      setSourceLabels((current) => ({ ...current, [exerciseId]: 'Aangepast' }));
    }
  }

  function applyExerciseSets(exerciseId, nextSets) {
    setExerciseSessions((current) =>
      current.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, sets: nextSets } : exercise,
      ),
    );
  }

  function updateExerciseNote(exerciseId, notes) {
    setExerciseSessions((current) =>
      current.map((exercise) => (exercise.exerciseId === exerciseId ? { ...exercise, notes } : exercise)),
    );
  }

  function restorePrevious(exercise) {
    applyExerciseSets(exercise.id, previousSets(previousByExercise[exercise.id], exercise));
    setSourceLabels((current) => ({
      ...current,
      [exercise.id]: previousByExercise[exercise.id] ? 'Gebaseerd op vorige sessie' : 'Programma standaard',
    }));
  }

  function addWeight(exerciseId, amount) {
    setExerciseSessions((current) =>
      current.map((exercise) =>
        exercise.exerciseId !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) => ({
                ...set,
                weight: Math.max(0, Number(set.weight || 0) + amount),
              })),
            },
      ),
    );
    setSourceLabels((current) => ({ ...current, [exerciseId]: '+2.5kg toegepast' }));
  }

  function resetExercise(exercise) {
    applyExerciseSets(exercise.id, defaultSets(exercise));
    setSourceLabels((current) => ({ ...current, [exercise.id]: 'Programma standaard' }));
  }

  function buildCompletedSession(recovery) {
    const now = new Date().toISOString();
    return {
      id: `session-${Date.now()}`,
      programId: program.id,
      programName: program.name,
      date: todayIsoDate(),
      completed: true,
      recovery: normalizeRecovery(recovery),
      exercises: exerciseSessions.map(cleanExerciseSession),
      createdAt: now,
      completedAt: now,
    };
  }

  return {
    exerciseSessions,
    previousByExercise,
    totalSets,
    completedSets,
    completedExercises,
    sourceLabels,
    updateSet,
    updateExerciseNote,
    restorePrevious,
    addWeight,
    resetExercise,
    buildCompletedSession,
  };
}

function findPreviousForExercise(sessions, exercise) {
  if (exercise.modality !== 'strength') return findPreviousExerciseSession(sessions, exercise.id);
  return completedSessions(sessions)
    .flatMap((session) =>
      session.exercises
        .filter((item) => item.exerciseId === exercise.id)
        .map((item) => ({ session, exercise: { ...item, modality: 'strength' } })),
    )
    .filter((item) => exerciseMetrics(item.exercise).hasValidWeightData)
    .sort((a, b) => byCompletedDesc(a.session, b.session))[0];
}

function normalizeRecovery(recovery = {}) {
  return {
    ...defaultRecovery,
    ...(recovery || {}),
    painLocation: recovery?.painLocation ?? '',
    notes: recovery?.notes ?? '',
  };
}

function cleanExerciseSession(exercise) {
  return {
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    muscleGroups: exercise.muscleGroups || [],
    modality: exercise.modality || 'strength',
    notes: exercise.notes || '',
    sets: (exercise.sets || []).map((set, index) => cleanSet(set, index, exercise.modality || 'strength')),
  };
}

function cleanSet(set, index, modality) {
  const clean = {
    setNumber: Number(set.setNumber || index + 1),
    completed: Boolean(set.completed),
    notes: set.notes || '',
  };

  if (set.effortLabel) clean.effortLabel = set.effortLabel;
  if (set.rir === null || set.rir === undefined || set.rir === '') clean.rir = null;
  else clean.rir = Number(set.rir);

  if (modality === 'timed') {
    clean.durationMinutes = normalizeNumber(set.durationMinutes, 0);
    return clean;
  }

  if (modality === 'carry') {
    clean.distanceMeters = normalizeNumber(set.distanceMeters, 0);
    clean.durationMinutes = normalizeNumber(set.durationMinutes, 0);
    clean.weight = normalizeWeight(set.weight, 0);
    return clean;
  }

  clean.weight = modality === 'strength' ? normalizeWeight(set.weight, '') : normalizeWeight(set.weight, 0);
  clean.reps = normalizeNumber(set.reps, 0);
  return clean;
}

function normalizeNumber(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeWeight(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}
