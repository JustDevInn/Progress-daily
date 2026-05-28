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
  const [showCompletion, setShowCompletion] = useState(Boolean(initialDraft?.showCompletion));
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [confirmMissingWeights, setConfirmMissingWeights] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState(initialDraft?.activeExerciseId || program.exercises[0]?.id);
  const [recoveryDraft, setRecoveryDraft] = useState(initialDraft?.recoveryDraft || null);
  const [startedAt] = useState(initialDraft?.startedAt || new Date().toISOString());
  const timer = useRestTimer(initialDraft?.timer, vibrationEnabled);
  const workout = useWorkoutSession(program, sessions, initialDraft);
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
    });
  }, [
    activeExerciseId,
    program.id,
    program.name,
    recoveryDraft,
    showCompletion,
    startedAt,
    timer.timer,
    workout.exerciseSessions,
    workout.sourceLabels,
  ]);

  function handleSetComplete(exercise, setNumber, completed) {
    setActiveExerciseId(exercise.id);
    workout.updateSet(exercise.id, setNumber, { completed });
    if (completed) timer.start(exercise.restSeconds, exercise.name);
  }

  function finish(recovery) {
    onComplete(workout.buildCompletedSession(recovery));
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
    <div className="min-h-screen bg-zinc-950 pb-40">
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
      <RestTimer
        timer={timer.timer}
        progress={timer.progress}
        onPause={timer.pause}
        onResume={timer.resume}
        onReset={timer.reset}
        onAdjust={timer.adjust}
        onStop={timer.stop}
      />
      <div className="space-y-4 px-4 py-4">
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
              onExerciseNoteChange={(notes) => {
                setActiveExerciseId(exercise.id);
                workout.updateExerciseNote(exercise.id, notes);
              }}
            />
          );
        })}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur md:absolute">
        <div className="mx-auto max-w-md">
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
      </div>
      {showCompletion && (
        <CompletionModal
          initialValue={recoveryDraft}
          onChange={setRecoveryDraft}
          onClose={() => setShowCompletion(false)}
          onComplete={finish}
        />
      )}
    </div>
  );
}
