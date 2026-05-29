import { CheckCircle2, Play, Trash2 } from 'lucide-react';
import { ProgramCard } from '../components/training/ProgramCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function TrainingPage({
  programs,
  sessions,
  onStart,
  activeWorkoutDraft,
  onResumeWorkout,
  onDiscardWorkout,
  completedSession,
  saveState,
}) {
  const draftProgram = programs.find((program) => program.id === activeWorkoutDraft?.programId);

  return (
    <div className="app-page min-h-dvh">
      <header className="px-4 pb-5 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">DailyProgress</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-50">Training</h1>
      </header>
      <div className="space-y-4 px-4">
        {completedSession && (
          <Card className="flex items-center gap-3 border-emerald-400/30 bg-emerald-400/10">
            <CheckCircle2 className="shrink-0 text-emerald-300" size={24} />
            <div>
              <p className="font-bold text-emerald-100">{completedSession.programName} opgeslagen</p>
              <p className="text-sm text-emerald-200/75">
                {sessionSaveText(saveState, completedSession.exercises.length)}
              </p>
            </div>
          </Card>
        )}
        {activeWorkoutDraft && (
          <Card className="space-y-3 border-emerald-400/30 bg-emerald-400/10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Training hervatten</p>
              <h2 className="mt-1 text-xl font-black text-emerald-50">
                {draftProgram?.name || activeWorkoutDraft.programName || 'Actieve training'}
              </h2>
              <p className="mt-1 text-sm text-emerald-100/75">
                {activeWorkoutDraft.exerciseSessions?.reduce(
                  (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
                  0,
                ) || 0}{' '}
                sets gelogd
              </p>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Button onClick={onResumeWorkout}>
                <Play size={18} fill="currentColor" />
                Hervatten
              </Button>
              <Button
                variant="danger"
                size="icon"
                onClick={() => {
                  if (window.confirm('Actieve training verwijderen?')) onDiscardWorkout();
                }}
                aria-label="Actieve training verwijderen"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </Card>
        )}
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} sessions={sessions} onStart={onStart} />
        ))}
      </div>
    </div>
  );
}

function sessionSaveText(saveState, exerciseCount) {
  if (saveState === 'saving') return 'Opslaan... lokale backup is al bijgewerkt';
  if (saveState === 'local') return 'Offline/lokaal opgeslagen';
  if (saveState === 'saved') return 'Opgeslagen';
  return `${exerciseCount} oefeningen gelogd`;
}
