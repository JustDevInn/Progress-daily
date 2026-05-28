import { CalendarDays, Play } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { findLatestProgramSession } from '../../utils/calculations';
import { formatShortDate } from '../../utils/date';

export function ProgramCard({ program, sessions, onStart }) {
  const latest = findLatestProgramSession(sessions, program.id);
  const completedSets =
    latest?.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0) || 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-50">{program.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">{program.description}</p>
        </div>
        <Badge tone={latest ? 'green' : 'neutral'}>{latest ? `${completedSets} sets` : 'Nieuw'}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <CalendarDays size={16} />
        <span>Laatst: {formatShortDate(latest?.date)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {program.exercises.slice(0, 4).map((exercise) => (
          <span key={exercise.id} className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
            {exercise.name}
          </span>
        ))}
      </div>
      <Button className="w-full" size="lg" onClick={() => onStart(program)}>
        <Play size={20} fill="currentColor" />
        Start training
      </Button>
    </Card>
  );
}
