import {
  differenceInCalendarDays,
  endOfWeek,
  isSameMonth,
  isSameWeek,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';

export function completedSessions(sessions) {
  return sessions.filter((session) => session.completed);
}

export function byCompletedDesc(a, b) {
  return new Date(b.completedAt || b.createdAt || b.date) - new Date(a.completedAt || a.createdAt || a.date);
}

export function sessionSortValue(session) {
  return new Date(session.completedAt || session.createdAt || `${session.date}T00:00:00`).getTime();
}

export function isValidWeightedSet(set, modality = 'strength') {
  const weight = Number(set.weight || 0);
  const reps = Number(set.reps || 0);
  if (modality === 'strength') return weight > 0 && reps > 0;
  if (modality === 'bodyweight') return weight > 0 && reps > 0;
  return false;
}

export function hasMissingStrengthWeight(set, modality = 'strength') {
  return modality === 'strength' && set.completed && Number(set.reps || 0) > 0 && Number(set.weight || 0) <= 0;
}

export function setVolume(set, modality = 'strength') {
  const weight = Number(set.weight || 0);
  const reps = Number(set.reps || 0);
  if (modality === 'timed') return 0;
  if (modality === 'carry') {
    const distance = Number(set.distanceMeters || 0);
    return weight > 0 && distance > 0 ? weight * distance : 0;
  }
  if (!isValidWeightedSet(set, modality)) return 0;
  return weight * reps;
}

export function estimatedOneRm(set, modality = 'strength') {
  const weight = Number(set.weight || 0);
  const reps = Number(set.reps || 0);
  if (!isValidWeightedSet(set, modality)) return 0;
  return weight * (1 + reps / 30);
}

export function isMaxSet(set) {
  return set.effortLabel === 'max' || set.rir === 0 || /max|failure/i.test(set.notes || '');
}

export function getSetEffortScore(set) {
  if (!set || !set.completed) return null;
  if (set.effortLabel === 'max') return 100;
  const rir = Number(set.rir);
  if (!Number.isFinite(rir)) return null;
  if (rir === 0) return 100;
  if (rir === 1) return 94;
  if (rir === 2) return 87;
  if (rir === 3) return 80;
  if (rir === 4) return 70;
  return null;
}

export function getExerciseSessionEffort(exerciseSession) {
  const scores = exerciseSession.sets
    .filter((set) => set.completed)
    .map(getSetEffortScore)
    .filter((score) => score !== null);
  return scores.length ? Math.round(average(scores)) : null;
}

export function getSessionEffort(session) {
  const scores = session.exercises.flatMap((exercise) =>
    exercise.sets
      .filter((set) => set.completed)
      .map(getSetEffortScore)
      .filter((score) => score !== null),
  );
  return scores.length ? Math.round(average(scores)) : null;
}

export function formatSetPerformance(set, modality = 'strength') {
  if (!set) return modality === 'strength' ? 'Gewicht ontbreekt' : 'Geen set';
  if (modality === 'timed') return `${Number(set.durationMinutes || 0)} min`;
  if (modality === 'carry') {
    const weight = Number(set.weight || 0) ? ` @ ${set.weight}kg` : '';
    const duration = Number(set.durationMinutes || 0) ? ` · ${set.durationMinutes} min` : '';
    return `${Number(set.distanceMeters || 0)}m${weight}${duration}`;
  }
  const weight = Number(set.weight || 0);
  const reps = Number(set.reps || 0);
  const load = modality === 'bodyweight' ? (weight ? `+${weight}kg ` : '') : `${weight || '?'}kg x `;
  const rir = Number(set.rir);
  const effort = isMaxSet(set) ? ' MAX' : Number.isFinite(rir) ? ` @RIR${rir}` : '';
  return `${load}${reps || '?'}${modality === 'bodyweight' ? ' reps' : ''}${effort}`;
}

export function exerciseVolume(exerciseSession) {
  const modality = exerciseSession.modality || inferModality(exerciseSession);
  return exerciseSession.sets
    .filter((set) => set.completed)
    .reduce((total, set) => total + setVolume(set, modality), 0);
}

export function totalReps(exerciseSession) {
  return exerciseSession.sets
    .filter((set) => set.completed)
    .reduce((total, set) => total + Number(set.reps || 0), 0);
}

export function bestExerciseSet(exerciseSession) {
  const modality = exerciseSession.modality || inferModality(exerciseSession);
  if (modality === 'timed' || modality === 'carry') return null;
  if (modality === 'bodyweight') {
    return [...exerciseSession.sets]
      .filter((set) => set.completed && Number(set.reps || 0) > 0)
      .sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0) || Number(b.reps || 0) - Number(a.reps || 0))[0] || null;
  }
  const valid = exerciseSession.sets.filter((set) => set.completed && isValidWeightedSet(set, modality));
  return [...valid].sort((a, b) => estimatedOneRm(b, modality) - estimatedOneRm(a, modality))[0] || null;
}

export function exerciseOneRm(exerciseSession) {
  const modality = exerciseSession.modality || inferModality(exerciseSession);
  const bestSet = bestExerciseSet(exerciseSession);
  return bestSet ? estimatedOneRm(bestSet, modality) : 0;
}

export function exerciseMetrics(exerciseSession) {
  const modality = exerciseSession.modality || inferModality(exerciseSession);
  const completed = exerciseSession.sets.filter((set) => set.completed);
  const validStrength = completed.filter((set) => isValidWeightedSet(set, modality));
  const heaviestSet = [...validStrength].sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0) || Number(b.reps || 0) - Number(a.reps || 0))[0] || null;
  const bestSet = bestExerciseSet(exerciseSession);
  const rirValues = completed.map((set) => set.rir).filter((rir) => typeof rir === 'number');
  const averageRir = rirValues.length
    ? Math.round((rirValues.reduce((total, rir) => total + rir, 0) / rirValues.length) * 10) / 10
    : null;
  const averageEffort = getExerciseSessionEffort(exerciseSession);

  return {
    totalSets: completed.length,
    totalReps: totalReps(exerciseSession),
    totalVolume: Math.round(exerciseVolume(exerciseSession)),
    heaviestSet,
    bestSet,
    bestOneRm: Math.round(exerciseOneRm(exerciseSession) * 10) / 10,
    averageRir,
    averageEffort,
    maxSets: completed.filter(isMaxSet).length,
    highEffortSets: completed.filter((set) => Number(getSetEffortScore(set) || 0) >= 90).length,
    missingWeightSets: completed.filter((set) => hasMissingStrengthWeight(set, modality)).length,
    hasValidWeightData: modality !== 'strength' || validStrength.length > 0,
    durationMinutes: completed.reduce((total, set) => total + Number(set.durationMinutes || 0), 0),
    distanceMeters: completed.reduce((total, set) => total + Number(set.distanceMeters || 0), 0),
  };
}

export function findLatestProgramSession(sessions, programId) {
  return completedSessions(sessions)
    .filter((session) => session.programId === programId)
    .sort(byCompletedDesc)[0];
}

export function findPreviousExerciseSession(sessions, exerciseId) {
  return completedSessions(sessions)
    .flatMap((session) =>
      session.exercises
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .map((exercise) => ({ session, exercise })),
    )
    .sort((a, b) => byCompletedDesc(a.session, b.session))[0];
}

export function buildExerciseHistory(sessions, exerciseId, programId = 'all', programs = []) {
  const modalityByExercise = buildProgramExerciseMap(programs);
  const rows = completedSessions(sessions)
    .filter((session) => programId === 'all' || session.programId === programId)
    .flatMap((session) =>
      session.exercises
        .filter((exercise) => exerciseId === 'all' || exercise.exerciseId === exerciseId)
        .map((exercise) => {
          const modality = exercise.modality || modalityByExercise[exercise.exerciseId]?.modality || inferModality(exercise);
          const normalizedExercise = { ...exercise, modality };
          const metrics = exerciseMetrics(normalizedExercise);
          return {
            id: `${session.id}-${exercise.exerciseId}`,
            sessionId: session.id,
            date: session.date,
            completedAt: session.completedAt || session.createdAt || `${session.date}T00:00:00`,
            label: session.date.slice(5),
            programName: session.programName,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroups: exercise.muscleGroups || [],
            modality,
            notes: collectNotes(session, exercise),
            sessionRecovery: session.recovery,
            rawSession: session,
            rawExercise: normalizedExercise,
            ...metrics,
            incomplete: isIncompleteStrengthExercise(normalizedExercise, programs) || isIncompleteTestSession(session, programs),
            weight: Number(metrics.heaviestSet?.weight || 0),
            reps: metrics.totalReps,
            volume: metrics.totalVolume,
            oneRm: metrics.bestOneRm,
            effort: metrics.averageEffort,
          };
        }),
    )
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  return addPrBadges(rows);
}

export function isIncompleteStrengthExercise(exercise, programs = []) {
  const modalityByExercise = buildProgramExerciseMap(programs);
  const modality = exercise.modality || modalityByExercise[exercise.exerciseId]?.modality || inferModality(exercise);
  if (modality !== 'strength') return false;
  const completed = exercise.sets.filter((set) => set.completed && Number(set.reps || 0) > 0);
  if (!completed.length) return false;
  const missing = completed.filter((set) => hasMissingStrengthWeight(set, 'strength')).length;
  return missing / completed.length >= 0.5;
}

export function isIncompleteTestSession(session, programs = []) {
  if (!session?.completed) return false;
  const exercises = session.exercises || [];
  const totalRepsValue = exercises.reduce((total, exercise) => total + totalReps(exercise), 0);
  if (totalRepsValue <= 0) return true;

  const modalityByExercise = buildProgramExerciseMap(programs);
  const strengthExercisesInSession = exercises.filter((exercise) => {
    const modality = exercise.modality || modalityByExercise[exercise.exerciseId]?.modality || inferModality(exercise);
    return modality === 'strength';
  });
  const validWeightedSets = strengthExercisesInSession.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed && isValidWeightedSet(set, 'strength')).length,
    0,
  );
  if (strengthExercisesInSession.length && validWeightedSets <= 0) return true;
  const completedStrengthSets = strengthExercisesInSession.flatMap((exercise) =>
    exercise.sets.filter((set) => set.completed && Number(set.reps || 0) > 0),
  );
  if (completedStrengthSets.length) {
    const missingStrengthSets = completedStrengthSets.filter((set) => hasMissingStrengthWeight(set, 'strength')).length;
    if (missingStrengthSets / completedStrengthSets.length >= 0.5) return true;
  }

  const strengthExercises = session.exercises.filter((exercise) => {
    return (exercise.modality || modalityByExercise[exercise.exerciseId]?.modality || inferModality(exercise)) === 'strength';
  });
  if (!strengthExercises.length) return false;
  const incomplete = strengthExercises.filter((exercise) => isIncompleteStrengthExercise(exercise, programs)).length;
  return incomplete / strengthExercises.length >= 0.5;
}

export function buildExerciseSeries(sessions, exerciseId, programId = 'all', programs = []) {
  return buildExerciseHistory(sessions, exerciseId, programId, programs);
}

export function compareLatest(history) {
  if (history.length < 2) return null;
  const previous = history[history.length - 2];
  const latest = history[history.length - 1];
  return {
    latest,
    previous,
    volume: compareMetric(latest.totalVolume, previous.totalVolume),
    reps: compareMetric(latest.totalReps, previous.totalReps),
    oneRm: compareMetric(latest.bestOneRm, previous.bestOneRm),
    effort: compareOptionalMetric(latest.averageEffort, previous.averageEffort),
    bestSet: {
      from: formatSetPerformance(previous.bestSet, previous.modality),
      to: formatSetPerformance(latest.bestSet, latest.modality),
      label: compareLabel(latest.bestOneRm, previous.bestOneRm),
    },
  };
}

function compareMetric(latest, previous) {
  const diff = Math.round((Number(latest || 0) - Number(previous || 0)) * 10) / 10;
  return { diff, label: compareLabel(latest, previous) };
}

function compareOptionalMetric(latest, previous) {
  if (latest === null || latest === undefined || previous === null || previous === undefined) {
    return { diff: null, label: 'Geen RIR-data', latest, previous };
  }
  return { ...compareMetric(latest, previous), latest, previous };
}

function compareLabel(latest, previous) {
  if (Number(latest || 0) > Number(previous || 0)) return 'Omhoog';
  if (Number(latest || 0) < Number(previous || 0)) return 'Omlaag';
  return 'Gelijk';
}

function addPrBadges(rows) {
  const best = { weight: 0, oneRm: 0, volume: 0, repsAtWeight: {} };
  return rows.map((row) => {
    const badges = [];
    const bestWeight = Number(row.heaviestSet?.weight || 0);
    const bestReps = Number(row.heaviestSet?.reps || 0);
    if (row.modality !== 'strength' && row.modality !== 'bodyweight') {
      return { ...row, prBadges: badges };
    }
    if (bestWeight && bestWeight > best.weight) {
      badges.push('Gewicht PR');
      best.weight = bestWeight;
    }
    if (bestWeight && bestReps && bestReps > (best.repsAtWeight[bestWeight] || 0)) {
      badges.push('Reps PR');
      best.repsAtWeight[bestWeight] = bestReps;
    }
    if (row.totalVolume && row.totalVolume > best.volume) {
      badges.push('Volume PR');
      best.volume = row.totalVolume;
    }
    if (row.bestOneRm && row.bestOneRm > best.oneRm) {
      badges.push('e1RM PR');
      best.oneRm = row.bestOneRm;
    }
    return { ...row, prBadges: badges };
  });
}

function collectNotes(session, exercise) {
  return [
    exercise.notes,
    ...exercise.sets.map((set) => set.notes),
    session.recovery?.notes,
    session.notes,
  ].filter(Boolean);
}

function inferModality(exercise) {
  if (exercise.sets.some((set) => set.durationMinutes && !set.reps)) return 'timed';
  if (exercise.sets.some((set) => set.distanceMeters)) return 'carry';
  if (exercise.sets.every((set) => !Number(set.weight || 0))) return 'bodyweight';
  return 'strength';
}

function buildProgramExerciseMap(programs) {
  const map = {};
  programs.forEach((program) => {
    program.exercises.forEach((exercise) => {
      map[exercise.id] = exercise;
    });
  });
  return map;
}

export function readinessScore(recovery) {
  if (!recovery) return 7;
  let score = 7;
  if (recovery.sleepQuality === 'goed') score += 1;
  if (recovery.sleepQuality === 'slecht') score -= 2;
  if (recovery.energyLevel === 'fit') score += 1;
  if (recovery.energyLevel === 'moe') score -= 2;
  if (recovery.recoveryLevel === 'goed') score += 1;
  if (recovery.recoveryLevel === 'slecht') score -= 2;
  if (recovery.stressLevel === 'hoog') score -= 2;
  if (recovery.stressLevel === 'laag') score += 1;
  if (recovery.painLevel === 'licht') score -= 1;
  if (recovery.painLevel === 'matig') score -= 2;
  if (recovery.painLevel === 'hoog') score -= 3;
  return Math.max(1, Math.min(10, score));
}

export function insightMetrics(sessions) {
  const done = completedSessions(sessions).sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const previousWeekStart = subWeeks(weekStart, 1);
  const previousWeekEnd = subWeeks(weekEnd, 1);
  const weekSessions = done.filter((session) => isSameWeek(parseISO(session.date), today, { weekStartsOn: 1 }));
  const previousWeekSessions = done.filter((session) => {
    const date = parseISO(session.date);
    return date >= previousWeekStart && date <= previousWeekEnd;
  });
  const monthSessions = done.filter((session) => isSameMonth(parseISO(session.date), today));
  const latest = [...done].sort(byCompletedDesc)[0];
  const latestMetrics = latest ? sessionMetrics(latest) : null;
  const weeklyMetrics = aggregateSessions(weekSessions);
  const previousWeeklyMetrics = aggregateSessions(previousWeekSessions);
  const recoveryRelation = buildRecoveryRelation(done);
  const performanceDrop = detectPerformanceDrop(done);
  const repeatedPain = done.filter((session) => ['matig', 'hoog'].includes(session.recovery?.painLevel)).length;
  const volumeJump =
    previousWeeklyMetrics.volume > 0 && weeklyMetrics.volume > previousWeeklyMetrics.volume * 1.35;
  const attentionPoints = buildAttentionPoints({
    weeklyMetrics,
    previousWeeklyMetrics,
    weekSessions,
    latest,
    performanceDrop,
    repeatedPain,
    volumeJump,
  });

  return {
    weekCount: weekSessions.length,
    monthCount: monthSessions.length,
    completedCount: done.length,
    latestTraining: latest,
    latestMetrics,
    weeklyHardSets: weeklyMetrics.hardSets,
    weeklyMaxSets: weeklyMetrics.maxSets,
    weeklyHighEffortSets: weeklyMetrics.highEffortSets,
    weeklyAverageEffort: weeklyMetrics.averageEffort,
    weeklyVolume: weeklyMetrics.volume,
    muscleRows: Object.values(weeklyMetrics.muscles).sort((a, b) => b.hardSets - a.hardSets),
    readiness: readinessScore(latest?.recovery),
    latestRecovery: latest?.recovery,
    prs: buildPrOverview(done),
    performanceDrop,
    recoveryRelation,
    attentionPoints,
  };
}

function sessionMetrics(session) {
  const result = session.exercises.reduce(
    (acc, exercise) => {
      const metrics = exerciseMetrics(exercise);
      acc.exercises += 1;
      acc.sets += metrics.totalSets;
      acc.reps += metrics.totalReps;
      acc.volume += metrics.totalVolume;
      acc.maxSets += metrics.maxSets;
      acc.highEffortSets += metrics.highEffortSets;
      return acc;
    },
    { exercises: 0, sets: 0, reps: 0, volume: 0, maxSets: 0, highEffortSets: 0 },
  );
  result.averageEffort = getSessionEffort(session);
  return result;
}

function aggregateSessions(sessions) {
  const aggregate = {
    volume: 0,
    hardSets: 0,
    maxSets: 0,
    highEffortSets: 0,
    reps: 0,
    effortTotal: 0,
    effortCount: 0,
    averageEffort: null,
    muscles: {},
  };
  sessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const modality = exercise.modality || inferModality(exercise);
      const groups = exercise.muscleGroups || [];
      exercise.sets
        .filter((set) => set.completed)
        .forEach((set) => {
          const volume = setVolume(set, modality);
          const effort = getSetEffortScore(set);
          aggregate.volume += volume;
          aggregate.reps += Number(set.reps || 0);
          const rir = Number(set.rir);
          if (Number.isFinite(rir) && rir <= 3) aggregate.hardSets += 1;
          if (isMaxSet(set)) aggregate.maxSets += 1;
          if (effort !== null) {
            aggregate.effortTotal += effort;
            aggregate.effortCount += 1;
            if (effort >= 90) aggregate.highEffortSets += 1;
          }
          groups.forEach((group) => {
            aggregate.muscles[group] ||= { group, hardSets: 0, reps: 0, volume: 0 };
            if (Number.isFinite(rir) && rir <= 3) aggregate.muscles[group].hardSets += 1;
            aggregate.muscles[group].reps += Number(set.reps || 0);
            aggregate.muscles[group].volume += volume;
          });
        });
    });
  });
  aggregate.volume = Math.round(aggregate.volume);
  aggregate.averageEffort = aggregate.effortCount ? Math.round(aggregate.effortTotal / aggregate.effortCount) : null;
  Object.values(aggregate.muscles).forEach((row) => {
    row.volume = Math.round(row.volume);
  });
  return aggregate;
}

function buildRecoveryRelation(sessions) {
  const poorSleep = sessions.filter((session) => session.recovery?.sleepQuality === 'slecht');
  if (sessions.length < 4 || poorSleep.length < 1) return 'Meer data nodig voor herstelanalyse.';
  const poorAverage = average(poorSleep.map((session) => sessionMetrics(session).volume));
  const otherAverage = average(
    sessions
      .filter((session) => session.recovery?.sleepQuality !== 'slecht')
      .map((session) => sessionMetrics(session).volume),
  );
  if (!otherAverage) return `Slechte slaap kwam voor bij ${poorSleep.length} sessies.`;
  const relation = poorAverage < otherAverage ? 'lager' : poorAverage > otherAverage ? 'hoger' : 'gelijk';
  return `Slechte slaap kwam voor bij ${poorSleep.length} sessies. Deze sessies hadden gemiddeld ${relation} volume.`;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((total, value) => total + value, 0) / valid.length : 0;
}

function buildAttentionPoints({ weeklyMetrics, previousWeeklyMetrics, weekSessions, latest, performanceDrop, repeatedPain, volumeJump }) {
  const points = [];
  if (weeklyMetrics.maxSets >= 5) points.push('Veel max/failure sets deze week. Houd vermoeidheid in de gaten.');
  if (repeatedPain >= 2 || ['matig', 'hoog'].includes(latest?.recovery?.painLevel)) {
    points.push('Pijn komt terug in de logs. Volg of dit afneemt of oploopt.');
  }
  if (performanceDrop) points.push('Laatste prestaties liggen lager dan de vorige vergelijkbare sessie.');
  if (!weekSessions.length) points.push('Nog geen training deze week. Plan een haalbare sessie.');
  if (volumeJump) {
    points.push(`Weekvolume is fors hoger dan vorige week (${weeklyMetrics.volume}kg vs ${previousWeeklyMetrics.volume}kg).`);
  }
  if (!points.length) points.push('Geen duidelijke aandachtspunten op basis van de huidige data.');
  return points;
}

function detectPerformanceDrop(sessions) {
  const latest = [...sessions].sort(byCompletedDesc)[0];
  if (!latest) return false;
  return latest.exercises.some((exercise) => {
    const previous = findPreviousExerciseSession(
      sessions.filter((session) => session.id !== latest.id),
      exercise.exerciseId,
    );
    if (!previous) return false;
    const currentVolume = exerciseVolume(exercise);
    const previousVolume = exerciseVolume(previous.exercise);
    return previousVolume > 0 && currentVolume < previousVolume * 0.92;
  });
}

function buildPrOverview(sessions) {
  const rowsByExercise = {};
  sessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      rowsByExercise[exercise.exerciseId] ||= [];
      rowsByExercise[exercise.exerciseId].push({
        session,
        exercise,
        ...exerciseMetrics(exercise),
      });
    });
  });

  return Object.values(rowsByExercise)
    .flatMap((rows) => {
      const sorted = rows.sort((a, b) => new Date(a.session.date) - new Date(b.session.date));
      const withBadges = addPrBadges(
        sorted.map((row) => ({
          date: row.session.date,
          exerciseName: row.exercise.exerciseName,
          heaviestSet: row.heaviestSet,
          bestOneRm: row.bestOneRm,
          totalVolume: row.totalVolume,
          modality: row.exercise.modality || inferModality(row.exercise),
        })),
      );
      return withBadges
        .filter((row) => row.prBadges.length)
        .map((row) => ({
          name: row.exerciseName,
          date: row.date,
          badges: row.prBadges,
          best: formatSetPerformance(row.heaviestSet, row.modality),
          oneRm: row.bestOneRm,
          volume: row.totalVolume,
        }));
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
}

export function daysSince(value) {
  if (!value) return null;
  return differenceInCalendarDays(new Date(), parseISO(value));
}
