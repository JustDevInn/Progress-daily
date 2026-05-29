import { ArrowLeft, CheckCircle2, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRestTimer } from '../../hooks/useRestTimer';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { Button } from '../ui/Button';
import { CompletionModal } from './CompletionModal';
import { ExerciseSessionCard } from './ExerciseSessionCard';
import { RestTimer } from './RestTimer';

export function ActiveWorkoutPage({
  program,
  sessions,
  initialDraft,
  vibrationEnabled,
  onDraftChange,
  onCancel,
  onStopWorkout,
  onComplete,
}) {
  const initialTimer = initialDraft?.timer;
  const [showCompletion, setShowCompletion] = useState(Boolean(initialDraft?.showCompletion));
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [confirmMissingWeights, setConfirmMissingWeights] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState(initialDraft?.activeExerciseId || program.exercises[0]?.id);
  const [recoveryDraft, setRecoveryDraft] = useState(initialDraft?.recoveryDraft || null);
  const [workoutNote, setWorkoutNote] = useState(initialDraft?.workoutNote ?? initialDraft?.recoveryDraft?.notes ?? '');
  const [startedAt] = useState(initialDraft?.startedAt || new Date().toISOString());
  const timer = useRestTimer(initialTimer, vibrationEnabled);
  const workout = useWorkoutSession(program, sessions, initialDraft);
  const activeExercise = program.exercises.find((exercise) => exercise.id === activeExerciseId) || program.exercises[0];
  const incompleteSets = workout.totalSets - workout.completedSets;
  const incompleteMany = workout.completedSets > 0 && incompleteSets > Math.max(2, workout.totalSets * 0.3);
  const missingStrengthWeightSets = workout.exerciseSessions.reduce(
    (total, exercise) =>
      total +
      (exercise.modality === 'strength'
        ? exercise.sets.filter((set) => set.completed && Number(set.reps || 0) > 0 && Number(set.weight || 0) <= 0).length
        : 0),
    0,
  );

  useEffect(() => {
    onDraftChange({
      programId: program.id,
      programName: program.name,
      startedAt,
      activeExerciseId,
      exerciseSessions: workout.exerciseSessions,
      sourceLabels: workout.sourceLabels,
      timer: timer.timer,
      showCompletion,
      recoveryDraft,
      workoutNote,
    });
  }, [
    activeExerciseId,
    program.id,
    program.name,
    recoveryDraft,
    showCompletion,
    startedAt,
    timer.timer,
    workoutNote,
    workout.exerciseSessions,
    workout.sourceLabels,
  ]);

  function handleSetComplete(exercise, setNumber, completed) {
    setActiveExerciseId(exercise.id);
    workout.updateSet(exercise.id, setNumber, { completed });
    if (completed) {
      timer.start(exercise.restSeconds, exercise.name);
    }
  }

  function startManualTimer() {
    const seconds = activeExercise?.restSeconds || 120;
    timer.start(seconds, activeExercise?.name || '');
  }

  function stopTimer() {
    timer.stop();
  }

  function finish(recovery) {
    onComplete(workout.buildCompletedSession({ ...recovery, notes: recovery?.notes || workoutNote }));
  }

  function stopWorkout() {
    if (window.confirm('Training stoppen? Je actieve training wordt verwijderd.')) {
      onStopWorkout();
    }
  }

  function requestCompletion() {
    if (!workout.completedSets) return;
    if (incompleteMany && !confirmIncomplete) {
      setConfirmIncomplete(true);
      return;
    }
    if (missingStrengthWeightSets > 0 && !confirmMissingWeights) {
      setConfirmMissingWeights(true);
      return;
    }
    setShowCompletion(true);
  }

  return (
    <div className="workout-page min-h-dvh bg-zinc-950">
      <header className="border-b border-zinc-800 px-4 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Terug">
            <ArrowLeft size={22} />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-black text-zinc-50">{program.name}</h1>
            <p className="text-xs text-zinc-500">{program.description}</p>
          </div>
          <Button variant="danger" size="sm" onClick={stopWorkout}>
            <Square size={16} />
            Stop
          </Button>
        </div>
      </header>
      <div className="space-y-3 px-4 py-3">
        {program.exercises.map((exercise) => {
          const exerciseSession = workout.exerciseSessions.find((item) => item.exerciseId === exercise.id);
          if (!exerciseSession) return null;
          return (
            <ExerciseSessionCard
              key={exercise.id}
              exercise={exercise}
              exerciseSession={exerciseSession}
              previous={workout.previousByExercise[exercise.id]}
              onSetChange={(setNumber, patch) => {
                setActiveExerciseId(exercise.id);
                workout.updateSet(exercise.id, setNumber, patch);
              }}
              onSetComplete={(setNumber, completed) => handleSetComplete(exercise, setNumber, completed)}
              onSame={() => workout.restorePrevious(exercise)}
              onAddWeight={() => workout.addWeight(exercise.id, 2.5)}
              onReset={() => workout.resetExercise(exercise)}
              statusLabel={workout.sourceLabels[exercise.id]}
            />
          );
        })}
      </div>
      <section className="space-y-3 px-4 pb-6">
        <label className="block rounded-lg border border-zinc-800 bg-zinc-900/82 p-3">
          <span className="mb-2 block text-sm font-black text-zinc-100">Training notitie</span>
          <textarea
            value={workoutNote}
            onChange={(event) => setWorkoutNote(event.target.value)}
            className="min-h-24 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            placeholder="Bijv. moe, elleboog gevoelig, meer rust nodig..."
          />
        </label>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/82 p-4">
          {confirmIncomplete && (
            <div className="mb-3 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Nog {incompleteSets} sets open. Tik nogmaals op voltooien om toch af te ronden.
            </div>
          )}
          {confirmMissingWeights && (
            <div className="mb-3 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Sommige strength sets hebben geen gewicht. Tik nogmaals om toch op te slaan.
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-zinc-50">{program.name}</p>
              <p className="text-xs text-zinc-400">
                {workout.completedSets} / {workout.totalSets} sets · {workout.completedExercises} / {program.exercises.length} oefeningen
              </p>
            </div>
            <Button
              size="lg"
              variant={workout.completedSets ? 'primary' : 'secondary'}
              onClick={requestCompletion}
              disabled={!workout.completedSets}
            >
              <CheckCircle2 size={20} />
              Voltooien
            </Button>
          </div>
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-30 px-3 md:absolute">
        <div className="mx-auto max-w-md">
          <RestTimer
            timer={timer.timer}
            manualSeconds={activeExercise?.restSeconds || 120}
            onStartDefault={startManualTimer}
            onPause={timer.pause}
            onResume={timer.resume}
            onAdjust={timer.adjust}
            onStop={stopTimer}
          />
        </div>
      </div>
      {showCompletion && (
        <CompletionModal
          initialValue={{ ...(recoveryDraft || {}), notes: recoveryDraft?.notes || workoutNote }}
          onChange={setRecoveryDraft}
          onClose={() => setShowCompletion(false)}
          onComplete={finish}
        />
      )}
    </div>
  );
}
