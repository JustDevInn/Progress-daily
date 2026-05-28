import { RotateCcw, Copy, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SetLogger } from './SetLogger';
import { formatShortDate } from '../../utils/date';

function formatSet(set, modality = 'strength') {
  if (modality === 'timed') return `${set.durationMinutes || 0} min`;
  if (modality === 'carry') return `${set.distanceMeters || 0}m${set.weight ? ` @ ${set.weight}kg` : ''}`;
  const effort = set.effortLabel === 'max' || /max|failure/i.test(set.notes || '')
    ? ' MAX'
    : set.rir !== null && set.rir !== undefined
      ? ` @RIR${set.rir}`
      : '';
  if (modality === 'bodyweight') {
    const load = set.weight ? ` +${set.weight}kg` : '';
    return `${set.reps || 0} reps${load}${effort}`;
  }
  return `${set.weight || 0}kg x ${set.reps || 0}${effort}`;
}

function targetSummary(exercise) {
  if (exercise.modality === 'timed') return `${exercise.targetDurationMinutes || 0} min`;
  if (exercise.modality === 'carry') return `${exercise.targetSets} x ${exercise.targetDistanceMeters || 0}m`;
  return `${exercise.targetSets} x ${exercise.targetRepMin}-${exercise.targetRepMax} reps · RIR ${exercise.targetRirMin}-${exercise.targetRirMax}`;
}

function previousSummary(previous, modality) {
  if (!previous) return 'Geen vorige sessie';
  const sets = previous.exercise.sets
    .map((set) => formatSet(set, modality))
    .join(' · ');
  return `${formatShortDate(previous.session.date)} · ${sets}`;
}

function previousNotes(previous) {
  if (!previous) return [];
  return [
    previous.session.notes,
    previous.session.recovery?.notes,
    previous.exercise.notes,
    ...previous.exercise.sets.map((set) => set.notes),
  ].filter(Boolean);
}

export function ExerciseSessionCard({
  exercise,
  exerciseSession,
  previous,
  onSetChange,
  onSetComplete,
  onSame,
  onAddWeight,
  onReset,
  statusLabel,
  onExerciseNoteChange,
}) {
  const [exerciseNotesOpen, setExerciseNotesOpen] = useState(false);
  const notes = previousNotes(previous);

  return (
    <Card className="space-y-3 p-3">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-zinc-50">{exercise.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{targetSummary(exercise)}</p>
          </div>
          <div className="shrink-0 rounded-md bg-zinc-800 px-2 py-1 text-sm font-bold text-zinc-200">
            {exercise.restSeconds ? `${Math.round(exercise.restSeconds / 60)}m` : '0m'}
          </div>
        </div>
        <div className="mt-3 rounded-md bg-zinc-950 px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Vorige keer</span>
            <Badge tone="neutral" className="max-w-[11rem] whitespace-normal text-right leading-4">
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs leading-5 text-zinc-300">{previousSummary(previous, exercise.modality)}</p>
          {notes.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-bold text-zinc-400">Notities vorige keer</summary>
              <div className="mt-2 space-y-1 text-xs leading-5 text-zinc-500">
                {notes.map((note, index) => (
                  <p key={`${note}-${index}`}>{note}</p>
                ))}
              </div>
            </details>
          )}
        </div>
        {exercise.notes && <p className="mt-2 text-xs leading-5 text-zinc-500">{exercise.notes}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={onSame}>
          <Copy size={16} />
          Zelfde
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddWeight}
          disabled={exercise.modality === 'timed'}
        >
          <TrendingUp size={16} />
          +2.5 kg
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>
      <div className="space-y-3">
        <details open={exerciseNotesOpen} onToggle={(event) => setExerciseNotesOpen(event.currentTarget.open)}>
          <summary className="min-h-10 cursor-pointer rounded-md px-2 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
            {exerciseNotesOpen ? 'Oefening notitie sluiten' : '+ oefening notitie'}
          </summary>
          <textarea
            value={exerciseSession.notes || ''}
            onChange={(event) => onExerciseNoteChange(event.target.value)}
            className="mt-2 min-h-20 w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            placeholder="Bijv. elleboog begon te verzuren, betere connectie, meer rust nemen"
          />
        </details>
        {exerciseSession.sets.map((set) => (
          <SetLogger
            key={set.setNumber}
            set={set}
            modality={exercise.modality}
            onChange={(patch) => onSetChange(set.setNumber, patch)}
            onComplete={() => onSetComplete(set.setNumber, !set.completed)}
          />
        ))}
      </div>
    </Card>
  );
}
