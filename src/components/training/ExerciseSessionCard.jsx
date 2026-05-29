import { RotateCcw, Copy, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SetLogger } from './SetLogger';
import { formatShortDate } from '../../utils/date';

function targetSummary(exercise) {
  const setLabel = `${exercise.targetSets || 1} ${Number(exercise.targetSets || 1) === 1 ? 'set' : 'sets'}`;
  if (exercise.modality === 'timed') return `${setLabel} · doel ${exercise.targetDurationMinutes || 0} min`;
  if (exercise.modality === 'carry') return `${setLabel} · doel ${exercise.targetDistanceMeters || 0}m`;
  const min = exercise.targetRepMin;
  const max = exercise.targetRepMax;
  const reps = min === max ? `${max} reps` : `${min}-${max} reps`;
  return `${setLabel} · doel ${reps} · RIR ${exercise.targetRirMin}-${exercise.targetRirMax}`;
}

function sourceSummary(statusLabel, previous) {
  if (statusLabel === 'Gebaseerd op vorige sessie' && previous?.session?.date) {
    return `${statusLabel} · ${formatShortDate(previous.session.date)}`;
  }
  return statusLabel;
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
}) {
  return (
    <Card className="space-y-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-zinc-50">{exercise.name}</h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-400">{targetSummary(exercise)}</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-emerald-200/85">
            {sourceSummary(statusLabel, previous)}
          </p>
        </div>
        <div className="shrink-0 rounded-md bg-zinc-800 px-2 py-1 text-xs font-black tabular-nums text-zinc-200">
          {exercise.restSeconds ? `${Math.round(exercise.restSeconds / 60)}m` : '0m'}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={onSame} className="min-h-9 px-2 text-xs">
          <Copy size={16} />
          Zelfde
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddWeight}
          disabled={exercise.modality !== 'strength'}
          className="min-h-9 px-2 text-xs"
        >
          <TrendingUp size={16} />
          +2.5kg
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="min-h-9 px-2 text-xs">
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>
      <div className="space-y-1">
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
